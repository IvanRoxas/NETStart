import { notFound } from "next/navigation";
import PlaygroundClient from "./PlaygroundClient";

export default function AIPlayground() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  const mockEnabled = process.env.AI_MOCK === "true";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Nova AI Sandbox Evaluator Playground
            </h1>
            <span
              className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${
                mockEnabled
                  ? "bg-emerald-950/80 text-emerald-400 border-emerald-800"
                  : "bg-cyan-950/80 text-cyan-400 border-cyan-800"
              }`}
            >
              Mode: {mockEnabled ? "AI_MOCK" : "LIVE GEMINI"}
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Developer testing harness for sandbox telemetry evaluation, prompt safety, and hint-bank classification.
          </p>
        </div>

        <PlaygroundClient isMock={mockEnabled} />
      </div>
    </div>
  );
}
