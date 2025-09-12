import React, { useEffect, useState } from "react";
import "./styles/comments.css";

export default function Comments({ postId, setPosts, posts }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  // Cargar comentarios al iniciar
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await fetch(`http://localhost:4000/api/posts/${postId}/comments`);
        const data = await res.json();
        setComments(data);
      } catch (err) {
        console.error("Error al cargar comentarios:", err);
      }
    };
    fetchComments();
  }, [postId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const user = JSON.parse(localStorage.getItem("user"));

    try {
      const res = await fetch(`http://localhost:4000/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: user.id, content: newComment }),
      });
      const data = await res.json();
      if (data.success) {
        setComments([...comments, { ...data.comment, user_name: user.name, avatar_url: user.avatar_url }]);
        setNewComment("");

        // Actualizar el feed si quieres
        setPosts(posts.map(p => 
          p.id === postId ? { ...p, comments_list: [...(p.comments_list || []), data.comment] } : p
        ));
      }
    } catch (err) {
      console.error("Error al comentar:", err);
    }
  };

  return (
    <div className="comments-section">
      <ul>
        {comments.map(comment => (
          <li key={comment.id}>
            <strong>{comment.user_name}:</strong> {comment.content}
          </li>
        ))}
      </ul>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Escribe un comentario..."
        />
        <button type="submit">Comentar</button>
      </form>
    </div>
  );
}

