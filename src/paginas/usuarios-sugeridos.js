import React, { useEffect, useState } from "react";
import "./styles/usuarios-sugeridos.css";

const UsuariosSugeridos = () => {
  const [sugeridos, setSugeridos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSugeridos = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/users/suggestions`);
        const data = await res.json();
        setSugeridos(data);
      } catch (err) {
        console.error("Error al obtener usuarios sugeridos:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSugeridos();
  }, []);

  return (
    <div className="sugeridos-card">
      <h3 className="sugeridos-titulo">Usuarios sugeridos</h3>

      {loading ? (
        <p className="sugeridos-loading">Cargando...</p>
      ) : sugeridos.length === 0 ? (
        <p className="sugeridos-vacio">No hay usuarios por ahora 😄</p>
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
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default UsuariosSugeridos;

