import { useEffect, useState } from "react";

import { obtenerMovimientos } from "../services/movimientoServices";

import ResumenMovimientos from "../components/movimientos/ResumenMovimiento";
import FiltrosMovimientos from "../components/movimientos/FiltrosMovimiento";
import ListaMovimientos from "../components/movimientos/ListaMovimientos";
import ModalMovimiento from "../components/modales/ModalMovimiento";

import "../styles/movimientos/movimientos.css";
import { Plus } from "lucide-react";

function Movimientos() {

  const [movimientos, setMovimientos] = useState([]);
  const [cargando, setCargando] = useState(true);
  // Buscador y filtro
  const [busqueda, setBusqueda] = useState("");
  const [tipo, setTipo] = useState("TODOS");
  const [periodo, setPeriodo] = useState("TODOS");
  // Modal de nuevo movimiento
  const [modalAbierto, setModalAbierto] = useState(false);

  // CARGAR MOVIMIENTOS
  useEffect(() => {
    cargarMovimientos();
  }, []);

  const cargarMovimientos = async () => {
    try {
      setCargando(true);
      const data = await obtenerMovimientos();
      setMovimientos(data);
    } catch (error) {
      console.error("Error al obtener movimientos:", error);
    } finally {
      setCargando(false);
    }
  };

  const obtenerFechaInicio = () => {
    const hoy = new Date();
    const fecha = new Date(hoy);

    if (periodo === "7") {
      fecha.setDate(hoy.getDate() - 7);
    }

    if (periodo === "15") {
      fecha.setDate(hoy.getDate() - 15);
    }

    if (periodo === "MES") {
      fecha.setDate(1);
    }

    return fecha;
  };
  // FILTRAR MOVIMIENTOS
  const movimientosFiltrados = movimientos
  .filter((movimiento) => {
    // BUSCADOR
    const texto = busqueda.toLowerCase();

    const coincideBusqueda =
      movimiento.descripcion?.toLowerCase().includes(texto) ||
      movimiento.categoria_detalle?.nombre?.toLowerCase().includes(texto) ||
      movimiento.meta_detalle?.nombre?.toLowerCase().includes(texto);

    // FILTRO DE TIPO
    const coincideTipo =
      tipo === "TODOS" || movimiento.tipo === tipo;

    // FILTRO DE PERÍODO
    let coincidePeriodo = true;

    if (periodo !== "TODOS") {
      const fechaMovimiento = new Date(
        `${movimiento.fecha}T00:00:00`
      );

      const fechaInicio = obtenerFechaInicio();

      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);

      coincidePeriodo =
        fechaMovimiento >= fechaInicio &&
        fechaMovimiento <= hoy;
    }

    return coincideBusqueda && coincideTipo && coincidePeriodo;
  })
  .sort((a, b) => {
    return new Date(`${b.fecha}T00:00:00`) -
           new Date(`${a.fecha}T00:00:00`);
  });

  return (
    <>
      {/* HEADER */}
      <header className="movimientos">
        <div>
          <h1>Movimientos</h1>
          <p>Consulta y administra tus ingresos, gastos y ahorros.</p>
        </div>
        <button
          className="boton-nuevo"
          onClick={() => setModalAbierto(true)}
        >
          <Plus size={20} />
          Nuevo movimiento
        </button>
      </header>
      {/* RESUMEN */}
      <ResumenMovimientos movimientos={movimientos} />
      {/* FILTROS */}
      <FiltrosMovimientos
        busqueda={busqueda}
        setBusqueda={setBusqueda}
        tipo={tipo}
        setTipo={setTipo}
        periodo={periodo}
        setPeriodo={setPeriodo}
      />
      {/* LISTA */}
      <ListaMovimientos
        movimientos={movimientosFiltrados}
        cargando={cargando}
      />
      {modalAbierto && (
        <ModalMovimiento
          onCerrar={() => setModalAbierto(false)}
          onGuardado={async () => {
            await cargarMovimientos();
          }}
        />
      )}

    </>
  );

}

export default Movimientos;
