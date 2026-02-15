// src/components/ai/chatApi.js
import axios from "axios";

// Use your FastAPI endpoint here
export const sendChatMessage = async (question, context = {}) => {
  try {
    const response = await axios.post("http://127.0.0.1:8000/ai/tutor", {
      question,
      context,
    });

    // Make sure the response returns a string
    return typeof response.data === "string" ? response.data : response.data.text || response.data.answer || "Sorry, no reply.";
  } catch (err) {
    console.error("AI backend error:", err);
    return "Sorry, I couldn't process that.";
  }
};
