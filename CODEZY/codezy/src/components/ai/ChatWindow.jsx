// src/components/ai/ChatWindow.jsx
import React, { useEffect, useRef } from "react";

const ChatWindow = ({ chatHistory, loading }) => {
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [chatHistory]);

  return (
    <div className="flex-1 p-4 bg-white overflow-y-auto space-y-4" ref={scrollRef}>
      {chatHistory.map((chat, idx) => (
        <div key={idx} className={`flex ${chat.role === "user" ? "justify-end" : "justify-start"}`}>
          <div
            className={`max-w-[85%] p-3 rounded-2xl shadow-sm text-sm ${
              chat.role === "user"
                ? "bg-purple-600 text-white rounded-tr-none shadow-purple-200"
                : "bg-white border border-gray-100 text-gray-700 rounded-tl-none"
            }`}
          >
            {chat.content}
            <p className={`text-[9px] mt-1 ${chat.role === "user" ? "text-purple-100" : "text-gray-400"}`}>
              {chat.time}
            </p>
          </div>
        </div>
      ))}

      {loading && (
        <div className="flex justify-start">
          <div className="max-w-[85%] p-3 rounded-2xl shadow-sm text-sm bg-gray-100 text-gray-700 animate-pulse">
            Typing...
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWindow;
