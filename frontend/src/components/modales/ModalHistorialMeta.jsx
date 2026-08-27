import { useEffect, useState } from "react";
import ModalBase from "./ModalBase";
import { obtenerMovimientos } from "../../services/movimientoServices";
import "../../styles/modales/modalHistorial.css";

function ModalHistorialMeta({ meta, onCerrar }) {

  const [abonos, setAbonos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (meta?.id) {
      cargarAbonos();
    }
  }, [meta?.id]);

  const cargarAbonos = async () => {
    try {
      setCargando(true);
      setError("");

      const data = await obtenerMovimientos();

      const abonosMeta = data
        .filter((abono) => abono.meta === meta.id)
        .sort(
          (a, b) =>
            new Date(`${b.fecha}T00:00:00`) -
            new Date(`${a.fecha}T00:00:00`)
        );

      setAbonos(abonosMeta);

    } catch (error) {
      console.error("Error obteniendo abonos:", error);
      setError("No se pudo cargar el historial.");
    } finally {
      setCargando(false);
    }
  };

  const totalAbonos = abonos.reduce(
    (total, abono) => total + Number(abono.monto),
    0
  );

  return (
    <ModalBase
      titulo={`Historial - ${meta.nombre}`}
      onCerrar={onCerrar}
    >
      <div className="historial-meta">

        {/* RESUMEN */}
        <div className="historial-resumen">
          <div>
            <span>Total ahorrado</span>
            <strong>
              ${totalAbonos.toLocaleString("es-CO")}
            </strong>
          </div>
          <div>
            <span>Número de abonos</span>
            <strong>
              {abonos.length}
            </strong>
          </div>
        </div>
        {/* ESTADOS */}
        {cargando && (
          <div className="historial-estado">
            Cargando historial...
          </div>
        )}
        {error && (
          <div className="historial-error">
            {error}
          </div>
        )}
        {!cargando && !error && abonos.length === 0 && (
          <div className="historial-vacio">
            Todavía no has realizado abonos a esta meta.
          </div>
        )}
        {/* LISTA */}
        {!cargando && !error && abonos.length > 0 && (
          <div className="historial-lista">
            {abonos.map((abono) => (
              <div
                className="historial-item"
                key={abono.id}
              >
                <div className="historial-icono">
                  +
                </div>
                <div className="historial-info">
                  <strong>
                    Abono
                  </strong>

                  <span>
                    {new Date(
                      `${abono.fecha}T00:00:00`
                    ).toLocaleDateString("es-CO", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>

                </div>

                <strong className="historial-monto">
                  +$
                  {Number(abono.monto).toLocaleString("es-CO")}
                </strong>

              </div>

            ))}

          </div>
        )}

      </div>
    </ModalBase>
  );
}

export default ModalHistorialMeta;