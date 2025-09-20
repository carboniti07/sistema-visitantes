// src/App.jsx
import React from "react";
import { Toaster } from "react-hot-toast";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import FormularioVisitante from "./components/FormularioVisitante";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import Footer from "./components/Footer"; // 👈 mantido para usar no formulário
import "./styles/global.css";

function App() {
  return (
    <Router>
      <Toaster position="top-center" />
      <Routes>
        <Route
          path="/"
          element={
            <div className="container">
              <img
                src="/Logo AD Bras Final.png"
                alt="Logo da Igreja"
                className="logo"
              />
              <h1>Cadastro visitantes</h1>
              <FormularioVisitante />
              <Footer /> {/* 👈 footer só no formulário */}
            </div>
          }
        />

        {/* O Login já tem seu próprio container */}
        <Route path="/login" element={<Login />} />

        {/* Dashboard renderiza o Footer dentro dele */}
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
