import { useState } from "react";

import ModalBase from "./ModalBase";

import { crearCategoria } from "../../../services/categoriaServices";

function ModalCategoria({ onCerrar, onGuardado }) {

  const [nombre, setNombre] = useState("");
  const [tipo, setTipo] = useState("GASTO");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const guardarCategoria = async (e) => {
    e.preventDefault();

    if (!nombre.trim()) {
      setError("Debes ingresar un nombre para la categoría.");
      return;
    }

    if (!tipo) {
      setError("Debes seleccionar un tipo.");
      return;
    }

    try {
      setGuardando(true);
      setError("");
      await crearCategoria({
        nombre: nombre.trim(),
        tipo: tipo,
      });
      // Avisar que se guardó correctamente
      if (onGuardado) {
        onGuardado();
      }
      // Cerrar modal
      onCerrar();

    } catch (error) {
      console.error("ERROR CATEGORÍA:", error);
      console.error("RESPUESTA DEL SERVIDOR:", error.response?.data);
      const mensaje =
        error.response?.data?.nombre?.[0] ||
        error.response?.data?.tipo?.[0] ||
        error.response?.data?.detail ||
        "No se pudo crear la categoría.";
      setError(mensaje);
      
    } finally {
      setGuardando(false);
    }
  };

  return (
    <ModalBase titulo="Nueva categoría" onCerrar={onCerrar}>
      <form onSubmit={guardarCategoria}>
        {/* NOMBRE */}
        <div className="campo-modal">
          <label>Nombre</label>
          <input
            type="text"
            placeholder="Ej. Alimentación"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
        </div>
        {/* ERROR */}
        {error && <p className="error">{error}</p>}
        {/* TIPO */}
        <div className="campo-modal">
          <label>Tipo</label>
          <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
            <option value="INGRESO">Ingreso</option>
            <option value="GASTO">Gasto</option>
            <option value="AHORRO">Ahorro</option>
          </select>
        </div>
        {/* BOTONES */}
        <div className="modal-acciones">
          {/* Cerrar */}
          <button
            type="button"
            className="btn-cancelar"
            onClick={onCerrar}
            disabled={guardando}
          >
            Cancelar
          </button>
          {/* Guardar */}
          <button type="submit" className="btn-guardar" disabled={guardando}>
            {guardando ? "Guardando..." : "Crear categoría"}
          </button>
        </div>
      </form>
    </ModalBase>
  );
  
}

export default ModalCategoria;
