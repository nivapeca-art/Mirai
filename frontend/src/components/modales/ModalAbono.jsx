import { useState } from "react";

import ModalBase from "./ModalBase";

import { crearMovimiento } from "../../services/movimientoServices";

function ModalAbono({ meta, onCerrar, onGuardado }) {
  const [monto, setMonto] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  // FORMATEAR MONTO
  const formatearMonto = (valor) => {
    const numero = valor.replace(/\D/g, "");
    if (!numero) {
      return "";
    }
    return Number(numero).toLocaleString("es-CO");
  };

  // MONTO ACTUAL
  const montoActual = Number(meta.monto_actual);

  // MONTO OBJETIVO
  const montoObjetivo = Number(meta.monto_objetivo);

  // MONTO QUE FALTA
  const montoFaltante = Math.max(
    0,
    montoObjetivo - montoActual
  );

  // GUARDAR ABONO
  const guardarAbono = async (e) => {
    e.preventDefault();
    setError("");
    const montoNumerico = Number(
      monto.replace(/\./g, "")
    );
    // VALIDAR MONTO
    if (!monto || montoNumerico <= 0) {
      setError("El monto debe ser mayor a 0.");
      return;
    }
    // EVITAR SUPERAR LA META
    if (montoNumerico > montoFaltante) {
      setError(
        `El abono no puede superar los $${montoFaltante.toLocaleString(
          "es-CO"
        )} que faltan para completar la meta.`
      );
      return;
    }

    try {
      setGuardando(true);
      const movimiento = {
        meta: meta.id,
        monto: montoNumerico,
        fecha: new Date().toISOString().split("T")[0],
        tipo: "AHORRO"
      };
      await crearMovimiento(movimiento);
      // AVISAR A METAS
      if (onGuardado) {
        await onGuardado();
      }
      onCerrar();

    } catch (error) {
      console.error("Error creando abono:", error);
      const respuesta = error.response?.data;
      if (respuesta) {
        const primerError = Object.values(respuesta).flat()[0];
        setError(
          primerError || "No se pudo realizar el abono."
        );
      } else {
        setError("No se pudo realizar el abono.");
      }

    } finally {
      setGuardando(false);
    }
  };

  return (
    <ModalBase
      titulo="Hacer abono"
      onCerrar={onCerrar}
    >
      <form onSubmit={guardarAbono}>

        {/* META */}
        <div className="abono-meta">
          <span>Meta</span>
          <strong>{meta.nombre}</strong>
        </div>
        {/* INFORMACIÓN */}
        <div className="abono-resumen">
          <div>
            <span>Ahorrado</span>
            <strong>
              ${montoActual.toLocaleString("es-CO")}
            </strong>
          </div>
          <div>
            <span>Falta</span>
            <strong>
              ${montoFaltante.toLocaleString("es-CO")}
            </strong>
          </div>
        </div>
        {/* MONTO */}
        <div className="campo-modal">
          <label>Monto del abono</label>
          <input
            type="text"
            inputMode="numeric"
            placeholder="0"
            value={monto}
            onChange={(e) => {
              setMonto(
                formatearMonto(e.target.value)
              );
            }}
            autoFocus
          />
        </div>
        {/* ERROR */}
        {error && (<p className="error">{error}</p>)}
        {/* BOTONES */}
        <div className="modal-acciones">
          <button
            type="button"
            className="btn-cancelar"
            onClick={onCerrar}
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
              : "Hacer abono"}
          </button>
        </div>

      </form>
    </ModalBase>
  );
}

export default ModalAbono;