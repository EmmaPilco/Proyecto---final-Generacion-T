import React, { useEffect, useState } from "react";
import "./styles/profile.css";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ avatar_url: "", cover_url: "", bio: "" });

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser) {
      window.location.href = "/login";
      return;
    }

    fetch(`http://localhost:4000/api/profile/${storedUser.id}`)
      .then((res) => res.json())
      .then((data) => {
        setProfile(data);
        setFormData({
          avatar_url: data.user.avatar_url || "",
          cover_url: data.user.cover_url || "",
          bio: data.user.bio || "",
        });
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Cargando perfil...</p>;
  if (!profile) return <p>Error cargando el perfil</p>;

  const user = profile.user || profile;
  const posts = profile.posts || [];
  const storedUser = JSON.parse(localStorage.getItem("user"));

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      const res = await fetch(`http://localhost:4000/api/profile/${storedUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setProfile({ ...profile, user: data.user });
        setEditing(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="profile-container">
      {/* Portada y avatar */}
      <div className="profile-header">
        <img
          src={user.cover_url || "https://picsum.photos/900/250?random=5"}
          alt="cover"
          className="cover-image"
        />
        <img
          src={user.avatar_url || "https://i.pravatar.cc/150?img=5"}
          alt="avatar"
          className="profile-avatar"
        />
      </div>

      {/* Info usuario */}
      <div className="profile-info">
        <h2>{user.name}</h2>
        <p className="username">@{user.username}</p>
        <p className="bio">{user.bio || "Sin biografía aún"}</p>
        <div className="follow-info">
          <span>Siguiendo: {user.following || 0}</span>
          <span>Seguidores: {user.followers || 0}</span>
        </div>

        {/* Botón de edición solo si es tu perfil */}
        {storedUser.id === user.id && (
          <>
            <button onClick={() => setEditing(!editing)}>
              {editing ? "Cancelar" : "Editar Perfil"}
            </button>
            {editing && (
              <div className="edit-profile-form">
                <input
                  type="text"
                  name="avatar_url"
                  placeholder="URL de avatar"
                  value={formData.avatar_url}
                  onChange={handleChange}
                />
                <input
                  type="text"
                  name="cover_url"
                  placeholder="URL de portada"
                  value={formData.cover_url}
                  onChange={handleChange}
                />
                <textarea
                  name="bio"
                  placeholder="Escribe tu biografía"
                  value={formData.bio}
                  onChange={handleChange}
                />
                <button onClick={handleSave}>Guardar cambios</button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Publicaciones */}
      <div className="profile-posts">
        {posts.length === 0 ? (
          <p>No publicaste nada aún.</p>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="post-card">
              <p className="post-content">{post.content}</p>
              {post.image_url && (
                <img src={post.image_url} alt="post" className="post-image" />
              )}
              <div className="post-footer">
                <span>👍 {post.likes_count || 0} Me gusta</span>
                <span>💬 {post.comments_count || 0} Comentarios</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}


