import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./styles/style.css";

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    username: "",
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
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        // ✅ Guardamos el usuario real que viene del backend
        localStorage.setItem("user", JSON.stringify(data.user));

        setMessage("Registro exitoso, ahora puedes iniciar sesión.");
        setTimeout(() => navigate("/login"), 1500);
      } else {
        setMessage("Error al registrar: " + (data.message || ""));
      }
    } catch (err) {
      console.error(err);
      setMessage("Error en el servidor.");
    }
  };

  return (
    <div className="container">
      <div className="form-container">
        <h2>Registro</h2>
        <form onSubmit={handleSubmit}>
          <input type="text" name="name" placeholder="Nombre" onChange={handleChange} required />
          <input type="text" name="username" placeholder="Usuario" onChange={handleChange} required />
          <input type="email" name="email" placeholder="Correo electrónico" onChange={handleChange} required />
          <input type="password" name="password" placeholder="Contraseña" onChange={handleChange} required />
          <button type="submit">Registrarse</button>
        </form>
        <p>{message}</p>
      </div>
    </div>
  );
}

