import api from "./api";

// GET
export const obtenerMovimientos = async () => {
  const { data } = await api.get("movimientos/");
  return data;
};

// POST
export const crearMovimiento = async (movimiento) => {
  const { data } = await api.post("movimientos/", movimiento);
  return data;
};

// PATCH
export const actualizarMovimiento = async (id, movimiento) => {
  const { data } = await api.patch(`movimientos/${id}/`, movimiento);
  return data;
};

// DELETE
export const eliminarMovimiento = async (id) => {
  await api.delete(`movimientos/${id}/`);
};