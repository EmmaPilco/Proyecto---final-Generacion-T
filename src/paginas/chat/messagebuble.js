import React from "react";
import "./chat.css";

export default function MessageBubble({ message }) {
  const isOwn = message.isOwn;

  return (
    <div className={`message-bubble ${isOwn ? "own" : "friend"}`}>
      <p>{message.content}</p>
      <span className="message-time">
        {new Date(message.created_at).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </span>
    </div>
  );
}
