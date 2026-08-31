import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

function GraficaCategorias({ dashboard }) {

  const categorias = dashboard?.gastos_por_categoria || [];
  const moneda = dashboard?.moneda?.simbolo || "$";
  const datos = categorias.map((item) => ({
    nombre: item.categoria,
    valor: Number(item.total || 0),
  }));
  const total = datos.reduce((acumulado, item) => acumulado + item.valor, 0);

  const formatearValor = (valor) => {
    return `${moneda} ${Number(valor || 0).toLocaleString("es-CO")}`;
  };

  return (
    <div className="tarjeta-grafica">
      <div className="cabecera-grafica">
        <div>
          <h2>Gastos por categoría</h2>
          <p>Distribución de tus gastos</p>
        </div>
      </div>

      <div className="contenedor-categorias">
        {datos.length === 0 ? (
          <div className="grafica-sin-datos">
            <p>No hay gastos con categoría para mostrar.</p>
          </div>
        ) : (
          <>
            <div className="grafica-pastel">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={datos}
                    dataKey="valor"
                    nameKey="nombre"
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={2}
                  >
                    {datos.map((entry, index) => (
                      <Cell
                        key={`celda-${index}`}
                        fill={`hsl(${205 + index * 37}, 55%, ${
                          48 + (index % 3) * 8
                        }%)`}
                      />
                    ))}
                  </Pie>

                  <Tooltip
                    formatter={(valor) => formatearValor(valor)}
                    contentStyle={{
                      borderRadius: "10px",
                      border: "1px solid #e4e9ef",
                      boxShadow: "0 6px 18px rgba(35, 55, 80, 0.08)",
                    }}
                  />

                  <Legend />
                </PieChart>
              </ResponsiveContainer>

              <div className="centro-pastel">
                <span>Total</span>

                <strong>{formatearValor(total)}</strong>
              </div>
            </div>

            <div className="lista-categorias">
              {datos.map((categoria, index) => {
                const porcentaje =
                  total > 0 ? ((categoria.valor / total) * 100).toFixed(1) : 0;

                return (
                  <div className="item-categoria" key={categoria.nombre}>
                    <div className="nombre-categoria">
                      <span
                        className="punto-categoria"
                        style={{
                          background: `hsl(${205 + index * 37}, 55%, ${
                            48 + (index % 3) * 8
                          }%)`,
                        }}
                      />

                      <span>{categoria.nombre}</span>
                    </div>

                    <div className="valor-categoria">
                      <strong>{formatearValor(categoria.valor)}</strong>

                      <small>{porcentaje}%</small>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default GraficaCategorias;
