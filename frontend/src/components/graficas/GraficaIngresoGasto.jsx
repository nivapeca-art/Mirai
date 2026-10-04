import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

import { formatearMonto } from "../../utils/moneda";

function GraficaIngresosGastos({ dashboard, periodo }) {
  const balance = dashboard?.balance || [];
  const codigoMoneda = dashboard?.moneda?.codigo || "COP";

  // PREPARAR DATOS
  let datos = [];

  if (periodo === "comparacion") {
    datos = balance.map((item) => ({
      nombre: `Día ${item.dia}`,
      ingresos: item.actual?.ingresos || 0,
      gastos: item.actual?.gastos || 0,
      ahorros: item.actual?.ahorros || 0,
    }));

  } else if (periodo === "anual") {
    datos = balance.map((item) => ({
      nombre: item.mes,
      ingresos: item.ingresos || 0,
      gastos: item.gastos || 0,
      ahorros: item.ahorros || 0,
    }));

  } else {
    datos = balance.map((item) => ({
      nombre: `Día ${item.dia}`,
      ingresos: item.ingresos || 0,
      gastos: item.gastos || 0,
      ahorros: item.ahorros || 0,
    }));
  }

  // FORMATEAR MONTO
  const formatearValor = (valor) => {
    return formatearMonto(valor || 0, codigoMoneda);
  };

  // TOOLTIP
  const tooltipFormatter = (valor) => {
    return formatearValor(valor);
  };

  return (
    <div className="tarjeta-grafica">
      <div className="cabecera-grafica">
        <div>
          <h2>Ingresos, gastos y ahorros</h2>
          <p>Comportamiento financiero durante el período</p>
        </div>
      </div>

      <div className="contenedor-grafica">
        {datos.length === 0 ? (
          <div className="grafica-sin-datos">
            <p>No hay movimientos para mostrar.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={datos}
              margin={{
                top: 10,
                right: 10,
                left: 10,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="nombre"
                tick={{
                  fontSize: 10,
                }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{
                  fontSize: 10,
                }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(valor) => Number(valor).toLocaleString("es-CO")}
              />

              <Tooltip
                formatter={tooltipFormatter}
                contentStyle={{
                  borderRadius: "10px",
                  border: "1px solid #e4e9ef",
                  boxShadow: "0 6px 18px rgba(35, 55, 80, 0.08)",
                }}
              />

              <Legend />

              <Bar
                dataKey="ingresos"
                name="Ingresos"
                fill="#2e8b57"
                radius={[5, 5, 0, 0]}
              />

              <Bar
                dataKey="gastos"
                name="Gastos"
                fill="#c62828"
                radius={[5, 5, 0, 0]}
              />

              <Bar
                dataKey="ahorros"
                name="Ahorros"
                fill="#3473ba"
                radius={[5, 5, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

export default GraficaIngresosGastos;
