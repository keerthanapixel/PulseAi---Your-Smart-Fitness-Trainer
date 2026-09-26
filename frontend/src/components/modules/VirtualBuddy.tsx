"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Sparkles, Trash2, ArrowRight } from "lucide-react";
import { GlassCard } from "../ui/GlassCard";
import { api, ChatResponse } from "@/lib/api";

interface MessageItem {
  id: string;
  sender: "user" | "bot";
  text: string;
  emotion?: string;
  emotionLabel?: string;
  suggestedActions?: string[];
  time: string;
}

const QUICK_PROMPTS = [
  "How do I do a proper squat?",
  "What should I eat before workout?",
  "How much protein do I need?",
  "My knees hurt when squatting",
  "What is the best workout split?",
  "How can I lose belly fat?",
  "Tell me about creatine",
  "I'm feeling tired and burnt out today...",
];

export const VirtualBuddy: React.FC = () => {
  const [messages, setMessages] = useState<MessageItem[]>([
    {
      id: "welcome",
      sender: "bot",
      text: (
        "Hey champion! I'm your **PULSE AI Gym Buddy & Fitness Coach**.\n\n" +
        "Ask me anything about:\n" +
        "• **Exercise Biomechanics:** Squat depth, knee tracking, lifting cues.\n" +
        "• **Sports Nutrition:** Pre/post-workout fuel, daily protein targets, fat loss deficits.\n" +
        "• **Workout Programming:** PPL, Upper/Lower splits, chest/back routines, plateaus.\n" +
        "• **Motivation:** 5-minute kickstarts when you're feeling sluggish!"
      ),
      emotion: "happy",
      emotionLabel: "PULSE AI Assistant",
      suggestedActions: [
        "How do I do a proper squat?",
        "What should I eat before workout?",
        "How much protein do I need?",
        "Launch AI Pose Coach"
      ],
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const messageContent = (textToSend || input).trim();
    if (!messageContent || loading) return;

    const userMessage: MessageItem = {
      id: `usr-${Date.now()}`,
      sender: "user",
      text: messageContent,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const data: ChatResponse = await api.sendChatMessage(messageContent);
      const botMessage: MessageItem = {
        id: `bot-${Date.now()}`,
        sender: "bot",
        text: data.reply,
        emotion: data.emotion,
        emotionLabel: data.emotion_label,
        suggestedActions: data.suggested_actions,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err: any) {
      const errorMessage: MessageItem = {
        id: `err-${Date.now()}`,
        sender: "bot",
        text: "Could not reach the AI Fitness backend. Please ensure the FastAPI server is running on port 8000.",
        emotion: "sad",
        emotionLabel: "Offline Mode",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const getEmotionBadgeColor = (emotion?: string) => {
    switch (emotion) {
      case "happy":
        return "bg-brand-emerald/15 text-brand-emerald border-brand-emerald/30";
      case "sad":
        return "bg-brand-rose/15 text-brand-rose border-brand-rose/30";
      case "unmotivated":
        return "bg-brand-amber/15 text-brand-amber border-brand-amber/30";
      case "focused":
        return "bg-brand-cyan/15 text-brand-cyan border-brand-cyan/30";
      default:
        return "bg-brand-purple/15 text-brand-purple border-brand-purple/30";
    }
  };

  // Render markdown text formatting (bold, italic, bullets)
  const renderFormattedMessage = (content: string) => {
    const lines = content.split("\n");
    return lines.map((line, idx) => {
      // Split bold (**text**) and italic (*text*)
      const parts = line.split(/(\*\*.*?\*\*|\*.*?\*)/g);
      const formattedLine = parts.map((part, pIdx) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={pIdx} className="font-bold text-white">
              {part.slice(2, -2)}
            </strong>
          );
        }
        if (part.startsWith("*") && part.endsWith("*")) {
          return (
            <em key={pIdx} className="italic text-brand-cyan">
              {part.slice(1, -1)}
            </em>
          );
        }
        return part;
      });

      const isBullet = line.trim().startsWith("•") || line.trim().startsWith("-");
      const isNumbered = /^\d+\.\s/.test(line.trim());

      return (
        <div
          key={idx}
          className={`${line.trim() === "" ? "h-2" : "min-h-[1.25rem]"} ${
            isBullet || isNumbered ? "pl-2 py-0.5 text-slate-100" : ""
          }`}
        >
          {formattedLine}
        </div>
      );
    });
  };

  return (
    <div className="p-2 sm:p-4 lg:p-6 max-w-5xl mx-auto flex flex-col h-[calc(100dvh-8rem)] lg:h-[calc(100vh-6rem)]">
      <GlassCard className="flex flex-col flex-1 overflow-hidden border-white/[0.12] shadow-2xl rounded-2xl">
        {/* Chat Header */}
        <div className="px-3.5 py-2.5 sm:px-6 sm:py-3.5 border-b border-white/[0.08] flex items-center justify-between bg-obsidian-950/60 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-brand-purple/20 text-brand-purple border border-brand-purple/30 flex items-center justify-center shadow-lg shadow-brand-purple/10 shrink-0">
              <Bot className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-xs sm:text-base font-bold text-white flex items-center gap-1.5 truncate">
                Virtual Gym Buddy
                <span className="text-[9px] sm:text-[10px] font-mono font-medium px-1.5 py-0.2 rounded-full bg-brand-purple/20 text-brand-purple border border-brand-purple/30">
                  FastAPI
                </span>
              </h2>
              <p className="text-[10px] sm:text-xs text-slate-400 truncate">
                Biomechanics form cues & sports nutrition
              </p>
            </div>
          </div>

          <button
            onClick={() => setMessages([messages[0]])}
            className="p-1.5 sm:p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/[0.05] transition shrink-0"
            title="Clear Chat History"
          >
            <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>

        {/* Message Feed */}
        <div className="flex-1 overflow-y-auto p-2.5 sm:p-4 lg:p-6 space-y-2.5 sm:space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-2 sm:gap-3.5 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.sender === "bot" && (
                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-brand-purple/20 text-brand-purple border border-brand-purple/30 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
              )}

              <div
                className={`max-w-[90%] sm:max-w-2xl rounded-2xl p-2.5 sm:p-4 transition-all ${
                  msg.sender === "user"
                    ? "bg-gradient-to-r from-brand-emerald to-emerald-600 text-obsidian-950 font-semibold rounded-tr-sm shadow-lg shadow-brand-emerald/10"
                    : "bg-obsidian-900/95 border border-white/[0.1] text-slate-200 rounded-tl-sm shadow-xl"
                }`}
              >
                {msg.sender === "bot" && msg.emotionLabel && (
                  <div className="flex items-center gap-1.5 mb-1.5 pb-1.5 border-b border-white/[0.06]">
                    <span
                      className={`text-[9px] sm:text-[10px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.2 rounded border ${getEmotionBadgeColor(
                        msg.emotion
                      )}`}
                    >
                      {msg.emotionLabel}
                    </span>
                    <span className="text-[9px] sm:text-[10px] text-slate-400 font-mono">{msg.time}</span>
                  </div>
                )}

                <div className="text-xs sm:text-sm leading-relaxed space-y-1">
                  {renderFormattedMessage(msg.text)}
                </div>

                {msg.sender === "user" && (
                  <div className="text-right text-[9px] sm:text-[10px] text-obsidian-950/70 font-mono mt-1">
                    {msg.time}
                  </div>
                )}

                {/* Suggested Action Chips */}
                {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                  <div className="mt-2.5 pt-2 sm:mt-3 sm:pt-3 border-t border-white/[0.08] flex flex-wrap gap-1">
                    {msg.suggestedActions.map((act, i) => (
                      <button
                        key={i}
                        onClick={() => handleSend(act)}
                        className="text-[10px] sm:text-[11px] px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg bg-white/[0.04] hover:bg-brand-purple/20 hover:text-brand-purple border border-white/[0.08] hover:border-brand-purple/30 text-slate-300 transition flex items-center gap-1"
                      >
                        <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-brand-purple" />
                        <span>{act}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {msg.sender === "user" && (
                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-white/[0.08] text-slate-300 border border-white/[0.1] flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
              )}
            </div>
          ))}

          {/* Typing Indicator */}
          {loading && (
            <div className="flex gap-2 sm:gap-3.5 items-center">
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-brand-purple/20 text-brand-purple border border-brand-purple/30 flex items-center justify-center shrink-0">
                <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <div className="p-2.5 sm:p-3.5 rounded-2xl bg-obsidian-900 border border-white/[0.08] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-brand-purple animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-brand-purple animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-brand-purple animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-3 py-1.5 border-t border-white/[0.06] bg-obsidian-950/40 flex items-center gap-1.5 overflow-x-auto shrink-0">
          <span className="text-[9px] sm:text-[10px] uppercase font-mono text-slate-400 shrink-0">Prompts:</span>
          {QUICK_PROMPTS.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSend(prompt)}
              className="text-[11px] sm:text-xs text-slate-300 hover:text-white px-2.5 py-0.5 rounded-full bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] whitespace-nowrap transition"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-2.5 sm:p-4 border-t border-white/[0.08] bg-obsidian-950/80 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2 sm:gap-3"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything: squat form, pre-workout meals, protein needs..."
              className="flex-1 bg-obsidian-900 border border-white/[0.12] rounded-xl px-3.5 py-2.5 sm:px-4 sm:py-3 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-brand-purple focus:ring-1 focus:ring-brand-purple transition"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-3.5 sm:px-5 py-2.5 sm:py-3 rounded-xl bg-brand-purple hover:bg-brand-purple/90 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 shadow-lg shadow-brand-purple/20 transition active:scale-95 shrink-0"
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </form>
        </div>
      </GlassCard>
    </div>
  );
};
