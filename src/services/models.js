// The models shown in the dropdown.
// `id` must match an OpenRouter model ID exactly: https://openrouter.ai/models
// To add a model, copy one line below and change the id + label.
export const MODELS = [
  { id: "anthropic/claude-sonnet-5.5", label: "Claude Sonnet 5.5" },
  { id: "google/gemini-3.8-flash", label: "Gemini 3.8 Flash" },
  { id: "openai/gpt-5.4-mini", label: "GPT-5.4 Mini" },
];

export const FALLBACK_MODEL = MODELS[0].id;

// Uses VITE_DEFAULT_MODEL from .env if it is one of the models above.
export function getDefaultModel() {
  const fromEnv = import.meta.env.VITE_DEFAULT_MODEL;
  return MODELS.some((m) => m.id === fromEnv) ? fromEnv : FALLBACK_MODEL;
}
