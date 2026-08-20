import api from "./api";

// GET
export const obtenerPais = async () => {
  const response = await api.get("paises/");
  return response.data;
}