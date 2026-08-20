import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import obtenerUsuarios from "../utils/obtenerUsuario";

function Dashboard(){
  const navegar = useNavigate();
  const usuario = obtenerUsuarios();

  const cerrarSesion = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("usuario");
    navegar("/login");
  };
  return(
    <main>
      <h1>Dashboard</h1>
      {usuario && (
        <h2>
          Bienvenido, {usuario.username || usuario.first_name}
        </h2>
      )}
      <button onClick={cerrarSesion} className="logout"><LogOut size={20} /><span>Salir</span></button>
    </main>
  );
}
export default Dashboard;