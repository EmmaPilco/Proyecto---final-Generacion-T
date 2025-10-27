import React, { useEffect, useState } from "react";
import "./chat.css";

export default function ChatSidebar({ onSelectChat, currentUser }) {
  const [friends, setFriends] = useState([]);

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/friends/mutual/${currentUser.id}`);
        const data = await response.json();
        setFriends(data);
      } catch (error) {
        console.error("Error cargando amigos:", error);
      }
    };
    if (currentUser) fetchFriends();
  }, [currentUser]);

  return (
    <div className="chat-sidebar">
      <h2>Chats</h2>
      <ul>
        {friends.map((friend) => (
          <li
            key={friend.id}
            onClick={() => onSelectChat(friend)}
            className="chat-sidebar-item"
          >
            <img
              src={friend.avatar_url || "/default-avatar.png"}
              alt={friend.name}
              className="chat-sidebar-avatar"
            />
            <span>{friend.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
