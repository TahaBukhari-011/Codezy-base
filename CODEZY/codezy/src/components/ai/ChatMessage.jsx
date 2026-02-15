import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";

const ChatMessage = ({ message }) => {
  // Determine if the message is from the user or the AI
  const isUser = message.sender === "user";

  return (
    <div
      className={classNames(
        "flex items-start my-2",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      {/* Optional avatar */}
      {!isUser && (
        <div className="mr-2">
          <img
            src="/ai-avatar.png"
            alt="AI"
            className="w-8 h-8 rounded-full"
          />
        </div>
      )}

      <div
        className={classNames(
          "px-4 py-2 rounded-lg max-w-xs break-words",
          isUser ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800"
        )}
      >
        {message.text}
      </div>

      {/* Optional user avatar */}
      {isUser && (
        <div className="ml-2">
          <img
            src="/user-avatar.png"
            alt="User"
            className="w-8 h-8 rounded-full"
          />
        </div>
      )}
    </div>
  );
};

ChatMessage.propTypes = {
  message: PropTypes.shape({
    sender: PropTypes.oneOf(["user", "ai"]).isRequired,
    text: PropTypes.string.isRequired,
    timestamp: PropTypes.string, // optional
  }).isRequired,
};

export default ChatMessage;
