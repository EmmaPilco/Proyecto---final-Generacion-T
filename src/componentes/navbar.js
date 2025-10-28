import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./navbar.css";

export default function Navbar() {
  const navigate = useNavigate();

  // ========================================
  // ESTADOS - Sin cambios en lógica de DB
  // ========================================
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const timerRef = useRef(null);
  const wrapperRef = useRef(null);

  const user = JSON.parse(localStorage.getItem("user"));

  // ========================================
  // CERRAR SESIÓN - Sin cambios
  // ========================================
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // ========================================
  // CERRAR DROPDOWN AL HACER CLIC FUERA
  // ========================================
  useEffect(() => {
    const onClick = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  // ========================================
  // BUSCAR USUARIOS - Sin cambios en fetch
  // ========================================
  const fetchSearch = async (q) => {
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/api/users/search?q=${encodeURIComponent(q)}`
      );
      if (!res.ok) return;
      const data = await res.json();
      setResults(data);
      setOpen(true);
    } catch (err) {
      console.error("Error buscando usuarios:", err);
    }
  };

  // ========================================
  // MANEJAR CAMBIO EN INPUT DE BÚSQUEDA
  // Debounce: esperar 300ms antes de buscar
  // ========================================
  const handleChange = (e) => {
    const v = e.target.value;
    setQuery(v);

    if (timerRef.current) clearTimeout(timerRef.current);
    if (v.trim().length >= 2) {
      timerRef.current = setTimeout(() => fetchSearch(v.trim()), 300);
    } else {
      setResults([]);
      setOpen(false);
    }
  };

  // ========================================
  // LIMPIAR BÚSQUEDA AL SELECCIONAR
  // ========================================
  const handleSelect = () => {
    setQuery("");
    setResults([]);
    setOpen(false);
  };

  // ========================================
  // IR AL FEED - Solo para UI
  // ========================================
  const goToFeed = () => {
    navigate("/feed");
  };

  // ========================================
  // RENDER - Mejoras solo visuales
  // ========================================
  return (
    <nav className="navbar">
      
      {/* ========================================
          LADO IZQUIERDO - LOGO, TÍTULO Y BÚSQUEDA
      ======================================== */}
      <div className="navbar-left">
        
        {/* Logo y título */}
        <div 
          className="app-logo" 
          onClick={goToFeed}
          role="button"
          tabIndex={0}
          aria-label="Ir al feed"
        />
        <h1 
          className="app-title" 
          onClick={goToFeed}
          role="button"
          tabIndex={0}
        >
          ConnectIU
        </h1>

        {/* Barra de búsqueda */}
        <div className="search-wrapper" ref={wrapperRef}>
          <input
            className="search-input"
            type="text"
            placeholder="Buscar usuarios..."
            value={query}
            onChange={handleChange}
            onFocus={() => {
              if (query.trim().length >= 2 && results.length) setOpen(true);
            }}
            aria-label="Buscar usuarios"
          />

          {/* Dropdown de resultados */}
          {open && (
            <div className="search-results">
              {results.length === 0 ? (
                <div className="search-empty">
                  ❌ No se encontraron usuarios
                </div>
              ) : (
                <>
                  {results.map((u) => (
                    <Link
                      key={u.id}
                      to={`/profile/${u.id}`}
                      className="search-item"
                      onClick={handleSelect}
                    >
                      <img
                        src={u.avatar_url || "https://i.pravatar.cc/40"}
                        alt={u.name}
                        className="search-item-avatar"
                      />
                      <div className="search-item-info">
                        <div className="search-item-name">{u.name}</div>
                        <div className="search-item-username">@{u.username}</div>
                      </div>
                    </Link>
                  ))}
                  <Link
                    to="/usuarios"
                    className="search-see-all"
                    onClick={handleSelect}
                  >
                    👥 Ver todos los usuarios →
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ========================================
          LADO DERECHO - NAVEGACIÓN
      ======================================== */}
      <div className="navbar-right">
        <Link to="/feed" className="nav-link">
          🏠 Feed
        </Link>
        <Link to="/usuarios" className="nav-link">
          👥 Usuarios
        </Link>

        {user && (
          <Link to={`/profile/${user.id}`} className="nav-link">
            👤 Mi Perfil
          </Link>
        )}

        <button 
          className="logout-btn" 
          onClick={handleLogout}
          aria-label="Cerrar sesión"
        >
          🚪 Cerrar sesión
        </button>
      </div>
    </nav>
  );
}