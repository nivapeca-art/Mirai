import api from "./api";

// GET
export const obtenerCategorias = async () => {
  const { data } = await api.get("categorias/");
  return data;
};

// POST
export const crearCategoria = async (categoria) => {
  const { data } = await api.post("categorias/", categoria);
  return data;
};

// PATCH
export const actualizarCategoria = async (id, categoria) => {
  const { data } = await api.patch(`categorias/${id}/`, categoria);
  return data;
};

// DELETE
export const eliminarCategoria = async (id) => {
  await api.delete(`categorias/${id}/`);
};