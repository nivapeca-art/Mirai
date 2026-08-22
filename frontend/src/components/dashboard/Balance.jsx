import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

function Balance({ dashboard }) {

  const { balance, moneda } = dashboard;
  const simbolo = moneda?.simbolo || "$";
  const periodo = dashboard.periodo?.nombre;
  const esAnual = periodo === "Año actual";
  const esComparacion = periodo === "Mes vs mes anterior";

  // FORMATEAR MONEDA
  const formatearMoneda = (valor) => {
    return `${simbolo} ${Number(valor).toLocaleString("es-CO")}`;
  };

  // DATOS
  let datos = [];

  // MES VS MES ANTERIOR
  if (esComparacion) {
    datos = balance.map((item) => ({
      dia: item.dia,
      ingresosActual: item.actual.ingresos,
      gastosActual: item.actual.gastos,
      ahorrosActual: item.actual.ahorros,
      ingresosAnterior: item.anterior.ingresos,
      gastosAnterior: item.anterior.gastos,
      ahorrosAnterior: item.anterior.ahorros,
    }));
  }

  // MES ACTUAL / ANUAL
  else {
    datos = balance.map((item) => ({
      ...item,
      fechaFormateada: esAnual
        ? item.mes
        : (item.dia ?? new Date(item.fecha).getDate()),
    }));
  }

  // TEXTO DEL EJE X
  const etiquetaEjeX = esAnual ? "Mes" : "Día";

  return (
    <section className="balance">
      {/* HEADER */}
      <div className="balance-header">
        <div>
          <h2>Balance</h2>
          <p>
            {esComparacion
              ? "Comparación con el mes anterior"
              : esAnual
                ? "Ingresos, gastos y ahorros durante el año"
                : "Ingresos, gastos y ahorros durante el mes"}
          </p>
        </div>
        <span className="balance-periodo">{periodo}</span>
      </div>

      {/* GRÁFICA */}
      <div className="balance-grafica">
        <ResponsiveContainer width="100%" height={220}>
          {/* Margen de la grafíca */}
          <LineChart
            data={datos}
            margin={{
              top: 15,
              right: 20,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            {/* EJE X Números del mes de la grafíca y texto */}
            <XAxis
              dataKey={esComparacion ? "dia" : "fechaFormateada"}
              tickLine={false}
              axisLine={false}
              tick={{
                fontSize: 12,
              }}
              label={{
                value: etiquetaEjeX,
                position: "insideBottom",
                offset: -2,
                fontSize: 13,
              }}
            />
            {/* EJE Y Valores de precio */}
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{
                fontSize: 12,
              }}
              tickFormatter={(valor) =>
                `${simbolo}${Number(valor).toLocaleString("es-CO")}`
              }
            />

            {/* TOOLTIP */}
            <Tooltip
              contentStyle={{
                fontSize: "10px",
                padding: "6px 8px",
                borderRadius: "6px",
              }}
              itemStyle={{
                fontSize: "10px",
                padding: "1px 0",
              }}
              labelStyle={{
                fontSize: "10px",
                marginBottom: "3px",
              }}
              formatter={(valor, nombre) => {
                const nombres = {
                  ingresosActual: "Ingresos · Actual",
                  gastosActual: "Gastos · Actual",
                  ahorrosActual: "Ahorros · Actual",
                  ingresosAnterior: "Ingresos · Mes anterior",
                  gastosAnterior: "Gastos · Mes anterior",
                  ahorrosAnterior: "Ahorros · Mes anterior",
                };

                return [formatearMoneda(valor), nombres[nombre] || nombre];
              }}
              labelFormatter={(valor) => (esAnual ? valor : `Día ${valor}`)}
            />

            {/* LEYENDA */}
            <Legend
              wrapperStyle={{
                fontSize: "14px",
                marginTop: 20,
              }}
              iconSize={8}
              formatter={(valor) => {
                const nombres = {
                  ingresos: "Ingresos",
                  gastos: "Gastos",
                  ahorros: "Ahorros",
                  ingresosActual: "Ingresos · Actual",
                  gastosActual: "Gastos · Actual",
                  ahorrosActual: "Ahorros · Actual",
                  ingresosAnterior: "Ingresos · Anterior",
                  gastosAnterior: "Gastos · Anterior",
                  ahorrosAnterior: "Ahorros · Anterior",
                };

                return nombres[valor] || valor;
              }}
            />
            {/* -------------------------------- */}
            {/* MES VS MES ANTERIOR */}
            {/* -------------------------------- */}

            {esComparacion ? (
              <>
                {/* MES ANTERIOR */}
                {/* Ingresos */}
                <Line
                  type="monotone"
                  dataKey="ingresosAnterior"
                  name="ingresosAnterior"
                  stroke="#0092446a"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                  activeDot={{ r: 5 }}
                />
                {/* Gasto */}
                <Line
                  type="monotone"
                  dataKey="gastosAnterior"
                  name="gastosAnterior"
                  stroke="#c6282866"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                  activeDot={{ r: 5 }}
                />
                {/* Ahorro */}
                <Line
                  type="monotone"
                  dataKey="ahorrosAnterior"
                  name="ahorrosAnterior"
                  stroke="#f7ad1a6b"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                  activeDot={{ r: 5 }}
                />

                {/* MES ACTUAL */}
                {/* Ingreso */}
                <Line
                  type="monotone"
                  dataKey="ingresosActual"
                  name="ingresosActual"
                  stroke="#009245"
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 5 }}
                />
                {/* Gasto */}
                <Line
                  type="monotone"
                  dataKey="gastosActual"
                  name="gastosActual"
                  stroke="#c62828"
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 5 }}
                />
                {/* Ahorro */}
                <Line
                  type="monotone"
                  dataKey="ahorrosActual"
                  name="ahorrosActual"
                  stroke="#F7AD1A"
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 5 }}
                />
              </>
            ) : (
              /* -------------------------------- */
              /* MES / AÑO */
              /* -------------------------------- */
              <>
                {/* Ingreso */}
                <Line
                  type="monotone"
                  dataKey="ingresos"
                  name="ingresos"
                  stroke="#009245"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 5 }}
                />
                {/* Gasto */}
                <Line
                  type="monotone"
                  dataKey="gastos"
                  name="gastos"
                  stroke="#c62828"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 5 }}
                />
                {/* Ahorro */}
                <Line
                  type="monotone"
                  dataKey="ahorros"
                  name="ahorros"
                  stroke="#e0a800"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 5 }}
                />
              </>
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
  
}

export default Balance;
