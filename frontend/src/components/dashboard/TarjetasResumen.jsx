import { formatearMonto } from "../../utils/moneda";

function TarjetasResumen({ dashboard }) {
  const { moneda, ingresos, gastos, saldo, comparacion } = dashboard;

  const codigoMoneda = moneda?.codigo || "COP";

  const obtenerClaseAlteracion = (tipo, tendencia) => {
    if (tendencia === "IGUAL") {
      return "alteracion igual";
    }
    // AUMENTO EN INGRESO O AHORRO
    if (tipo === "ingresos" || tipo === "ahorros") {
      return tendencia === "AUMENTO"
        ? "alteracion positiva"
        : "alteracion negativa";
    }
    // DISMINUCIÓN EN GASTOS
    if (tipo === "gastos") {
      return tendencia === "DISMINUCION"
        ? "alteracion positiva"
        : "alteracion negativa";
    }
    // AUMENTO DEL SALDO
    if (tipo === "saldo") {
      return tendencia === "AUMENTO"
        ? "alteracion positiva"
        : "alteracion negativa";
    }
    return "alteracion";
  };

  return (
    <section className="tarjetas-resumen">
      {/* DISPONIBLE */}{" "}
      <div className="tarjeta-disponible">
        {" "}
        <p>Disponible</p>
        {/* Dinero */}
        <p className="valor">{formatearMonto(saldo, codigoMoneda)}</p>
        {/* Aumento o disminución */}
        <p
          className={obtenerClaseAlteracion(
            "saldo",
            comparacion.saldo.tendencia,
          )}
        >
          {comparacion.saldo.tendencia === "AUMENTO" && "↑"}
          {comparacion.saldo.tendencia === "DISMINUCION" && "↓"}
          {comparacion.saldo.porcentaje !== null &&
            ` ${comparacion.saldo.porcentaje}%`}
        </p>
        {/* Información */}
        <p className="mensaje">{comparacion.saldo.mensaje}</p>
      </div>
      {/* INGRESOS */}
      <div className="tarjeta-ingresos">
        <p>Ingresos</p>
        {/* Dinero */}
        <p className="valor">{formatearMonto(ingresos, codigoMoneda)}</p>
        {/* Aumento o disminución */}
        <p
          className={obtenerClaseAlteracion(
            "ingresos",
            comparacion.ingresos.tendencia,
          )}
        >
          {comparacion.ingresos.tendencia === "AUMENTO" && "↑"}
          {comparacion.ingresos.tendencia === "DISMINUCION" && "↓"}
          {comparacion.ingresos.porcentaje !== null &&
            ` ${comparacion.ingresos.porcentaje}%`}
        </p>
        {/* Información */}
        <p className="mensaje">{comparacion.ingresos.mensaje}</p>
      </div>
      {/* GASTOS */}
      <div className="tarjeta-gastos">
        <p>Gastos</p>
        {/* Dinero */}
        <p className="valor">{formatearMonto(gastos, codigoMoneda)}</p>
        {/* Aumento o disminución */}
        <p
          className={obtenerClaseAlteracion(
            "gastos",
            comparacion.gastos.tendencia,
          )}
        >
          {comparacion.gastos.tendencia === "AUMENTO" && "↑"}
          {comparacion.gastos.tendencia === "DISMINUCION" && "↓"}
          {comparacion.gastos.porcentaje !== null &&
            ` ${comparacion.gastos.porcentaje}%`}
        </p>
        {/* Información */}
        <p className="mensaje">{comparacion.gastos.mensaje}</p>
      </div>
    </section>
  );
}

export default TarjetasResumen;
