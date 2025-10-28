import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./styles/style.css";

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: ""
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      
      if (data.success) {
        // Guardar usuario en localStorage
        localStorage.setItem("user", JSON.stringify(data.user));
        
        setMessage("✅ Registro exitoso! Redirigiendo al login...");
        
        // Redirigir al login después de 1.5 segundos
        setTimeout(() => {
          navigate("/login");
        }, 1500);
      } else {
        setMessage("❌ " + (data.message || "Error al registrar"));
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      setMessage("❌ Error de conexión con el servidor");
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="form-container">
        <h2>Crear Cuenta</h2>
        
        <form onSubmit={handleSubmit}>
          <input 
            type="text" 
            name="name" 
            placeholder="👤 Nombre completo" 
            value={formData.name}
            onChange={handleChange} 
            required 
            disabled={loading}
            autoComplete="name"
          />
          <input 
            type="text" 
            name="username" 
            placeholder="@usuario" 
            value={formData.username}
            onChange={handleChange} 
            required 
            disabled={loading}
            autoComplete="username"
          />
          <input 
            type="email" 
            name="email" 
            placeholder="📧 Correo electrónico" 
            value={formData.email}
            onChange={handleChange} 
            required 
            disabled={loading}
            autoComplete="email"
          />
          <input 
            type="password" 
            name="password" 
            placeholder="🔒 Contraseña" 
            value={formData.password}
            onChange={handleChange} 
            required 
            disabled={loading}
            minLength="6"
            autoComplete="new-password"
          />
          <button type="submit" disabled={loading}>
            {loading ? "⏳ Registrando..." : "Registrarse"}
          </button>
        </form>

        {message && <p>{message}</p>}

        {/* Enlace de login */}
        <p className="register-text">
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión aquí</Link>
        </p>
      </div>
    </div>
  );
}