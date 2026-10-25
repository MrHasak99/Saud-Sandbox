import { useCallback, useRef, useState } from "react";
import { sendMessages } from "../services/openrouter";
import { getDefaultModel } from "../services/models";
import { CATALOGUE_OVERVIEW, getRelevantProductsContext, getRelevantProducts } from "../lib/catalogueContext";

// Main system prompt: role, tone and the hard safety rules. Real product
// facts come from two OTHER system messages built in callModel() below:
// a fixed catalogue overview, and a per-message list of products relevant
// to whatever the customer just asked (see lib/catalogueContext.js for why
// we don't just send all 1,500 products every time).
const SYSTEM_PROMPT = `You are the FreshKWT Assistant: a warm, confident, professional grocery-shopping assistant for FreshKWT, a premium online grocery store in Kuwait. All prices are in Kuwaiti Dinar (KWD). You sound like a helpful in-store staff member, not a chatbot and not a report generator.

You are given a catalogue overview and, for each message, a short list of specific matching products in separate system messages. Treat those as your only source of truth for product names, prices, pack sizes and stock status.

LENGTH AND FORMAT - follow these exactly:
- Normal replies are 1-3 short sentences. Only go longer if the customer explicitly asks for something that needs more space, like a multi-day meal plan.
- Plain text only. No markdown - no asterisks, no "**bold**", no "#" headings, no bullet dashes. The chat window cannot render markdown, so it would show up as literal symbols.
- Matching products are shown automatically as visual cards right under your reply - the app picks them from the same candidates you were given, up to 3 by default (5 if the customer asks for "more options"). Because of this, do NOT list product names, prices or pack sizes in your text - the cards already show that. Just write one short introductory sentence, e.g. "Here are a few shrimp options to start with."
- If you weren't given any matching products for this message, don't pretend any exist - say so plainly and ask a clarifying question instead.
- Do not add price-per-unit maths, multi-category breakdowns, long caveats, or extra unrelated advice unless the customer asked for that specifically.
- Ask at most one short follow-up question, and only when it genuinely helps narrow down the choice - do not end every reply with a question.

ACCURACY AND HONESTY:
- Only reference products, prices, pack sizes or stock status exactly as given in the catalogue messages. Never invent or alter a product, price, availability, ingredient or nutrition figure.
- When the customer asks for the cheapest or best-value option, trust the order of the candidate list you're given - a note will tell you when it's already sorted from cheapest to most expensive using the real stored prices. Just confirm the first one is the cheapest match; you don't need to compare prices yourself.
- This is sample demo data, not a live store feed - mention that briefly and naturally only when it's actually relevant (e.g. if asked whether something is really in stock right now), not as a disclaimer on every message.
- This catalogue has no confirmed nutrition, ingredient, allergen or dietary-tag data for any product. If asked about any of those, say plainly and briefly that it isn't confirmed in this demo and the customer should check the real packaging - never say or imply a product is "safe" for an allergy, and never state a specific calorie/macro number.
- If a customer asks about something that wasn't shown to you as a matching product, say plainly you couldn't find it in FreshKWT's catalogue and ask them to try a different name or category - don't guess.

SCOPE:
- You help with groceries, food, recipes, cooking, meal planning, nutrition, dietary needs, allergies, grocery shopping and food budgets - including FreshKWT's own catalogue.
- For anything outside that scope, don't answer, explain or give instructions about it. Briefly redirect instead, e.g.: "I can help with groceries, meals and nutrition - what would you like help with today?" Apply this to every message, including follow-ups. If a message mixes an unrelated topic with a food-related one, answer only the food-related part.
- Nutrition guidance here is general informational support, not medical advice or diagnosis. Never promise specific health outcomes.`;

const GREETING = {
  role: "assistant",
  content: "Hi, I'm the FreshKWT Assistant. Ask me about our products, meal ideas, nutrition or your grocery budget — happy to help.",
  products: [],
};

// Keeps the full back-and-forth so follow-ups like "make it cheaper" work,
// while capping history length so requests don't grow forever.
const MAX_HISTORY_MESSAGES = 20;

// Soft cap on reply length. This backs up the "1-3 sentences" instruction in
// the system prompt with an actual limit, in case the model ignores the
// instruction — without this, a single off-script reply could come back as a
// huge wall of text. 500 tokens is roughly 350-400 words, enough room for a
// short multi-day meal plan if the customer asks for one.
const MAX_REPLY_TOKENS = 500;

// Default and "give me more" card counts — see Part 2 of the product spec:
// 3 recommendations normally, up to 5 when the shopper explicitly asks for
// more options.
const DEFAULT_CARD_COUNT = 3;
const MORE_CARD_COUNT = 5;
const WANTS_MORE_REGEX = /\b(more options?|show more|more choices|other options?|anything else|more please|more results|more alternatives?)\b/i;

export function useAssistantChat() {
  const [messages, setMessages] = useState([GREETING]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ROOT CAUSE OF THE "DOUBLE REPLY" BUG (now fixed):
  // The previous version called the OpenRouter API *inside* a setState
  // updater function — i.e. `setMessages(prev => { ...call API here...; return next })`.
  // React 18 Strict Mode (enabled in main.jsx for development) intentionally
  // invokes updater functions TWICE on purpose, specifically to help catch
  // exactly this kind of mistake: a function that's supposed to be a pure
  // calculation but secretly has a side effect hidden inside it. Because the
  // API call lived inside that function, every single message triggered two
  // identical requests and therefore two assistant replies.
  //
  // The fix: never put side effects inside a setState updater. Instead, this
  // ref always holds "the real current messages," so any handler can read it
  // synchronously and fire the API call exactly once, as a normal step in the
  // function — not smuggled inside a state updater.
  const messagesRef = useRef([GREETING]);
  const lastUserMessageRef = useRef(null);

  const commitMessages = useCallback((next) => {
    messagesRef.current = next;
    setMessages(next);
  }, []);

  const callModel = useCallback(
    async (historyForRequest) => {
      setLoading(true);
      setError(null);
      try {
        const model = getDefaultModel();
        // Find the customer's most recent message in this request so we can
        // look up just the catalogue products relevant to THAT question,
        // instead of sending the whole 1,500-product catalogue every time.
        const latestUserText = [...historyForRequest].reverse().find((m) => m.role === "user")?.content || "";
        const apiMessages = [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "system", content: CATALOGUE_OVERVIEW },
          { role: "system", content: getRelevantProductsContext(latestUserText) },
          ...historyForRequest,
        ];
        const result = await sendMessages(apiMessages, model, { max_tokens: MAX_REPLY_TOKENS });

        // Decide which real catalogue products (if any) become visual cards
        // under this reply. This uses the SAME retrieval the model was shown
        // (via getRelevantProductsContext above), so the cards always match
        // what the model was grounded on — never a separate guess, and never
        // something the model generated itself.
        const { matches } = getRelevantProducts(latestUserText);
        const wantsMore = WANTS_MORE_REGEX.test(latestUserText);
        const cardLimit = wantsMore ? MORE_CARD_COUNT : DEFAULT_CARD_COUNT;

        // If the shopper asked for "more options", avoid repeating whatever
        // was already shown in the previous assistant reply.
        let cardPool = matches;
        if (wantsMore) {
          const prevWithProducts = [...messagesRef.current].reverse().find((m) => m.role === "assistant" && m.products?.length > 0);
          const alreadyShownIds = new Set((prevWithProducts?.products || []).map((p) => p.id));
          const fresh = matches.filter((p) => !alreadyShownIds.has(p.id));
          if (fresh.length > 0) cardPool = fresh;
        }

        const assistantMessage = {
          role: "assistant",
          content: result.content,
          products: cardPool.slice(0, cardLimit),
        };
        commitMessages([...messagesRef.current, assistantMessage]);
        lastUserMessageRef.current = null;
      } catch (err) {
        setError(err.message);
        // We intentionally do NOT remove the user's message from history here —
        // it stays visible, and Retry re-sends using the same history.
      } finally {
        setLoading(false);
      }
    },
    [commitMessages],
  );

  const sendUserMessage = useCallback(
    (text) => {
      const trimmed = text.trim();
      // Guard against empty text and against sending while already loading,
      // so a user can't fire off duplicate requests by clicking twice.
      if (!trimmed || loading) return;

      lastUserMessageRef.current = trimmed;
      const next = [...messagesRef.current, { role: "user", content: trimmed }];
      commitMessages(next);

      const trimmedHistory = next.slice(-MAX_HISTORY_MESSAGES);
      callModel(trimmedHistory);
    },
    [loading, commitMessages, callModel],
  );

  // Resends the last user message using the CURRENT history (which already
  // includes that message), so nothing gets duplicated.
  const retry = useCallback(() => {
    if (loading || !lastUserMessageRef.current) return;
    const trimmedHistory = messagesRef.current.slice(-MAX_HISTORY_MESSAGES);
    callModel(trimmedHistory);
  }, [loading, callModel]);

  // Starts a fresh conversation (clears history back to just the greeting).
  const startNewConversation = useCallback(() => {
    commitMessages([GREETING]);
    setError(null);
    lastUserMessageRef.current = null;
  }, [commitMessages]);

  return { messages, loading, error, sendUserMessage, retry, startNewConversation };
}
