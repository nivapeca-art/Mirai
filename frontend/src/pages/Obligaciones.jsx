import { useEffect, useState } from "react";
import { CalendarPlus, Plus} from "lucide-react";

import ResumenObligaciones from "../components/obligaciones/ResumenObligaciones";
import TarjetaObligacion from "../components/obligaciones/TarjetaObligacion";
import ModalObligacion from "../components/modales/ModalObligacion";

import { obtenerObligaciones, actualizarObligacion } from "../services/obligacionServices";
import { obtenerCategorias } from "../services/categoriaServices";

import "../styles/obligaciones/obligaciones.css";

function Obligaciones() {

  const [obligaciones, setObligaciones] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [mostrarModal, setMostrarModal] = useState(false);
  const [obligacionEditar, setObligacionEditar] = useState(null);
  // Filtro seleccionado
  const [filtro, setFiltro] = useState("total");

  // CARGAR OBLIGACIONES Y CATEGORÍAS
  const cargarObligaciones = async () => {
    try {
      setCargando(true);
      setError("");

      const [obligacionesData, categoriasData] = await Promise.all([
        obtenerObligaciones(),
        obtenerCategorias(),
      ]);

      setObligaciones(obligacionesData);
      setCategorias(categoriasData);
    } catch (error) {
      console.error("Error cargando obligaciones:", error);

      setError("No se pudieron cargar las obligaciones.");
    } finally {
      setCargando(false);
    }
  };

  // CARGAR OBLIGACIONES
  useEffect(() => {
    cargarObligaciones();
  }, []);

  // MARCAR COMO REALIZADA
  const marcarRealizada = async (id) => {
    try {
      await actualizarObligacion(id, {
        cumplida: true,
      });
      await cargarObligaciones();

    } catch (error) {
      console.error("Error marcando obligación:", error);
      setError("No se pudo marcar la obligación como realizada.");
    }
  };

  // ACTIVAR / DESACTIVAR
  const cambiarEstado = async (obligacion) => {
    try {
      await actualizarObligacion(obligacion.id, {
        activa: !obligacion.activa,
      });
      await cargarObligaciones();

    } catch (error) {
      console.error("Error cambiando estado:", error);
      setError("No se pudo cambiar el estado de la obligación.");
    }
  };

  // RESUMEN
  const obligacionesActivas = obligaciones.filter(
    (obligacion) => obligacion.activa,
  );

  const obligacionesPendientes = obligaciones.filter(
    (obligacion) => obligacion.activa && !obligacion.cumplida,
  );

  const obligacionesRealizadas = obligaciones.filter(
    (obligacion) => obligacion.activa && obligacion.cumplida,
  );

  // FILTRAR OBLIGACIONES
  const obligacionesFiltradas = obligaciones.filter((obligacion) => {
    switch (filtro) {
      case "pendientes":
        return obligacion.activa && !obligacion.cumplida;
      case "realizadas":
        return obligacion.activa && obligacion.cumplida;
      case "activas":
        return obligacion.activa;
      case "total":
      default:
        return true;
    }
  });

  // CAMBIAR FILTRO
  const cambiarFiltro = (nuevoFiltro) => {
    setFiltro(nuevoFiltro);
  };

  // TÍTULO DEL FILTRO
  const obtenerTituloFiltro = () => {
    switch (filtro) {
      case "pendientes":
        return "Obligaciones pendientes";
      case "realizadas":
        return "Obligaciones realizadas";
      case "activas":
        return "Obligaciones activas";
      case "total":
      default:
        return "Mis obligaciones";
    }
  };

  // EDITAR
  const editarObligacion = (obligacion) => {
    setObligacionEditar(obligacion);
    setMostrarModal(true);
  };

  return (
    <div className="pagina-obligaciones">
      {/* ==================================================
          ENCABEZADO
          ================================================== */}

      <div className="encabezado-pagina">
        <div className="titulo-obligacion">
          <div className="icono-titulo-obligacion">
            <CalendarPlus size={20}/>
          </div>
          <div>
            <h1>Obligaciones</h1>
            <p>Lleva el control de tus pagos y compromisos.</p>
          </div>
        </div>
        {obligaciones.length > 0 &&(
          <div className="acciones-encabezado">
            <button
              className="boton-nuevo"
              onClick={() => {setMostrarModal(true); setObligacionEditar(null);}}
            >
              <Plus size={20} />
              Nueva obligación
            </button>
          </div>
        )}
        </div>

      {/* ==================================================
          ERROR
          ================================================== */}

      {error && <div className="mensaje-error">{error}</div>}

      {/* ==================================================
          RESUMEN
          ================================================== */}

      <ResumenObligaciones
        total={obligaciones.length}
        activas={obligacionesActivas.length}
        pendientes={obligacionesPendientes.length}
        realizadas={obligacionesRealizadas.length}
        filtro={filtro}
        onFiltro={cambiarFiltro}
      />

      {/* ==================================================
          CONTENIDO
          ================================================== */}

      <div className="contenido-obligaciones">
        {/* TÍTULO */}

        <div className="titulo-seccion">
          <h2>{obtenerTituloFiltro()}</h2>

          <span>
            {obligacionesFiltradas.length}{" "}
            {obligacionesFiltradas.length === 1 ? "obligación" : "obligaciones"}
          </span>
        </div>

        {/* ==================================================
            CARGANDO
            ================================================== */}

        {cargando ? (
          <div className="estado-obligaciones">
            <p>Cargando obligaciones...</p>
          </div>
        ) : obligacionesFiltradas.length === 0 ? (
          /* ==================================================
             SIN RESULTADOS
             ================================================== */

          <div className="estado-obligaciones">
            <h3>
              {filtro === "total"
                ? "No tienes obligaciones"
                : "No hay obligaciones en este filtro"}
            </h3>

            <p>
              {filtro === "total"
                ? "Crea tu primera obligación para comenzar a llevar el control de tus pagos."
                : "No hay obligaciones que coincidan con el filtro seleccionado."}
            </p>

            {filtro === "total" && (
              <button
                className="boton-nuevo"
                onClick={() => setMostrarModal(true)}
              >
                <Plus size={20} />
                Crear obligación
              </button>
            )}
          </div>
        ) : (
          /* ==================================================
             LISTA
             ================================================== */

          <div className="lista-obligaciones">
            {obligacionesFiltradas.map((obligacion) => {
              const categoriaObligacion = categorias.find(
                (categoria) => categoria.id === obligacion.categoria,
              );

              return (
                <TarjetaObligacion
                  key={obligacion.id}
                  obligacion={obligacion}
                  categoria={categoriaObligacion}
                  onRealizada={marcarRealizada}
                  onCambiarEstado={cambiarEstado}
                  onEditar={editarObligacion}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* ==================================================
          MODAL
          ================================================== */}

      {mostrarModal && (
        <ModalObligacion
          obligacion={obligacionEditar}
          onCerrar={() => {setMostrarModal(false); setObligacionEditar(null);}}
          onGuardado={async () => {
            await cargarObligaciones();
          }}
        />
      )}
    </div>
  );
}

export default Obligaciones;
