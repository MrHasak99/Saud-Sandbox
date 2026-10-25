import { MessageSquare } from "lucide-react";

export default function ResponseViewer({ response, loading }) {
  return (
    <div className="flex min-h-[20rem] flex-1 flex-col">
      <h2 className="mb-1 text-sm font-medium text-slate-300">Response</h2>
      <div className="flex-1 overflow-auto rounded-lg border border-white/10 bg-slate-800 p-4">
        {loading ? (
          <div className="space-y-3">
            <div className="h-4 w-3/4 animate-pulse rounded bg-slate-700" />
            <div className="h-4 w-full animate-pulse rounded bg-slate-700" />
            <div className="h-4 w-5/6 animate-pulse rounded bg-slate-700" />
          </div>
        ) : response ? (
          <p className="whitespace-pre-wrap leading-relaxed text-slate-100">{response}</p>
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-slate-500">
            <MessageSquare className="mb-2 h-8 w-8" />
            <p>The AI's answer will show up here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
