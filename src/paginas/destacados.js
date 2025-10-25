import React, { useEffect, useState } from "react";
import "./styles/destacados.css";

function Destacados() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/posts/trending`);
        if (!res.ok) throw new Error("Error al obtener destacados");
        const data = await res.json();
        setPosts(data);
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrending();
  }, []);

  if (loading) return <p className="loading">Cargando destacados...</p>;

  return (
    <div className="trending-container">
      <h2>🔥 Publicaciones destacadas</h2>
      {posts.length === 0 ? (
        <p className="no-posts">Aún no hay publicaciones con likes.</p>
      ) : (
        posts.map((post) => (
          <div key={post.id} className="trending-post">
            <div className="post-header">
              <img
                src={post.avatar_url || "/default-avatar.png"}
                alt={post.user_name}
                className="avatar"
              />
              <div>
                <h4>{post.user_name}</h4>
                <p className="username">@{post.username}</p>
              </div>
            </div>

            <p className="post-content">{post.content}</p>

            {post.image_url && (
              <img src={post.image_url} alt="Post" className="post-image" />
            )}

            <div className="post-footer">
              <span className="likes">❤️ {post.likes_count ?? 0} likes</span>
              <span className="date">
                {new Date(post.created_at).toLocaleString()}
              </span>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default Destacados;
