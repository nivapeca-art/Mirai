import api from "./api";

export const obtenerProyeccionMeta = async (metaId) => {
  const response = await api.get(`/proyeccion/?meta=${metaId}`);
  return response.data;
};
