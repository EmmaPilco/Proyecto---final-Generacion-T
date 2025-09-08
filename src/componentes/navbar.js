import React from "react";
import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav style={{ padding: "10px", background: "#282c34", color: "#fff" }}>
      <Link to="/" style={{ margin: "0 10px", color: "white" }}>Feed</Link>
      <Link to="/login" style={{ margin: "0 10px", color: "white" }}>Login</Link>
      <Link to="/register" style={{ margin: "0 10px", color: "white" }}>Registro</Link>
      <Link to="/profile/1" style={{ margin: "0 10px", color: "white" }}>Mi Perfil</Link>
    </nav>
  );
}
