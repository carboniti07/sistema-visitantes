// src/components/Dashboard.jsx
import React, { useEffect, useState } from "react";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import ptBR from "date-fns/locale/pt-BR";
import { useNavigate } from "react-router-dom";
import {
  FaUser,
  FaPrayingHands,
  FaVenusMars,
  FaChartPie,
  FaChurch,
  FaClock,
  FaInfoCircle,
  FaWhatsapp,
  FaSignOutAlt,
  FaTrash,
} from "react-icons/fa";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import Footer from "./Footer";

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [visitantes, setVisitantes] = useState([]);
  const [filtros, setFiltros] = useState({
    tipoCulto: "",
    sexo: "",
    faixaEtaria: "",
    dataInicio: null,
    dataFim: null,
    congregacao: "",
  });

  const API_URL = "https://sistema-visitantes-backend.onrender.com";

  // login/session + carregar visitantes
  useEffect(() => {
    const savedUser = JSON.parse(sessionStorage.getItem("auth_user"));
    if (!savedUser) {
      navigate("/login");
      return;
    }

    setUser(savedUser);
    setFiltros((prev) => ({
      ...prev,
      congregacao: savedUser.isSede ? "" : savedUser.congregacao,
    }));

    // Buscar visitantes da API
    fetch(`${API_URL}/visitantes`)
      .then((res) => res.json())
      .then((data) => {
        const dadosFiltrados = savedUser.isSede
          ? data
          : data.filter((v) => v.congregacao === savedUser.congregacao);
        setVisitantes(dadosFiltrados);
      })
      .catch((err) => console.error("Erro ao carregar visitantes:", err));
  }, [navigate]);

  if (!user) return null;

  // logout
  const handleLogout = () => {
    sessionStorage.removeItem("auth_user");
    navigate("/login");
  };

  // deletar visitante
  const handleDelete = async (id) => {
    if (!window.confirm("Deseja realmente apagar este visitante?")) return;

    try {
      await fetch(`${API_URL}/visitantes/${id}`, { method: "DELETE" });
      setVisitantes((prev) => prev.filter((v) => v._id !== id));
    } catch (err) {
      console.error("Erro ao deletar visitante:", err);
    }
  };

  // filtros
  const visitantesFiltrados = visitantes.filter((v) => {
    const matchTipo = filtros.tipoCulto ? v.tipoCulto === filtros.tipoCulto : true;
    const matchSexo = filtros.sexo ? v.sexo === filtros.sexo : true;
    const matchEtaria = filtros.faixaEtaria ? v.perfilEtario === filtros.faixaEtaria : true;
    const dataVisitante = v.dataRef
      ? new Date(v.dataRef.split("/").reverse().join("-"))
      : new Date();
    const matchDataInicio = filtros.dataInicio ? dataVisitante >= filtros.dataInicio : true;
    const matchDataFim = filtros.dataFim ? dataVisitante <= filtros.dataFim : true;
    const matchCong =
      user.isSede && filtros.congregacao ? v.congregacao === filtros.congregacao : true;
    return (
      matchTipo && matchSexo && matchEtaria && matchDataInicio && matchDataFim && matchCong
    );
  });

  // exportar Excel
  const exportToExcel = () => {
    if (visitantesFiltrados.length === 0) {
      alert("Nenhum visitante para exportar.");
      return;
    }

    const dadosFormatados = visitantesFiltrados.map((v) => ({
      Nome: v.nome,
      Sexo: v.sexo || "-",
      "Faixa Etária": v.perfilEtario || "-",
      "Tipo de Culto": v.tipoCulto,
      Congregação: v.congregacao,
      "Frequenta outra igreja":
        v.frequenta === "sim"
          ? `Sim (${v.qualIgreja || "-"})`
          : v.frequenta === "não"
          ? "Não"
          : "-",
      "Procurando igreja":
        v.procurando === "sim"
          ? "Sim"
          : v.procurando === "não"
          ? "Não"
          : "-",
      Cargo:
        v.temCargo === "sim"
          ? v.cargo || "-"
          : v.temCargo === "não"
          ? "Não"
          : "-",
      "Como conheceu": v.comoconheceuLabel || "-",
      "Data/Hora": v.dataHora || v.dataRef,
      WhatsApp: v.whatsapp || "-",
    }));

    const header = [
      "Nome",
      "Sexo",
      "Faixa Etária",
      "Tipo de Culto",
      "Congregação",
      "Frequenta outra igreja",
      "Procurando igreja",
      "Cargo",
      "Como conheceu",
      "Data/Hora",
      "WhatsApp",
    ];

    const worksheet = XLSX.utils.json_to_sheet(dadosFormatados, { header });
    const colWidths = header.map((key) => ({
      wch: Math.max(
        key.length,
        ...dadosFormatados.map((row) => (row[key] ? row[key].toString().length : 0))
      ),
    }));
    worksheet["!cols"] = colWidths;
    worksheet["!autofilter"] = { ref: worksheet["!ref"] };
    worksheet["!freeze"] = { xSplit: 0, ySplit: 1 };

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Visitantes");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, "visitantes.xlsx");
  };

  // opções selects
  const opcoesTipoCulto = [
    { value: "", label: "Tipo de culto" },
    { value: "Culto Santa Ceia", label: "Santa Ceia" },
    { value: "Culto da Família", label: "Família" },
    { value: "Culto de Ensino", label: "Ensino" },
    { value: "Culto Evangelístico", label: "Evangelístico" },
    { value: "Culto de Louvor e Testemunho", label: "Louvor e Testemunho" },
  ];

  const opcoesSexo = [
    { value: "", label: "Gênero" },
    { value: "masculino", label: "Masculino" },
    { value: "feminino", label: "Feminino" },
  ];

  const opcoesFaixaEtaria = [
    { value: "", label: "Faixa etária" },
    { value: "crianca", label: "Criança" },
    { value: "adolescente", label: "Adolescente" },
    { value: "jovem", label: "Jovem" },
    { value: "adulto", label: "Adulto" },
    { value: "idoso", label: "Idoso" },
  ];

  const opcoesCong = [
    { value: "", label: "Todas as congregações" },
    { value: "001 RUDGE RAMOS / SEDE", label: "001 SEDE" },
    { value: "002 V LIVIERO", label: "002 LIVIERO" },
    { value: "004 JD DO LAGO", label: "004 JD DO LAGO" },
    { value: "006 V IDEALOPOLIS", label: "006 V IDEALOPOLIS" },
    { value: "007 JD ABC", label: "007 JD ABC" },
    { value: "008 V NOVA CONQUISTA", label: "008 V NOVA CONQUISTA" },
    { value: "010 V VERA", label: "010 V VERA" },
    { value: "012 V ORIENTAL", label: "012 V ORIENTAL" },
    { value: "014 JD ORION", label: "014 JD ORION" },
    { value: "016 JD GONZAGA", label: "016 JD GONZAGA" },
    { value: "017 JD EUROPA", label: "017 JD EUROPA" },
    { value: "032 JD LAS PALMAS", label: "032 JD LAS PALMAS" },
    { value: "034 FAZENDA VELHA", label: "034 FAZENDA VELHA" },
    { value: "043 V BRASIL", label: "043 V BRASIL" },
    { value: "044 TORNINOS", label: "044 TORNINOS" },
    { value: "050 PRQ BRISTOL", label: "050 PRQ BRISTOL" },
    { value: "055 JD INAMAR", label: "055 JD INAMAR" },
    { value: "057 V ARAPUA", label: "057 V ARAPUA" },
    { value: "061 V FLORIDA", label: "061 V FLORIDA" },
    { value: "062 JD IPE", label: "062 JD IPE" },
  ];

  const estiloSelect = {
    control: (base) => ({
      ...base,
      borderRadius: 10,
      minHeight: 40,
      borderColor: "#ccc",
      boxShadow: "none",
      fontSize: "14px",
      fontFamily: "Poppins, sans-serif",
    }),
    menu: (base) => ({ ...base, zIndex: 9999 }),
    option: (base, { isFocused, isSelected }) => ({
      ...base,
      backgroundColor: isSelected ? "#0b3a85" : isFocused ? "#1249a1" : "#fff",
      color: isSelected || isFocused ? "#fff" : "#000",
      cursor: "pointer",
      fontSize: "14px",
    }),
  };

  const estiloData = {
    width: "100%",
    padding: "10px 12px",
    fontSize: "14px",
    borderRadius: "10px",
    border: "2px solid #ccc",
  };

  return (
    <div
      className="dashboard-page"
      style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
    >
      {/* Topo */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "#0b3a85",
          padding: "10px 16px",
          borderRadius: "8px",
          color: "#fff",
          marginBottom: "20px",
        }}
      >
        <h2 style={{ margin: 0, fontSize: "18px", fontWeight: "600" }}>
          Painel de Visitantes
        </h2>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={exportToExcel}
            style={{
              background: "#28a745",
              color: "#fff",
              border: "none",
              padding: "6px 12px",
              borderRadius: "6px",
              fontSize: "13px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            Exportar Excel
          </button>
          <button
            onClick={handleLogout}
            style={{
              background: "#d9534f",
              color: "#fff",
              border: "none",
              padding: "6px 12px",
              borderRadius: "6px",
              fontSize: "13px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <FaSignOutAlt /> Sair
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="filters-card">
        <Select
          options={opcoesTipoCulto}
          value={opcoesTipoCulto.find((o) => o.value === filtros.tipoCulto)}
          onChange={(opt) => setFiltros((f) => ({ ...f, tipoCulto: opt.value }))}
          styles={estiloSelect}
          isSearchable={false}
        />
        <Select
          options={opcoesSexo}
          value={opcoesSexo.find((o) => o.value === filtros.sexo)}
          onChange={(opt) => setFiltros((f) => ({ ...f, sexo: opt.value }))}
          styles={estiloSelect}
          isSearchable={false}
        />
        <Select
          options={opcoesFaixaEtaria}
          value={opcoesFaixaEtaria.find((o) => o.value === filtros.faixaEtaria)}
          onChange={(opt) => setFiltros((f) => ({ ...f, faixaEtaria: opt.value }))}
          styles={estiloSelect}
          isSearchable={false}
        />
        {user.isSede && (
          <Select
            options={opcoesCong}
            value={opcoesCong.find((o) => o.value === filtros.congregacao)}
            onChange={(opt) => setFiltros((f) => ({ ...f, congregacao: opt.value }))}
            styles={estiloSelect}
            isSearchable={false}
          />
        )}
        <DatePicker
          selected={filtros.dataInicio}
          onChange={(date) => setFiltros((f) => ({ ...f, dataInicio: date }))}
          placeholderText="Início"
          dateFormat="dd/MM/yyyy"
          locale={ptBR}
          customInput={<input style={estiloData} />}
        />
        <DatePicker
          selected={filtros.dataFim}
          onChange={(date) => setFiltros((f) => ({ ...f, dataFim: date }))}
          placeholderText="Fim"
          dateFormat="dd/MM/yyyy"
          locale={ptBR}
          customInput={<input style={estiloData} />}
        />
      </div>

      {/* Tabela */}
      <div style={{ marginTop: "20px", overflowX: "auto", flex: 1 }}>
        {visitantesFiltrados.length === 0 ? (
          <p style={{ textAlign: "center", color: "#888" }}>Nenhum visitante encontrado.</p>
        ) : (
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>
                  <div className="icon-text">
                    <FaUser className="icon" /> <span>Nome</span>
                  </div>
                </th>
                <th>
                  <div className="icon-text">
                    <FaVenusMars className="icon" /> <span>Sexo</span>
                  </div>
                </th>
                <th>
                  <div className="icon-text">
                    <FaChartPie className="icon" /> <span>Perfil</span>
                  </div>
                </th>
                <th>
                  <div className="icon-text">
                    <FaPrayingHands className="icon" /> <span>Culto</span>
                  </div>
                </th>
                <th>
                  <div className="icon-text">
                    <FaChurch className="icon" /> <span>Congregação</span>
                  </div>
                </th>
                <th>Frequenta outra igreja</th>
                <th>Procurando igreja</th>
                <th>Cargo</th>
                <th>
                  <div className="icon-text">
                    <FaInfoCircle className="icon" /> <span>Como conheceu</span>
                  </div>
                </th>
                <th>
                  <div className="icon-text">
                    <FaClock className="icon" /> <span>Data/Hora</span>
                  </div>
                </th>
                {user.isSede && (
                  <th>
                    <div className="icon-text">
                      <FaWhatsapp className="icon" /> <span>WhatsApp</span>
                    </div>
                  </th>
                )}
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {visitantesFiltrados.map((v) => (
                <tr key={v._id}>
                  <td>{v.nome}</td>
                  <td>{v.sexo || "-"}</td>
                  <td>{v.perfilEtario || "-"}</td>
                  <td>{v.tipoCulto}</td>
                  <td>{v.congregacao}</td>
                  <td>
                    {v.frequenta === "sim"
                      ? `Sim (${v.qualIgreja || "-"})`
                      : v.frequenta === "não"
                      ? "Não"
                      : "-"}
                  </td>
                  <td>
                    {v.procurando === "sim"
                      ? "Sim"
                      : v.procurando === "não"
                      ? "Não"
                      : "-"}
                  </td>
                  <td>
                    {v.temCargo === "sim"
                      ? v.cargo || "-"
                      : v.temCargo === "não"
                      ? "Não"
                      : "-"}
                  </td>
                  <td>{v.comoconheceuLabel || "-"}</td>
                  <td>{v.dataHora || v.dataRef}</td>
                  {user.isSede && <td>{v.whatsapp || "-"}</td>}
                  <td>
                    <button
                      onClick={() => handleDelete(v._id)}
                      className="delete-btn"
                      title="Apagar visitante"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer dentro do container */}
      <Footer variant="card" />
    </div>
  );
}
