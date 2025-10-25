import React, { useEffect, useState } from "react";
import "./styles/usuarios-sugeridos.css";

const UsuariosSugeridos = ({ userId }) => {
  const [sugeridos, setSugeridos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Obtener usuarios sugeridos
  useEffect(() => {
    if (!userId) return;

    const fetchSugeridos = async () => {
      try {
        const res = await fetch(
          `${process.env.REACT_APP_API_URL}/api/users/suggestions/${userId}`
        );
        const data = await res.json();
        setSugeridos(data);
      } catch (err) {
        console.error("Error al obtener usuarios sugeridos:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSugeridos();
  }, [userId]);

  // Acción de seguir
  const handleFollow = async (followingId) => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/follow`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ follower_id: userId, following_id: followingId }),
      });

      if (res.ok) {
        // Eliminamos de la lista local el usuario seguido
        setSugeridos((prev) => prev.filter((u) => u.id !== followingId));
      } else {
        console.error("Error al seguir usuario");
      }
    } catch (err) {
      console.error("Error al seguir:", err);
    }
  };

  return (
    <div className="sugeridos-card">
      <h3 className="sugeridos-titulo">Usuarios sugeridos</h3>

      {loading ? (
        <p className="sugeridos-loading">Cargando...</p>
      ) : sugeridos.length === 0 ? (
        <p className="sugeridos-vacio">No hay sugerencias por ahora 😄</p>
      ) : (
        <ul className="sugeridos-lista">
          {sugeridos.map((user) => (
            <li key={user.id} className="sugerido-item">
              <img
                src={
                  user.avatar_url
                    ? `${process.env.REACT_APP_API_URL}/${user.avatar_url}`
                    : "/default-avatar.png"
                }
                alt={user.name}
                className="sugerido-avatar"
              />
              <div className="sugerido-info">
                <p className="sugerido-nombre">{user.name}</p>
                <span className="sugerido-username">@{user.username}</span>
              </div>
              <button
                className="btn-seguir"
                onClick={() => handleFollow(user.id)}
              >
                Seguir
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default UsuariosSugeridos;
