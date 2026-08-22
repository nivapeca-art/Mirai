import api from "./api";

// GET DASHBOARD
export const obtenerDashboard = async (periodo = "mes") => {
  const { data } = await api.get("dashboard/", {
    params: {
      periodo,
    },
  });
  return data;
};