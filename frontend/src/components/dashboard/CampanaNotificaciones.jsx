import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Bell, Target, Clock, X } from "lucide-react";

import { obtenerMonedaUsuario, formatearMonto } from "../../utils/moneda";

import "../../styles/dashboard/campanaNotificaciones.css";

function CampanaNotificaciones({ notificaciones = [] }) {
  const navegar = useNavigate();
  const [abierta, setAbierta] = useState(false);
  const cantidad = notificaciones.length;
  const moneda = obtenerMonedaUsuario();

  const alternarCampana = () => {
    setAbierta((previo) => !previo);
  };

  const abrirNotificacion = (notificacion) => {
    if (notificacion.tipo === "META") {
      navegar("/metas", {
        state: {
          abrirAbono: true,
          metaId: notificacion.meta_id,
          monto: notificacion.monto,
        },
      });
      setAbierta(false);
    }
  };

  const cerrarPanel = () => {
    setAbierta(false);
  };

  const formatearNotificacion = (notificacion) => {
    if (!notificacion.mensaje) {
      return "";
    }

    if (notificacion.monto !== undefined && notificacion.monto !== null) {
      return notificacion.mensaje.replace(
        "{monto}",
        formatearMonto(notificacion.monto, moneda.codigo),
      );
    }

    if (
      notificacion.monto_estimado !== undefined &&
      notificacion.monto_estimado !== null
    ) {
      return notificacion.mensaje.replace(
        "{monto}",
        formatearMonto(notificacion.monto_estimado, moneda.codigo),
      );
    }

    return notificacion.mensaje;
  };

  return (
    <div className="contenedor-notificaciones">
      {/* CAMPANA */}
      <button
        type="button"
        className={`boton-campana ${abierta ? "campana-activa" : ""}`}
        onClick={alternarCampana}
        aria-label="Notificaciones"
        title="Notificaciones"
      >
        <Bell size={21} />
        {cantidad > 0 && (
          <span className="contador-notificaciones">
            {cantidad > 9 ? "9+" : cantidad}
          </span>
        )}
      </button>

      {/* PANEL */}
      {abierta && (
        <div className="panel-notificaciones">
          <div className="cabecera-notificaciones">
            <div>
              <h3>Notificaciones</h3>
              <span>
                {cantidad === 0
                  ? "No tienes avisos pendientes"
                  : `${cantidad} ${
                      cantidad === 1 ? "aviso pendiente" : "avisos pendientes"
                    }`}
              </span>
            </div>
            <button
              type="button"
              className="cerrar-notificaciones"
              onClick={cerrarPanel}
              aria-label="Cerrar notificaciones"
            >
              <X size={17} />
            </button>
          </div>

          {/* SIN NOTIFICACIONES */}
          {cantidad === 0 && (
            <div className="notificaciones-vacias">
              <div className="icono-notificaciones-vacias">
                <Bell size={22} />
              </div>
              <strong>Todo está en orden</strong>
              <p>Por ahora no tienes avisos pendientes.</p>
            </div>
          )}

          {/* NOTIFICACIONES */}
          {cantidad > 0 && (
            <div className="lista-notificaciones">
              {notificaciones.map((notificacion) => {
                const esMeta = notificacion.tipo === "META";
                return (
                  <div
                    className={`notificacion-item ${
                      esMeta ? "notificacion-meta" : "notificacion-obligacion"
                    }`}
                    key={
                      esMeta
                        ? `meta-${notificacion.meta_id}`
                        : `obligacion-${notificacion.obligacion_id}`
                    }
                    onClick={() => abrirNotificacion(notificacion)}
                  >
                    <div className="icono-notificacion">
                      {esMeta ? <Target size={18} /> : <Clock size={18} />}
                    </div>
                    <div className="contenido-notificacion">
                      <strong>{notificacion.titulo}</strong>

                      <p>{formatearNotificacion(notificacion)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default CampanaNotificaciones;
