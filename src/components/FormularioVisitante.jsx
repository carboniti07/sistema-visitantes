import React, { useState, useEffect } from "react";
import { FaWhatsapp } from "react-icons/fa";

const congregacoes = [
  "001 RUDGE RAMOS / SEDE", "002 V LIVIERO", "004 JD DO LAGO", "006 V IDEALOPOLIS", "007 JD ABC",
  "008 V NOVA CONQUISTA", "010 V VERA", "012 V ORIENTAL", "014 JD ORION", "016 JD GONZAGA",
  "017 JD EUROPA", "032 JD LAS PALMAS", "034 FAZENDA VELHA", "043 V BRASIL", "044 TORNINOS",
  "050 PRQ BRISTOL", "055 JD INAMAR", "057 V ARAPUA", "061 V FLORIDA", "062 JD IPE"
];

export default function FormularioVisitante() {
  const [form, setForm] = useState({
    nome: "",
    frequenta: "",
    qualIgreja: "",
    convidado: "",
    quemConvidou: "",
    congregacao: ""
  });

  const [mensagemStatus, setMensagemStatus] = useState("");

  const handleChange = (e) => {
  const { name, value } = e.target;
  let newValue = value;

  const formatarTexto = (texto) => {
    return texto
      .replace(/[^A-Za-zÀ-ÿ\s]/g, "") // remove tudo que não for letra ou espaço
      .slice(0, 45) // limite de 30 caracteres
      .replace(/\s+/g, " ") // remove espaços duplicados
      .toLowerCase()
      .split(" ")
      .map((palavra) => palavra.charAt(0).toUpperCase() + palavra.slice(1))
      .join(" ");
  };

  if (["nome", "qualIgreja", "quemConvidou"].includes(name)) {
    newValue = formatarTexto(newValue);
  }

  setForm((prev) => ({ ...prev, [name]: newValue }));
};


  const obterDataAtual = () => {
    const hoje = new Date();
    const dia = String(hoje.getDate()).padStart(2, "0");
    const mes = String(hoje.getMonth() + 1).padStart(2, "0");
    const ano = hoje.getFullYear();
    const hora = hoje.getHours();
    return `${dia}/${mes}/${ano} – ${hora}h Culto`;
  };

  const montarMensagem = () => {
    return (
      `📌 *Novo visitante na igreja!*\n\n` +
      `*🧍 Nome:* ${form.nome}\n` +
      `*🙋‍♂️ Frequenta outra igreja?* ${form.frequenta}` +
      (form.frequenta === "sim" ? `\n*📍 Qual?* ${form.qualIgreja}` : "") +
      `\n*🤝 Foi convidado?* ${form.convidado}` +
      (form.convidado === "sim" ? `\n*👤 Por quem?* ${form.quemConvidou}` : "") +
      `\n*🏠 Congregação:* ${form.congregacao}` +
      `\n*📅 Data:* ${obterDataAtual()}\n\n` +
      `🕊️ *Seja bem-vindo(a)!*`
    );
  };

  const handleEnviar = () => {
    if (!form.nome || !form.frequenta || !form.congregacao) {
      setMensagemStatus("❌ Preencha os campos obrigatórios!");
      return;
    }

    const mensagem = encodeURIComponent(montarMensagem());
    const link = `https://wa.me/?text=${mensagem}`;
    window.open(link, "_blank");

    setMensagemStatus("✅ Visitante enviado com sucesso!");
    setForm({
      nome: "",
      frequenta: "",
      qualIgreja: "",
      convidado: "",
      quemConvidou: "",
      congregacao: ""
    });

    setTimeout(() => {
      setMensagemStatus("");
    }, 3000);
  };

  return (
    <div className="formulario">
      <input
        type="text"
        name="nome"
        placeholder="Nome do visitante *"
        value={form.nome}
        onChange={handleChange}
      />

      <select name="frequenta" value={form.frequenta} onChange={handleChange}>
        <option value="">Frequenta alguma igreja? *</option>
        <option value="sim">Sim</option>
        <option value="não">Não</option>
      </select>

      {form.frequenta === "sim" && (
        <input
          type="text"
          name="qualIgreja"
          placeholder="Qual igreja?"
          value={form.qualIgreja}
          onChange={handleChange}
        />
      )}

      <select name="convidado" value={form.convidado} onChange={handleChange}>
        <option value="">Foi convidado por alguém?</option>
        <option value="sim">Sim</option>
        <option value="não">Não</option>
      </select>

      {form.convidado === "sim" && (
        <input
          type="text"
          name="quemConvidou"
          placeholder="Quem convidou?"
          value={form.quemConvidou}
          onChange={handleChange}
        />
      )}

      <select
        name="congregacao"
        value={form.congregacao}
        onChange={handleChange}
      >
        <option value="">Escolha a congregação *</option>
        {congregacoes.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>

      <button onClick={handleEnviar} className="pulse">
        <FaWhatsapp style={{ marginRight: "8px" }} />
        Enviar para WhatsApp
      </button>

      {mensagemStatus && (
        <p
          style={{
            marginTop: "1rem",
            fontWeight: "bold",
            color: mensagemStatus.startsWith("✅") ? "#00cc88" : "#ff5b5b",
            textAlign: "center",
            transition: "opacity 0.3s ease"
          }}
        >
          {mensagemStatus}
        </p>
      )}
    </div>
  );
}
