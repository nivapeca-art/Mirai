import { ArrowDownLeft, ArrowUpRight, PiggyBank } from "lucide-react";

function MovimientoItem({ movimiento }) {

  const formatearMoneda = (valor) => {
    return `$ ${Number(valor || 0).toLocaleString("es-CO")}`;
  };

  const obtenerInformacion = () => {
    if (movimiento.tipo === "INGRESO") {
      return {
        clase: "ingreso",
        icono: <ArrowDownLeft size={18} />,
        titulo: movimiento.categoria_detalle?.nombre || "Ingreso",
        signo: "+",
      };
    }

    if (movimiento.tipo === "GASTO") {
      return {
        clase: "gasto",
        icono: <ArrowUpRight size={18} />,
        titulo: movimiento.categoria_detalle?.nombre || "Gasto",
        signo: "-",
      };
    }

    return {
      clase: "ahorro",
      icono: <PiggyBank size={18} />,
      titulo: movimiento.meta_detalle?.nombre || "Ahorro",
      signo: "",
    };
  };

  const informacion = obtenerInformacion();

  return (
    <article className={`movimiento-item ${informacion.clase}`}>
      {/* ICONO */}
      <div className={`movimiento-icono ${informacion.clase}`}>
        {informacion.icono}
      </div>
      {/* INFORMACIÓN */}
      <div className="movimiento-info">
        <strong>{informacion.titulo}</strong>
        <span>
          {movimiento.descripcion || movimiento.tipo}
        </span>
      </div>
      {/* FECHA */}
      <span className="movimiento-fecha">
        {new Date(`${movimiento.fecha}T00:00:00`).toLocaleDateString(
          "es-CO",
          {
            day: "numeric",
            month: "short",
          }
        )}
      </span>
      {/* MONTO */}
      <strong className={`movimiento-monto ${informacion.clase}`}>
        {informacion.signo}
        {formatearMoneda(movimiento.monto)}
      </strong>
    </article>
  );
  
}

export default MovimientoItem;