// src/FormularioVisitante.jsx
import React, { useState, useEffect, useMemo } from "react";
import { FaWhatsapp } from "react-icons/fa";
import Select from "react-select";

const congregacoes = [
  "001 RUDGE RAMOS / SEDE", "002 V LIVIERO", "004 JD DO LAGO", "006 V IDEALOPOLIS", "007 JD ABC",
  "008 V NOVA CONQUISTA", "010 V VERA", "012 V ORIENTAL", "014 JD ORION", "016 JD GONZAGA",
  "017 JD EUROPA", "032 JD LAS PALMAS", "034 FAZENDA VELHA", "043 V BRASIL", "044 TORNINOS",
  "050 PRQ BRISTOL", "055 JD INAMAR", "057 V ARAPUA", "061 V FLORIDA", "062 JD IPE"
];

const DRAFT_KEY = "visitante_form_draft";
const FIXED_PREFIX = "visitante_fixos_";
const todayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const fixedKeyForToday = () => `${FIXED_PREFIX}${todayKey()}`;

export default function FormularioVisitante() {
  const [form, setForm] = useState({
    tipoCulto: "", nome: "", sexo: "", perfilEtario: "",
    frequenta: "", procurando: "", qualIgreja: "",
    comoconheceu: "", nomeConvidador: "",
    congregacao: "", temCargo: "", cargo: "",
    whatsapp: ""
  });
  const [mensagemStatus, setMensagemStatus] = useState("");

  // restaura rascunho + fixos
  useEffect(() => {
    try {
      const draft = JSON.parse(localStorage.getItem(DRAFT_KEY) || "{}");
      const fixed = JSON.parse(localStorage.getItem(fixedKeyForToday()) || "{}");
      setForm(prev => ({
        ...prev,
        ...{ tipoCulto: fixed.tipoCulto || "", congregacao: fixed.congregacao || "" },
        ...draft
      }));
    } catch { }
  }, []);

  const persistForm = (next) => {
    try { localStorage.setItem(DRAFT_KEY, JSON.stringify(next)); } catch { }
  };
  const persistFixos = (campo, valor) => {
    if (campo !== "tipoCulto" && campo !== "congregacao") return;
    try {
      const k = fixedKeyForToday();
      const prev = JSON.parse(localStorage.getItem(k) || "{}");
      localStorage.setItem(k, JSON.stringify({ ...prev, [campo]: valor || "" }));
    } catch { }
  };

  const setField = (n, v) => {
    const nv = v || "";
    setForm(p => {
      const next = { ...p, [n]: nv };
      persistForm(next);
      persistFixos(n, nv);
      return next;
    });
  };

  const formatarTexto = (t) =>
    t.replace(/[^A-Za-zÀ-ÿ\s]/g, "")
      .slice(0, 45)
      .replace(/\s+/g, " ")
      .toLowerCase()
      .split(" ")
      .map(p => p.charAt(0).toUpperCase() + p.slice(1))
      .join(" ");
  const formatarWhats = (v) => {
    const d = v.replace(/\D/g, "").slice(0, 11);
    if (d.length <= 10) {
      const p1 = d.slice(0, 2), p2 = d.slice(2, 6), p3 = d.slice(6, 10);
      return d.length > 6
        ? `(${p1}) ${p2}-${p3}`
        : d.length > 2
          ? `(${p1}) ${p2}`
          : d.length > 0
            ? `(${p1}`
            : "";
    } else {
      const p1 = d.slice(0, 2), p2 = d.slice(2, 7), p3 = d.slice(7, 11);
      return `(${p1}) ${p2}-${p3}`;
    }
  };
  const handleChangeInput = (e) => {
    const { name, value } = e.target;
    let nv = value;
    if (["nome", "qualIgreja", "nomeConvidador"].includes(name)) nv = formatarTexto(nv);
    if (name === "whatsapp") nv = formatarWhats(nv);
    setField(name, nv);
  };

  // regras condicionais
  useEffect(() => { if (form.frequenta !== "sim") setField("qualIgreja", ""); }, [form.frequenta]);
  useEffect(() => { if (form.comoconheceu !== "convite") setField("nomeConvidador", ""); }, [form.comoconheceu]);
  useEffect(() => { if (form.temCargo !== "sim") setField("cargo", ""); }, [form.temCargo]);

  const cargoLabel = (k, sexo) => {
    const masc = { diacono: "Diácono", presbitero: "Presbítero", evangelista: "Evangelista", pastor: "Pastor" };
    const fem = { diacono: "Diaconisa", presbitero: "Missionária", evangelista: "Evangelista", pastor: "Pastora" };
    return sexo === "feminino" ? fem[k] : masc[k];
  };

  const isEmpty = (v) => !v || String(v).trim() === "";
  const validateObrigatorios = () => {
    if ([form.tipoCulto, form.nome, form.sexo, form.perfilEtario, form.frequenta, form.procurando, form.comoconheceu, form.congregacao, form.temCargo].some(isEmpty)) return false;
    if (form.frequenta === "sim" && isEmpty(form.qualIgreja)) return false;
    if (form.comoconheceu === "convite" && isEmpty(form.nomeConvidador)) return false;
    if (form.temCargo === "sim" && isEmpty(form.cargo)) return false;
    return true;
  };

  const montarMensagem = () => {
    const data = new Date().toLocaleDateString("pt-BR");
    const cargoTxt = form.temCargo === "sim" && form.cargo ? cargoLabel(form.cargo, form.sexo) : null;
    const frequentaTxt = form.frequenta === "sim" && form.qualIgreja ? form.qualIgreja : null;
    const procurandoTxt = form.procurando === "sim" ? "Está procurando uma igreja." : null;

    const linhas = [
      "*Novo visitante*",
      `• *Dia:* ${data}`,
      `• *Tipo de culto:* ${form.tipoCulto || "-"}`,
      `• *Nome:* ${form.nome || "-"}`,
      cargoTxt ? `• *Cargo:* ${cargoTxt}` : null,
      frequentaTxt ? `• *Frequenta Igreja:* ${frequentaTxt}` : null,
      procurandoTxt ? `• *${procurandoTxt}*` : null
    ].filter(Boolean);

    return linhas.join("\n");
  };

  const limparTudo = () => {
    let keepTipo = form.tipoCulto;
    let keepCong = form.congregacao;
    try {
      const fixed = JSON.parse(localStorage.getItem(fixedKeyForToday()) || "{}");
      if (fixed.tipoCulto) keepTipo = fixed.tipoCulto;
      if (fixed.congregacao) keepCong = fixed.congregacao;
    } catch { }

    const next = {
      tipoCulto: keepTipo || "",
      nome: "",
      sexo: "",
      perfilEtario: "",
      frequenta: "",
      qualIgreja: "",
      procurando: "",
      comoconheceu: "",
      nomeConvidador: "",
      congregacao: keepCong || "",
      temCargo: "",
      cargo: "",
      whatsapp: ""
    };

    setForm(next);
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(next));
      const prevFixed = JSON.parse(localStorage.getItem(fixedKeyForToday()) || "{}");
      localStorage.setItem(
        fixedKeyForToday(),
        JSON.stringify({ ...prevFixed, tipoCulto: next.tipoCulto, congregacao: next.congregacao })
      );
    } catch { }
  };

const handleEnviar = async () => {
  if (!validateObrigatorios()) {
    setMensagemStatus("❌ Responda as alternativas");
    return;
  }

  // Detecta ambiente: localhost em dev, Render em produção
  const API_URL =
    window.location.hostname === "localhost"
      ? "http://localhost:3001"
      : "https://sistema-visitantes-backend.onrender.com";

  try {
    // 🔹 Salvar visitante no backend
    await fetch(`${API_URL}/visitantes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        comoconheceuLabel:
          comoConheceuOptions.find((c) => c.value === form.comoconheceu)?.label || "",
        dataHora: new Date().toLocaleString("pt-BR"),
      }),
    });

    // 🔹 Abre mensagem no WhatsApp
    const mensagem = encodeURIComponent(montarMensagem());
    window.open(`https://wa.me/?text=${mensagem}`, "_blank", "noopener,noreferrer");

    setMensagemStatus("✅ Visitante salvo e mensagem aberta no WhatsApp.");
    setTimeout(() => setMensagemStatus(""), 3000);

    limparTudo(); // mantém culto e congregação
  } catch (err) {
    console.error("Erro ao salvar visitante:", err);
    setMensagemStatus("❌ Erro ao salvar visitante no servidor.");
  }
};


  // opções
  const tipoCultoOptions = [
    { value: "Culto Santa Ceia", label: "Santa Ceia" },
    { value: "Culto da Família", label: "Família" },
    { value: "Culto de Ensino", label: "Ensino" },
    { value: "Culto de Libertação", label: "Libertação" },
    { value: "Culto Evangelístico", label: "Evangelístico" },
    { value: "Culto de Louvor e Testemunho", label: "Louvor e Testemunho" },
    { value: "Círculo de Oração", label: "Círculo de Oração" },
    { value: "Culto da Bênção", label: "Bênção" },
    { value: "Culto de Crianças", label: "Crianças" },
    { value: "Culto de Adolescentes", label: "Adolescentes" },
    { value: "Culto de Jovens", label: "Jovens" },
    { value: "Culto de Varões", label: "Varões" },
    { value: "Culto CIBE", label: "CIBE" },
    { value: "Culto Especial", label: "Especial" }
  ];
  const sexoOptions = [
    { value: "masculino", label: "Masculino" },
    { value: "feminino", label: "Feminino" }
  ];
  const perfilEtarioOptions = [
    { value: "crianca", label: "Criança" },
    { value: "adolescente", label: "Adolescente" },
    { value: "jovem", label: "Jovem" },
    { value: "adulto", label: "Adulto" },
    { value: "idoso", label: "Idoso" }
  ];
  const simNao = [
    { value: "sim", label: "Sim" },
    { value: "não", label: "Não" }
  ];
  const comoConheceuOptions = [
    { value: "redes", label: "Redes sociais (Instagram, Facebook, etc.)" },
    { value: "google", label: "Busca no Google ou na internet" },
    { value: "convite", label: "Convite de um membro da igreja" },
    { value: "outro", label: "Outro" }
  ];
  const congregacaoOptions = useMemo(() => congregacoes.map(c => ({ value: c, label: c })), []);
  const cargoOptions = useMemo(() => [
    { value: "diacono", label: cargoLabel("diacono", form.sexo) },
    { value: "presbitero", label: cargoLabel("presbitero", form.sexo) },
    { value: "evangelista", label: cargoLabel("evangelista", form.sexo) },
    { value: "pastor", label: cargoLabel("pastor", form.sexo) }
  ], [form.sexo]);

  const azulPrim = "#0b3a85", azulSec = "#174ea6", azulFocus = "#0d3a9a";
  const selectStyles = {
    control: (base, state) => ({
      ...base, minHeight: 44, borderRadius: 12,
      borderColor: state.isFocused ? azulFocus : "#e5e7eb",
      boxShadow: state.isFocused ? "0 0 0 3px rgba(13,58,154,.18)" : "none",
      ":hover": { borderColor: azulSec }, fontSize: 14
    }),
    menu: (base) => ({ ...base, borderRadius: 12, overflow: "hidden", boxShadow: "0 10px 30px rgba(0,0,0,.08)" }),
    option: (base, state) => ({
      ...base, padding: "10px 12px",
      backgroundColor: state.isSelected ? azulPrim : state.isFocused ? "#f3f4f6" : "white",
      color: state.isSelected ? "white" : "#111827", cursor: "pointer", fontSize: 14
    }),
    valueContainer: (b) => ({ ...b, padding: "2px 8px" }),
    indicatorsContainer: (b) => ({ ...b, paddingRight: 6 })
  };

  const getOpt = (opts, v) => opts.find(o => o.value === v) || null;

  return (
    <div className="formulario">
      {/* Campos */}
      <div className="field">
        <label className="field-label">Tipo de culto</label>
        <Select styles={selectStyles} isSearchable={false}
          options={tipoCultoOptions}
          value={getOpt(tipoCultoOptions, form.tipoCulto)}
          onChange={(o) => setField("tipoCulto", o?.value)} />
      </div>

      <div className="field">
        <label className="field-label">Nome do visitante</label>
        <input type="text" name="nome" value={form.nome} onChange={handleChangeInput} placeholder="Digite o nome" />
      </div>

      <div className="field">
        <label className="field-label">Sexo</label>
        <Select styles={selectStyles} isSearchable={false}
          options={sexoOptions}
          value={getOpt(sexoOptions, form.sexo)}
          onChange={(o) => setField("sexo", o?.value)} />
      </div>

      <div className="field">
        <label className="field-label">Perfil etário</label>
        <Select styles={selectStyles} isSearchable={false}
          options={perfilEtarioOptions}
          value={getOpt(perfilEtarioOptions, form.perfilEtario)}
          onChange={(o) => setField("perfilEtario", o?.value)} />
      </div>

      <div className="field">
        <label className="field-label">Frequenta alguma igreja?</label>
        <Select styles={selectStyles} isSearchable={false}
          options={simNao}
          value={getOpt(simNao, form.frequenta)}
          onChange={(o) => setField("frequenta", o?.value)} />
      </div>

      {form.frequenta === "sim" && (
        <div className="field">
          <label className="field-label">Qual igreja?</label>
          <input type="text" name="qualIgreja" value={form.qualIgreja} onChange={handleChangeInput} placeholder="Digite o nome da igreja" />
        </div>
      )}

      <div className="field">
        <label className="field-label">Procurando igreja?</label>
        <Select styles={selectStyles} isSearchable={false}
          options={simNao}
          value={getOpt(simNao, form.procurando)}
          onChange={(o) => setField("procurando", o?.value)} />
      </div>

      <div className="field">
        <label className="field-label">Como conheceu a nossa igreja?</label>
        <Select styles={selectStyles} isSearchable={false}
          options={comoConheceuOptions}
          value={getOpt(comoConheceuOptions, form.comoconheceu)}
          onChange={(o) => setField("comoconheceu", o?.value)} />
      </div>
      {form.comoconheceu === "convite" && (
        <div className="field">
          <label className="field-label">Nome de quem convidou</label>
          <input
            type="text"
            name="nomeConvidador"
            value={form.nomeConvidador}
            onChange={handleChangeInput}
            placeholder="Digite o nome"
          />
        </div>
      )}

      <div className="field">
        <label className="field-label">Possui cargo eclesiástico?</label>
        <Select
          styles={selectStyles}
          isSearchable={false}
          options={simNao}
          value={getOpt(simNao, form.temCargo)}
          onChange={(o) => setField("temCargo", o?.value)}
        />
      </div>

      {form.temCargo === "sim" && (
        <div className="field">
          <label className="field-label">Selecione o cargo</label>
          <Select
            styles={selectStyles}
            isSearchable={false}
            options={cargoOptions}
            value={getOpt(cargoOptions, form.cargo)}
            onChange={(o) => setField("cargo", o?.value)}
          />
        </div>
      )}

      <div className="field">
        <label className="field-label">WhatsApp (opcional)</label>
        <input
          type="tel"
          name="whatsapp"
          value={form.whatsapp}
          onChange={handleChangeInput}
          placeholder="(11) 91234-5678"
          inputMode="tel"
        />
      </div>

      <div className="field">
        <label className="field-label">Congregação</label>
        <Select
          styles={selectStyles}
          isSearchable={false}
          options={congregacaoOptions}
          value={getOpt(congregacaoOptions, form.congregacao)}
          onChange={(o) => setField("congregacao", o?.value)}
        />
      </div>

      {/* Botões */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <button onClick={handleEnviar} className="pulse whatsapp-btn">
          <FaWhatsapp className="btn-icon" /> Enviar para WhatsApp
        </button>
        <button type="button" onClick={limparTudo} className="btn-secondary">
          Limpar tudo
        </button>
      </div>

      {mensagemStatus && (
        <p
          style={{
            marginTop: "1rem",
            fontWeight: "bold",
            color: mensagemStatus.startsWith("✅") ? "#00cc88" : "#ff5b5b",
            textAlign: "center",
          }}
        >
          {mensagemStatus}
        </p>
      )}
    </div>
  );
}

     
