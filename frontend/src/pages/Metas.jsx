import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

import {
  Calendar,
  Goal,
  Plus,
  Target,
  Pencil,
  Trash2,
} from "lucide-react";

import {
  eliminarMeta,
  obtenerMetas,
} from "../services/metaServices";

import ModalMeta from "../components/modales/ModalMeta";
import ModalAbono from "../components/modales/ModalAbono";
import ModalHistorialMeta from "../components/modales/ModalHistorialMeta";
import ModalProyeccion from "../components/modales/ModalProyeccion";

import { obtenerMonedaUsuario,formatearMonto } from "../utils/moneda";

import "../styles/metas/metas.css";

function Metas() {
  const localizar = useLocation();

  const [metas, setMetas] = useState([]);
  const [cargando, setCargando] = useState(true);
  // Moneda del usuario
  const moneda = obtenerMonedaUsuario();

  // Modal para crear o editar meta
  // null = cerrado
  // {} = crear
  // meta = editar
  const [metaEditar, setMetaEditar] = useState(null);

  // Modal para abono
  const [metaAbono, setMetaAbono] = useState(null);

  // Modal para ver historial
  const [metaHistorial, setMetaHistorial] = useState(null);

  // Modal para proyección
  const [metaProyeccion, setMetaProyeccion] = useState(null);

  // Abrir modal de creación desde el dashboard
  useEffect(() => {
    if (localizar.state?.abrirModal) {
      setMetaEditar({});
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

      // Ordenar primero las que están en proceso
      // y después las completadas/canceladas
      const metasOrdenadas = [...data].sort((a, b) => {
        if (
          a.estado === "EN_PROCESO" &&
          b.estado !== "EN_PROCESO"
        ) {
          return -1;
        }

        if (
          a.estado !== "EN_PROCESO" &&
          b.estado === "EN_PROCESO"
        ) {
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

  // ELIMINAR META
  const handleEliminarMeta = async (meta) => {
    const confirmar = window.confirm(
      `¿Estás seguro de que quieres eliminar la meta "${meta.nombre}"?`,
    );

    if (!confirmar) {
      return;
    }

    try {
      await eliminarMeta(meta.id);
      await cargarMetas();
    } catch (error) {
      console.error("Error al eliminar meta:", error);
      alert("No se pudo eliminar la meta.");
    }
  };

  // EDITAR META
  const editarMeta = (meta) => {
    setMetaEditar(meta);
  };

  // CALCULAR PROGRESO
  const obtenerProgreso = (meta) => {
    if (Number(meta.monto_objetivo) <= 0) {
      return 0;
    }

    return Math.min(
      100,
      (Number(meta.monto_actual) /
        Number(meta.monto_objetivo)) *
        100,
    );
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
    <div className="pagina-metas">
      {/* HEADER */}
      <header className="metas-header">
        <div className="titulo-metas">
          <div className="icono-titulo-metas">
            <Target size={25} />
          </div>

          <div>
            <h1>Metas</h1>
            <p>
              Define tus objetivos y haz seguimiento a tu
              progreso.
            </p>
          </div>
        </div>

        {metas.length > 0 && (
          <div className="acciones">
            <button
              className="boton-nuevo"
              onClick={() => setMetaEditar({})}
            >
              <Plus size={20} />
              Nueva meta
            </button>
          </div>
        )}
      </header>

      {/* CONTENIDO */}
      <section className="metas-contenido">
        {cargando ? (
          <div className="metas-estado">
            Cargando metas...
          </div>
        ) : metas.length === 0 ? (
          /* SIN METAS */
          <div className="metas-vacio">
            <div className="metas-vacio-icono">
              <Goal size={30} />
            </div>

            <h2>No tienes metas todavía</h2>

            <p>
              Crea una meta para comenzar a organizar tus
              objetivos y hacer seguimiento a tus ahorros.
            </p>

            <button
              className="metas-vacio-boton"
              onClick={() => setMetaEditar({})}
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

                    {/* ACCIONES DE LA META */}
                    <div className="meta-acciones-importantes">
                      <button
                        type="button"
                        className="meta-editar"
                        onClick={() => editarMeta(meta)}
                        title="Editar meta"
                        aria-label={`Editar meta ${meta.nombre}`}
                      >
                        <Pencil size={15} />
                      </button>

                      <button
                        type="button"
                        className="meta-eliminar"
                        onClick={() =>
                          handleEliminarMeta(meta)
                        }
                        title="Eliminar meta"
                        aria-label={`Eliminar meta ${meta.nombre}`}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  {/* DESCRIPCIÓN */}
                  {meta.descripcion && (
                    <p className="meta-descripcion">
                      {meta.descripcion}
                    </p>
                  )}

                  {/* MONTOS */}
                  <div className="meta-montos">
                    <div>
                      <span>Ahorrado</span>

                      <strong>
                        {formatearMonto(meta.monto_actual,moneda.codigo)}
                      </strong>
                    </div>

                    <div>
                      <span>Objetivo</span>

                      <strong>
                        {formatearMonto(meta.monto_objetivo,moneda.codigo)}
                      </strong>
                    </div>
                  </div>

                  {/* PROGRESO */}
                  <div className="meta-progreso">
                    <div className="meta-progreso-info">
                      <span>Progreso</span>

                      <strong>
                        {progreso.toFixed(0)}%
                      </strong>
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
                      <Calendar size={16} />

                      Fecha límite:{" "}
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
                        onClick={() =>
                          setMetaAbono(meta)
                        }
                      >
                        + Hacer abono
                      </button>
                    )}

                    <button
                      className="meta-detalle"
                      onClick={() =>
                        setMetaHistorial(meta)
                      }
                    >
                      Ver más
                    </button>

                    <button
                      className="meta-proyeccion"
                      onClick={() =>
                        setMetaProyeccion(meta)
                      }
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

      {/* MODAL CREAR / EDITAR META */}
      {metaEditar !== null && (
        <ModalMeta
          meta={
            Object.keys(metaEditar).length === 0
              ? null
              : metaEditar
          }
          onCerrar={() => setMetaEditar(null)}
          onGuardado={cargarMetas}
        />
      )}

      {/* MODAL ABONO */}
      {metaAbono && (
        <ModalAbono
          meta={metaAbono}
          onCerrar={() => setMetaAbono(null)}
          onGuardado={cargarMetas}
        />
      )}

      {/* MODAL HISTORIAL */}
      {metaHistorial && (
        <ModalHistorialMeta
          meta={metaHistorial}
          onCerrar={() => setMetaHistorial(null)}
          onGuardado={cargarMetas}
        />
      )}

      {/* MODAL PROYECCIÓN */}
      {metaProyeccion && (
        <ModalProyeccion
          meta={metaProyeccion}
          onCerrar={() => setMetaProyeccion(null)}
        />
      )}
    </div>
  );
}

export default Metas;