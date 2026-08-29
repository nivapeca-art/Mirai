import { ClipboardList, CircleCheck, Clock, Power } from "lucide-react";

function ResumenObligaciones({ total, activas, pendientes, realizadas, filtro, onFiltro }) {

  return (
    <div className="resumen-obligaciones">
      {/* TOTAL */}
      <button
        type="button"
        className={`tarjeta-resumen ${
          filtro === "total" ? "activa" : ""
        }`}
        onClick={() => onFiltro("total")}
      >
        <div className="icono-resumen">
          <ClipboardList size={22} />
        </div>
        <div>
          <span>Total</span>
          <strong>{total}</strong>
        </div>
      </button>
      {/* PENDIENTES */}
      <button
        type="button"
        className={`tarjeta-resumen ${
          filtro === "pendientes" ? "activa" : ""
        }`}
        onClick={() => onFiltro("pendientes")}
      >
        <div className="icono-resumen">
          <Clock size={22} />
        </div>
        <div>
          <span>Pendientes</span>
          <strong>{pendientes}</strong>
        </div>
      </button>
      {/* REALIZADAS */}
      <button
        type="button"
        className={`tarjeta-resumen ${
          filtro === "realizadas" ? "activa" : ""
        }`}
        onClick={() => onFiltro("realizadas")}
      >
        <div className="icono-resumen">
          <CircleCheck size={22} />
        </div>
        <div>
          <span>Realizadas</span>
          <strong>{realizadas}</strong>
        </div>
      </button>
      {/* ACTIVAS */}
      <button
        type="button"
        className={`tarjeta-resumen ${
          filtro === "activas" ? "activa" : ""
        }`}
        onClick={() => onFiltro("activas")}
      >
        <div className="icono-resumen">
          <Power size={22} />
        </div>
        <div>
          <span>Activas</span>
          <strong>{activas}</strong>
        </div>
      </button>
    </div>
  );
  
}

export default ResumenObligaciones;
