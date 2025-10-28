import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Comments from "./Comments";
import "./styles/feed.css";

export default function Feed() {
  // ========================================
  // ESTADOS - Sin cambios en lógica de DB
  // ========================================
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("user")));
  const [posts, setPosts] = useState([]);
  const [friends, setFriends] = useState([]);
  const [newPost, setNewPost] = useState({ content: "", image: null });
  const [preview, setPreview] = useState(null);
  const [editingPostId, setEditingPostId] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [darkMode, setDarkMode] = useState(localStorage.getItem("darkMode") === "true");

  // ========================================
  // CARGAR USUARIO
  // ========================================
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  // ========================================
  // CARGAR POSTS Y AMIGOS - Sin cambios
  // ========================================
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

  // ========================================
  // MODO OSCURO - Solo afecta UI
  // ========================================
  useEffect(() => {
    document.body.classList.toggle("dark-mode", darkMode);
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  // ========================================
  // CREAR POST - Sin cambios en lógica DB
  // ========================================
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
          likes: 0,
          liked_by_me: false,
          comments_list: []
        };
        setPosts([newPostData, ...posts]);
        setNewPost({ content: "", image: null });
        setPreview(null);
      }
    } catch (err) {
      console.error("Error al publicar:", err);
    }
  };

  // ========================================
  // LIKE - Sin cambios en lógica DB
  // ========================================
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

  // ========================================
  // EDITAR POST - Sin cambios en lógica DB
  // ========================================
  const handleEditPost = async (postId) => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/posts/${postId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: user.id, content: editContent }),
      });
      const data = await res.json();

      if (data.success) {
        setPosts((prev) =>
          prev.map((p) => (p.id === postId ? { ...p, content: data.post.content } : p))
        );
        setEditingPostId(null);
        setMenuOpenId(null);
      }
    } catch (err) {
      console.error("Error al editar post:", err);
    }
  };

  // ========================================
  // ELIMINAR POST - Sin cambios en lógica DB
  // ========================================
  const handleDeletePost = async (postId) => {
    if (!window.confirm("¿Seguro que deseas eliminar esta publicación?")) return;
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/posts/${postId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: user.id }),
      });
      const data = await res.json();
      if (data.success) setPosts(posts.filter((p) => p.id !== postId));
    } catch (err) {
      console.error("Error al eliminar post:", err);
    }
  };

  // ========================================
  // RENDER - Mejoras solo visuales
  // ========================================
  return (
    <div className={`feed-layout ${darkMode ? 'dark-mode' : ''}`}>
      
      {/* ========================================
          BOTÓN MENÚ HAMBURGUESA (MÓVIL)
      ======================================== */}
      <button 
        className="menu-toggle" 
        onClick={() => setMenuAbierto(!menuAbierto)}
        aria-label="Abrir menú"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      {/* ========================================
          SIDEBAR IZQUIERDO - AMIGOS
      ======================================== */}
      <aside className={`friends-sidebar ${menuAbierto ? 'active' : ''}`}>
        <h3>Amigos</h3>
        {friends.length === 0 ? (
          <p className="no-friends">No tienes amigos aún</p>
        ) : (
          friends.map((friend) => (
            <Link 
              key={friend.id} 
              to={`/profile/${friend.id}`} 
              className="friend-item"
            >
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

      {/* ========================================
          FEED CENTRAL
      ======================================== */}
      <main className="feed-container">
        <h2 className="feed-title">Últimas publicaciones</h2>

        {/* CREAR PUBLICACIÓN */}
        <div className="create-post">
          <form onSubmit={handleSubmit}>
            <div className="create-post-header">
              <img 
                src={user?.avatar_url || "https://i.pravatar.cc/50"} 
                alt="Tu avatar" 
                className="avatar"
              />
              <textarea
                placeholder="¿Qué estás pensando?"
                value={newPost.content}
                onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
              />
            </div>

            {preview && (
              <div className="image-preview">
                <img src={preview} alt="Vista previa" />
                <button 
                  type="button" 
                  className="remove-preview"
                  onClick={() => {
                    setPreview(null);
                    setNewPost({ ...newPost, image: null });
                  }}
                  aria-label="Eliminar imagen"
                >
                  ✕
                </button>
              </div>
            )}

            <div className="post-actions">
              <label className="file-input-label">
                📷 Imagen
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageChange} 
                />
              </label>
              <button type="submit" className="publish-btn">
                Publicar
              </button>
            </div>
          </form>
        </div>

        {/* LISTA DE PUBLICACIONES */}
        <div className="posts-list">
          {posts.map((post) => (
            <div key={post.id} className="post-card">
              
              {/* HEADER DEL POST */}
              <div className="post-header">
                <Link to={`/profile/${post.user_id}`} className="post-user">
                  <img 
                    src={post.avatar_url} 
                    alt="avatar" 
                    className="avatar" 
                  />
                  <div className="post-user-info">
                    <span className="user-name">{post.user_name}</span>
                    <span className="post-date">
                      {new Date(post.created_at).toLocaleString()}
                    </span>
                  </div>
                </Link>

                {/* MENÚ TRES PUNTOS */}
                {user && user.id === post.user_id && (
                  <div className="menu-container">
                    <button
                      className="menu-btn"
                      onClick={() => setMenuOpenId(menuOpenId === post.id ? null : post.id)}
                      aria-label="Opciones del post"
                    >
                      ⋮
                    </button>
                    {menuOpenId === post.id && (
                      <div className="menu-options">
                        <button
                          onClick={() => {
                            setEditingPostId(post.id);
                            setEditContent(post.content);
                            setMenuOpenId(null);
                          }}
                        >
                          ✏️ Editar
                        </button>
                        <button 
                          className="danger" 
                          onClick={() => handleDeletePost(post.id)}
                        >
                          🗑️ Eliminar
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* CONTENIDO DEL POST */}
              {editingPostId === post.id ? (
                <div className="edit-section">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                  />
                  <div className="edit-buttons">
                    <button 
                      className="save-btn" 
                      onClick={() => handleEditPost(post.id)}
                    >
                      Guardar
                    </button>
                    <button 
                      className="cancel-btn" 
                      onClick={() => setEditingPostId(null)}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="post-content">{post.content}</p>
                  {post.image_url && (
                    <img 
                      src={post.image_url} 
                      alt="post" 
                      className="post-image" 
                    />
                  )}
                </>
              )}

              {/* FOOTER - LIKES Y COMENTARIOS */}
              <div className="post-footer">
                <button
                  className={`like-btn ${post.liked_by_me ? "liked" : ""}`}
                  onClick={() => handleLike(post.id)}
                >
                  <span>❤️</span>
                  <span>{post.likes || 0}</span>
                </button>
                <span className="comment-count">
                  💬 {post.comments_list?.length || 0} comentarios
                </span>
              </div>

              {/* COMPONENTE DE COMENTARIOS */}
              <Comments 
                postId={post.id} 
                posts={posts} 
                setPosts={setPosts} 
              />
            </div>
          ))}
        </div>
      </main>

      {/* ========================================
          SIDEBAR DERECHO
      ======================================== */}
      <aside className="right-sidebar">
        
        {/* MODO OSCURO */}
        <div className="sidebar-section">
          <h4>Modo oscuro</h4>
          <label className="switch">
            <input 
              type="checkbox" 
              checked={darkMode} 
              onChange={() => setDarkMode(!darkMode)} 
            />
            <span className="slider"></span>
          </label>
        </div>

        {/* DESTACADOS */}
        <div className="sidebar-section">
          <h4>Destacados</h4>
          <p>Los posts con más me gusta.</p>
          <Link to="/destacados" className="sidebar-btn">Ver</Link>
        </div>

        {/* USUARIOS SUGERIDOS */}
        <div className="sidebar-section">
          <h4>Usuarios sugeridos</h4>
          <p>Personas que podrías seguir.</p>
          <Link to="/usuarios-sugeridos" className="sidebar-btn">Ver</Link>
        </div>

        {/* EVENTOS */}
        <div className="sidebar-section">
          <h4>Eventos</h4>
          <p>Tus próximos eventos.</p>
          <Link to="/crear-evento" className="sidebar-btn add">Agregar</Link>
          <Link to="/eventos" className="sidebar-btn">Ver</Link>
        </div>

       {/* CHAT EN LÍNEA */}
<div className="sidebar-section">
  <h4>Chat en línea</h4>
  <p>Chatea con tus amigos.</p>
  <Link to="/chat" className="sidebar-btn">Abrir chat</Link>
</div>

      </aside>
    </div>
  );
}
