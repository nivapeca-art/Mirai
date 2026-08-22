// REACT
import { NavLink, useNavigate } from "react-router-dom";
// UTILIDADES
import obtenerUsuarios from "../utils/obtenerUsuario";
// ESTILOS
import "../styles/sidebar.css"
import { ArrowLeftRight, CalendarPlus, ChartColumn, FileText, LayoutDashboard, LogOut, Target } from "lucide-react";

function Sidebar() {
  // CONSTANTES
  const navegar = useNavigate();
  const usuario = obtenerUsuarios();

  // FUNCIONES
  const cerrarSesion = ()=>{
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("usuario");
    navegar("/login");
  };

  return(
    <aside className="sidebar">
      <nav>
        <NavLink
          to="/dashboard" className={({ isActive }) => isActive ? "activo" : "" }
        > <LayoutDashboard className="iconos-sidebar" size={20} /> <span>Dashboard</span>
        </NavLink>
        <NavLink
          to="/movimientos" className={({ isActive }) => isActive ? "activo" : "" }
        > <ArrowLeftRight className="iconos-sidebar" size={20}/> <span>Movimientos</span>
        </NavLink>
        <NavLink
          to="/metas" className={({ isActive }) => isActive ? "activo" : "" }
        > <Target className="iconos-sidebar" size={20} /> <span>Metas</span>
        </NavLink>
        <NavLink
          to="/obligacion" className={({ isActive }) => isActive ? "activo" : "" }
        > <CalendarPlus className="iconos-sidebar" size={20} /> <span>Obligación</span>
        </NavLink>
        <NavLink
          to="/graficas" className={({ isActive }) => isActive ? "activo" : "" }
        > <ChartColumn className="iconos-sidebar" size={20} /> <span>Grafícas</span>
        </NavLink>
        <NavLink
          to="/generarPDF" className={({ isActive }) => isActive ? "activo" : "" }
        > <FileText className="iconos-sidebar" size={20} /> <span>Reporte</span>
        </NavLink>
        <button onClick={cerrarSesion} className="logout"> <LogOut className="iconos-sidebar" size={20}/> <span>Salir</span> </button>

      </nav>

    </aside>
  )
}
export default Sidebar;