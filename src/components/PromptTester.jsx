import { useState } from "react";
import { Send, Loader2 } from "lucide-react";

export default function PromptTester({ onSubmit, loading }) {
  const [prompt, setPrompt] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!prompt.trim() || loading) return;
    onSubmit(prompt.trim());
  };

  // Cmd/Ctrl + Enter sends the prompt
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSubmit(e);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-1 flex-col">
      <label htmlFor="prompt" className="mb-1 block text-sm font-medium text-slate-300">
        Your prompt
      </label>
      <textarea
        id="prompt"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask the AI anything..."
        rows={10}
        className="w-full flex-1 resize-none rounded-lg border border-white/10 bg-slate-800 p-4 text-white placeholder-slate-500 focus:border-indigo-400 focus:outline-none"
      />
      <button
        type="submit"
        disabled={loading || !prompt.trim()}
        className="mt-3 flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-indigo-500 to-pink-500 px-4 py-2.5 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        {loading ? "Thinking..." : "Send (Cmd/Ctrl + Enter)"}
      </button>
    </form>
  );
}
