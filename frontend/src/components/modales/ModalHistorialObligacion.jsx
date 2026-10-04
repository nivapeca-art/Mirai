import { useEffect, useState } from "react";

import { Clock, X, Check } from "lucide-react";

import { obtenerHistorialObligacion } from "../../services/obligacionServices";

import { formatearFecha } from "../../utils/fecha";
import { formatearMonto, obtenerMonedaUsuario } from "../../utils/moneda";

import "../../styles/modales/modalHistorialObligacion.css";

function ModalHistorialObligacion({obligacion,onCerrar}) {
  const [historial, setHistorial] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const moneda = obtenerMonedaUsuario();

  useEffect(() => {
    const cargarHistorial = async () => {
      try {
        setCargando(true);
        setError("");
        const data = await obtenerHistorialObligacion(
          obligacion.id
        );
        console.log("Historial recibido:", data);
        setHistorial(data);

      } catch (error) {
        console.error(
          "Error cargando historial:",
          error
        );
        setError(
          "No se pudo cargar el historial."
        );

      } finally {
        setCargando(false);
      }
    };

    cargarHistorial();
  }, [obligacion.id]);

  return (
    <div
      className="modal-overlay"
      onClick={onCerrar}
    >
      <div
        className="modal-historial"
        onClick={(e) => e.stopPropagation()}
      >

        {/* CABECERA */}
        <div className="modal-historial-cabecera">
          <div className="modal-historial-titulo">
            <div className="modal-historial-icono">
              <Clock size={20} />
            </div>
            <div>
              <h2>Historial</h2>
              <p>{obligacion.nombre}</p>
            </div>
          </div>
          <button
            className="modal-historial-cerrar"
            onClick={onCerrar}
            aria-label="Cerrar"
          >
            <X size={20} />
          </button>
        </div>

        {/* CONTENIDO */}
        <div className="modal-historial-contenido">
          {cargando && (
            <div className="historial-estado">
              <p>Cargando historial...</p>
            </div>
          )}
          {!cargando && error && (
            <div className="historial-estado error">
              <p>{error}</p>
            </div>
          )}
          {!cargando &&
            !error &&
            historial.length === 0 && (
              <div className="historial-vacio">
                <Clock size={30} />
                <h3>Sin historial</h3>
                <p>Todavía no has marcado esta obligación como realizada.</p>
              </div>
            )}
          {!cargando &&
            !error &&
            historial.length > 0 && (
              <div className="lista-historial">
                {historial.map((registro) => (
                  <div className="item-historial" key={registro.id}>
                    <div className="historial-check">
                      <Check size={16} />
                    </div>
                    <div className="historial-info">
                      <div className="historial-principal">
                        <strong>Fecha limite</strong>
                        <strong>
                          {formatearFecha(registro.fecha_limite )}
                        </strong>
                        <span>
                          Realizada {formatearFecha(registro.fecha_realizada)}
                        </span>
                      </div>

                      <div className="historial-detalles">
                        <span>
                          {formatearMonto(registro.monto_estimado, moneda.codigo)}
                        </span>
                        <span>
                          {registro.frecuencia ||
                            "Única"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
        </div>

      </div>
    </div>
  );
}

export default ModalHistorialObligacion;