"use client";

import { useState, useRef } from "react";
import { Bot, Send, Volume2, VolumeX } from "lucide-react";

// TYPES
interface Message {
  id: string;
  text: string;
  sender: "user" | "ai";
  timestamp: Date;
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

  const [insights, setInsights] = useState<string[]>([
    "Your insights will appear here as the conversation continues.",
  ]);

  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // SEND MESSAGE
  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const msg = inputMessage;
    setInputMessage("");
    setIsTyping(true);

    try {
      const res = await fetch("/api/kardia-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: msg }),
      });

      const ai = await res.json();

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: ai.text,
        sender: "ai",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);

      // UPDATE INSIGHTS
      setInsights(ai.insights || ["No insights generated"]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsTyping(false);
    }
  };

  // PLAY AUDIO
  const playAudio = async (text: string) => {
    if (isPlayingAudio) return;

    try {
      setIsPlayingAudio(true);

      const res = await fetch("/api/kardia-ai/audio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

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
    }
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlayingAudio(false);
    }
  };

  return (
    <div className="p-8 min-h-screen bg-[#f5f7fa] flex gap-6">

      {/* LEFT: CHAT */}
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
                <div className="w-8 h-8 flex items-center justify-center bg-blue-600 rounded-full text-white">
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
                    className="mt-2 text-xs flex items-center gap-1 px-2 py-1 rounded bg-blue-100 text-blue-700 hover:bg-blue-200"
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
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* INPUT */}
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

      {/* RIGHT: INSIGHTS */}
      <div className="w-1/3 bg-white rounded-xl shadow p-6 border flex flex-col">
        <h2 className="text-xl font-semibold mb-4">Kardia Insights</h2>

        <div className="flex-1 bg-gray-50 overflow-y-auto p-4 rounded-lg space-y-4">
          {insights.map((insight, index) => (
            <div
              key={index}
              className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-gray-800"
            >
              {insight}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
