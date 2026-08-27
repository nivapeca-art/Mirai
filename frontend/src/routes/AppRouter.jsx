import {BrowserRouter,Route,Routes} from "react-router-dom"
import Autenticar from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import RutaProtegida from "./RutaProtegida";
import Layout from "../layout/Layout";
import Metas from "../pages/Metas";
import Movimientos from "../pages/Movimientos";
import Obligaciones from "../pages/Obligaciones";

function AppRouter (){
  return(
  <BrowserRouter>
    <Routes>
      {/* Rutas publicas */}
      <Route path="/login" element={<Autenticar/>}/>
      <Route path="/registro" element={<Autenticar/>}/>
      {/* Rutas privadas */}
       <Route element={<RutaProtegida />}>

        <Route element={<Layout/>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/movimientos" element={<Movimientos />} />
          <Route path="/metas" element={<Metas />} />
          <Route path="/obligaciones" element={<Obligaciones />} />
        </Route>
        
      </Route>

    </Routes>
  </BrowserRouter>
  )
}
export default AppRouter;