import {BrowserRouter,Route,Routes} from "react-router-dom"
import Autenticar from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import RutaProtegida from "./RutaProtegida";

function AppRouter (){
  return(
  <BrowserRouter>
    <Routes>
      {/* Rutas publicas */}
      <Route path="/login" element={<Autenticar/>}/>
      <Route path="/registro" element={<Autenticar/>}/>
      {/* Rutas privadas */}
       <Route element={<RutaProtegida />}>
        <Route path="/dashboard" element={<Dashboard />} />
      </Route>

    </Routes>
  </BrowserRouter>
  )
}
export default AppRouter;