import { useState } from "react";
import { Loader2 } from "lucide-react";

export default function App() {
  const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API;
  const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API;
  console.log(OPENROUTER_API_KEY, "this is api key");

  const [prompt, setPrompt] = useState("");

  const [gptResponse, setGptResponse] = useState("");
  const [qwenResponse, setQwenResponse] = useState("");
  const [geminiResponse, setGeminiResponse] = useState("");
  const [llamaResponse, setLlamaResponse] = useState("");

  const [loading, setLoading] = useState({
    gpt: false,
    qwen: false,
    gemini: false,
    llama: false,
  });

  const fetchRequest = async (content: string, model: string) => {
    const url = "https://openrouter.ai/api/v1/chat/completions"; // Replace with your API key

    const requestBody = {
      model: `${model}`,
      messages: [
        {
          role: "user",
          content: `${content}`,
        },
      ],
    };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      return result.choices[0].message.content;
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const fetchGeminiRequest = async (content: string) => {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`; // Replace GEMINI_API_KEY with your actual API key

    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: `${content}`,
            },
          ],
        },
      ],
    };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      return result.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!prompt.trim()) return;

    setLoading({
      gpt: true,
      qwen: true,
      gemini: true,
      llama: true,
    });

    setGptResponse(
      await fetchRequest(prompt, "microsoft/phi-3-mini-128k-instruct:free")
    );
    setLoading((prev) => ({ ...prev, gpt: false }));
    setQwenResponse(await fetchRequest(prompt, "qwen/qwen-2-7b-instruct:free"));
    setLoading((prev) => ({ ...prev, qwen: false }));
    setGeminiResponse(await fetchGeminiRequest(prompt));
    setLoading((prev) => ({ ...prev, gemini: false }));
    setLlamaResponse(
      await fetchRequest(prompt, "meta-llama/llama-3.2-1b-instruct:free")
    );
    setLoading((prev) => ({ ...prev, llama: false }));
  };

  const ResponseWindow = ({
    title,
    content,
    isLoading,
  }: {
    title: string;
    content: string;
    isLoading: boolean;
  }) => (
    <div className="flex-1 p-4 bg-white rounded-lg shadow-lg m-2">
      <h2 className="text-lg font-bold mb-2 text-gray-700">{title}</h2>
      <div className="h-[200px] overflow-y-auto bg-gray-50 p-4 rounded">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : (
          <p className="text-gray-600">{content || "No response yet"}</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-center mb-8 text-gray-800">
          Multi-LLM Chat Interface
        </h1>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <ResponseWindow
            title="Microsoft Phi"
            content={gptResponse || "No response yet"}
            isLoading={loading.gpt}
          />
          <ResponseWindow
            title="qwen"
            content={qwenResponse || "No response yet"}
            isLoading={loading.qwen}
          />
          <ResponseWindow
            title="gemini"
            content={geminiResponse || "No response yet"}
            isLoading={loading.gemini}
          />
          <ResponseWindow
            title="Llama"
            content={llamaResponse || "No response yet"}
            isLoading={loading.llama}
          />
        </div>

        <form onSubmit={handleSubmit} className="flex gap-4">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter your prompt here..."
            className="flex-1 p-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-6 py-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
