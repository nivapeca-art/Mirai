import { X } from "lucide-react";

import { formatearMonto } from "../../utils/moneda";

import "../../styles/modales/modalComparacion.css";

function ComparacionModal({
  dashboard,
  categorias,
  obtenerCategoriaAnterior,
  obtenerMensaje,
  onClose,
}) {
  const periodo = dashboard.periodo?.nombre;
  const esComparacion = periodo === "Mes vs mes anterior";
  const codigoMoneda = dashboard?.moneda?.codigo || "COP";

  const formatearMoneda = (valor) => {
    return formatearMonto(
      valor || 0,
      codigoMoneda
    );
  };

  return (
    <div className="comparacion-modal-overlay" onClick={onClose}>
      <div className="comparacion-modal" onClick={(e) => e.stopPropagation()}>
        {/* HEADER */}
        <div className="comparacion-modal-header">
          <div>
            <h2>Gastos por categoría</h2>
            <p>
              {esComparacion
                ? "Comparación con el mes anterior"
                : "Todas tus categorías"}
            </p>
          </div>

          <button
            className="comparacion-modal-cerrar"
            onClick={onClose}
            aria-label="Cerrar"
          >
            <X size={20} />
          </button>
        </div>

        {/* CONTENIDO */}
        <div className="comparacion-modal-contenido">
          {categorias.map((categoria) => {
            const anterior = obtenerCategoriaAnterior(categoria.categoria_id);
            const actual = Number(categoria.total || 0);
            const gastoAnterior = Number(anterior?.total || 0);
            const mayorValor = Math.max(actual, gastoAnterior, 1);
            const porcentajeActual = (actual / mayorValor) * 100;
            const porcentajeAnterior = (gastoAnterior / mayorValor) * 100;
            const mensaje = obtenerMensaje(actual, gastoAnterior);

            return (
              <div className="modal-categoria" key={categoria.categoria_id}>
                {/* NOMBRE Y VALORES */}
                <div className="modal-categoria-info">
                  <span className="modal-categoria-nombre">
                    {categoria.categoria}
                  </span>

                  <div className="modal-categoria-valores">
                    <span className="valor-actual">
                      Este mes: <strong>{formatearMoneda(actual)}</strong>
                    </span>

                    <span className="valor-anterior">
                      Mes anterior:{" "}
                      <strong>{formatearMoneda(gastoAnterior)}</strong>
                    </span>
                  </div>
                </div>

                {/* MES ANTERIOR */}
                <div className="barra-comparacion">
                  <div className="barra-label">
                    <span>Mes anterior</span>
                    <strong>{formatearMoneda(gastoAnterior)}</strong>
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

                {/* MES ACTUAL */}
                <div className="barra-comparacion">
                  <div className="barra-label">
                    <span>Este mes</span>
                    <strong>{formatearMoneda(actual)}</strong>
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
          })}
        </div>
      </div>
    </div>
  );
}

export default ComparacionModal;
