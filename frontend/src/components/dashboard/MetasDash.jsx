import { useNavigate } from "react-router-dom";

function MetasDash({ dashboard }) {
  const navigate = useNavigate();
  const { metas, moneda } = dashboard;
  const simbolo = moneda?.simbolo || "$";
  // FORMATEAR MONTO
  const formatearMonto = (monto) => {
    return `${simbolo} ${Number(monto).toLocaleString("es-CO")}`;
  };
  // FORMATEAR FECHA
  const formatearFecha = (fecha) => {
    if (!fecha) return "Sin fecha límite";
    const fechaLocal = new Date(`${fecha}T00:00:00`);
    return fechaLocal.toLocaleDateString("es-CO", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };
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

        <button
          className="metas-ver-todas"
          onClick={() => navigate("/metas")}
        >
          Ver todas
        </button>

      </div>
      {/* Si no tiene metas */}
      {metas.length === 0 ? (
        <div className="metas-vacio">
          <p>No tienes metas registradas.</p>
          <button
            className="metas-crear"
            onClick={() => navigate("/metas")}
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
                    {formatearMonto(meta.monto_actual)}
                    {" de "}
                    {formatearMonto(meta.monto_objetivo)}
                  </p>
                </div>
                <span className="meta-porcentaje">
                  {meta.progreso}%
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
                <span>
                  {formatearFecha(meta.fecha_limite)}
                </span>

              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default MetasDash;