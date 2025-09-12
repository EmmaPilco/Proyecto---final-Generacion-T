import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./componentes/navbar";
import Welcome from "./paginas/bienvenido";
import Login from "./paginas/login";
import Register from "./paginas/register";
import Feed from "./paginas/feed";
import Profile from "./paginas/profile";
import PrivateRoute from "./rutaprivada";

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
          {/*<Route path="/profile/:id" element={<><Navbar /><Profile /></>} />*/}

        </Routes>
      </div>
    </Router>
  );
}

export default App;
