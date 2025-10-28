// bienvenido.js
import React from "react";
import { Link } from "react-router-dom";
import "./styles/bienvenido.css";

export default function Welcome() {
  return (
    <div className="welcome-container">
      <header className="welcome-header">
        <h1>ConectIU</h1>
        <p>Tu espacio para conectar, compartir e inspirar.</p>
      </header>

      <main className="welcome-main">
        <h2>Bienvenido a la nueva forma de estar conectado</h2>
        <p>
          Únete a ConectIU y empieza a compartir tus ideas, fotos y experiencias 
          con amigos y el mundo. Una red social moderna y fácil de usar.
        </p>

        <div className="welcome-features">
          <div className="feature-card">
            <span className="feature-icon">📱</span>
            <h3>Conecta</h3>
            <p>Encuentra y sigue a personas con tus mismos intereses</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">📸</span>
            <h3>Comparte</h3>
            <p>Publica fotos, ideas y momentos especiales</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">💬</span>
            <h3>Interactúa</h3>
            <p>Comenta, reacciona y conversa en tiempo real</p>
          </div>
        </div>

        <div className="welcome-buttons">
          <Link to="/login" className="btn btn-login">
            <span>🔐 Iniciar Sesión</span>
          </Link>
          <Link to="/register" className="btn btn-register">
            <span>✨ Registrarse</span>
          </Link>
        </div>
      </main>

      <footer className="welcome-footer">
        <p>© 2025 ConectIU - Conectando personas, creando comunidades</p>
      </footer>
    </div>
  );
}
