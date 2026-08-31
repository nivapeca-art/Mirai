import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

function GraficaBalance({ dashboard, periodo }) {
  
  const balance = dashboard?.balance || [];
  const moneda = dashboard?.moneda?.simbolo || "$";

  let datos = [];
  if (periodo === "anual") {
    datos = balance.map((item) => ({
      nombre: item.mes,
      saldo: item.saldo || 0,
    }));

  } else if (periodo === "comparacion") {
    datos = balance.map((item) => {
      const ingresos = item.actual?.ingresos || 0;
      const gastos = item.actual?.gastos || 0;
      const ahorros = item.actual?.ahorros || 0;
      return {
        nombre: `Día ${item.dia}`,
        saldo: ingresos - gastos - ahorros,
      };
    });

  } else {
    datos = balance.map((item) => ({
      nombre: `Día ${item.dia}`,
      saldo: item.saldo || 0,
    }));
  }

  const formatearValor = (valor) => {
    return `${moneda} ${Number(valor || 0).toLocaleString("es-CO")}`;
  };

  return (
    <div className="tarjeta-grafica grafica-balance">
      <div className="cabecera-grafica">
        <div>
          <h2>Balance financiero</h2>
          <p>Evolución del saldo durante el período</p>
        </div>
      </div>
      <div className="contenedor-grafica balance">
        {datos.length === 0 ? (
          <div className="grafica-sin-datos">
            <p>No hay datos para mostrar.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={datos}
              margin={{
                top: 10,
                right: 20,
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
                formatter={(valor) => formatearValor(valor)}
                contentStyle={{
                  borderRadius: "10px",
                  border: "1px solid #e4e9ef",
                  boxShadow: "0 6px 18px rgba(35, 55, 80, 0.08)",
                }}
              />

              <Line
                type="monotone"
                dataKey="saldo"
                name="Saldo"
                stroke="#3f80c9"
                strokeWidth={3}
                dot={{
                  r: 3,
                }}
                activeDot={{
                  r: 6,
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
  
}

export default GraficaBalance;
