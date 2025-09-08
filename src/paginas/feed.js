import React, { useState, useEffect } from "react";
import "./styles/feed.css";

export default function Feed() {
  const [posts, setPosts] = useState([]);

  const [newPost, setNewPost] = useState({
    content: "",
    image: null,
  });

  const [preview, setPreview] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch("http://localhost:4000/api/posts");
        const data = await res.json();
        setPosts(data);
      } catch (err) {
        console.error("Error al cargar posts:", err);
      }
    };
    fetchPosts();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewPost({ ...newPost, image: file });
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newPost.content.trim()) return;

    try {
      const user = JSON.parse(localStorage.getItem("user")); // 👈 usuario logueado
      const res = await fetch("http://localhost:4000/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          content: newPost.content,
          image_url: null, // luego puedes implementar subida de imágenes
        }),
      });

      const data = await res.json();
      if (data.success) {
        const newPostData = {
          id: data.post.id,
          content: data.post.content,
          image_url: data.post.image_url,
          user_name: JSON.parse(localStorage.getItem("user")).name,
          avatar_url: JSON.parse(localStorage.getItem("user")).avatar_url,
          created_at: data.post.created_at
        };
        setPosts([newPostData, ...posts]);
        setNewPost({ content: "", image: null });
        setPreview(null);
      }
    } catch (err) {
      console.error("Error al publicar:", err);
    }
  };

  return (
    <div className="feed-container">
      <h2 className="feed-title">Últimas publicaciones</h2>

      {/* Formulario para crear post */}
      <div className="create-post">
        <form onSubmit={handleSubmit}>
          <textarea
            placeholder="¿Qué estás pensando?"
            value={newPost.content}
            onChange={(e) =>
              setNewPost({ ...newPost, content: e.target.value })
            }
          ></textarea>

          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
          />

          {preview && (
            <div className="image-preview">
              <img src={preview} alt="Vista previa" />
            </div>
          )}

          <button type="submit">Publicar</button>
        </form>
      </div>

      {/* Posts */}
      {posts.map((post) => (
        <div key={post.id} className="post-card">
          <div className="post-header">
            <img src={post.avatar_url} alt="avatar" className="avatar" />
            <span className="user-name">{post.user_name}</span>
          </div>
          <p className="post-content">{post.content}</p>
          {post.image_url && (
            <img src={post.image_url} alt="post" className="post-image" />
          )}
          <div className="post-footer">
            <span>👍 {post.likes} Me gusta</span>
            <span>💬 {post.comments} Comentarios</span>
          </div>
        </div>
      ))}
    </div>
  );
}


