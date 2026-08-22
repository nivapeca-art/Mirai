import { useEffect, useState } from "react";

import ModalBase from "./ModalBase";

import { crearObligacion } from "../../../services/obligacionServices";
import { obtenerCategorias } from "../../../services/categoriaServices";

function ModalObligacion({ onCerrar, onGuardado }) {
  
  const [nombre, setNombre] = useState("");
  const [categoria, setCategoria] = useState("");
  const [monto, setMonto] = useState("");
  const [fecha, setFecha] = useState("");
  const [frecuencia, setFrecuencia] = useState("");

  const [categorias, setCategorias] = useState([]);

  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  // CARGAR CATEGORÍAS
  useEffect(() => {
    cargarCategorias();
  }, []);

  const cargarCategorias = async () => {
    try {
      const categoriasData = await obtenerCategorias();
      const categoriasOrdenadas = categoriasData.sort((a, b) =>
        a.nombre.localeCompare(b.nombre),
      );
      const categoriasGasto = categoriasOrdenadas.filter(
        (categoria) => categoria.tipo === "GASTO",
      );
      setCategorias(categoriasGasto);

    } catch (error) {
      console.error("Error cargando categorías:", error);
      setError("No se pudieron cargar las categorías.");
    }
  };

  // FORMATEAR MONTO
  const formatearMonto = (valor) => {
    const numero = valor.replace(/\D/g, "");
    if (!numero) {
      return "";
    }
    return Number(numero).toLocaleString("es-CO");
  };

  // GUARDAR OBLIGACIÓN
  const guardarObligacion = async (e) => {
    e.preventDefault();
    setError("");
    // Validar nombre
    if (!nombre.trim()) {
      setError("Debes ingresar un nombre para la obligación.");
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
      setGuardando(true);
      // Datos para crear la obligación
      const obligacion = {
        nombre: nombre.trim(),
        monto_estimado: Number(monto.replace(/\./g, "")),
        fecha_limite: fecha,
        categoria: categoria || null,
        frecuencia: frecuencia
      };
      console.log("OBLIGACIÓN A GUARDAR:", obligacion);
      // CREAR OBLIGACIÓN
      await crearObligacion(obligacion);
      // Avisar al Dashboard
      if (onGuardado) {
        await onGuardado();
      }
      // Cerrar modal
      onCerrar();

    } catch (error) {
      console.error("ERROR OBLIGACIÓN:", error);
      console.error("RESPUESTA DEL SERVIDOR:", error.response?.data);
      const respuesta = error.response?.data;
      if (respuesta) {
        const primerError = Object.values(respuesta).flat()[0];
        setError(primerError || "No se pudo crear la obligación.");
      } else {
        setError("No se pudo crear la obligación.");
      }

    } finally {
      setGuardando(false);
    }
  };

  return (
    <ModalBase titulo="Nueva obligación" onCerrar={onCerrar}>
      <form onSubmit={guardarObligacion}>
        {/* NOMBRE */}
        <div className="campo-modal">
          <label>Nombre</label>
          <input
            type="text"
            placeholder="Ej. Arriendo"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
        </div>
        {/* CATEGORÍA */}
        <div className="campo-modal">
          <label>Categoría</label>
          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
          >
            <option value="">Sin categoría</option>
            {categorias.map((item) => (
              <option key={item.id} value={item.id}>
                {item.nombre}
              </option>
            ))}
          </select>
        </div>
        {/* MONTO */}
        <div className="campo-modal">
          <label>Monto estimado</label>
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
        {/* FRECUENCIA */}
        <div className="campo-modal">
          <label>Frecuencia</label>
          <select
            value={frecuencia}
            onChange={(e) => setFrecuencia(e.target.value)}
          >
            <option value="">Seleccionar frecuencia</option>
            <option value="Unica">Única</option>
            <option value="Semanal">Semanal</option>
            <option value="Mensual">Mensual</option>
            <option value="Trimestral">Cada 3 meses</option>
            <option value="Semestral">Cada 6 meses</option>
            <option value="Anual">Anual</option>
          </select>
        </div>
        {/* ERROR */}
        {error && <p className="error">{error}</p>}
        {/* BOTONES */}
        <div className="modal-acciones">
          {/* Cerrar */}
          <button type="button" className="btn-cancelar" onClick={onCerrar} disabled={guardado}>
            Cancelar
          </button>
          {/* Guardar */}
          <button type="submit" className="btn-guardar" disabled={guardado}>
            {guardando ? "Guardando..." : "Crear obligación"}
          </button>
        </div>
      </form>
    </ModalBase>
  );
}

export default ModalObligacion;
