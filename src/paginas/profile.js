import React from "react";
import "./styles/profile.css";

export default function Profile() {
  // Datos de ejemplo
  const user = {
    name: "Juan Pérez",
    username: "@juanperez",
    avatar: "https://i.pravatar.cc/150?img=5",
    cover: "https://picsum.photos/900/250?random=5",
    bio: "Desarrollador web y amante de la tecnología 🚀",
    followers: 120,
    following: 80,
  };

  const posts = [
    {
      id: 1,
      content: "Disfrutando de un día soleado mientras programo ☀️💻",
      image: "https://picsum.photos/500/300?random=10",
      likes: 15,
      comments: 2,
    },
    {
      id: 2,
      content: "Mi nuevo proyecto en React va tomando forma 😎",
      image: null,
      likes: 22,
      comments: 4,
    },
  ];

  return (
    <div className="profile-container">
      {/* Portada y avatar */}
      <div className="profile-header">
        <img src={user.cover} alt="cover" className="cover-image" />
        <img src={user.avatar} alt="avatar" className="profile-avatar" />
      </div>

      {/* Info usuario */}
      <div className="profile-info">
        <h2>{user.name}</h2>
        <p className="username">{user.username}</p>
        <p className="bio">{user.bio}</p>
        <div className="follow-info">
          <span>Siguiendo: {user.following}</span>
          <span>Seguidores: {user.followers}</span>
        </div>
      </div>

      {/* Publicaciones */}
      <div className="profile-posts">
        {posts.map((post) => (
          <div key={post.id} className="post-card">
            <p className="post-content">{post.content}</p>
            {post.image && <img src={post.image} alt="post" className="post-image" />}
            <div className="post-footer">
              <span>👍 {post.likes} Me gusta</span>
              <span>💬 {post.comments} Comentarios</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

