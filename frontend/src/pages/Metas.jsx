import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

import { Calendar, Goal, Plus } from "lucide-react";

import { obtenerMetas } from "../services/metaServices";

import ModalMeta from "../components/modales/ModalMeta";
import ModalAbono from "../components/modales/ModalAbono";
import ModalHistorialMeta from "../components/modales/ModalHistorialMeta";
import ModalProyeccion from "../components/modales/ModalProyeccion";

import "../styles/metas/metas.css";

function Metas() {

  const localizar = useLocation();
  const [metas, setMetas] = useState([]);
  const [cargando, setCargando] = useState(true);

  // Modal para crear meta
  const [modalCrear, setModalCrear] = useState(false);
  // Modal para abono
  const [metaAbono, setMetaAbono] = useState(null);
  // Modal para ver historial
  const [metaHistorial, setMetaHistorial] = useState(false);
  // Modal para proyección
  const [metaProyeccion, setMetaProyeccion] = useState(null);

  // Abrir el modal al hacer click desde metas en el dashboard
  useEffect(() => {
    if (localizar.state?.abrirModal) {
      setModalCrear(true);
    }
  }, [localizar.state]);

  // CARGAR METAS
  useEffect(() => {
    cargarMetas();
  }, []);

  const cargarMetas = async () => {
    try {
      setCargando(true);
      const data = await obtenerMetas();
      // Ordenar primero las que están en proceso y después las completadas
      const metasOrdenadas = [...data].sort((a, b) => {
        if (a.estado === "EN_PROCESO" && b.estado !== "EN_PROCESO") {
          return -1;
        }
        if (a.estado !== "EN_PROCESO" && b.estado === "EN_PROCESO") {
          return 1;
        }
        return a.nombre.localeCompare(b.nombre);
      });
      setMetas(metasOrdenadas);
      
    } catch (error) {
      console.error("Error al obtener metas:", error);

    } finally {
      setCargando(false);
    }
  };

  // CALCULAR PROGRESO
  const obtenerProgreso = (meta) => {
    if (meta.monto_objetivo <= 0) {
      return 0;
    }
    return Math.min(
      100,
      (Number(meta.monto_actual) / Number(meta.monto_objetivo)) * 100,
    );
  };

  // FORMATEAR DINERO
  const formatearMonto = (monto) => {
    return Number(monto).toLocaleString("es-CO");
  };

  // TEXTO DEL ESTADO
  const obtenerEstado = (estado) => {
    switch (estado) {
      case "COMPLETADO":
        return "Completada";

      case "CANCELADO":
        return "Cancelada";

      default:
        return "En proceso";
    }
  };

  return (
    <>
      {/* HEADER */}
      <header className="metas-header">
        <div>
          <h1>Metas</h1>

          <p>Define tus objetivos y haz seguimiento a tu progreso.</p>
        </div>
        {metas.length > 0 && (
          <button className="boton-nuevo" onClick={() => setModalCrear(true)}>
            <Plus size={20} />
            Nueva meta
          </button>
        )}
      </header>
      {/* CONTENIDO */}
      <section className="metas-contenido">
        {cargando ? (
          <div className="metas-estado">Cargando metas...</div>
        ) : metas.length === 0 ? (
          /* SIN METAS */
          <div className="metas-vacio">
            <div className="metas-vacio-icono">
              <Goal size={30} />
            </div>
            <h2>No tienes metas todavía</h2>
            <p>
              Crea una meta para comenzar a organizar tus objetivos y hacer
              seguimiento a tus ahorros.
            </p>
            <button
              className="metas-vacio-boton"
              onClick={() => setModalCrear(true)}
            >
              Crear mi primera meta
            </button>
          </div>
        ) : (
          /* LISTA DE METAS */
          <div className="metas-lista">
            {metas.map((meta) => {
              const progreso = obtenerProgreso(meta);

              return (
                <article
                  key={meta.id}
                  className={`meta-card ${meta.estado.toLowerCase()}`}
                >
                  {/* CABECERA */}
                  <div className="meta-card-header">
                    <div className="meta-card-titulo">
                      <h2>{meta.nombre}</h2>
                      <span className="meta-estado">
                        {obtenerEstado(meta.estado)}
                      </span>
                    </div>
                  </div>
                  {/* DESCRIPCIÓN */}
                  {meta.descripcion && (
                    <p className="meta-descripcion">{meta.descripcion}</p>
                  )}
                  {/* MONTOS */}
                  <div className="meta-montos">
                    <div>
                      <span>Ahorrado</span>
                      <strong>${formatearMonto(meta.monto_actual)}</strong>
                    </div>
                    <div>
                      <span>Objetivo</span>
                      <strong>${formatearMonto(meta.monto_objetivo)}</strong>
                    </div>
                  </div>
                  {/* PROGRESO */}
                  <div className="meta-progreso">
                    <div className="meta-progreso-info">
                      <span>Progreso</span>
                      <strong>{progreso.toFixed(0)}%</strong>
                    </div>
                    <div className="meta-progreso-barra">
                      <div
                        className="meta-progreso-valor"
                        style={{
                          width: `${progreso}%`,
                        }}
                      />
                    </div>
                  </div>
                  {/* FECHA */}
                  {meta.fecha_limite && (
                    <div className="meta-fecha">
                      <Calendar size={16} /> Fecha límite:{" "}
                      {new Date(
                        `${meta.fecha_limite}T00:00:00`,
                      ).toLocaleDateString("es-CO")}
                    </div>
                  )}
                  {/* ACCIONES */}
                  <div className="meta-acciones">
                    {meta.estado === "EN_PROCESO" && (
                      <button
                        className="meta-abono"
                        onClick={() => setMetaAbono(meta)}
                      >
                        + Hacer abono
                      </button>
                    )}
                    <button
                      className="meta-detalle"
                      onClick={() => setMetaHistorial(meta)}
                    >
                      Ver más
                    </button>
                    <button
                      className="meta-proyeccion"
                      onClick={() => setMetaProyeccion(meta)}
                    >
                      Proyección
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* MODAL CREAR META */}
      {modalCrear && (
        <ModalMeta
          onCerrar={() => setModalCrear(false)}
          onGuardado={async () => {
            await cargarMetas();
          }}
        />
      )}
      {/* MODAL ABONO */}
      {metaAbono && (
        <ModalAbono
          meta={metaAbono}
          onCerrar={() => setMetaAbono(null)}
          onGuardado={async () => {
            await cargarMetas();
          }}
        />
      )}
      {/* MODAL HISTORIAL */}
      {metaHistorial && (
        <ModalHistorialMeta
          meta={metaHistorial}
          onCerrar={() => setMetaHistorial(null)}
          onGuardado={async () => {
            await cargarMetas();
          }}
        />
      )}
      {/* MODAL PROYECCIÓN */}
      {metaProyeccion && (
        <ModalProyeccion
          meta={metaProyeccion}
          onCerrar={() => setMetaProyeccion(null)}
        />
      )}
    </>
  );
  
}

export default Metas;
