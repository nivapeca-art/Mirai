import { Search } from "lucide-react";

function FiltrosMovimientos({
  busqueda,
  setBusqueda,
  tipo,
  setTipo,
  periodo,
  setPeriodo,
}) {

  return (
    <div className="movimientos-filtros">
      {/* BUSCADOR */}
      <div className="movimientos-buscador">
        <Search size={18} />
        <input
          type="text"
          placeholder="Buscar movimiento..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>
      {/* TIPO */}
      <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
        <option value="TODOS">Todos</option>
        <option value="INGRESO">Ingresos</option>
        <option value="GASTO">Gastos</option>
        <option value="AHORRO">Ahorros</option>
      </select>
      {/* PERIODO */}
      <select value={periodo} onChange={(e) => setPeriodo(e.target.value)}>
        <option value="TODOS">Todo el tiempo</option>
        <option value="7">Últimos 7 días</option>
        <option value="15">Últimos 15 días</option>
        <option value="MES">Este mes</option>
      </select>
    </div>
  );
  
}

export default FiltrosMovimientos;
