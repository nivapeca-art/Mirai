function SelectorReporte({
  opcion,
  seleccionado,
  onSeleccionar,
}) {
  const Icono = opcion.icono;

  return (
    <button
      type="button"
      className={`tarjeta-periodo ${
        seleccionado ? "tarjeta-periodo-seleccionada" : ""
      }`}
      onClick={onSeleccionar}
    >

      {/* ICONO */}

      <div className="icono-periodo">

        <Icono size={22} />

      </div>


      {/* CONTENIDO */}

      <div className="contenido-periodo">

        <h3>
          {opcion.titulo}
        </h3>

        <p>
          {opcion.descripcion}
        </p>

      </div>


      {/* INDICADOR */}

      <div
        className={`indicador-periodo ${
          seleccionado
            ? "indicador-seleccionado"
            : ""
        }`}
      >
        {seleccionado && (
          <span></span>
        )}
      </div>

    </button>
  );
}

export default SelectorReporte;