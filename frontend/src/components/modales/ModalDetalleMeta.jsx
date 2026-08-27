import { useState } from "react";

import ModalBase from "./ModalBase";

import { actualizarMeta } from "../../services/metaServices";
 

function ModalDetalleMeta({ meta, onCerrar, onActualizado }) {
  const [editando, setEditando] = useState(false);

  const [nombre, setNombre] = useState(meta.nombre);
  const [descripcion, setDescripcion] = useState(meta.descripcion || "");
  const [montoObjetivo, setMontoObjetivo] = useState(
    Number(meta.monto_objetivo).toLocaleString("es-CO"),
  );
  const [fechaLimite, setFechaLimite] = useState(meta.fecha_limite || "");

  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const formatearMonto = (valor) => {
    const numero = valor.replace(/\D/g, "");

    if (!numero) {
      return "";
    }

    return Number(numero).toLocaleString("es-CO");
  };

  const guardarCambios = async (e) => {
    e.preventDefault();

    setError("");

    if (!nombre.trim()) {
      setError("Debes ingresar un nombre.");
      return;
    }

    const monto = Number(montoObjetivo.replace(/\./g, ""));

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

        setError(primerError || "No se pudo actualizar la meta.");
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
          <p>{meta.descripcion || "Sin descripción."}</p>

          <div>
            <strong>Progreso</strong>

            <div className="meta-barra">
              <div
                className="meta-barra-progreso"
                style={{
                  width: `${Math.min(meta.progreso, 100)}%`,
                }}
              />
            </div>

            <span>{meta.progreso}%</span>
          </div>

          <p>
            <strong>Ahorrado:</strong> $
            {Number(meta.monto_actual).toLocaleString("es-CO")}
          </p>

          <p>
            <strong>Objetivo:</strong> $
            {Number(meta.monto_objetivo).toLocaleString("es-CO")}
          </p>

          <p>
            <strong>Fecha de inicio:</strong> {meta.fecha_inicio}
          </p>

          <p>
            <strong>Fecha límite:</strong> {meta.fecha_limite || "Sin fecha"}
          </p>

          <p>
            <strong>Estado:</strong> {meta.estado}
          </p>

          <div className="modal-acciones">
            <button
              type="button"
              className="btn-guardar"
              onClick={() => setEditando(true)}
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
              onChange={(e) => setNombre(e.target.value)}
            />
          </div>

          <div className="campo-modal">
            <label>Descripción</label>

            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              rows={3}
            />
          </div>

          <div className="campo-modal">
            <label>Monto objetivo</label>

            <input
              type="text"
              inputMode="numeric"
              value={montoObjetivo}
              onChange={(e) => setMontoObjetivo(formatearMonto(e.target.value))}
            />
          </div>

          <div className="campo-modal">
            <label>Fecha límite</label>

            <input
              type="date"
              value={fechaLimite}
              onChange={(e) => setFechaLimite(e.target.value)}
            />
          </div>

          {error && <p className="error">{error}</p>}

          <div className="modal-acciones">
            <button
              type="button"
              className="btn-cancelar"
              onClick={() => setEditando(false)}
              disabled={guardando}
            >
              Cancelar
            </button>

            <button type="submit" className="btn-guardar" disabled={guardando}>
              {guardando ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </form>
      )}
    </ModalBase>
  );
}

export default ModalDetalleMeta;
