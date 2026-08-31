import {
  ArrowDown,
  ArrowUp,
  PiggyBank,
  Wallet,
} from "lucide-react";

function ResumenGraficas({ dashboard }) {
  const moneda = dashboard?.moneda?.simbolo || "$";

  const formatear = (valor) => {
    return `${moneda} ${Number(valor || 0).toLocaleString("es-CO")}`;
  };

  return (
    <div className="resumen-graficas">

      {/* INGRESOS */}

      <div className="tarjeta-resumen-grafica ingresos">

        <div className="icono-resumen-grafica">
          <ArrowUp size={21} />
        </div>

        <div className="contenido-resumen-grafica">

          <span>Ingresos</span>

          <strong>
            {formatear(dashboard.ingresos)}
          </strong>

        </div>

      </div>


      {/* GASTOS */}

      <div className="tarjeta-resumen-grafica gastos">

        <div className="icono-resumen-grafica">
          <ArrowDown size={21} />
        </div>

        <div className="contenido-resumen-grafica">

          <span>Gastos</span>

          <strong>
            {formatear(dashboard.gastos)}
          </strong>

        </div>

      </div>


      {/* AHORROS */}

      <div className="tarjeta-resumen-grafica ahorros">

        <div className="icono-resumen-grafica">
          <PiggyBank size={21} />
        </div>

        <div className="contenido-resumen-grafica">

          <span>Ahorros</span>

          <strong>
            {formatear(dashboard.ahorros)}
          </strong>

        </div>

      </div>


      {/* SALDO */}

      <div className="tarjeta-resumen-grafica saldo">

        <div className="icono-resumen-grafica">
          <Wallet size={21} />
        </div>

        <div className="contenido-resumen-grafica">

          <span>Disponible</span>

          <strong>
            {formatear(dashboard.saldo)}
          </strong>

        </div>

      </div>

    </div>
  );
}

export default ResumenGraficas;