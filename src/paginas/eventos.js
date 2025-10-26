import React, { useState, useEffect } from "react";
import "./styles/eventos.css";

export default function Eventos() {
  const [user] = useState(() => JSON.parse(localStorage.getItem("user")));
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEventos = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/eventos`);
        const data = await res.json();
        setEventos(data);
      } catch (err) {
        console.error("Error al cargar eventos:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEventos();
  }, []);

  const handleAsistencia = async (eventoId) => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/eventos/asistir`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: user.id, evento_id: eventoId }),
      });
      const data = await res.json();

      if (res.ok) {
        setEventos((prev) =>
          prev.map((e) =>
            e.id === eventoId
              ? {
                  ...e,
                  asistiendo: data.asistiendo,
                  asistentes_count: data.asistiendo
                    ? Number(e.asistentes_count) + 1
                    : Number(e.asistentes_count) - 1,
                }
              : e
          )
        );
      }
    } catch (err) {
      console.error("Error al cambiar asistencia:", err);
    }
  };

  if (loading) return <p className="loading">Cargando eventos...</p>;

  return (
    <div className="eventos-container">
      <h2>Eventos disponibles</h2>

      {eventos.length === 0 ? (
        <p className="no-events">No hay eventos aún</p>
      ) : (
        eventos.map((evento) => (
          <div key={evento.id} className="evento-card">
            <div className="evento-header">
              <img
                src={evento.avatar_url || "https://i.pravatar.cc/40"}
                alt={evento.creador_nombre}
                className="evento-avatar"
              />
              <div>
                <h3>{evento.titulo}</h3>
                <p>
                  Creado por <strong>{evento.creador_nombre}</strong>
                </p>
                <p className="fecha">
                  📅 {new Date(evento.fecha).toLocaleString("es-ES")}
                </p>
                <p className="lugar">📍 {evento.lugar}</p>
              </div>
            </div>

            <div className="evento-footer">
              <span>Asistentes: {evento.asistentes_count}</span>
              <button
                className={`asistir-btn ${evento.asistiendo ? "cancelar" : ""}`}
                onClick={() => handleAsistencia(evento.id)}
              >
                {evento.asistiendo ? "No asistiré" : "Asistiré"}
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
