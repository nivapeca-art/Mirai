
import { useEffect, useState } from "react";

import { obtenerDashboard } from "../services/dashboardServices";

import TarjetasResumen from "../components/dashboard/TarjetasResumen";
import Balance from "../components/dashboard/Balance";
import Comparacion from "../components/dashboard/Comparacion";
import MetasDash from "../components/dashboard/MetasDash";
import PanelLateral from "../components/dashboard/PanelLateral";

import "../styles/dashboard/dashboard.css";

function Dashboard() {

  const [dashboard, setDashboard] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [periodo, setPeriodo] = useState("mes");
  
  // Cargar datos
  useEffect(() => {
    cargarDashboard();
  }, [periodo]);

  const cargarDashboard = async () => {
    try {
      const respuesta = await obtenerDashboard(periodo);
      console.log("DATOS DASHBOARD:", respuesta);
      setDashboard(respuesta);
    } catch (error) {
      console.error("ERROR DASHBOARD:", error);
    } finally {
      setCargando(false);
    }
  };
  
  // Fecha actual
  const fechaActual = new Date().toLocaleDateString("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  
  // Tiempo del login realizado
  const obtenerMensajeUltimoAcceso = (ultimoAcceso) => {
    if (!ultimoAcceso) {
      return "Primera vez que haces login";
    }
    const ahora = new Date();
    const fecha = new Date(ultimoAcceso);
    const diferenciaMs = ahora - fecha;
    const dias = Math.floor(diferenciaMs / (1000 * 60 * 60 * 24));
    if (dias === 0) {
      return "Último acceso: Hoy";
    }
    if (dias === 1) {
      return "Último acceso: Ayer";
    }
    if (dias < 7) {
      return `Último acceso: Hace ${dias} días`;
    }
    const semanas = Math.floor(dias / 7);
    if (dias < 30) {
      return semanas === 1
        ? "Último acceso: Hace 1 semana"
        : `Último acceso: Hace ${semanas} semanas`;
    }
    const meses = Math.floor(dias / 30);
    return meses === 1
      ? "Último acceso: Hace 1 mes"
      : `Último acceso: Hace ${meses} meses`;
  };

  if (cargando) {
    return <p>Cargando Dashboard...</p>;
  }

  if (!dashboard) {
    return <p>No se pudieron cargar los datos del dashboard.</p>;
  }

  return (
    <div className="dashboard">
      {/* ENCABEZADO */}
      <header className="dashboard-encabezado">
        {/* TITULO Y FILTRO */}
        <div className="dashboard-titulo">
          <h1>DASHBOARD</h1>
          <select
            className="filtro-periodo"
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value)}
          >
            <option value="mes">Mes actual</option>
            <option value="comparacion">Mes vs mes anterior</option>
            <option value="anual">Anual</option>
          </select>
        </div>
        {/* FECHA Y ULTIMO ACCESO */}
        <div className="info-usuario">
          <p className="fecha">{fechaActual}</p>
          <span>
            {obtenerMensajeUltimoAcceso(dashboard.usuario?.ultimo_acceso)}
          </span>
        </div>
      </header>
      {/* RESUMEN */}
      <TarjetasResumen dashboard={dashboard} />
      {/* BALANCE */}
      <Balance dashboard={dashboard} />
      {/* PARTE INFERIOR */}
      <div className="inferior">
        <Comparacion dashboard={dashboard} />
        <MetasDash dashboard={dashboard} />
      </div>
      {/* PANEL LATERAL */}
        <PanelLateral dashboard={dashboard} onGuardado={cargarDashboard} />
    </div>
  );
}
export default Dashboard;
