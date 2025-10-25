import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./componentes/navbar";
import Welcome from "./paginas/bienvenido";
import Login from "./paginas/login";
import Register from "./paginas/register";
import Feed from "./paginas/feed";
import Profile from "./paginas/profile";
import Usuarios from "./paginas/usuarios";
import PrivateRoute from "./rutaprivada";

import Destacados from "./paginas/destacados";
import UsuariosSugeridos from "./paginas/usuarios-sugeridos";
import Eventos from "./paginas/eventos";
import CrearEvento from "./paginas/crear-evento";

function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/feed" element={<PrivateRoute><Navbar /><Feed /></PrivateRoute>} />
          <Route path="/profile/:id" element={<PrivateRoute><Navbar /><Profile /></PrivateRoute>} />
          <Route path="/usuarios" element={<PrivateRoute><Navbar /><Usuarios /></PrivateRoute>} />
          {/* 🔹 NUEVAS RUTAS */}
          <Route path="/destacados" element={<PrivateRoute><Navbar /><Destacados /></PrivateRoute>}/>
          <Route path="/usuarios-sugeridos" element={<PrivateRoute><Navbar /><UsuariosSugeridos /></PrivateRoute>}/>
          <Route path="/eventos" element={<PrivateRoute><Navbar /><Eventos /></PrivateRoute>} />
          <Route path="/crear-evento" element={<PrivateRoute><Navbar /><CrearEvento /></PrivateRoute>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
