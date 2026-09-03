import { ArrowDownLeft, ArrowUpRight, PiggyBank } from "lucide-react";

import { obtenerMonedaUsuario, formatearMonto } from "../../utils/moneda";

function ResumenMovimientos({ movimientos }) {
  const moneda = obtenerMonedaUsuario();
  const codigoMoneda = moneda?.codigo || "COP";

  const ingresos = movimientos
    .filter((movimiento) => movimiento.tipo === "INGRESO")
    .reduce((total, movimiento) => total + Number(movimiento.monto || 0), 0);

  const gastos = movimientos
    .filter((movimiento) => movimiento.tipo === "GASTO")
    .reduce((total, movimiento) => total + Number(movimiento.monto || 0), 0);

  const ahorros = movimientos
    .filter((movimiento) => movimiento.tipo === "AHORRO")
    .reduce((total, movimiento) => total + Number(movimiento.monto || 0), 0);

  return (
    <div className="movimientos-resumen">
      {/* INGRESOS */}
      <div className="resumen-card ingreso">
        <div className="resumen-icono">
          <ArrowDownLeft size={20} />
        </div>

        <div>
          <span>Ingresos</span>

          <strong>{formatearMonto(ingresos, codigoMoneda)}</strong>
        </div>
      </div>

      {/* GASTOS */}
      <div className="resumen-card gasto">
        <div className="resumen-icono">
          <ArrowUpRight size={20} />
        </div>

        <div>
          <span>Gastos</span>

          <strong>{formatearMonto(gastos, codigoMoneda)}</strong>
        </div>
      </div>

      {/* AHORROS */}
      <div className="resumen-card ahorro">
        <div className="resumen-icono">
          <PiggyBank size={20} />
        </div>

        <div>
          <span>Ahorros</span>

          <strong>{formatearMonto(ahorros, codigoMoneda)}</strong>
        </div>
      </div>
    </div>
  );
}

export default ResumenMovimientos;
