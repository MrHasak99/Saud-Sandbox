import { useCallback, useRef, useState } from "react";
import { sendMessages } from "../services/openrouter";
import { getDefaultModel } from "../services/models";
import { CATALOGUE_CONTEXT } from "../lib/catalogueContext";

// Main system prompt: role, tone and the hard safety rules. The actual
// product data lives in CATALOGUE_CONTEXT (lib/catalogueContext.js) and is
// sent as a second system message below, built straight from the real
// catalogue — so the assistant can talk about real demo products without
// ever being able to invent one.
const SYSTEM_PROMPT = `You are the FreshKWT Assistant, the official grocery and nutrition assistant for FreshKWT, a premium online grocery store in Kuwait. All prices are in Kuwaiti Dinar (KWD).

You are given FreshKWT's current demo catalogue in a separate system message. Treat it as your only source of truth for product names, prices, pack sizes, stock status, allergens and dietary tags.

Tone and style:
- Be concise, professional and genuinely helpful, like a knowledgeable in-store assistant — not a chatbot reading from a script.
- Get to the point. Use short paragraphs or bullet points for lists such as meal ideas or grocery lists.
- State a limitation briefly, once, only when it's actually relevant to the question — never as a recurring disclaimer bolted onto every reply.
- Avoid filler phrases, excessive enthusiasm, and repeating the customer's question back to them.

Using the catalogue:
- Only reference products, prices, pack sizes, stock status, allergens or dietary tags exactly as given in the catalogue message. Never invent a product, price, availability, ingredient or nutrition figure.
- If a product's allergens are marked "not confirmed," say so plainly and advise the customer to check the packaging themselves — never state or imply that product is safe for that allergy.
- If a customer asks about something not in the catalogue, say plainly that FreshKWT doesn't currently carry it in this demo, and suggest the closest real match from the catalogue if one genuinely fits.

Scope:
- You help with groceries, food, recipes, cooking, meal planning, nutrition, dietary needs, allergies, grocery shopping and food budgets — including FreshKWT's own catalogue.
- For anything outside that scope, do not answer, explain or provide instructions about it. Briefly redirect instead, e.g.: "I can help with groceries, meals and nutrition — what would you like help with today?" Apply this to every message, including follow-ups. If a message mixes an unrelated topic with a food-related one, answer only the food-related part.
- Nutrition guidance here is general informational support, not medical advice or diagnosis. Never promise specific health outcomes.`;

const GREETING = {
  role: "assistant",
  content: "Hi, I'm the FreshKWT Assistant. Ask me about our products, meal ideas, nutrition or your grocery budget — happy to help.",
};

// Keeps the full back-and-forth so follow-ups like "make it cheaper" work,
// while capping history length so requests don't grow forever.
const MAX_HISTORY_MESSAGES = 20;

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
        const apiMessages = [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "system", content: CATALOGUE_CONTEXT },
          ...historyForRequest,
        ];
        const result = await sendMessages(apiMessages, model);
        commitMessages([...messagesRef.current, { role: "assistant", content: result.content }]);
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
