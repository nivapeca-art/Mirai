import api from "./api";

// GET
export const obtenerDashboard = async () => {
  const response = await api.get("dashboard/");
  return response.data;
};