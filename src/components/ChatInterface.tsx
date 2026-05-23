"use client";

import React, { useState, useEffect, useRef } from "react";
import { Send, Eye, ShieldAlert, Sparkles, RefreshCw } from "lucide-react";

interface Exercise {
  id: string;
  title: string;
  category: string;
  description: string;
  duration: string;
  steps: string[];
  tags: string[];
}

interface Game {
  id: string;
  title: string;
  category: string;
  description: string;
  type: string;
  difficulty: string;
  tags: string[];
}

interface Recommendations {
  exercises?: Exercise[];
  games?: Game[];
}

interface Message {
  id: string;
  sender: "user" | "naina";
  text: string;
  timestamp: Date;
  recommendations?: Recommendations;
  isMedicalWarning?: boolean;
}

interface ChatInterfaceProps {
  onStartExercise: (exerciseId: string) => void;
  onStartGame: (gameId: string) => void;
}

export default function ChatInterface({ onStartExercise, onStartGame }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([
      {
        id: "welcome",
        sender: "naina",
        text: "Hello! I am Naina, your conversational eye wellness companion. 🌿\n\nStaring at screens all day can lead to dry eyes, strain, or headaches. How are your eyes feeling right now?",
        timestamp: new Date(),
      },
    ]);
  }, []);

  const actionChips = [
    { label: "👁️ My eyes are strained", prompt: "My eyes are feeling very strained and tired." },
    { label: "💧 My eyes feel dry", prompt: "My eyes feel dry and scratchy." },
    { label: "⏱️ Start 20-20-20 Rule", action: "timer", target: "ex_20_20_20" },
    { label: "🎮 Quick Focus Game", action: "game", target: "game_tracker" },
    { label: "🧘 Quick Palming Exercise", prompt: "Suggest a relaxing palming guide." }
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const checkMedicalDisclaimer = (text: string): boolean => {
    const medicalKeywords = [
      "disease", "cure", "medicine", "doctor", "drops", "glasses", "prescription",
      "infection", "pain", "blind", "cataract", "glaucoma", "conjunctivitis", "redness"
    ];
    const lower = text.toLowerCase();
    return medicalKeywords.some(keyword => lower.includes(keyword));
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMsgId = Math.random().toString();
    const newUserMessage: Message = {
      id: userMsgId,
      sender: "user",
      text: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081";
      const response = await fetch(`${backendUrl}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: text,
          session_id: sessionId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to communicate with Spring Boot gateway");
      }

      const data = await response.json();
      if (data.sessionId && !sessionId) {
        setSessionId(data.sessionId);
      }

      const hasMedicalAlert = checkMedicalDisclaimer(text) || checkMedicalDisclaimer(data.response);

      const nainaMessage: Message = {
        id: Math.random().toString(),
        sender: "naina",
        text: data.response,
        timestamp: new Date(),
        recommendations: data.recommendations,
        isMedicalWarning: hasMedicalAlert,
      };

      setMessages((prev) => [...prev, nainaMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: Message = {
        id: Math.random().toString(),
        sender: "naina",
        text: "I am having trouble connecting to my servers. Please ensure the backend services are running. In the meantime, remember to take a screen break!",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChipClick = (chip: typeof actionChips[0]) => {
    if (chip.action === "timer" && chip.target) {
      onStartExercise(chip.target);
    } else if (chip.action === "game" && chip.target) {
      onStartGame(chip.target);
    } else if (chip.prompt) {
      handleSendMessage(chip.prompt);
    }
  };

  return (
    <div className="flex flex-col h-full rounded-2xl glass overflow-hidden border border-sage-200/20 shadow-lg">
      {/* Header */}
      <div className="px-6 py-4 border-b border-sage-200/10 flex items-center justify-between bg-sage-50/50 dark:bg-sage-950/30">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-sage-500 flex items-center justify-center text-white shadow-inner animate-pulse">
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-semibold text-lg text-sage-900 dark:text-sage-100 flex items-center gap-1.5">
              Naina AI <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-sage-100 dark:bg-sage-900 text-sage-600 dark:text-sage-400">Assistant</span>
            </h2>
            <p className="text-xs text-sage-500 dark:text-sage-400">Online • Your eye wellness guide</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {sessionId && (
            <button 
              onClick={() => {
                setSessionId(null);
                setMessages([
                  {
                    id: "welcome",
                    sender: "naina",
                    text: "Conversation reset. Hello! How can I help your eyes feel better right now?",
                    timestamp: new Date(),
                  }
                ]);
              }}
              title="Reset Chat"
              className="p-2 hover:bg-sage-200/30 rounded-full text-sage-600 dark:text-sage-400 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}>
            {/* Bubble */}
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed transition-all shadow-sm ${
                msg.sender === "user"
                  ? "bg-sage-600 text-white rounded-tr-none"
                  : "bg-white dark:bg-sage-900 border border-sage-200/10 text-sage-900 dark:text-sage-100 rounded-tl-none"
              }`}
            >
              <div className="whitespace-pre-line">{msg.text}</div>
            </div>

            {/* Medical Warning Alert */}
            {msg.isMedicalWarning && msg.sender === "naina" && (
              <div className="mt-2 max-w-[85%] glass border-l-4 border-amber-500 rounded-r-xl p-3 bg-amber-50/50 dark:bg-amber-950/10 flex items-start space-x-2.5 animate-fadeIn">
                <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-800 dark:text-amber-300">
                  <strong>Safety Notice:</strong> Straining symptoms can sometimes point to medical conditions. Consider booking a professional check-up if irritation persists.
                  <a 
                    href="https://www.practo.com/consult" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="block mt-1 font-semibold text-sage-600 dark:text-mint-400 hover:underline"
                  >
                    Consult an eye specialist online ↗
                  </a>
                </div>
              </div>
            )}

            {/* Inline Recommendations */}
            {msg.recommendations && (
              <div className="mt-3 w-full max-w-[90%] space-y-2.5">
                {msg.recommendations.exercises && msg.recommendations.exercises.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-[11px] font-semibold text-sage-500 uppercase tracking-wider pl-1">Suggested Exercises</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {msg.recommendations.exercises.map((ex) => (
                        <div key={ex.id} className="p-3 rounded-xl bg-white dark:bg-sage-950 border border-sage-200/10 flex flex-col justify-between shadow-xs hover:border-sage-500/30 transition-all">
                          <div>
                            <h4 className="text-xs font-semibold text-sage-800 dark:text-sage-200">{ex.title}</h4>
                            <p className="text-[11px] text-sage-500 dark:text-sage-400 mt-1 line-clamp-2">{ex.description}</p>
                          </div>
                          <button
                            onClick={() => onStartExercise(ex.id)}
                            className="mt-2.5 w-full text-center text-xs py-1.5 rounded-lg bg-sage-100 hover:bg-sage-500 hover:text-white dark:bg-sage-900 text-sage-700 dark:text-sage-300 font-medium transition-all"
                          >
                            Start ({ex.duration})
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {msg.recommendations.games && msg.recommendations.games.length > 0 && (
                  <div className="space-y-2 mt-2">
                    <p className="text-[11px] font-semibold text-sage-500 uppercase tracking-wider pl-1">Focus Building Games</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {msg.recommendations.games.map((g) => (
                        <div key={g.id} className="p-3 rounded-xl bg-white dark:bg-sage-950 border border-sage-200/10 flex flex-col justify-between shadow-xs hover:border-sage-500/30 transition-all">
                          <div>
                            <div className="flex justify-between items-start">
                              <h4 className="text-xs font-semibold text-sage-800 dark:text-sage-200">{g.title}</h4>
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-mint-500/10 text-mint-500 font-semibold uppercase">{g.difficulty}</span>
                            </div>
                            <p className="text-[11px] text-sage-500 dark:text-sage-400 mt-1 line-clamp-2">{g.description}</p>
                          </div>
                          <button
                            onClick={() => onStartGame(g.id)}
                            className="mt-2.5 w-full text-center text-xs py-1.5 rounded-lg bg-sage-100 hover:bg-sage-500 hover:text-white dark:bg-sage-900 text-sage-700 dark:text-sage-300 font-medium transition-all"
                          >
                            Play Game
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Time */}
            <span className="text-[10px] text-sage-400 dark:text-sage-500 mt-1 px-1">
              {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}

        {isLoading && (
          <div className="flex flex-col items-start">
            <div className="bg-white dark:bg-sage-900 border border-sage-200/10 rounded-2xl rounded-tl-none px-4 py-3 shadow-xs">
              <div className="flex items-center space-x-1.5 py-1">
                <div className="w-2.5 h-2.5 rounded-full bg-sage-400 animate-bounce" style={{ animationDelay: "0ms" }}></div>
                <div className="w-2.5 h-2.5 rounded-full bg-sage-400 animate-bounce" style={{ animationDelay: "150ms" }}></div>
                <div className="w-2.5 h-2.5 rounded-full bg-sage-400 animate-bounce" style={{ animationDelay: "300ms" }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions Box / Action Chips */}
      <div className="px-6 py-2 flex flex-wrap gap-1.5 overflow-x-auto select-none border-t border-sage-200/5 bg-sage-50/10 dark:bg-sage-950/10">
        {actionChips.map((chip, idx) => (
          <button
            key={idx}
            onClick={() => handleChipClick(chip)}
            className="text-xs px-3 py-1.5 rounded-full bg-sage-100 hover:bg-sage-200/60 dark:bg-sage-900 dark:hover:bg-sage-800 text-sage-700 dark:text-sage-300 transition-all font-medium whitespace-nowrap"
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage(input);
        }}
        className="p-4 border-t border-sage-200/10 flex items-center space-x-2 bg-sage-50/20 dark:bg-sage-950/20"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask Naina about screen fatigue, dry eyes..."
          className="flex-1 bg-white dark:bg-sage-900 border border-sage-200/20 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-sage-500/50 text-sage-900 dark:text-sage-100 placeholder-sage-400"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="p-2.5 rounded-xl bg-sage-500 hover:bg-sage-600 disabled:opacity-50 text-white shadow-sm flex items-center justify-center transition-all cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
