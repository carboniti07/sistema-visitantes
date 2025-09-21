// src/components/Login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { FaIdCard, FaIdBadge } from "react-icons/fa";

export default function Login() {
  const [matricula, setMatricula] = useState("");
  const [cpf, setCpf] = useState("");
  const navigate = useNavigate();

  const API_URL = "https://sistema-visitantes-backend.onrender.com";

  // máscara matrícula (até 6 dígitos numéricos)
  const handleMatriculaChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setMatricula(value);
  };

  // máscara CPF (000.000.000-00)
  const handleCpfChange = (e) => {
    let value = e.target.value.replace(/\D/g, "").slice(0, 11);
    if (value.length <= 9) {
      value = value.replace(/(\d{3})(\d)/, "$1.$2");
      value = value.replace(/(\d{3})(\d)/, "$1.$2");
    } else {
      value = value.replace(/(\d{3})(\d)/, "$1.$2");
      value = value.replace(/(\d{3})(\d)/, "$1.$2");
      value = value.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    }
    setCpf(value);
  };

  // validação CPF (algoritmo oficial)
  const validarCPF = (strCPF) => {
    const cpfNum = strCPF.replace(/\D/g, "");
    if (cpfNum.length !== 11 || /^(\d)\1+$/.test(cpfNum)) return false;

    let soma = 0;
    for (let i = 1; i <= 9; i++) soma += parseInt(cpfNum.substring(i - 1, i)) * (11 - i);
    let resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpfNum.substring(9, 10))) return false;

    soma = 0;
    for (let i = 1; i <= 10; i++) soma += parseInt(cpfNum.substring(i - 1, i)) * (12 - i);
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpfNum.substring(10, 11))) return false;

    return true;
  };

  const handleLogin = async () => {
    if (matricula.length === 0) {
      toast.error("Informe a matrícula.");
      return;
    }
    if (!validarCPF(cpf)) {
      toast.error("CPF inválido.");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matricula,
          cpf: cpf.replace(/\D/g, "") // envia só números
        })
      });

      if (!res.ok) throw new Error("Login inválido");

      const user = await res.json();
      sessionStorage.setItem("auth_user", JSON.stringify(user)); // expira ao fechar navegador

      toast.success(`Bem-vindo(a), ${user.nome.split(" ")[0]}!`);
      navigate("/dashboard");
    } catch (err) {
      toast.error("Matrícula ou CPF inválidos.");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "24px"
      }}
    >
      <div className="login-card">
        <img src="/Logo AD Bras Final.png" className="logo" alt="logo" />
        <h1>Login Secretários</h1>

        <div className="formulario">
          {/* Campo matrícula */}
          <div style={{ position: "relative" }}>
            <FaIdBadge
              style={{
                position: "absolute",
                top: "50%",
                left: "14px",
                transform: "translateY(-50%)",
                color: "#666",
                zIndex: 2
              }}
            />
            <input
              type="text"
              placeholder="Matrícula "
              value={matricula}
              onChange={handleMatriculaChange}
              style={{ paddingLeft: "40px" }}
            />
          </div>

          {/* Campo CPF */}
          <div style={{ position: "relative" }}>
            <FaIdCard
              style={{
                position: "absolute",
                top: "50%",
                left: "14px",
                transform: "translateY(-50%)",
                color: "#666",
                zIndex: 2
              }}
            />
            <input
              type="text"
              placeholder="CPF"
              value={cpf}
              onChange={handleCpfChange}
              style={{ paddingLeft: "40px" }}
            />
          </div>

          <button onClick={handleLogin} className="pulse">
            Entrar
          </button>
        </div>
      </div>
    </div>
  );
}
