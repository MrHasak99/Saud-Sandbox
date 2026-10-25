// Generates a canned demo reply for the chat widget UI.
// IMPORTANT: this does NOT call any AI model and does NOT know the real
// catalogue. It only returns pre-written text so we can test the chat UI
// before building the real grounded assistant in a later stage.
// Every reply below is honest about being a placeholder — it never invents
// a product, price, nutrition fact or allergy-safety claim.

const DEMO_NOTE =
  "(Demo reply — I'm not connected to the real catalogue or your profile yet.)";

const TOPICS = [
  {
    keywords: ["allerg", "nut", "gluten", "dairy", "lactose", "safe"],
    reply:
      `${DEMO_NOTE} I'll eventually check your allergies against real product data before suggesting anything. ` +
      "For now I can't confirm any product is safe — once the real assistant is connected, it will only recommend items with verified allergen information, and will tell you when that information is missing.",
  },
  {
    keywords: ["meal", "plan", "recipe", "dinner", "lunch", "breakfast"],
    reply:
      `${DEMO_NOTE} Meal planning is on the roadmap. ` +
      "Later, I'll build weekly meal plans using real products from the FreshKWT catalogue, matched to your goals and budget.",
  },
  {
    keywords: ["budget", "cheap", "price", "cost", "kwd", "dinar"],
    reply:
      `${DEMO_NOTE} Budget-aware shopping lists are planned for a later stage. ` +
      "All totals will be calculated by the app itself (not guessed by me) so the numbers are always accurate.",
  },
  {
    keywords: ["recommend", "suggest", "product", "buy", "basket"],
    reply:
      `${DEMO_NOTE} I can't recommend real products yet — that needs to be grounded in the actual catalogue, which comes in a later stage. ` +
      "For now, feel free to browse the storefront directly!",
  },
];

const DEFAULT_REPLY =
  `${DEMO_NOTE} Thanks for trying the chat! This is just a UI preview right now. ` +
  "Once the real assistant is built, I'll be able to answer grocery questions using FreshKWT's actual product data.";

export function getPlaceholderReply(userText) {
  const text = userText.toLowerCase();
  const match = TOPICS.find((topic) => topic.keywords.some((kw) => text.includes(kw)));
  return match ? match.reply : DEFAULT_REPLY;
}

export const GREETING_MESSAGE =
  "Hi! I'm the FreshKWT assistant (demo preview). Ask me about groceries, meal plans, allergies or budgets — " +
  "I'll only give placeholder answers for now while the real, catalogue-grounded assistant is being built.";
