import { Check, Edit, Power, History} from "lucide-react";

import { obtenerMonedaUsuario, formatearMonto } from "../../utils/moneda";
import { formatearFecha } from "../../utils/fecha";

function TarjetaObligacion({ obligacion, categoria, onRealizada, onCambiarEstado, onEditar, onHistorial}) {

  const moneda = obtenerMonedaUsuario();

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

    if (
      obligacion.dias_restantes !== null &&
      obligacion.dias_restantes < 0
    ) {
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
            <strong>
              {formatearMonto(obligacion.monto_estimado, moneda.codigo)}
            </strong>
          </div>
          <div>
            <span>Frecuencia</span>
            <strong>
              {obligacion.frecuencia || "Única"}
            </strong>
          </div>
          <div>
            <span>Fecha límite</span>
            <strong>
              {formatearFecha(obligacion.fecha_limite)}
            </strong>
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
        {/* REALIZADA */}
        {obligacion.activa && !obligacion.cumplida && (
          <button
            className="btn-realizada"
            onClick={() => onRealizada(obligacion.id)}
          >
            <Check size={18} />
            Realizada
          </button>
        )}

        {/* EDITAR */}
        <button
          className="btn-icono-accion btn-editar"
          onClick={() => onEditar(obligacion)}
          title="Editar obligación"
          aria-label="Editar obligación"
        >
          <Edit size={18} />
        </button>

        {/* ACTIVAR / DESACTIVAR */}
        <button
          className={`btn-icono-accion ${
            obligacion.activa
              ? "btn-desactivar"
              : "btn-activar"
          }`}
          onClick={() => onCambiarEstado(obligacion)}
          title={
            obligacion.activa
              ? "Desactivar obligación"
              : "Activar obligación"
          }
          aria-label={
            obligacion.activa
              ? "Desactivar obligación"
              : "Activar obligación"
          }
        >
          <Power size={18} />
        </button>

        {/* HISTORIAL */}
        <button
          className="btn-icono-accion btn-historial"
          onClick={() => onHistorial(obligacion)}
          title="Ver historial"
          aria-label="Ver historial"
        >
          <History size={18} />
        </button>

      </div>
    </article>
  );
}

export default TarjetaObligacion;