import React, { useState, useEffect, useRef } from "react";
import { api } from "../api/client";
import { Send, Bot, User } from "lucide-react";

interface Message {
  from: "user" | "bot";
  text: string;
}

export default function Assistant() {
  const [lang, setLang] = useState("en");
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState<Message[]>([
    { from: "bot", text: "Hello! I am your Warranty Assistant. Ask me about your products, warranty status, or service centers." }
  ]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  async function send() {
    if (!message.trim()) return;
    const userMsg = { from: "user" as const, text: message };
    setChat(c => [...c, userMsg]);
    setMessage("");
    setLoading(true);

    try {
      const res = await api.post("/assistant/message", { message: userMsg.text, lang });
      setChat(c => [...c, { from: "bot", text: res.data.reply }]);
    } catch (err) {
      setChat(c => [...c, { from: "bot", text: "Sorry, I encountered an error. Please try again." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4 max-w-2xl mx-auto h-[calc(100vh-80px)] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Bot className="text-blue-600" /> Smart Assistant
        </h1>
        <select 
          className="border rounded-lg px-3 py-1 bg-white text-sm"
          value={lang} 
          onChange={e => setLang(e.target.value)}
        >
          <option value="en">English</option>
          <option value="hi">Hindi (हिंदी)</option>
          <option value="mr">Marathi (मराठी)</option>
        </select>
      </div>

      <div className="flex-1 bg-gray-50 rounded-xl border border-gray-200 p-4 overflow-y-auto mb-4 space-y-4">
        {chat.map((m, i) => (
          <div key={i} className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] p-3 rounded-xl ${
              m.from === "user" 
                ? "bg-black text-white rounded-tr-none" 
                : "bg-white border border-gray-200 shadow-sm rounded-tl-none"
            }`}>
              <p className="text-sm whitespace-pre-wrap">{m.text}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-200 p-3 rounded-xl rounded-tl-none animate-pulse">
              <div className="w-8 h-2 bg-gray-400 rounded-full"></div>
            </div>
          </div>
        )}
        <div ref={bottomRef}></div>
      </div>

      <div className="flex gap-2">
        <input 
          className="flex-1 border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black"
          value={message} 
          onChange={e => setMessage(e.target.value)}
          onKeyDown={e => e.key === "Enter" && send()}
          placeholder="Ask something..." 
        />
        <button 
          className="bg-black text-white p-3 rounded-xl hover:bg-gray-800 transition disabled:opacity-50"
          onClick={send}
          disabled={loading || !message.trim()}
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
}
