import { useState } from "react";

import { TrendingUp, TrendingDown, Minus, Plus } from "lucide-react";

import ComparacionModal from "../modales/ModalComparacion";

import "../../styles/dashboard/comparacion.css";

function Comparacion({ dashboard }) {
  const [modalAbierto, setModalAbierto] = useState(false);
  const categoriasActuales = dashboard.gastos_por_categoria || [];
  const categoriasAnteriores = dashboard.gastos_por_categoria_anterior || [];
  const periodo = dashboard.periodo?.nombre;
  const moneda = dashboard.moneda?.simbolo || "$";
  const esComparacion = periodo === "Mes vs mes anterior";

  // FORMATEAR MONEDA
  const formatearMoneda = (valor) => {
    return `${moneda} ${Number(valor || 0).toLocaleString("es-CO")}`;
  };

  // TOTAL ACTUAL
  const totalGastosActuales = categoriasActuales.reduce(
    (total, categoria) => total + Number(categoria.total || 0),
    0,
  );

  // TOTAL ANTERIOR
  const totalGastosAnteriores = categoriasAnteriores.reduce(
    (total, categoria) => total + Number(categoria.total || 0),
    0,
  );

  // BUSCAR CATEGORÍA ANTERIOR
  const obtenerCategoriaAnterior = (categoriaId) => {
    return categoriasAnteriores.find(
      (categoria) => categoria.categoria_id === categoriaId,
    );
  };

  // CREAR LISTA COMBINADA
  const obtenerCategoriasComparacion = () => {
    const categorias = [...categoriasActuales];
    categoriasAnteriores.forEach((categoriaAnterior) => {
      const existe = categorias.some(
        (categoriaActual) =>
          categoriaActual.categoria_id === categoriaAnterior.categoria_id,
      );

      if (!existe) {
        categorias.push({
          ...categoriaAnterior,
          total: 0,
        });
      }
    });
    // Ordenar por el mayor gasto entre ambos meses
    categorias.sort((a, b) => {
      const anteriorA = obtenerCategoriaAnterior(a.categoria_id)?.total || 0;
      const anteriorB = obtenerCategoriaAnterior(b.categoria_id)?.total || 0;
      const mayorA = Math.max(Number(a.total || 0), Number(anteriorA));
      const mayorB = Math.max(Number(b.total || 0), Number(anteriorB));
      return mayorB - mayorA;
    });
    return categorias;
  };
  // CATEGORÍAS
  const categorias = esComparacion
    ? obtenerCategoriasComparacion()
    : [...categoriasActuales].sort((a, b) => Number(b.total) - Number(a.total));

  // CALCULAR VARIACIÓN
  const calcularVariacion = (actual, anterior) => {
    actual = Number(actual || 0);
    anterior = Number(anterior || 0);

    if (anterior === 0) {
      if (actual > 0) {
        return {
          porcentaje: null,
          tipo: "nuevo",
        };
      }

      return {
        porcentaje: 0,
        tipo: "igual",
      };
    }

    const variacion = ((actual - anterior) / anterior) * 100;

    if (variacion > 0) {
      return {
        porcentaje: Math.abs(variacion),
        tipo: "sube",
      };
    }

    if (variacion < 0) {
      return {
        porcentaje: Math.abs(variacion),
        tipo: "baja",
      };
    }

    return {
      porcentaje: 0,
      tipo: "igual",
    };
  };

  // MENSAJE
  const obtenerMensaje = (actual, anterior) => {
    const variacion = calcularVariacion(actual, anterior);

    if (variacion.tipo === "nuevo") {
      return {
        tipo: "nuevo",
        icono: <Plus size={14} />,
        texto: "Nueva categoría este mes",
      };
    }

    if (variacion.tipo === "sube") {
      return {
        tipo: "sube",
        icono: <TrendingUp size={14} />,
        texto: `Has gastado ${variacion.porcentaje.toFixed(
          1,
        )}% más que el mes anterior`,
      };
    }

    if (variacion.tipo === "baja") {
      return {
        tipo: "baja",
        icono: <TrendingDown size={14} />,
        texto: `Has gastado ${variacion.porcentaje.toFixed(
          1,
        )}% menos que el mes anterior`,
      };
    }

    return {
      tipo: "igual",
      icono: <Minus size={14} />,
      texto: "Has gastado lo mismo que el mes anterior",
    };
  };

  // PORCENTAJE DE DISTRIBUCIÓN
  const obtenerPorcentaje = (total) => {
    if (totalGastosActuales === 0) {
      return 0;
    }

    return (Number(total || 0) / totalGastosActuales) * 100;
  };

  // VARIACIÓN TOTAL
  const variacionTotal = calcularVariacion(
    totalGastosActuales,
    totalGastosAnteriores,
  );

  return (
    <>
      <section className="comparacion">
        {/* HEADER */}
        <div className="comparacion-header">
          <div>
            <h2>Gastos por categoría</h2>
            <p>
              {esComparacion
                ? "Comparación con el mes anterior"
                : periodo === "Año actual"
                  ? "Distribución de gastos del año"
                  : "Distribución de gastos del mes"}
            </p>
          </div>
          <span className="comparacion-periodo">{periodo}</span>
        </div>

        {/* SIN GASTOS */}
        {categorias.length === 0 ? (
          <div className="comparacion-vacia">
            <p>No hay gastos registrados en este período.</p>
          </div>
        ) : (
          <div className="categorias-lista">
            {categorias.slice(0, 3).map((categoria) => {
              const categoriaAnterior = obtenerCategoriaAnterior(
                categoria.categoria_id,
              );
              const actual = Number(categoria.total || 0);
              const anterior = Number(categoriaAnterior?.total || 0);
              // COMPARACIÓN
              if (esComparacion) {
                const mayorValor = Math.max(actual, anterior, 1);
                const porcentajeActual = (actual / mayorValor) * 100;
                const porcentajeAnterior = (anterior / mayorValor) * 100;
                const mensaje = obtenerMensaje(actual, anterior);

                return (
                  <div
                    className="categoria-item comparacion-item"
                    key={categoria.categoria_id}
                  >
                    {/* INFORMACIÓN */}
                    <div className="categoria-info">
                      <span className="categoria-nombre">
                        {categoria.categoria}
                      </span>
                    </div>

                    {/* ANTERIOR */}
                    <div className="barra-comparacion">
                      <div className="barra-label">
                        Mes anterior:{" "}
                        <strong>{formatearMoneda(anterior)}</strong> 
                      </div>
                      <div className="barra-fondo">
                        <div
                          className="barra-anterior"
                          style={{
                            width: `${porcentajeAnterior}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* ACTUAL */}
                    <div className="barra-comparacion">
                      <div className="barra-label">
                        Este mes: <strong>{formatearMoneda(actual)}</strong>
                      </div>

                      <div className="barra-fondo">
                        <div
                          className="barra-actual"
                          style={{
                            width: `${porcentajeActual}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* MENSAJE */}
                    <div className={`categoria-mensaje ${mensaje.tipo}`}>
                      {mensaje.icono}

                      <span>{mensaje.texto}</span>
                    </div>
                  </div>
                );
              }
              // MES / AÑO
              const porcentaje = obtenerPorcentaje(actual);

              return (
                <div className="categoria-item" key={categoria.categoria_id}>
                  <div className="categoria-info">
                    <span className="categoria-nombre">
                      {categoria.categoria}
                    </span>
                    {/* Monto */}
                    <span className="categoria-monto">
                      {formatearMoneda(actual)}
                    </span>
                  </div>
                  {/* Barra */}
                  <div className="categoria-barra">
                    <div
                      className="categoria-barra-progreso"
                      style={{
                        width: `${porcentaje}%`,
                      }}
                    />
                  </div>
                  {/* footer */}
                  <div className="categoria-footer">
                    <span>{porcentaje.toFixed(1)}% de tus gastos</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TOTAL */}
        {categoriasActuales.length > 0 && (
          <div className="comparacion-total">
            <div className="total-info">
              <span>
                {esComparacion ? "Gastos este mes" : "Total de gastos"}
              </span>
              {/* Total gasto actual */}
              <strong>{formatearMoneda(totalGastosActuales)}</strong>
            </div>
            {esComparacion && (
              <div className={`total-variacion ${variacionTotal.tipo}`}>
                {variacionTotal.tipo === "sube" && <TrendingUp size={15} />}
                {variacionTotal.tipo === "baja" && <TrendingDown size={15} />}
                {variacionTotal.tipo === "igual" && <Minus size={15} />}
                {variacionTotal.tipo === "nuevo" && <Plus size={15} />}
                <span>
                  {variacionTotal.tipo === "nuevo"
                    ? "Sin gastos el mes anterior"
                    : variacionTotal.tipo === "igual"
                      ? "Mismo gasto que el mes anterior"
                      : `${variacionTotal.porcentaje.toFixed(1)}% ${
                          variacionTotal.tipo === "sube" ? "más" : "menos"
                        } que el mes anterior`}
                </span>
              </div>
            )}
          </div>
        )}

        {/* VER TODAS */}
        {categorias.length > 3 && (
          <button
            className="comparacion-ver-todas"
            onClick={() => setModalAbierto(true)}
          >
            Ver todas
            <span>→</span>
          </button>
        )}
      </section>

      {/* MODAL */}
      {modalAbierto && (
        <ComparacionModal
          dashboard={dashboard}
          categorias={categorias}
          formatearMoneda={formatearMoneda}
          obtenerCategoriaAnterior={obtenerCategoriaAnterior}
          obtenerMensaje={obtenerMensaje}
          onClose={() => setModalAbierto(false)}
        />
      )}
    </>
  );
  
}

export default Comparacion;
