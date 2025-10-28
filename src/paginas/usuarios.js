import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./styles/usuarios.css";

export default function Usuarios() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/users`);
        const data = await res.json();
        setUsers(data);
        setLoading(false);
      } catch (err) {
        console.error("Error cargando usuarios:", err);
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // Filtrado en frontend
  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.username.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="usuarios-container">
        <div className="loading-wrapper">
          <p className="loading-text">⏳ Cargando usuarios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="usuarios-container">
      <h2 className="usuarios-title">🔍 Buscar Usuarios</h2>

      {/* Barra de búsqueda */}
      <input
        type="text"
        className="usuarios-search"
        placeholder="🔎 Buscar por nombre o usuario..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Si hay búsqueda, mostrar resultados */}
      {search && (
        <>
          <h3 className="section-title">📋 Resultados de búsqueda</h3>
          <div className="usuarios-list">
            {filtered.length === 0 ? (
              <p className="no-results">❌ No se encontraron usuarios con "{search}"</p>
            ) : (
              filtered.map((u) => (
                <div key={u.id} className="usuario-card">
                  <img
                    src={u.avatar_url || "https://i.pravatar.cc/100"}
                    alt={u.name}
                    className="usuario-avatar"
                  />
                  <div className="usuario-info">
                    <h3>{u.name}</h3>
                    <p>@{u.username}</p>
                  </div>
                  <Link to={`/profile/${u.id}`} className="usuario-btn">
                    👤 Ver Perfil
                  </Link>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* Lista completa */}
      {!search && (
        <>
          <h3 className="section-title">👥 Todos los usuarios ({users.length})</h3>
          <div className="usuarios-list">
            {users.length === 0 ? (
              <p className="no-results">No hay usuarios registrados</p>
            ) : (
              users.map((u) => (
                <div key={u.id} className="usuario-card">
                  <img
                    src={u.avatar_url || "https://i.pravatar.cc/100"}
                    alt={u.name}
                    className="usuario-avatar"
                  />
                  <div className="usuario-info">
                    <h3>{u.name}</h3>
                    <p>@{u.username}</p>
                  </div>
                  <Link to={`/profile/${u.id}`} className="usuario-btn">
                    👤 Ver Perfil
                  </Link>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
