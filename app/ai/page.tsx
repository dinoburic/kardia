"use client";

import { useState, useRef } from "react";
import { Bot, Send, Volume2, VolumeX, AlertTriangle } from "lucide-react";

interface Message {
  id: string;
  text: string;
  sender: "user" | "ai";
  timestamp: Date;
}

interface KardiaAIResponse {
  text: string;
  risk: "low" | "medium" | "high";
  factors: string;
  recommendation: string;
  alert?: string;
}

export default function KardiaAIPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hello! I'm KardiaAI — your personal heart-health assistant. How can I help you today?",
      sender: "ai",
      timestamp: new Date(),
    },
  ]);

  const [insight, setInsight] = useState<KardiaAIResponse | null>(null);

  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);

    const sendText = inputMessage;
    setInputMessage("");
    setIsTyping(true);

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: sendText }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({
          error: "Unknown API Error",
          details: `HTTP Status: ${res.status}`,
        }));

        throw new Error(errorData.error || `Server error: ${res.status}`);
      }

      const ai: KardiaAIResponse = await res.json();

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: ai.text,
        sender: "ai",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMsg]);

      setInsight(ai);
    } catch (err) {
      console.error("AI error:", err);
      const errorText =
        err instanceof Error
          ? err.message
          : "Došlo je do neočekivane greške u obradi AI zahteva.";
      alert(`Greška: ${errorText}`);
    } finally {
      setIsTyping(false);
    }
  };

  const playAudio = async (text: string) => {
    if (isPlayingAudio) return;

    try {
      setIsPlayingAudio(true);

      const res = await fetch("/api/kardia-ai/audio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      
      if (!res.ok) {
        throw new Error(`Failed to generate audio. Status: ${res.status}`);
      }

      const audioBlob = new Blob([await res.arrayBuffer()], {
        type: "audio/mpeg",
      });

      const url = URL.createObjectURL(audioBlob);

      if (audioRef.current) audioRef.current.pause();

      audioRef.current = new Audio(url);
      audioRef.current.onended = () => {
        setIsPlayingAudio(false);
        URL.revokeObjectURL(url);
      };

      await audioRef.current.play();
    } catch (error) {
      console.error("Audio error:", error);
      setIsPlayingAudio(false);
      alert("Greška pri reprodukciji zvuka.");
    }
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlayingAudio(false);
    }
  };

  const RiskBadge = ({ risk }: { risk: "low" | "medium" | "high" }) => {
    const colors = {
      low: "bg-green-100 text-green-700 border-green-300",
      medium: "bg-yellow-100 text-yellow-700 border-yellow-300",
      high: "bg-red-100 text-red-700 border-red-300",
    };

    return (
      <span className={`px-3 py-1 rounded-full text-sm border ${colors[risk]}`}>
        {risk.toUpperCase()} RISK
      </span>
    );
  };

  return (
    <div className="p-8 min-h-screen bg-[#f5f7fa] flex gap-6">

      <div className="flex flex-col bg-white rounded-xl shadow p-6 border w-2/3">
        <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
          <Bot className="w-5 h-5 text-blue-600" />
          KardiaAI Chat
        </h2>

        <div className="flex-1 overflow-y-auto bg-gray-50 rounded-lg p-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${
                msg.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {msg.sender === "ai" && (
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-md px-4 py-2 rounded-lg text-sm ${
                  msg.sender === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-800 shadow"
                }`}
              >
                <p>{msg.text}</p>

                {msg.sender === "ai" && (
                  <button
                    className={`mt-2 text-xs flex items-center gap-1 px-2 py-1 rounded ${
                      isPlayingAudio ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    }`}
                    onClick={() =>
                      isPlayingAudio ? stopAudio() : playAudio(msg.text)
                    }
                  >
                    {isPlayingAudio ? (
                      <>
                        <VolumeX className="w-3 h-3" /> Stop
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3 h-3" /> Listen
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-3">
              <Bot className="w-5 h-5 text-blue-600" />
              <div className="bg-white px-3 py-2 rounded-lg shadow">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  />
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 flex gap-2">
          <input
            className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Ask anything about your heart health..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button
            onClick={sendMessage}
            className="p-3 bg-blue-600 rounded-lg text-white hover:bg-blue-700"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="w-1/3 bg-white rounded-xl shadow p-6 border flex flex-col">
        <h2 className="text-xl font-semibold mb-4">Kardia Insights</h2>

        {!insight ? (
          <p className="text-gray-400 text-sm">
            Ask something to see your heart-health insights here.
          </p>
        ) : (
          <div className="space-y-4 bg-gray-50 p-4 rounded-lg">

            <RiskBadge risk={insight.risk} />

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm">{insight.text}</p>
            </div>

            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-xs font-semibold">Factors Influencing Risk:</p>
              <p className="text-sm">{insight.factors}</p>
            </div>

            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-xs font-semibold">Recommended Action:</p>
              <p className="text-sm">{insight.recommendation}</p>
            </div>

            {insight.alert && (
              <div className="p-3 bg-red-50 border border-red-300 rounded-lg flex gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <p className="text-sm text-red-700">{insight.alert}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}