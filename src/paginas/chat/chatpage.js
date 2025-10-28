import React, { useEffect, useState } from "react";
import "./chat.css";
import ChatSidebar from "./chatsidebar";
import ChatWindow from "./chatwindow";

function ChatPage() {
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [messages, setMessages] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [conversationId, setConversationId] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) setCurrentUser(user);
  }, []);

  // Cargar conversación y mensajes
  useEffect(() => {
    const iniciarConversacion = async () => {
      if (!selectedFriend || !currentUser) return;

      try {
        // Buscar o crear conversación
        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/conversations`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user1_id: currentUser.id,
            user2_id: selectedFriend.id,
          }),
        });

        const convo = await res.json();
        setConversationId(convo.id);

        // Carga mensajes de esa conversación
        const mensajesRes = await fetch(
          `${process.env.REACT_APP_API_URL}/api/messages/${convo.id}`
        );
        const mensajes = await mensajesRes.json();

        // Determina si los mensajes son propios o del otro
        const mensajesMarcados = mensajes.map((msg) => ({
          ...msg,
          isOwn: msg.sender_id === currentUser.id,
        }));

        setMessages(mensajesMarcados);
      } catch (err) {
        console.error("❌ Error al iniciar conversación:", err);
      }
    };

    iniciarConversacion();
  }, [selectedFriend, currentUser]);

  // Enviar mensaje
  const handleSendMessage = async (text) => {
    if (!text.trim() || !selectedFriend || !currentUser || !conversationId) return;

    const newMessage = {
      content: text,
      sender_id: currentUser.id,
      receiver_id: selectedFriend.id,
      created_at: new Date(),
      isOwn: true,
    };

    setMessages((prev) => [...prev, newMessage]);

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversation_id: conversationId,
          sender_id: currentUser.id,
          receiver_id: selectedFriend.id,
          content: text,
        }),
      });

      // Recargar mensajes después de guardar en la Base de Datos
      if (res.ok) {
        const mensajesRes = await fetch(
          `${process.env.REACT_APP_API_URL}/api/messages/${conversationId}`
        );
        const mensajes = await mensajesRes.json();
        const mensajesMarcados = mensajes.map((msg) => ({
          ...msg,
          isOwn: msg.sender_id === currentUser.id,
        }));
        setMessages(mensajesMarcados);
      }
    } catch (err) {
      console.error("❌ Error al enviar mensaje:", err);
    }
  };

  return (
    <div className="chat-page">
      <ChatSidebar onSelectChat={setSelectedFriend} currentUser={currentUser} />
      <ChatWindow friend={selectedFriend} messages={messages} onSendMessage={handleSendMessage} />
    </div>
  );
}

export default ChatPage;

