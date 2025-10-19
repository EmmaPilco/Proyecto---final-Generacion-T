import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./styles/style.css";

export default function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        // Guardamos el token en localStorage
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        setMessage("Bienvenido " + data.user.name);

        // Redirigir al feed
        navigate("/feed"); 
      } else {
        setMessage("❌ " + data.message);
      }
    } catch (err) {
      console.error(err);
      setMessage("Error en el servidor.");
    }
  };

  return (
    <div className="container">
    <div className="form-container">
      <h2>Iniciar Sesión</h2>
      <form onSubmit={handleSubmit}>
        <input type="email" name="email" placeholder="Correo electrónico" onChange={handleChange} required />
        <input type="password" name="password" placeholder="Contraseña" onChange={handleChange} required />
        <button type="submit">Ingresar</button>
      </form>
      <p>{message}</p>

      {/* 🔹 Enlace de registro */}
      <p className="register-text">
        ¿No estás registrado? <Link to="/register">Entra aquí</Link>
      </p>
    </div>
    </div>
  );
}

