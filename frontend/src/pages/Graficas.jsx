import { useEffect, useState } from "react";

import { RefreshCw, BarChart3 } from "lucide-react";

import { obtenerDashboard } from "../services/dashboardServices";

import ResumenGraficas from "../components/graficas/ResumenGraficas";
import GraficaIngresosGastos from "../components/graficas/GraficaIngresoGasto";
import GraficaCategorias from "../components/graficas/GraficaCategorias";
import GraficaBalance from "../components/graficas/GraficaBalance";
import GraficaMetas from "../components/graficas/GraficaMetas";

import "../styles/graficas/graficas.css";

function Graficas() {
  
  const [dashboard, setDashboard] = useState(null);
  const [periodo, setPeriodo] = useState("mes");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  // CARGAR DASHBOARD
  const cargarDashboard = async () => {
    try {
      setCargando(true);
      setError("");
      const respuesta = await obtenerDashboard(periodo);
      console.log("DATOS GRÁFICAS:", respuesta);
      console.log("PERIODO:", respuesta.periodo);
      console.log("FECHA FIN:", respuesta.periodo?.fin);
      setDashboard(respuesta);

    } catch (error) {
      console.error("ERROR CARGANDO GRÁFICAS:", error);
      setError("No se pudieron cargar los datos para las gráficas.");
    } finally {
      setCargando(false);
    }
  };

  // CARGAR AL ENTRAR Y CAMBIAR PERÍODO
  useEffect(() => {
    cargarDashboard();
  }, [periodo]);

  // TÍTULO DEL PERÍODO
  const obtenerNombrePeriodo = () => {
    switch (periodo) {
      case "comparacion":
        return "Mes actual vs mes anterior";
      case "anual":
        return "Resumen del año actual";
      case "mes":
      default:
        return "Resumen del mes actual";
    }
  };

  // CARGANDO
  if (cargando && !dashboard) {
    return (
      <div className="estado-graficas">
        <div className="spinner-graficas">
          <RefreshCw size={25} />
        </div>
        <h3>Cargando gráficas...</h3>
        <p>Estamos preparando la información de tus finanzas.</p>
      </div>
    );
  }

  // ERROR
  if (error && !dashboard) {
    return (
      <div className="estado-graficas estado-error-graficas">
        <div className="icono-error-graficas">
          <BarChart3 size={28} />
        </div>
        <h3>No se pudieron cargar las gráficas</h3>
        <p>{error}</p>
        <button className="btn-actualizar-graficas" onClick={cargarDashboard}>
          <RefreshCw size={17} />
          Intentar nuevamente
        </button>
      </div>
    );
  }

  if (!dashboard) {
    return null;
  }

  const formatearFecha = (fecha) => {
    if (!fecha) return "";
    const [anio, mes, dia] = fecha.split("-");
    const fechaLocal = new Date(Number(anio), Number(mes) - 1, Number(dia));
    return fechaLocal.toLocaleDateString("es-CO", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="graficas">
      {/* ENCABEZADO */}
      <header className="encabezado-graficas">
        <div className="titulo-graficas">
          <div className="icono-titulo-graficas">
            <BarChart3 size={25} />
          </div>
          <div>
            <h1>Gráficas</h1>
            <p>Analiza visualmente el comportamiento de tus finanzas.</p>
          </div>
        </div>
        {/* Acciones graficas */}
        <div className="acciones-graficas">
          <select
            className="filtro-periodo-graficas"
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value)}
          >
            <option value="mes">Mes actual</option>
            <option value="comparacion">Mes vs mes anterior</option>
            <option value="anual">Anual</option>
          </select>
        </div>
      </header>

      {/* INFORMACIÓN DEL PERÍODO */}
      <div className="periodo-graficas">
        <div>
          <span>Período analizado</span>
          <strong>{obtenerNombrePeriodo()}</strong>
        </div>
        <div className="periodo-fechas">
          {dashboard.periodo?.inicio && (
            <>
              {formatearFecha(dashboard.periodo.inicio)}
              {" — "}
              {formatearFecha(dashboard.periodo.fin)}
            </>
          )}
        </div>
      </div>

      {/* RESUMEN + VARIACIÓN */}
      <div className="grid-resumen-variacion">
        {/* RESUMEN */}
        <ResumenGraficas dashboard={dashboard} />
        {/* VARIACIÓN FINANCIERA */}
        <div className="tarjeta-grafica tarjeta-comparacion">
          <div className="cabecera-grafica">
            <div>
              <h2>Variación financiera</h2>
              <p>Cambios respecto al período anterior</p>
            </div>
          </div>
          <div className="lista-variaciones">
            {/* Variación Ingresos */}
            <Variacion
              titulo="Ingresos"
              dato={dashboard.comparacion?.ingresos}
              moneda={dashboard.moneda}
            />
            {/* Variación Gastos */}
            <Variacion
              titulo="Gastos"
              dato={dashboard.comparacion?.gastos}
              moneda={dashboard.moneda}
            />
            {/* Variación Ahorro */}
            <Variacion
              titulo="Ahorros"
              dato={dashboard.comparacion?.ahorros}
              moneda={dashboard.moneda}
            />
            {/* Variación Saldo */}
            <Variacion
              titulo="Saldo"
              dato={dashboard.comparacion?.saldo}
              moneda={dashboard.moneda}
            />
          </div>
        </div>
      </div>

      {/* GRÁFICAS PRINCIPALES */}
      <div className="grid-graficas-principales">
        <GraficaIngresosGastos dashboard={dashboard} periodo={periodo} />
        <GraficaCategorias dashboard={dashboard} periodo={periodo} />
      </div>
      {/* BALANCE */}
      <GraficaBalance dashboard={dashboard} periodo={periodo} />
      {/* Interior */}
      <div className="grid-graficas-inferiores">
        <GraficaMetas dashboard={dashboard} />
      </div>
    </div>
  );
}

// ==================================================
// COMPONENTE PEQUEÑO DE VARIACIÓN
// ==================================================
function Variacion({ titulo, dato }) {
  if (!dato) {
    return (
      <div className="item-variacion">
        <span>{titulo}</span>
        <strong>Sin datos</strong>
      </div>
    );
  }
  const tendencia = dato.tendencia;
  const clase =
    tendencia === "AUMENTO"
      ? "variacion-aumento"
      : tendencia === "DISMINUCION"
        ? "variacion-disminucion"
        : "variacion-igual";
  const signo =
    tendencia === "AUMENTO" ? "+" : tendencia === "DISMINUCION" ? "-" : "";
  return (
    <div className="item-variacion">
      <div>
        <span>{titulo}</span>
        <small>{dato.mensaje}</small>
      </div>
      <strong className={clase}>
        {dato.porcentaje === null ? "Nuevo" : `${signo}${dato.porcentaje}%`}
      </strong>
    </div>
  );
}
export default Graficas;
