import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./styles/crear-evento.css";

export default function CrearEvento() {
  const [titulo, setTitulo] = useState("");
  const [lugar, setLugar] = useState("");
  const [fecha, setFecha] = useState("");
  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!titulo || !lugar || !fecha) return alert("Completa todos los campos");

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/eventos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo,
          lugar,
          fecha,
          user_id: user.id,
        }),
      });

      if (res.ok) {
        alert("Evento creado con éxito 🎉");
        navigate("/eventos");
      }
    } catch (err) {
      console.error("Error al crear evento:", err);
    }
  };

  return (
    <div className="crear-evento-container">
      <h2>Crear nuevo evento</h2>
      <form onSubmit={handleSubmit}>
        <label>Título del evento:</label>
        <input
          type="text"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder="Ejemplo: Fiesta de fin de año"
        />

        <label>Lugar:</label>
        <input
          type="text"
          value={lugar}
          onChange={(e) => setLugar(e.target.value)}
          placeholder="Ejemplo: Buenos Aires, Argentina"
        />

        <label>Fecha y hora:</label>
        <input
          type="datetime-local"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
        />

        <button type="submit">Crear evento</button>
      </form>
    </div>
  );
}
