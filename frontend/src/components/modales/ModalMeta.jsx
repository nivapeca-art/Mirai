import { useState } from "react";

import ModalBase from "./ModalBase";

import { crearMeta, actualizarMeta } from "../../services/metaServices";

function ModalMeta({ meta = null, onCerrar, onGuardado }) {
  const esEdicion = Boolean(meta);

  const [nombre, setNombre] = useState(meta?.nombre || "");
  const [descripcion, setDescripcion] = useState(meta?.descripcion || "");

  const [monto, setMonto] = useState(
    meta?.monto_objetivo
      ? Number(meta.monto_objetivo).toLocaleString("es-CO")
      : "",
  );

  const [fecha, setFecha] = useState(meta?.fecha_limite || "");

  const [guardado, setGuardado] = useState(false);
  const [error, setError] = useState("");

  // FORMATEAR MONTO
  const formatearMonto = (valor) => {
    const numero = valor.replace(/\D/g, "");

    if (!numero) {
      return "";
    }

    return Number(numero).toLocaleString("es-CO");
  };

  // GUARDAR META
  const guardarMeta = async (e) => {
    e.preventDefault();

    setError("");

    // VALIDAR NOMBRE
    if (!nombre.trim()) {
      setError("Debes ingresar un nombre para la meta.");
      return;
    }

    // CONVERTIR MONTO
    const montoNumerico = Number(monto.replace(/\./g, ""));

    // VALIDAR MONTO
    if (!montoNumerico || montoNumerico <= 0) {
      setError("El monto debe ser mayor a 0.");
      return;
    }

    // VALIDAR FECHA
    if (!fecha) {
      setError("Debes seleccionar una fecha.");
      return;
    }

    // VALIDAR QUE NO BAJE DEL MONTO AHORRADO
    if (esEdicion && montoNumerico < Number(meta.monto_actual)) {
      setError(
        "El monto objetivo no puede ser menor al monto ahorrado actualmente.",
      );
      return;
    }

    try {
      setGuardado(true);

      const datosMeta = {
        nombre: nombre.trim(),
        descripcion: descripcion.trim(),
        monto_objetivo: montoNumerico,
        fecha_limite: fecha,
      };

      console.log(
        esEdicion ? "META A ACTUALIZAR:" : "META A CREAR:",
        datosMeta,
      );

      if (esEdicion) {
        await actualizarMeta(meta.id, datosMeta);
      } else {
        await crearMeta(datosMeta);
      }

      // AVISAR A LA PÁGINA
      if (onGuardado) {
        await onGuardado();
      }

      // CERRAR MODAL
      onCerrar();
    } catch (error) {
      console.error(
        esEdicion ? "ERROR ACTUALIZANDO META:" : "ERROR CREANDO META:",
        error,
      );

      console.error("RESPUESTA DEL SERVIDOR:", error.response?.data);

      const respuesta = error.response?.data;

      if (respuesta) {
        const primerError = Object.values(respuesta).flat()[0];

        setError(
          primerError ||
            (esEdicion
              ? "No se pudo actualizar la meta."
              : "No se pudo crear la meta."),
        );
      } else {
        setError(
          esEdicion
            ? "No se pudo actualizar la meta."
            : "No se pudo crear la meta.",
        );
      }
    } finally {
      setGuardado(false);
    }
  };

  return (
    <ModalBase
      titulo={esEdicion ? "Editar meta" : "Nueva meta"}
      onCerrar={onCerrar}
    >
      <form onSubmit={guardarMeta}>
        {/* NOMBRE */}
        <div className="campo-modal">
          <label>Nombre</label>

          <input
            type="text"
            placeholder="Ej. Viaje a Japón"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
        </div>

        {/* DESCRIPCIÓN */}
        <div className="campo-modal">
          <label>Descripción</label>

          <textarea
            placeholder="Describe tu meta..."
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            rows={3}
          />
        </div>

        {/* MONTO */}
        <div className="campo-modal">
          <label>Monto objetivo</label>

          <input
            type="text"
            inputMode="numeric"
            placeholder="0"
            value={monto}
            onChange={(e) => setMonto(formatearMonto(e.target.value))}
          />
        </div>

        {/* FECHA */}
        <div className="campo-modal">
          <label>Fecha límite</label>

          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
          />
        </div>

        {/* ERROR */}
        {error && <p className="error">{error}</p>}

        {/* BOTONES */}
        <div className="modal-acciones">
          <button
            type="button"
            className="btn-cancelar"
            onClick={onCerrar}
            disabled={guardado}
          >
            Cancelar
          </button>

          <button type="submit" className="btn-guardar" disabled={guardado}>
            {guardado
              ? "Guardando..."
              : esEdicion
                ? "Guardar cambios"
                : "Crear Meta"}
          </button>
        </div>
      </form>
    </ModalBase>
  );
}

export default ModalMeta;
