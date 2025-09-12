import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./navbar.css";

export default function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        {/* Aquí podrás poner tu logo más adelante */}
        <div className="app-logo"></div>
        <h1 className="app-title">ConnectIU</h1>
      </div>

      <div className="navbar-right">
        <Link to="/feed" className="nav-link">Feed</Link>
        <Link to="/profile/1" className="nav-link">Mi Perfil</Link>
        <button className="logout-btn" onClick={handleLogout}>
          Cerrar sesión
        </button>
      </div>
    </nav>
  );
}
