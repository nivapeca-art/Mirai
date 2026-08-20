import { Navigate, Outlet } from "react-router-dom";

function RutaProtegida() {

  const token = localStorage.getItem("access_token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export default RutaProtegida;