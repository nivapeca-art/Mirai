import Sidebar from "../components/Sidebar";
import { Outlet } from "react-router-dom";
import "../styles/layout.css"

function Layout() {
  return (
    <div className="layout">
      <Sidebar />
      <div className="contenido">
        {/* Las demás páginas se acomodan aquí */}
        <Outlet />
      </div>
    </div>
  );
}

export default Layout;
