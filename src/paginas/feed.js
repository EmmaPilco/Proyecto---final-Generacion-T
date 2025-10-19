import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Comments from "./Comments";
import "./styles/feed.css";

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [friends, setFriends] = useState([]);
  const [newPost, setNewPost] = useState({
    content: "",
    image: null,
  });
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));

        // 🔹 Posts
        const resPosts = await fetch(`http://localhost:4000/api/posts/${user.id}`);
        const dataPosts = await resPosts.json();

        const postsWithComments = await Promise.all(
          dataPosts.map(async (post) => {
            const commentsRes = await fetch(`http://localhost:4000/api/posts/${post.id}/comments`);
            const comments = await commentsRes.json();
            return { ...post, comments_list: comments };
          })
        );
        setPosts(postsWithComments);

        // 🔹 Amigos (seguimiento mutuo)
        const resFriends = await fetch(`http://localhost:4000/api/friends/${user.id}`);
        const dataFriends = await resFriends.json();
        setFriends(dataFriends);
      } catch (err) {
        console.error("Error al cargar feed:", err);
      }
    };
    fetchData();
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
      const user = JSON.parse(localStorage.getItem("user"));
      const formData = new FormData();
      formData.append("user_id", user.id);
      formData.append("content", newPost.content);
      if (newPost.image) {
        formData.append("image", newPost.image);
      }

      const res = await fetch("http://localhost:4000/api/posts", {
        method: "POST",
        body: formData, // sin headers JSON
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

  const handleLike = async (postId) => {
    const user = JSON.parse(localStorage.getItem("user"));

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/posts/${postId}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: user.id }),
      });

      const data = await res.json();

      if (data.success) {
        setPosts((prevPosts) =>
          prevPosts.map((p) =>
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
      {/* 🔹 Sidebar de amigos */}
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

      {/* 🔹 Sección principal (posts) */}
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
              <img src={post.avatar_url} alt="avatar" className="avatar" />
              <div>
                <span className="user-name">{post.user_name}</span>
                <span className="post-date">
                  {new Date(post.created_at).toLocaleString()}
                </span>
              </div>
            </div>
            <p className="post-content">{post.content}</p>
            {post.image_url && (
              <img src={post.image_url} alt="post" className="post-image" />
            )}
            <div className="post-footer">
              <button
                className={`like-btn ${post.liked_by_me ? "liked" : ""}`}
                onClick={() => handleLike(post.id)}
              >
                👍 {post.likes}
              </button>
              <span>💬 {post.comments_list ? post.comments_list.length : 0}</span>
            </div>
            <Comments postId={post.id} posts={posts} setPosts={setPosts} />
          </div>
        ))}
      </main>
    </div>
  );
}


