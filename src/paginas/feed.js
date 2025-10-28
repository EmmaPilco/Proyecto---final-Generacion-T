import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Comments from "./Comments";
import "./styles/feed.css";

export default function Feed() {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("user")));
  const [posts, setPosts] = useState([]);
  const [friends, setFriends] = useState([]);
  const [newPost, setNewPost] = useState({ content: "", image: null });
  const [preview, setPreview] = useState(null);

  const [darkMode, setDarkMode] = useState(localStorage.getItem("darkMode") === "true");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  useEffect(() => {
    if (!user?.id) return;

    const fetchData = async () => {
      try {
        const resPosts = await fetch(`${process.env.REACT_APP_API_URL}/api/posts/${user.id}`);
        const dataPosts = await resPosts.json();

        const postsWithComments = await Promise.all(
          dataPosts.map(async (post) => {
            const commentsRes = await fetch(`${process.env.REACT_APP_API_URL}/api/posts/${post.id}/comments`);
            const comments = await commentsRes.json();
            return { ...post, comments_list: comments };
          })
        );
        setPosts(postsWithComments);

        const resFriends = await fetch(`${process.env.REACT_APP_API_URL}/api/friends/${user.id}`);
        const dataFriends = await resFriends.json();
        setFriends(dataFriends);
      } catch (err) {
        console.error("Error al cargar feed:", err);
      }
    };

    fetchData();
  }, [user?.id]);

  // Guardar preferencia modo oscuro
  useEffect(() => {
    document.body.classList.toggle("dark-mode", darkMode);
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  // Crear post
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewPost({ ...newPost, image: file });
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newPost.content.trim() || !user) return;

    try {
      const formData = new FormData();
      formData.append("user_id", user.id);
      formData.append("content", newPost.content);
      if (newPost.image) formData.append("image", newPost.image);

      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/posts`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        const newPostData = {
          id: data.post.id,
          content: data.post.content,
          image_url: data.post.image_url,
          user_id: user.id,
          user_name: user.name,
          avatar_url: user.avatar_url,
          created_at: data.post.created_at,
        };
        setPosts([newPostData, ...posts]);
        setNewPost({ content: "", image: null });
        setPreview(null);
      }
    } catch (err) {
      console.error("Error al publicar:", err);
    }
  };

  // Like
  const handleLike = async (postId) => {
    if (!user) return;
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/posts/${postId}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: user.id }),
      });
      const data = await res.json();
      if (data.success) {
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId
              ? {
                  ...p,
                  likes: data.liked ? Number(p.likes) + 1 : Number(p.likes) - 1,
                  liked_by_me: data.liked,
                }
              : p
          )
        );
      }
    } catch (err) {
      console.error("Error al dar like:", err);
    }
  };

  return (
    <div className="feed-layout">

      <aside className="friends-sidebar">
        <h3>Amigos</h3>
        {friends.length === 0 ? (
          <p>No tienes amigos aún</p>
        ) : (
          friends.map((friend) => (
            <Link key={friend.id} to={`/profile/${friend.id}`} className="friend-item">
              <img
                src={friend.avatar_url || "https://i.pravatar.cc/50"}
                alt={friend.name}
                className="friend-avatar"
              />
              <span>{friend.name}</span>
            </Link>
          ))
        )}
      </aside>

      <main className="feed-container">
        <h2 className="feed-title">Últimas publicaciones</h2>

        <div className="create-post">
          <form onSubmit={handleSubmit}>
            <textarea
              placeholder="¿Qué estás pensando?"
              value={newPost.content}
              onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
            ></textarea>

            {preview && (
              <div className="image-preview">
                <img src={preview} alt="Vista previa" />
              </div>
            )}

            <div className="post-actions">
              <input type="file" accept="image/*" onChange={handleImageChange} />
              <button type="submit">Publicar</button>
            </div>
          </form>
        </div>

        {posts.map((post) => (
          <div key={post.id} className="post-card">
            <div className="post-header">
              <div className="post-user">
                <img src={post.avatar_url} alt="avatar" className="avatar" />
                <div>
                  <span className="user-name">{post.user_name}</span>
                  <span className="post-date">{new Date(post.created_at).toLocaleString()}</span>
                </div>
              </div>          
            </div>

            <p className="post-content">{post.content}</p>
            {post.image_url && <img src={post.image_url} alt="post" className="post-image" />}

            <div className="post-footer">
              <button
                className={`like-btn ${post.liked_by_me ? "liked" : ""}`}
                onClick={() => handleLike(post.id)}
              >
                👍 {post.likes}
              </button>
              <span>💬 {post.comments_list?.length || 0}</span>
            </div>

            <Comments postId={post.id} posts={posts} setPosts={setPosts} />
          </div>
        ))}
      </main>

      {/* Sidebar derecha */}
      <aside className="right-sidebar">
        {/* Modo oscuro */}
        <div className="sidebar-section">
          <h4>Modo oscuro</h4>
          <label className="switch">
            <input type="checkbox" checked={darkMode} onChange={() => setDarkMode(!darkMode)} />
            <span className="slider"></span>
          </label>
        </div>

        {/* Posts destacados */}
        <div className="sidebar-section">
          <h4>Destacados</h4>
          <p>Los posts con más me gusta.</p>
          <Link to="/destacados" className="sidebar-btn">Ver</Link>
        </div>

        {/* Eventos */}
        <div className="sidebar-section">
          <h4>Eventos</h4>
          <p>Tus próximos eventos.</p>
          <Link to="/crear-evento" className="sidebar-btn add">Agregar</Link>
          <Link to="/eventos" className="sidebar-btn">Ver</Link>
        </div>

        {/* Chat en línea */}
        <div className="sidebar-section">
          <h4>Chat en línea</h4>
          <p>Chatea con tus amigos.</p>
          <Link to="/chat" className="sidebar-btn">Abrir chat</Link>
        </div>
      </aside>
    </div>
  );
}
