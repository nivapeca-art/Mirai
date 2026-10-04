import {BrowserRouter,Route,Routes} from "react-router-dom"
import Autenticar from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import RutaProtegida from "./RutaProtegida";
import Layout from "../layout/Layout";
import Metas from "../pages/Metas";
import Movimientos from "../pages/Movimientos";
import Obligaciones from "../pages/Obligaciones";
import Graficas from "../pages/Graficas";
import Reporte from "../pages/Reporte";
import Perfil from "../pages/Perfil";
import RecuperarPassword from "../pages/RecuperarContrasena";
import RestablecerPassword from "../pages/RestablecerContrasena";


function AppRouter (){
  return(
  <BrowserRouter>
    <Routes>
      {/* Rutas publicas */}
      <Route path="/login" element={<Autenticar/>}/>
      <Route path="/registro" element={<Autenticar/>}/>
      <Route path="/recuperar-password" element={<RecuperarPassword />}/>
      <Route path="/restablecer-password/:uid/:token" element={<RestablecerPassword />}/>
      {/* Rutas privadas */}
       <Route element={<RutaProtegida />}>

        <Route element={<Layout/>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/movimientos" element={<Movimientos />} />
          <Route path="/metas" element={<Metas />} />
          <Route path="/graficas" element={<Graficas />} />
          <Route path="/obligaciones" element={<Obligaciones />} />
          <Route path="/reportesPDF" element={<Reporte/>}/>
          <Route path="/perfil" element={<Perfil />} />
        </Route>
        
      </Route>

    </Routes>
  </BrowserRouter>
  )
}
export default AppRouter;