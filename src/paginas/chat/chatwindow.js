import React, { useEffect, useRef } from "react";
import MessageBubble from "./messagebuble";
import MessageInput from "./messageinput";
import "./chat.css";

export default function ChatWindow({ messages, onSendMessage, friend }) {
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!friend) {
    return (
      <div className="chat-window-empty">
        <p>Selecciona un chat para comenzar</p>
      </div>
    );
  }

  return (
    <div className="chat-window">
      <div className="chat-window-header">
        <img
          src={friend.avatar_url || "/default-avatar.png"}
          alt={friend.name}
          className="chat-window-avatar"
        />
        <span>{friend.name}</span>
      </div>

      <div className="chat-window-messages">
        {messages.map((msg, index) => (
          <MessageBubble key={index} message={msg} />
        ))}
        <div ref={chatEndRef} />
      </div>

      <MessageInput onSend={onSendMessage} />
    </div>
  );
}
