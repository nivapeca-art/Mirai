import { useEffect, useState } from "react";

import ModalBase from "./ModalBase";

import { crearMovimiento } from "../../services/movimientoServices";
import { obtenerCategorias } from "../../services/categoriaServices";
import { obtenerMetas } from "../../services/metaServices";

import {
  obtenerMonedaUsuario,
  formatearMontoInput,
  convertirMontoParaAPI,
} from "../../utils/moneda";
import { obtenerFechaHoy } from "../../utils/fecha";

function ModalMovimiento({ onCerrar, onGuardado }) {
  const [tipo, setTipo] = useState("INGRESO");
  const [monto, setMonto] = useState("");
  const [fecha, setFecha] = useState("");
  const hoy = obtenerFechaHoy();
  const [categoria, setCategoria] = useState("");
  const [meta, setMeta] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [categorias, setCategorias] = useState([]);
  const [metas, setMetas] = useState([]);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const moneda = obtenerMonedaUsuario();
  const codigoMoneda = moneda?.codigo || "COP";

  // CARGAR DATOS
  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [categoriasData, metasData] = await Promise.all([
        obtenerCategorias(),
        obtenerMetas(),
      ]);
      // Categorías en orden alfabético
      const categoriasOrdenadas = categoriasData.sort((a, b) =>
        a.nombre.localeCompare(b.nombre),
      );
      // No mostrar las metas completas
      const metasEnProceso = metasData
        .filter((meta) => meta.estado !== "COMPLETADO")
        .sort((a, b) => a.nombre.localeCompare(b.nombre));
      setCategorias(categoriasOrdenadas);
      setMetas(metasEnProceso);
    } catch (error) {
      console.error("Error cargando datos:", error);
      setError("No se pudieron cargar las categorías y metas.");
    }
  };

  // SEGÚN EL TIPO, SALDRÁN SOLO LAS CATEGORÍAS DE ESE TIPO
  const categoriasFiltradas = categorias.filter((item) => item.tipo === tipo);

  // MANEJAR TIPO DE INGRESO
  const manejarTipo = (e) => {
    const nuevoTipo = e.target.value;
    setTipo(nuevoTipo);
    // Limpiar el campo que ya no corresponde
    setCategoria("");
    setMeta("");
  };

  // MANEJAR MONTO
  const manejarMonto = (e) => {
    setMonto(formatearMontoInput(e.target.value, codigoMoneda));
  };

  // GUARDAR MOVIMIENTO
  const guardarMovimiento = async (e) => {
    e.preventDefault();
    setError("");
    const montoAPI = convertirMontoParaAPI(monto, codigoMoneda);
    // Validar monto
    if (!monto || Number(montoAPI) <= 0) {
      setError("El monto debe ser mayor a 0.");
      return;
    }
    // Validar fecha
    if (!fecha) {
      setError("Debes seleccionar una fecha.");
      return;
    }
    // La fecha no puede ser mayor al día de hoy
    const hoy = new Date().toISOString().split("T")[0];
    if (fecha > hoy) {
      setError("La fecha no puede ser después a hoy.");
      return;
    }
    // Validar categoría
    if ((tipo === "INGRESO" || tipo === "GASTO") && !categoria) {
      setError("Debes seleccionar una categoría.");
      return;
    }
    // Validar meta
    if (tipo === "AHORRO" && !meta) {
      setError("Debes seleccionar una meta.");
      return;
    }
    // Datos para crear el movimiento
    const movimiento = {
      tipo,
      monto: montoAPI,
      fecha,
      categoria: tipo === "AHORRO" ? null : Number(categoria),
      meta: tipo === "AHORRO" ? Number(meta) : null,
      descripcion: descripcion.trim(),
    };

    try {
      setGuardando(true);
      // CREAR MOVIMIENTO
      await crearMovimiento(movimiento);
      // Avisar al Dashboard que se creó correctamente
      if (onGuardado) {
        await onGuardado();
      }
      onCerrar();
    } catch (error) {
      console.error("Error creando movimiento:", error);
      const respuesta = error.response?.data;
      if (respuesta) {
        const primerError = Object.values(respuesta).flat()[0];
        setError(primerError || "No se pudo crear el movimiento.");
      } else {
        setError("No se pudo crear el movimiento.");
      }
    } finally {
      setGuardando(false);
    }
  };

  return (
    <ModalBase titulo="Nuevo movimiento" onCerrar={onCerrar}>
      <form onSubmit={guardarMovimiento}>
        {/* TIPO */}
        <div className="campo-modal">
          <label>Tipo</label>
          <select value={tipo} onChange={manejarTipo}>
            <option value="INGRESO">Ingreso</option>
            <option value="GASTO">Gasto</option>
            <option value="AHORRO">Ahorro</option>
          </select>
        </div>
        {/* MONTO */}
        <div className="campo-modal">
          <label>Monto</label>
          <input
            type="text"
            inputMode="decimal"
            value={monto}
            onChange={manejarMonto}
            placeholder="0"
          />
        </div>
        {/* CATEGORÍA */}
        {(tipo === "INGRESO" || tipo === "GASTO") && (
          <div className="campo-modal">
            <label>Categoría</label>
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
            >
              <option value="">Seleccionar categoría</option>

              <optgroup label="Generales">
                {categoriasFiltradas
                  .filter((item) => item.creada === null)
                  .map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.nombre}
                    </option>
                  ))}
              </optgroup>

              <optgroup label="Mis categorías">
                {categoriasFiltradas
                  .filter((item) => item.creada !== null)
                  .map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.nombre}
                    </option>
                  ))}
              </optgroup>
            </select>
          </div>
        )}
        {/* META */}
        {tipo === "AHORRO" && (
          <div className="campo-modal">
            <label>Meta</label>
            <select value={meta} onChange={(e) => setMeta(e.target.value)}>
              <option value="">Seleccionar meta</option>
              {metas.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.nombre}
                </option>
              ))}
            </select>
          </div>
        )}
        {/* FECHA */}
        <div className="campo-modal">
          <label>Fecha</label>
          <input
            type="date"
            value={fecha}
            max={hoy}
            onChange={(e) => setFecha(e.target.value)}
          />
        </div>
        {/* DESCRIPCIÓN */}
        <div className="campo-modal">
          <label>Descripción</label>
          <textarea
            placeholder="Describe tu movimiento..."
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            rows={3}
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
            disabled={guardando}
          >
            Cancelar
          </button>
          {/* Guardar */}
          <button type="submit" className="btn-guardar" disabled={guardando}>
            {guardando ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </form>
    </ModalBase>
  );
}

export default ModalMovimiento;
