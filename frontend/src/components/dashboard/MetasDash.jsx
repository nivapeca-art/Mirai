import { Goal } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { formatearFecha } from "../../utils/fecha";
import { formatearMonto } from "../../utils/moneda";

function MetasDash({ dashboard }) {
  const navigate = useNavigate();
  const { metas, moneda } = dashboard;

  // Las 3 metas con mayor progreso
  const metasDestacadas = [...metas]
    .sort((a, b) => b.progreso - a.progreso)
    .slice(0, 3);

  return (
    <section className="metas">
      <div className="metas-header">
        <div>
          <h2>Mis metas</h2>
          <p>Progreso de tus objetivos</p>
        </div>

        <button className="metas-ver-todas" onClick={() => navigate("/metas")}>
          Ver todas
        </button>
      </div>
      {/* Si no tiene metas */}
      {metas.length === 0 ? (
        <div className="metas-vacio">
          <div className="metas-vacio-icono">
            <Goal size={18} />
          </div>
          <h2>No tienes metas todavía.</h2>
          <p>
            Crea una meta para comenzar a organizar tus objetivos y hacer
            seguimiento a tus ahorros.
          </p>
          <button
            className="metas-vacio-boton"
            // {state: { abrirModal: true }} Para abrir el modal al dar click
            onClick={() => navigate("/metas", { state: { abrirModal: true } })}
          >
            Crear meta
          </button>
        </div>
      ) : (
        // Mostrar las metas que tiene
        <div className="metas-lista">
          {metasDestacadas.map((meta) => (
            <div className="meta-item" key={meta.id}>
              <div className="meta-superior">
                <div>
                  <h3>{meta.nombre}</h3>
                  <p>
                    {formatearMonto(meta.monto_actual, moneda.codigo)}
                    {" de "}
                    {formatearMonto(meta.monto_objetivo, moneda.codigo)}
                  </p>
                </div>
                <span className="meta-porcentaje">
                  {Number(meta.progreso).toFixed(0)}%
                </span>
              </div>
              {/* Barra */}
              <div className="meta-barra">
                <div
                  className="meta-barra-progreso"
                  style={{
                    width: `${meta.progreso}%`,
                  }}
                />
              </div>

              <div className="meta-inferior">
                <span>{meta.estado.replace("_", " ")}</span>
                <span>{formatearFecha(meta.fecha_limite)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default MetasDash;
