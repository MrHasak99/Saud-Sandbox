import { useState } from "react";
import Header from "./components/Header";
import ModelSwitcher from "./components/ModelSwitcher";
import PromptTester from "./components/PromptTester";
import ResponseViewer from "./components/ResponseViewer";
import StatusBar from "./components/StatusBar";
import { useOpenRouter } from "./hooks/useOpenRouter";
import { getDefaultModel } from "./services/models";

export default function App() {
  const [selectedModel, setSelectedModel] = useState(getDefaultModel());
  const { sendPrompt, response, loading, error, usage } = useOpenRouter();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Header />
      <main className="mx-auto max-w-6xl space-y-4 px-6 py-6">
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
