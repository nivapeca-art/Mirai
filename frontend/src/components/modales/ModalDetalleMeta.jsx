import { useState } from "react";

import ModalBase from "./ModalBase";

import { actualizarMeta } from "../../services/metaServices";

import {
  formatearMonto,
  formatearMontoInput,
  convertirMontoParaAPI,
  obtenerMonedaUsuario,
} from "../../utils/moneda";

function ModalDetalleMeta({ meta, onCerrar, onActualizado }) {
  const [editando, setEditando] = useState(false);
  const [nombre, setNombre] = useState(meta.nombre);
  const [descripcion, setDescripcion] = useState(
    meta.descripcion || "",
  );
  const moneda = obtenerMonedaUsuario();
  const codigoMoneda = moneda?.codigo || "COP";
  const [montoObjetivo, setMontoObjetivo] = useState(
    formatearMontoInput(
      String(meta.monto_objetivo || ""),
      codigoMoneda,
    ),
  );

  const [fechaLimite, setFechaLimite] = useState(
    meta.fecha_limite || "",
  );

  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const guardarCambios = async (e) => {
    e.preventDefault();
    setError("");
    if (!nombre.trim()) {
      setError("Debes ingresar un nombre.");
      return;
    }
    const monto = convertirMontoParaAPI(
      montoObjetivo,
      codigoMoneda,
    );
    if (!monto || monto <= 0) {
      setError("El monto objetivo debe ser mayor a 0.");
      return;
    }
    if (!fechaLimite) {
      setError("Debes seleccionar una fecha límite.");
      return;
    }
    if (monto < Number(meta.monto_actual)) {
      setError(
        "El monto objetivo no puede ser menor al monto ahorrado actualmente.",
      );
      return;
    }

    try {
      setGuardando(true);
      await actualizarMeta(meta.id, {
        nombre: nombre.trim(),
        descripcion: descripcion.trim(),
        monto_objetivo: monto,
        fecha_limite: fechaLimite,
      });
      await onActualizado();
      onCerrar();

    } catch (error) {
      console.error("Error actualizando meta:", error);
      const respuesta = error.response?.data;
      if (respuesta) {
        const primerError = Object.values(respuesta).flat()[0];
        setError(
          primerError || "No se pudo actualizar la meta.",
        );
      } else {
        setError("No se pudo actualizar la meta.");
      }

    } finally {
      setGuardando(false);
    }
  };

  return (
    <ModalBase
      titulo={editando ? "Editar meta" : meta.nombre}
      onCerrar={onCerrar}
    >
      {!editando ? (
        <div className="meta-detalle">
          <p>
            {meta.descripcion || "Sin descripción."}
          </p>

          <div>
            <strong>Progreso</strong>

            <div className="meta-barra">
              <div
                className="meta-barra-progreso"
                style={{
                  width: `${Math.min(
                    meta.progreso,
                    100,
                  )}%`,
                }}
              />
            </div>

            <span>{meta.progreso}%</span>
          </div>

          <p>
            <strong>Ahorrado:</strong>{" "}
            {formatearMonto(
              meta.monto_actual,
              codigoMoneda,
            )}
          </p>

          <p>
            <strong>Objetivo:</strong>{" "}
            {formatearMonto(
              meta.monto_objetivo,
              codigoMoneda,
            )}
          </p>

          <p>
            <strong>Fecha de inicio:</strong>{" "}
            {new Date(
              `${meta.fecha_inicio}T00:00:00`,
            ).toLocaleDateString("es-CO", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>

          <p>
            <strong>Fecha límite:</strong>{" "}
            {new Date(
              `${meta.fecha_limite}T00:00:00`,
            ).toLocaleDateString("es-CO", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>

          <p>
            <strong>Estado:</strong> {meta.estado}
          </p>

          <div className="modal-acciones">
            <button
              type="button"
              className="btn-guardar"
              onClick={() => {
                setError("");
                setEditando(true);
              }}
            >
              Editar
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={guardarCambios}>
          <div className="campo-modal">
            <label>Nombre</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) =>
                setNombre(e.target.value)
              }
            />
          </div>
          <div className="campo-modal">
            <label>Descripción</label>
            <textarea
              value={descripcion}
              onChange={(e) =>
                setDescripcion(e.target.value)
              }
              rows={3}
            />
          </div>
          <div className="campo-modal">
            <label>Monto objetivo</label>
            <input
              type="text"
              inputMode="decimal"
              value={montoObjetivo}
              onChange={(e) =>
                setMontoObjetivo(
                  formatearMontoInput(
                    e.target.value,
                    codigoMoneda,
                  ),
                )
              }
            />
          </div>
          <div className="campo-modal">
            <label>Fecha límite</label>
            <input
              type="date"
              value={fechaLimite}
              onChange={(e) =>
                setFechaLimite(e.target.value)
              }
            />
          </div>

          {error && (<p className="error">{error}</p>)}

          <div className="modal-acciones">
            <button
              type="button"
              className="btn-cancelar"
              onClick={() => {
                setError("");
                setEditando(false);
              }}
              disabled={guardando}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="btn-guardar"
              disabled={guardando}
            >
              {guardando
                ? "Guardando..."
                : "Guardar cambios"}
            </button>
          </div>
        </form>
      )}
    </ModalBase>
  );
}

export default ModalDetalleMeta;

