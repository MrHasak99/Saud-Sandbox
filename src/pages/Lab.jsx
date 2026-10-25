import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import Header from "../components/Header";
import ModelSwitcher from "../components/ModelSwitcher";
import PromptTester from "../components/PromptTester";
import ResponseViewer from "../components/ResponseViewer";
import StatusBar from "../components/StatusBar";
import { useOpenRouter } from "../hooks/useOpenRouter";
import { getDefaultModel } from "../services/models";

// This is the original "AI Micro-Lab" screen, unchanged — it just lives on its
// own page now instead of being the whole app. `onBack` returns to the store.
export default function Lab({ onBack }) {
  const [selectedModel, setSelectedModel] = useState(getDefaultModel());
  const { sendPrompt, response, loading, error, usage } = useOpenRouter();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Header />
      <main className="mx-auto max-w-6xl space-y-4 px-6 py-6">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm font-medium text-slate-400 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to store
        </button>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Left: inputs */}
          <section className="flex flex-col gap-4">
            <ModelSwitcher
              selectedModel={selectedModel}
              onModelChange={setSelectedModel}
              disabled={loading}
            />
            <PromptTester onSubmit={(prompt) => sendPrompt(prompt, selectedModel)} loading={loading} />
          </section>

          {/* Right: output */}
          <section className="flex flex-col">
            <ResponseViewer response={response} loading={loading} />
          </section>
        </div>

        <StatusBar loading={loading} error={error} usage={usage} />
      </main>
    </div>
  );
}
