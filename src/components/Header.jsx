import { Sparkles } from "lucide-react";

export default function Header() {
  return (
    <header className="border-b border-white/10 bg-gradient-to-r from-indigo-600/30 via-fuchsia-600/20 to-pink-600/30">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-6 py-5">
        <div className="rounded-xl bg-gradient-to-br from-indigo-500 to-pink-500 p-2">
          <Sparkles className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">AI Micro-Lab</h1>
          <p className="text-sm text-slate-300">Vibe Coding Sandbox</p>
        </div>
      </div>
    </header>
  );
}
