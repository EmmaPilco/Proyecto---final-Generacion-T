import React from "react";
import { Link } from "react-router-dom";
import "./styles/bienvenido.css";

export default function Welcome() {
  return (
    <div className="welcome-container">
      <header className="welcome-header">
        <h1>ConectIU 🚀</h1>
        <p>Tu espacio para conectar, compartir e inspirar.</p>
      </header>

      <main className="welcome-main">
        <h2>Bienvenido a la nueva forma de estar conectado</h2>
        <p>
          Únete a ConectIU y empieza a compartir tus ideas, fotos y experiencias 
          con amigos y el mundo.
        </p>

        <div className="welcome-buttons">
          <Link to="/login" className="btn btn-login">Iniciar Sesión</Link>
          <Link to="/register" className="btn btn-register">Registrarse</Link>
        </div>
      </main>
    </div>
  );
}
