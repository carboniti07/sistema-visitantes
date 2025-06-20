import React from "react";
import FormularioVisitante from "./components/FormularioVisitante";
import "./styles/global.css";

function App() {
  return (
    <div className="container">
      <img src="/Logo AD Bras Final.png" alt="Logo da Igreja" className="logo" />
      <h1>Visitantes !</h1>
      <FormularioVisitante />
    </div>
  );
}

export default App;
