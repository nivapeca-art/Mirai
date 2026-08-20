import api from "./api";

// GET
export const registrarUsuario = async (datos) => {
  const response = await api.post("register/", datos);
  return response.data;
};
// POST
export const iniciarSesion = async (datos) => {
  const response = await api.post("login/", datos);
  return response.data;
};