import { useState, useCallback } from "react";
import { sendMessage } from "../services/openrouter";

// Holds everything the UI needs about one API call: loading, result, error, usage.
export function useOpenRouter() {
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [usage, setUsage] = useState(null);

  const sendPrompt = useCallback(async (prompt, model) => {
    setLoading(true);
    setError(null);
    try {
      const result = await sendMessage(prompt, model);
      setResponse(result.content);
      setUsage({
        promptTokens: result.promptTokens,
        completionTokens: result.completionTokens,
        model: result.model,
        latencyMs: result.latencyMs,
      });
      return result.content;
    } catch (err) {
      setError(err.message);
      setUsage(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearResponse = useCallback(() => {
    setResponse("");
    setError(null);
    setUsage(null);
  }, []);

  return { sendPrompt, response, loading, error, usage, clearResponse };
}
