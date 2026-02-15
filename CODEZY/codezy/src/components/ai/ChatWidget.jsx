// src/components/ai/ChatWidget.jsx
import React, { useState } from "react";
import { MessageCircle, X, Maximize2, Minimize2, Send } from "lucide-react";
import ChatWindow from "./ChatWindow";
import { sendChatMessage } from "./chatApi";

const ChatWidget = ({ context }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [chatMessage, setChatMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!chatMessage.trim()) return;

    const userMsg = {
      role: "user",
      content: chatMessage,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setChatHistory((prev) => [...prev, userMsg]);
    setChatMessage("");
    setLoading(true);

    const reply = await sendChatMessage(chatMessage, context);
    setLoading(false);

    setChatHistory((prev) => [
      ...prev,
      { role: "assistant", content: reply, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) },
    ]);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
      {isOpen && (
        <div
          className={`mb-4 bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden transition-all duration-300 ease-in-out ${
            isMaximized ? "w-[90vw] h-[85vh] fixed bottom-[7.5vh] right-[5vw]" : "w-[350px] h-[550px]"
          }`}
        >
          <div className="bg-gradient-to-r from-[#D91B5C] via-[#7C3AED] to-[#7C3AED] p-4 text-white flex justify-between items-center shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-bold">✨</div>
              <h3 className="font-bold text-md leading-tight">Codezy AI Coach</h3>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => setIsMaximized(!isMaximized)}>
                {isMaximized ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
              </button>
              <X size={20} className="cursor-pointer" onClick={() => setIsOpen(false)} />
            </div>
          </div>

          <ChatWindow chatHistory={chatHistory} loading={loading} />

          <div className="p-4 bg-white border-t border-gray-50 flex items-center gap-3">
            <input
              type="text"
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Type your message..."
              className="flex-1 bg-[#F9FAFB] border border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-purple-300"
            />
            <button
              onClick={handleSend}
              className="bg-gradient-to-br from-[#A21CAF] to-[#DB2777] text-white p-3 rounded-xl shadow-lg hover:opacity-90 transition-all hover:scale-105 active:scale-95"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-gradient-to-br from-[#7C3AED] via-[#A21CAF] to-[#DB2777] text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-all duration-300 active:scale-95"
      >
        {isOpen ? <X size={28} /> : <MessageCircle size={28} />}
      </button>
    </div>
  );
};

export default ChatWidget;
