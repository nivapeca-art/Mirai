import { useState } from "react";

function Calendario({ dashboard }) {

  const [fechaActual, setFechaActual] = useState(new Date());

  const obtenerInicioSemana = (fecha) => {
    const dia = fecha.getDay();
    const diferencia = dia === 0 ? -6 : 1 - dia;
    const inicio = new Date(fecha);
    inicio.setDate(fecha.getDate() + diferencia);
    return inicio;
  };

  const inicioSemana = obtenerInicioSemana(fechaActual);

  const dias = Array.from({ length: 7 }, (_, index) => {
    const fecha = new Date(inicioSemana);
    fecha.setDate(inicioSemana.getDate() + index);
    return fecha;
  });

  // ¿ES HOY?
  const esHoy = (fecha) => {
    return (
      fecha.getDate() === fechaActual.getDate() &&
      fecha.getMonth() === fechaActual.getMonth() &&
      fecha.getFullYear() === fechaActual.getFullYear()
    );
  };

  // ¿TIENE OBLIGACIÓN?
  const tieneObligacion = (fecha) => {
    const obligaciones = dashboard?.obligaciones || [];
    return obligaciones.some((obligacion) => {
      // No marcar desactivadas
      if (!obligacion.activa) {
        return false;
      }
      // No marcar cumplidas
      if (obligacion.cumplida) {
        return false;
      }
      // No marcar vencidas
      if (obligacion.dias_restantes !== null && obligacion.dias_restantes < 0) {
        return false;
      }

      if (!obligacion.fecha_limite) {
        return false;
      }
      const [año, mes, dia] = obligacion.fecha_limite.split("-").map(Number);
      return (
        fecha.getFullYear() === año &&
        fecha.getMonth() + 1 === mes &&
        fecha.getDate() === dia
      );
    });
  };
  // Iniciales de los días de la semana
  const nombresDias = ["L", "M", "X", "J", "V", "S", "D"];

  return (
    <section className="calendario">
      <div className="calendario-header">
        <h2>Esta semana</h2>
      </div>
      {/* Calendario de la semana */}
      <div className="calendario-dias">
        {dias.map((fecha, index) => {
          const hoy = esHoy(fecha);
          const obligacion = tieneObligacion(fecha);
          let claseDia = "dia";
          // La obligación tiene prioridad sobre "hoy"
          if (obligacion) {
            claseDia += " dia-obligacion";
          } else if (hoy) {
            claseDia += " dia-hoy";
          }

          return (
            <div className={claseDia} key={fecha.toISOString()}>
              <span className="dia-nombre">{nombresDias[index]}</span>

              <span className="dia-numero">{fecha.getDate()}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
  
}

export default Calendario;
