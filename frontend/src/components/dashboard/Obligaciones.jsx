import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { marcarObligacionCumplida } from "../../services/obligacionServices";

function Obligaciones({ dashboard, onGuardado }) {
  const navigate = useNavigate();
  const { obligaciones = [], moneda } = dashboard;
  const simbolo = moneda?.simbolo || "$";
  const [actualizando, setActualizando] = useState(null);
  const obligacionesCercanas = obligaciones
    .filter((obligacion) => {
      // No mostrar obligaciones inactivas
      if (!obligacion.activa) {
        return false;
      }
      // No mostrar obligaciones vencidas
      if (obligacion.dias_restantes !== null && obligacion.dias_restantes < 0) {
        return false;
      }
      return true;
    })
    .slice(0, 3);

  // ESTADO
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
  // OBLIGACIÓN CUMPLIDA
  const cambiarCumplida = async (id, estadoActual) => {
    try {
      setActualizando(id);
      // USA EL SERVICIO DE OBLIGACIÓN
      await marcarObligacionCumplida(id, !estadoActual);
      // Actualizar el dashboard
      await onGuardado();
    } catch (error) {
      console.error("Error actualizando obligación:", error);
    } finally {
      setActualizando(null);
    }
  };

  return (
    <section className="obligaciones">
      <div className="obligaciones-header">
        <div>
          <h2>Obligaciones</h2>
          <p>Próximos vencimientos</p>
        </div>

        <button onClick={() => navigate("/obligaciones")}>Ver todas</button>
      </div>

      {obligacionesCercanas.length === 0 ? (
        // No tiene obligaciónes pendientes
        <div className="obligaciones-vacio">
          <p>No tienes obligaciones pendientes.</p>
        </div>
      ) : (
        // Muestra las obligaciones pendientes
        <div className="obligaciones-lista">
          {obligacionesCercanas.map((obligacion) => {
            const estado = obtenerEstado(obligacion.dias_restantes);

            return (
              <div
                className={`obligacion-item ${
                  obligacion.cumplida ? "obligacion-cumplida" : ""
                }`}
                key={obligacion.id}
              >
                {/* Botón para cambiar de pendiente a cumplida o al reves */}
                <button
                  className={
                    obligacion.cumplida
                      ? "estado-obligacion cumplida"
                      : "estado-obligacion pendiente"
                  }
                  disabled={actualizando === obligacion.id}
                  onClick={() =>
                    cambiarCumplida(obligacion.id, obligacion.cumplida)
                  }
                >
                  {obligacion.cumplida ? "✓ Cumplida" : "○ Pendiente"}
                </button>
                {/* Información de la obligación */}
                <div className="obligacion-info">
                  <h3>{obligacion.nombre}</h3>
                  <span>
                    {simbolo}{" "}
                    {Number(obligacion.monto_estimado).toLocaleString("es-CO")}
                  </span>
                </div>
                {/* Cambio de estado */}
                {!obligacion.cumplida && (
                  <span className={estado.clase}>{estado.texto}</span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default Obligaciones;
