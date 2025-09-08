// src/PrivateRoute.js
import React from "react";
import { Navigate } from "react-router-dom";

export default function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");

  if (!token) {
    // Si no hay token, mandamos al login
    return <Navigate to="/login" replace />;
  }

  return children;
}
