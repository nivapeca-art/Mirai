import MovimientoItem from "./MovimientoItem";

function ListaMovimientos({ movimientos, cargando}){

  if (cargando) {
    return (
      <div className="movimientos-estado">
        <p>Cargando movimientos...</p>
      </div>
    );
  }

  if (movimientos.length === 0) {
    return (
      <div className="movimientos-estado">
        <p>No se encontraron movimientos.</p>
      </div>
    );
  }

  return (
    <div className="movimientos-lista">
      {movimientos.map((movimiento) => (
        <MovimientoItem
          key={movimiento.id}
          movimiento={movimiento}
        />
      ))}
    </div>
  );
  
}

export default ListaMovimientos;