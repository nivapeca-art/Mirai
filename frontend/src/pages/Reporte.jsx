import { useState } from "react";

import {
  FileText,
  CalendarDays,
  FileDown,
  CheckCircle,
  AlertCircle,
  Clock3,
} from "lucide-react";

import { generarReporte } from "../services/reporteServices";

import "../styles/reportes/reportes.css";

function ReportePDF() {
  const [periodo, setPeriodo] = useState("mensual");
  const [mes, setMes] = useState(() => {
    const hoy = new Date();
    const año = hoy.getFullYear();
    const mesActual = String(hoy.getMonth() + 1).padStart(2, "0");
    return `${año}-${mesActual}`;
  });
  const [generando, setGenerando] = useState(false);
  const [mensaje, setMensaje] = useState(null);

  // Generar los últimos 24 meses
  const generarMeses = () => {
    const meses = [];
    const hoy = new Date();
    const añoActual = hoy.getFullYear();
    const mesActual = hoy.getMonth();
    for (let i = 0; i <= mesActual; i++) {
      const fecha = new Date(añoActual, i, 1);
      const numeroMes = String(fecha.getMonth() + 1).padStart(2, "0");
      const nombreMes = fecha.toLocaleDateString("es-CO", {
        month: "long",
      });
      meses.push({
        valor: `${añoActual}-${numeroMes}`,
        nombre:
          nombreMes.charAt(0).toUpperCase() +
          nombreMes.slice(1) +
          ` ${añoActual}`,
      });
    }
    return meses;
  };

  const mesesDisponibles = generarMeses();

  const periodos = [
    {
      valor: "15_dias",
      titulo: "Últimos 15 días",
      descripcion:
        "Resumen de tus movimientos financieros de los últimos 15 días.",
      icono: Clock3,
    },
    {
      valor: "mensual",
      titulo: "Mensual",
      descripcion:
        "Consulta el comportamiento financiero de un mes específico.",
      icono: CalendarDays,
    },
    {
      valor: "6_meses",
      titulo: "Últimos 6 meses",
      descripcion:
        "Análisis general de tus ingresos, gastos y ahorro de los últimos 6 meses.",
      icono: CalendarDays,
    },
    {
      valor: "anual",
      titulo: "Anual",
      descripcion: "Resumen financiero completo del año actual.",
      icono: FileText,
    },
  ];

  const manejarGenerarReporte = async () => {
    try {
      setGenerando(true);
      setMensaje(null);
      const blob = await generarReporte(
        periodo,
        periodo === "mensual" ? mes : null,
      );
      const url = window.URL.createObjectURL(blob);
      const enlace = document.createElement("a");
      enlace.href = url;
      enlace.download = `reporte_${
        periodo === "mensual" ? mes.replace("-", "_") : periodo
      }.pdf`;
      document.body.appendChild(enlace);
      enlace.click();
      enlace.remove();
      window.URL.revokeObjectURL(url);
      setMensaje({
        tipo: "exito",
        texto: "El reporte se generó correctamente.",
      });

    } catch (error) {
      console.error("Error generando reporte:", error);
      setMensaje({
        tipo: "error",
        texto: "No fue posible generar el reporte. Inténtalo nuevamente.",
      });

    } finally {
      setGenerando(false);
    }
  };

  const periodoSeleccionado = periodos.find((item) => item.valor === periodo);

  return (
    <div className="reportes">
      {/* ENCABEZADO */}
      <div className="encabezado-reportes">
        <div className="titulo-reportes">
          <div className="icono-titulo-reportes">
            <FileText size={24} />
          </div>
          <div>
            <h1>Reportes</h1>
            <p>Genera informes sobre el comportamiento de tus finanzas.</p>
          </div>
        </div>
      </div>

      {/* CONTENEDOR PRINCIPAL */}
      <div className="contenedor-generar-reporte">
        {/* CABECERA */}
        <div className="cabecera-reporte">
          <div className="icono-generar-reporte">
            <FileDown size={22} />
          </div>
          <div>
            <h2>Generar informe financiero</h2>
            <p>Selecciona el período que deseas consultar.</p>
          </div>
        </div>
        {/* PERIODOS */}
        <div className="seccion-periodos">
          <div className="titulo-seccion-reporte">
            <span>Selecciona un período</span>
            <small>
              Puedes generar un reporte según el período que necesites.
            </small>
          </div>
          <div className="grid-periodos">
            {periodos.map((item) => {
              const Icono = item.icono;
              const seleccionado = periodo === item.valor;
              return (
                <button
                  key={item.valor}
                  type="button"
                  className={`tarjeta-periodo ${
                    seleccionado ? "tarjeta-periodo-seleccionada" : ""
                  }`}
                  onClick={() => {
                    setPeriodo(item.valor);
                    setMensaje(null);
                  }}
                >
                  <div className="icono-periodo">
                    <Icono size={21} />
                  </div>
                  <div className="contenido-periodo">
                    <h3>{item.titulo}</h3>
                    <p>{item.descripcion}</p>
                  </div>
                  <div
                    className={`indicador-periodo ${
                      seleccionado ? "indicador-seleccionado" : ""
                    }`}
                  >
                    {seleccionado && <span></span>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* SELECTOR DE MES */}
        {periodo === "mensual" && (
          <div className="selector-mes-reporte">
            <div className="titulo-selector-mes">
              <CalendarDays size={20} />
              <div>
                <span>Selecciona el mes</span>
              </div>
            </div>
            <select
              value={mes}
              onChange={(e) => {
                setMes(e.target.value);
                setMensaje(null);
              }}
              className="select-mes-reporte"
            >
              {mesesDisponibles.map((item) => (
                <option key={item.valor} value={item.valor}>
                  {item.nombre}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* RESUMEN */}
        <div className="resumen-reporte">
          <div className="resumen-reporte-icono">
            <FileText size={19} />
          </div>
          <div className="resumen-reporte-info">
            <span>Reporte seleccionado</span>
            <strong>
              {periodo === "mensual"
                ? mesesDisponibles.find((item) => item.valor === mes)?.nombre ||
                  "Mensual"
                : periodoSeleccionado?.titulo}
            </strong>
          </div>
          <div className="resumen-reporte-formato">
            <span>Formato</span>
            <strong>PDF</strong>
          </div>
        </div>

        {/* MENSAJE */}
        {mensaje && (
          <div
            className={`mensaje-reporte ${
              mensaje.tipo === "exito" ? "mensaje-exito" : "mensaje-error"
            }`}
          >
            {mensaje.tipo === "exito" ? (
              <CheckCircle size={18} />
            ) : (
              <AlertCircle size={18} />
            )}
            <span>{mensaje.texto}</span>
          </div>
        )}

        {/* BOTÓN */}
        <div className="acciones-reporte">
          <button
            type="button"
            className="btn-generar-pdf"
            onClick={manejarGenerarReporte}
            disabled={generando}
          >
            {generando ? (
              <>
                <span className="spinner-reporte"></span>
                Generando...
              </>
            ) : (
              <>
                <FileDown size={18} />
                Generar PDF
              </>
            )}
          </button>
        </div>
      </div>

      {/* INFORMACIÓN */}
      <div className="informacion-reporte">
        <div className="info-reporte-icono">
          <FileText size={19} />
        </div>
        <div>
          <h3>Sobre los reportes</h3>
          <p>
            El informe incluye información sobre tus ingresos, gastos, ahorro,
            saldo, distribución de gastos, metas y obligaciones según el período
            seleccionado.
          </p>
        </div>
      </div>
    </div>
  );
}

export default ReportePDF;
