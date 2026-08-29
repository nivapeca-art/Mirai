import { Check, Edit, Power } from "lucide-react";

function TarjetaObligacion({ obligacion, categoria, onRealizada, onCambiarEstado, onEditar }) {

  const formatearMonto = (monto) => {
    return Number(monto || 0).toLocaleString("es-CO");
  };
  const formatearFecha = (fecha) => {
    if (!fecha) {
      return "Sin fecha límite";
    }
    return new Date(`${fecha}T00:00:00`).toLocaleDateString("es-CO");
  };

  const getEstado = () => {
    if (!obligacion.activa) {
      return {
        texto: "Inactiva",
        clase: "estado-inactiva",
      };
    }

    if (obligacion.cumplida) {
      return {
        texto: "Realizada",
        clase: "estado-realizada",
      };
    }

    if (obligacion.dias_restantes !== null && obligacion.dias_restantes < 0) {
      return {
        texto: "Vencida",
        clase: "estado-vencida",
      };
    }

    return {
      texto: "Pendiente",
      clase: "estado-pendiente",
    };
  };

  const estado = getEstado();

  return (
    <article className="tarjeta-obligacion">
      {/* INFORMACIÓN */}
      <div className="obligacion-info">
        <div className="obligacion-cabecera">
          <h3>{obligacion.nombre}</h3>
          <span className={`estado-obligacion ${estado.clase}`}>
            {estado.texto}
          </span>
        </div>
        {/* CATEGORÍA */}
        <p className="obligacion-categoria">
          {categoria?.nombre || "Sin categoría"}
        </p>
        {/* DATOS */}
        <div className="datos-obligacion">
          <div>
            <span>Monto estimado</span>
            <strong>${formatearMonto(obligacion.monto_estimado)}</strong>
          </div>
          <div>
            <span>Frecuencia</span>
            <strong>{obligacion.frecuencia || "Única"}</strong>
          </div>
          <div>
            <span>Fecha límite</span>
            <strong>{formatearFecha(obligacion.fecha_limite)}</strong>
          </div>
          <div>
            <span>Tiempo</span>
            <strong>
              {obligacion.dias_restantes === null
                ? "—"
                : obligacion.dias_restantes < 0
                  ? "Vencida"
                  : obligacion.dias_restantes === 0
                    ? "Hoy"
                    : `${obligacion.dias_restantes} días`}
            </strong>
          </div>
        </div>
      </div>
      {/* ACCIONES */}
      <div className="acciones-obligacion">
        {obligacion.activa && !obligacion.cumplida && (
          <button
            className="btn-realizada"
            onClick={() => onRealizada(obligacion.id)}
          >
            <Check size={18} />
            Realizada
          </button>
        )}
        <button className="btn-editar" onClick={() => onEditar(obligacion)}>
          <Edit size={18} />
          Editar
        </button>
        <button
          className={obligacion.activa ? "btn-desactivar" : "btn-activar"}
          onClick={() => onCambiarEstado(obligacion)}
        >
          <Power size={18} />
          {obligacion.activa ? "Desactivar" : "Activar"}
        </button>
      </div>
    </article>
  );
  
}

export default TarjetaObligacion;
