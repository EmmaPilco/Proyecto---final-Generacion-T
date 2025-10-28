import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./styles/style.css";

export default function Login() {
  const [formData, setFormData] = useState({
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
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      
      if (data.success) {
        // Guardar token y usuario en localStorage
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        
        setMessage("✅ Bienvenido " + data.user.name);

        // Redirigir al feed después de 1 segundo
        setTimeout(() => {
          navigate("/feed"); 
        }, 1000);
      } else {
        setMessage("❌ " + data.message);
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
        <h2>Iniciar Sesión</h2>
        
        <form onSubmit={handleSubmit}>
          <input 
            type="email" 
            name="email" 
            placeholder="📧 Correo electrónico" 
            value={formData.email}
            onChange={handleChange} 
            required 
            disabled={loading}
          />
          <input 
            type="password" 
            name="password" 
            placeholder="🔒 Contraseña" 
            value={formData.password}
            onChange={handleChange} 
            required 
            disabled={loading}
          />
          <button type="submit" disabled={loading}>
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>

        {message && <p>{message}</p>}

        {/* Enlace de registro */}
        <p className="register-text">
          ¿No estás registrado? <Link to="/register">Entra aquí</Link>
        </p>
      </div>
    </div>
  );
}