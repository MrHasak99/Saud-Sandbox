// Talks to OpenRouter's OpenAI-compatible chat endpoint.
// NOTE: This runs in the browser, so the key is visible in DevTools.
// That's fine for a personal sandbox with your own key, run only on your own
// machine. Never deploy this app publicly with the key wired up this way —
// a real production version must route this request through a backend
// (e.g. a Supabase Edge Function) so the key never reaches the browser.

const API_URL = "https://openrouter.ai/api/v1/chat/completions";

// Core function: send a full conversation (array of {role, content}) and get
// one reply back. Both sendMessage() below and the new chat assistant use this.
// `options` is an optional object of extra fields merged into the request
// body, e.g. { max_tokens: 500 } to cap how long a reply can be. It defaults
// to an empty object, so the Lab page (which doesn't pass it) keeps working
// exactly as before.
export async function sendMessages(messages, model, options = {}) {
  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;

  if (!apiKey || apiKey === "your_openrouter_key_here") {
    throw new Error(
      "No API key found. Copy .env.example to .env, paste your OpenRouter key, then restart `npm run dev`.",
    );
  }

  const startedAt = performance.now();
  let res;
  try {
    res = await fetch(API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": window.location.origin,
        "X-Title": "AI Micro-Lab",
      },
      body: JSON.stringify({ model, messages, ...options }),
    });
  } catch {
    throw new Error("Network error. Check your internet connection and try again.");
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const detail = data?.error?.message || res.statusText || "Unknown error";
    const hints = {
      401: "Your API key looks invalid. Re-copy it from openrouter.ai/keys.",
      402: "Out of credits. Add credits at openrouter.ai/credits.",
      429: "Too many requests. Wait a moment and try again.",
    };
    throw new Error(`${res.status}: ${detail}${hints[res.status] ? ` ${hints[res.status]}` : ""}`);
  }

  const content = data?.choices?.[0]?.message?.content;
  if (typeof content !== "string") {
    throw new Error("OpenRouter returned an empty response. Try again or switch models.");
  }

  return {
    content,
    promptTokens: data.usage?.prompt_tokens ?? 0,
    completionTokens: data.usage?.completion_tokens ?? 0,
    model: data.model || model,
    latencyMs: Math.round(performance.now() - startedAt),
  };
}

// Kept for the AI Micro-Lab (single prompt, no history). Just a thin wrapper
// around sendMessages() so existing code keeps working unchanged.
export async function sendMessage(prompt, model) {
  return sendMessages([{ role: "user", content: prompt }], model);
}
