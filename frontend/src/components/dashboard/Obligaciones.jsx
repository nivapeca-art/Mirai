import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  marcarObligacionCumplida,
  deshacerObligacionCumplida,
} from "../../services/obligacionServices";

import { obtenerMonedaUsuario, formatearMonto } from "../../utils/moneda";

function Obligaciones({ dashboard, onGuardado }) {
  const navigate = useNavigate();

  const { obligaciones = [] } = dashboard;

  const moneda = obtenerMonedaUsuario();
  const simbolo = moneda.simbolo;

  const [actualizando, setActualizando] = useState(null);

  // OBLIGACIONES CERCANAS
  const obligacionesCercanas = obligaciones
    .filter((obligacion) => {
      // No mostrar obligaciones inactivas
      if (!obligacion.activa) {
        return false;
      }
      // No mostrar obligaciones vencidas
      if (
        obligacion.dias_restantes !== null &&
        obligacion.dias_restantes < 0 &&
        !obligacion.cumplida_hoy
      ) {
        return false;
      }
      // Mostrar obligaciones que estén a 15 días o menos.
      // EXCEPTO las que fueron cumplidas hoy
      if (
        obligacion.dias_restantes !== null &&
        obligacion.dias_restantes > 15 &&
        !obligacion.cumplida_hoy
      ) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      // Las cumplidas hoy tienen prioridad para mantenerse visibles
      if (a.cumplida_hoy && !b.cumplida_hoy) {
        return -1;
      }
      if (!a.cumplida_hoy && b.cumplida_hoy) {
        return 1;
      }
      return a.dias_restantes - b.dias_restantes;
    })
    .slice(0, 10);

  // ESTADO DE LA OBLIGACIÓN
  const obtenerEstado = (dias) => {
    if (dias < 0) {
      return {
        texto: "Vencida",
        clase: "obligacion-vencida",
      };
    }
    if (dias === 0) {
      return {
        texto: "Hoy",
        clase: "obligacion-hoy",
      };
    }
    if (dias <= 3) {
      return {
        texto: `En ${dias} días`,
        clase: "obligacion-proxima",
      };
    }
    return {
      texto: `En ${dias} días`,
      clase: "obligacion-normal",
    };
  };

  // MARCAR COMO CUMPLIDA
  const cambiarCumplida = async (id) => {
    try {
      setActualizando(id);
      await marcarObligacionCumplida(id, true);
      await onGuardado();
    } catch (error) {
      console.error("Error actualizando obligación:", error);
    } finally {
      setActualizando(null);
    }
  };

  // DESHACER CUMPLIDA
  const deshacerCumplida = async (id) => {
    try {
      setActualizando(id);
      await deshacerObligacionCumplida(id);
      await onGuardado();
    } catch (error) {
      console.error("Error deshaciendo obligación:", error);
    } finally {
      setActualizando(null);
    }
  };

  return (
    <section className="obligaciones">
      {/* HEADER */}
      <div className="obligaciones-header">
        <div>
          <h2>Obligaciones</h2>
          <p>Próximos vencimientos</p>
        </div>
        <button onClick={() => navigate("/obligaciones")}>Ver todas</button>
      </div>

      {/* SIN OBLIGACIONES */}
      {obligacionesCercanas.length === 0 ? (
        <div className="obligaciones-vacio">
          <p>No tienes obligaciones próximas.</p>
        </div>
      ) : (
        /* LISTA DE OBLIGACIONES */
        <div className="obligaciones-lista">
          {obligacionesCercanas.map((obligacion) => {
            const estado = obtenerEstado(obligacion.dias_restantes);
            // Una obligación se considera cumplida si esta marcada o se realizo hoy.
            const estaCumplida = obligacion.cumplida || obligacion.cumplida_hoy;

            return (
              <div
                className={`obligacion-item ${
                  estaCumplida ? "obligacion-cumplida" : ""
                }`}
                key={obligacion.id}
              >
                {/* BOTÓN ESTADO */}
                <button
                  className={
                    estaCumplida
                      ? "estado-obligacion cumplida"
                      : "estado-obligacion pendiente"
                  }
                  disabled={actualizando === obligacion.id}
                  onClick={() => {
                    if (estaCumplida) {
                      deshacerCumplida(obligacion.id);
                    } else {
                      cambiarCumplida(obligacion.id);
                    }
                  }}
                  title={
                    estaCumplida
                      ? "Deshacer realización"
                      : "Marcar como cumplida"
                  }
                >
                  {estaCumplida ? "✓ Cumplida" : "○ Pendiente"}
                </button>

                {/* INFORMACIÓN */}
                <div className="obligacion-info">
                  <h3>{obligacion.nombre}</h3>
                  <span>
                    {formatearMonto(obligacion.monto_estimado, moneda.codigo)}
                  </span>
                </div>
                {/* FECHA / ESTADO */}
                <span
                  className={
                    estaCumplida ? "obligacion-cumplida-hoy" : estado.clase
                  }
                >
                  {obligacion.cumplida_hoy
                    ? "Cumplida hoy"
                    : estaCumplida
                      ? "Cumplida"
                      : estado.texto}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default Obligaciones;
