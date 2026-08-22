import api from "./api";

// GET
export const obtenerObligaciones = async () => {
  const { data } = await api.get("obligaciones/");
  return data;
};

// POST
export const crearObligacion = async (obligacion) => {
  const { data } = await api.post("obligaciones/", obligacion);
  return data;
};

// PATCH
export const actualizarObligacion = async (id, obligacion) => {
  const { data } = await api.patch(`obligaciones/${id}/`, obligacion);
  return data;
};

// DELETE
export const eliminarObligacion = async (id) => {
  await api.delete(`obligaciones/${id}/`);
};

// MARCAR COMO CUMPLIDA
export const marcarObligacionCumplida = async (id, cumplida) => {
  const { data } = await api.patch(
    `obligaciones/${id}/`,
    {
      cumplida
    }
  );
  return data;
};