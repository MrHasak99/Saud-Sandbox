import { useEffect, useRef, useState } from "react";
import { X, Send, Bot, RotateCcw, AlertCircle } from "lucide-react";
import ChatMessage from "./ChatMessage";
import { useAssistantChat } from "../../hooks/useAssistantChat";

export default function ChatPanel({ onClose }) {
  const { messages, loading, error, sendUserMessage, retry, startNewConversation } = useAssistantChat();
  const [draft, setDraft] = useState("");
  const scrollRef = useRef(null);

  // Always scroll to the newest message (or the loading indicator) when it changes.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, loading, error]);

  const handleSend = () => {
    if (loading) return; // Prevent duplicate submissions while waiting for a reply.
    sendUserMessage(draft);
    setDraft("");
  };

  // Enter sends the message; Shift+Enter adds a new line instead.
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const canSend = draft.trim().length > 0 && !loading;

  return (
    <div
      role="dialog"
      aria-label="FreshKWT assistant chat"
      className="fixed inset-4 z-50 flex flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl sm:inset-auto sm:bottom-24 sm:right-6 sm:h-[32rem] sm:w-96"
    >
      {/* Header */}
      <div className="flex items-center gap-2 rounded-t-2xl border-b border-slate-100 bg-emerald-600 px-4 py-3 text-white">
        <Bot className="h-5 w-5" />
        <div className="flex-1">
          <p className="text-sm font-semibold">FreshKWT Assistant</p>
          <p className="text-xs text-emerald-50">Grocery &amp; nutrition help, grounded in our catalogue</p>
        </div>
        <button
          type="button"
          onClick={startNewConversation}
          aria-label="Start a new conversation"
          title="Start a new conversation"
          className="rounded-full p-1 hover:bg-white/15"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close chat"
          className="rounded-full p-1 hover:bg-white/15"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.map((m, i) => (
          <ChatMessage key={i} role={m.role} text={m.content} />
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="flex items-center gap-1 rounded-2xl bg-slate-100 px-3.5 py-2.5 text-slate-500">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.2s] motion-reduce:animate-none" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 motion-reduce:animate-none" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:0.2s] motion-reduce:animate-none" />
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <div className="flex-1">
              <p>{error}</p>
              <button
                type="button"
                onClick={retry}
                className="mt-1.5 font-medium text-red-800 underline hover:no-underline"
              >
                Retry
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="flex items-end gap-2 border-t border-slate-100 p-3">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about groceries, meals, allergies..."
          rows={1}
          aria-label="Message the assistant"
          className="max-h-24 flex-1 resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-emerald-400 focus:outline-none"
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={!canSend}
          aria-label="Send message"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
