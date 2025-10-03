import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./styles/usuarios.css";

export default function Usuarios() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("http://localhost:4000/api/users");
        const data = await res.json();
        setUsers(data);
      } catch (err) {
        console.error("Error cargando usuarios:", err);
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

  return (
    <div className="usuarios-container">
      <h2 className="usuarios-title">Lista de Usuarios</h2>

      {/* Barra de búsqueda */}
      <input
        type="text"
        className="usuarios-search"
        placeholder="Buscar usuario..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Si hay búsqueda, mostrar resultados */}
      {search && (
        <>
          <h3 style={{ color: "#a9cdf1", marginTop: "10px" }}>Resultados</h3>
          <div className="usuarios-list">
            {filtered.length === 0 ? (
              <p>No se encontraron usuarios</p>
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
                    Ver Perfil
                  </Link>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* Lista completa */}
      <h3 style={{ color: "#a9cdf1", marginTop: "20px" }}>Todos los usuarios</h3>
      <div className="usuarios-list">
        {users.map((u) => (
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
              Ver Perfil
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

