import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom"; // 👈 para leer el :id de la URL
import "./styles/profile.css";

export default function Profile() {
  const { id } = useParams(); // 👈 ID del perfil visitado
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false); // 👈 nuevo estado
  const [formData, setFormData] = useState({ avatar_url: "", cover_url: "", bio: "" });

  const storedUser = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser) {
      window.location.href = "/login";
      return;
    }

    // Cargar el perfil del usuario visitado
    fetch(`h${process.env.REACT_APP_API_URL}/api/profile/${id}`)
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

    // Consultar si lo sigo (solo si no es mi perfil)
    if (parseInt(id) !== storedUser.id) {
      fetch(`${process.env.REACT_APP_API_URL}/api/follow/check/${storedUser.id}/${id}`)
        .then((res) => res.json())
        .then((data) => setIsFollowing(data.isFollowing))
        .catch((err) => console.error(err));
    }
  }, [id]);

  if (loading) return <p>Cargando perfil...</p>;
  if (!profile) return <p>Error cargando el perfil</p>;

  const user = profile.user || profile;
  const posts = profile.posts || [];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/profile/${storedUser.id}`, {
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

  const handleFollowToggle = async () => {
    try {
      if (isFollowing) {
        // 👉 Dejar de seguir
        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/follow/${user.id}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ follower_id: storedUser.id }), // 🔥 agregado
        });
        const data = await res.json();
        if (data.unfollowed) {
          setIsFollowing(false);
          setProfile((prev) => ({
            ...prev,
            user: {
              ...prev.user,
              followers: prev.user.followers - 1,
            },
          }));
        }
      } else {
        // 👉 Seguir
        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/follow/${user.id}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ follower_id: storedUser.id }), // 🔥 agregado
        });
        const data = await res.json();
        if (data.followed) {
          setIsFollowing(true);
          setProfile((prev) => ({
            ...prev,
            user: {
              ...prev.user,
              followers: prev.user.followers + 1,
            },
          }));
        }
      }
    } catch (err) {
      console.error(err);
    }
  };


  return (
    <div className="profile-container">
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

      <div className="profile-info">
        <h2>{user.name}</h2>
        <p className="username">@{user.username}</p>
        <p className="bio">{user.bio || "Sin biografía aún"}</p>
        <div className="follow-info">
          <span>Siguiendo: {user.following || 0}</span>
          <span>Seguidores: {user.followers || 0}</span>
        </div>

        {storedUser.id === user.id ? (
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
        ) : (
          <button onClick={handleFollowToggle}>
            {isFollowing ? "Dejar de seguir" : "Seguir"}
          </button>
        )}
      </div>

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

