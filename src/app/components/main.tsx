"use client";

import { useState } from "react";
import { startWorkflow, step } from "../actions/actions";

export default function ChapterInput() {
  const [text, setText] = useState("");
  const [prompt1, setPrompt1] = useState("");
  const [prompt2, setPrompt2] = useState("");
  const [loading, setLoading] = useState(false);
  const [workflowResult, setWorkflowResult] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append("text", text);
    formData.append("prompt1", prompt1);
    formData.append("prompt2", prompt2);

    const result = await startWorkflow(formData);
    setWorkflowResult(result);

    setLoading(false);
  };

  const handleNextStep = async () => {
    if (workflowResult?.step) {
      setLoading(true);
      const nextStepResult = await step(
        workflowResult.step,
        workflowResult.runId
      );
      setWorkflowResult(nextStepResult);
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-4 space-y-4">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Enter your chapter text here..."
        className="w-full h-40 p-2 border rounded"
      />

      <div className="grid grid-cols-2 gap-4">
        <input
          type="text"
          value={prompt1}
          onChange={(e) => setPrompt1(e.target.value)}
          placeholder="Enter first prompt..."
          className="p-2 border rounded w-full"
        />
        <input
          type="text"
          value={prompt2}
          onChange={(e) => setPrompt2(e.target.value)}
          placeholder="Enter second prompt..."
          className="p-2 border rounded w-full"
        />
      </div>

      {!workflowResult && (
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white py-2 rounded mt-4 hover:bg-blue-600 disabled:bg-gray-400"
        >
          {loading ? "Submitting..." : "Submit"}
        </button>
      )}

      {workflowResult?.results && (
        <div className="mt-4 p-4 border border-gray-700 rounded-lg bg-gray-900 shadow-md">
          <h3 className="text-lg font-semibold text-gray-100 mb-2">
            Step Results:
          </h3>
          <pre className="bg-gray-800 p-3 rounded text-sm text-gray-300 overflow-auto">
            {JSON.stringify(workflowResult.results, null, 2)}
          </pre>
        </div>
      )}

      {workflowResult?.step && (
        <button
          onClick={handleNextStep}
          disabled={loading}
          className="w-full bg-green-500 text-white py-2 rounded mt-4 hover:bg-green-600 disabled:bg-gray-400"
        >
          {loading ? "Processing..." : "Next Step"}
        </button>
      )}
    </form>
  );
}
