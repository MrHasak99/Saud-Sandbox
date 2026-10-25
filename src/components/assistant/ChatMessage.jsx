// A single chat bubble. Styled differently depending on who sent it.
export default function ChatMessage({ role, text }) {
  const isUser = role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
          isUser
            ? "bg-emerald-600 text-white"
            : "bg-slate-100 text-slate-800"
        }`}
      >
        {text}
      </div>
    </div>
  );
}
