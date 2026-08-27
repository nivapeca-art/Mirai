import api from "./api";

// GET
export const obtenerMetas = async () => {
  const { data } = await api.get("metas/");
  return data;
};

// POST
export const crearMeta = async (meta) => {
  const { data } = await api.post("metas/", meta);
  return data;
};

// PATCH
export const actualizarMeta = async (id, meta) => {
  const { data } = await api.patch(`metas/${id}/`, meta);
  return data;
};

// DELETE
export const eliminarMeta = async (id) => {
  await api.delete(`metas/${id}/`);
};

export const crearAbono = async (abono) => {
  const { data } = await api.post(
    "movimientos/",
    {
      ...abono,
      tipo: "AHORRO"
    }
  );

  return data;
};