import { AlertCircle, CheckCircle, Loader2, Circle } from "lucide-react";

export default function StatusBar({ loading, error, usage }) {
  let tone = "border-white/10 text-slate-400";
  let icon = <Circle className="h-4 w-4" />;
  let message = "Ready. Write a prompt and hit send.";

  if (loading) {
    tone = "border-indigo-400/40 text-indigo-300";
    icon = <Loader2 className="h-4 w-4 animate-spin" />;
    message = "Calling OpenRouter...";
  } else if (error) {
    tone = "border-red-400/40 bg-red-500/10 text-red-300";
    icon = <AlertCircle className="h-4 w-4 shrink-0" />;
    message = error;
  } else if (usage) {
    tone = "border-emerald-400/40 text-emerald-300";
    icon = <CheckCircle className="h-4 w-4" />;
    message = "Success";
  }

  return (
    <div className={`flex flex-wrap items-center gap-x-4 gap-y-1 rounded-lg border bg-slate-900 px-4 py-3 text-sm ${tone}`}>
      <span className="flex items-center gap-2">
        {icon}
        {message}
      </span>
      {usage && !loading && !error && (
        <span className="ml-auto text-slate-400">
          Tokens: {usage.promptTokens} in / {usage.completionTokens} out
          {" · "}
          {(usage.latencyMs / 1000).toFixed(1)}s
          {" · "}
          {usage.model}
        </span>
      )}
    </div>
  );
}
