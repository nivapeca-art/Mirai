import api from "./api";

export const generarReporte = async (periodo, mes = null) => {
  let url = `/dashboard/pdf/?periodo=${periodo}`;

  if (mes) {
    url += `&mes=${mes}`;
  }

  const respuesta = await api.get(url, {
    responseType: "blob",
  });

  return respuesta.data;
};