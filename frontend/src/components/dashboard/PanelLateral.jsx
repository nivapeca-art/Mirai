import PerfilUsuario from "./PerfilUsuario";
import AccesosRapidos from "./AccesosRapidos";
import Calendario from "./Calendario";
import Obligaciones from "./Obligaciones";

import "../../styles/dashboard/panelLaterla.css"

function PanelLateral({ dashboard,onGuardado }) {
  return (
    <aside className="panel-lateral">
      <PerfilUsuario dashboard={dashboard} />
      <AccesosRapidos onGuardado={onGuardado}/>
      <Calendario dashboard={dashboard} onGuardado={onGuardado} />
      <Obligaciones dashboard={dashboard} onGuardado={onGuardado}/>
    </aside>
  );
}

export default PanelLateral;
