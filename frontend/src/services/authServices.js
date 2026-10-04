import api from "./api";

export const registrarUsuario = async (datos) => {
  const response = await api.post("register/", datos);
  return response.data;
};

export const iniciarSesion = async (datos) => {
  const response = await api.post("login/", datos);
  return response.data;
};
 
export const cambiarPassword = async (datos) => {
  const response = await api.post("cambiar-password/", datos);
  return response.data;
};

export const solicitarRecuperacion = async (email) => {
  const response = await api.post("recuperar-password/", {
    email,
  });
  return response.data;
};

export const restablecerPassword = async (datos) => {
  const response = await api.post("restablecer-password/", datos);
  return response.data;
};