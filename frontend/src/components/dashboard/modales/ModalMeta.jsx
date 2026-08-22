import { useState } from "react";

import ModalBase from "./ModalBase";

import { crearMeta } from "../../../services/metaServices";


function ModalMeta({ onCerrar, onGuardado }) {
  
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [monto, setMonto] = useState("");
  const [fecha, setFecha] = useState("");

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

  // GUARDAR OBLIGACIÓN
  const guardarMeta = async (e) => {
    e.preventDefault();
    setError("");
    // Validar nombre
    if (!nombre.trim()) {
      setError("Debes ingresar un nombre para la meta.");
      return;
    }
    // Validar monto
    if (!monto || Number(monto.replace(/\./g, "")) <= 0) {
      setError("El monto debe ser mayor a 0.");
      return;
    }
    // Validar fecha
    if (!fecha) {
      setError("Debes seleccionar una fecha.");
      return;
    }

    try {
      setGuardado(true);
      const meta = {
        nombre: nombre.trim(),
        descripcion: descripcion.trim(),
        monto_objetivo: Number(monto.replace(/\./g, "")),
        fecha_limite: fecha,
      };
      console.log("META A GUARDAR:", meta);
      // CREAR OBLIGACIÓN
      await crearMeta(meta);
      // Avisar al Dashboard
      if (onGuardado) {
        await onGuardado();
      }
      // Cerrar modal
      onCerrar();

    } catch (error) {
      console.error("ERROR META:", error);
      console.error("RESPUESTA DEL SERVIDOR:", error.response?.data);
      const respuesta = error.response?.data;
      if (respuesta) {
        const primerError = Object.values(respuesta).flat()[0];
        setError(primerError || "No se pudo crear la meta.");
      } else {
        setError("No se pudo crear la meta.");
      }

    } finally {
      setGuardado(false);
    }
  };

  return (
    <ModalBase titulo="Nueva meta" onCerrar={onCerrar}>
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
          {/* Cerrar */}
          <button
            type="button"
            className="btn-cancelar"
            onClick={onCerrar}
            disabled={guardado}
          >
            Cancelar
          </button>
          {/* Guardar */}
          <button type="submit" className="btn-guardar" disabled={guardado}>
            {guardado ? "Guardando..." : "Crear Meta"}
          </button>
        </div>
      </form>
    </ModalBase>
  );

}

export default ModalMeta;
