import React, { useEffect, useState } from "react";
import "./chat.css";
import ChatSidebar from "./chatsidebar";
import ChatWindow from "./chatwindow";

function ChatPage() {
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [messages, setMessages] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  // 🔹 Obtener usuario actual desde localStorage
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) setCurrentUser(user);
  }, []);

  // 🔹 Cargar mensajes cuando se selecciona un amigo
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedFriend || !currentUser) return;
      try {
        const res = await fetch(
          `${process.env.REACT_APP_API_URL}/api/chat/history/${currentUser.id}/${selectedFriend.id}`
        );
        const data = await res.json();
        setMessages(data);
      } catch (err) {
        console.error("Error al cargar mensajes:", err);
      }
    };

    fetchMessages();
  }, [selectedFriend, currentUser]);

  // 🔹 Enviar mensaje
  const handleSendMessage = async (text) => {
    if (!text.trim() || !selectedFriend || !currentUser) return;

    const newMessage = {
      text,
      sender_id: currentUser.id,
      receiver_id: selectedFriend.id,
      created_at: new Date(),
      isOwn: true,
    };

    // Mostrar mensaje inmediatamente
    setMessages((prev) => [...prev, newMessage]);

    try {
      await fetch(`${process.env.REACT_APP_API_URL}/api/chat/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiver_id: selectedFriend.id,
          content: text,
        }),
      });
    } catch (err) {
      console.error("Error al enviar mensaje:", err);
    }
  };

  return (
    <div className="chat-page">
      {/* Sidebar de amigos */}
      <ChatSidebar
        onSelectChat={setSelectedFriend}
        currentUser={currentUser}
      />

      {/* Ventana de chat */}
      <ChatWindow
        friend={selectedFriend}
        messages={messages}
        onSendMessage={handleSendMessage}
      />
    </div>
  );
}

export default ChatPage;

