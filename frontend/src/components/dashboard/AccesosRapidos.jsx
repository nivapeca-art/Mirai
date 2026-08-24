import { useState } from "react";

import { ArrowLeftRight, Target, Tag, CalendarPlus } from "lucide-react";

import ModalMeta from "../modales/ModalMeta";
import ModalMovimiento from "../modales/ModalMovimiento";
import ModalCategoria from "../modales/ModalCategoria";
import ModalObligacion from "../modales/ModalObligacion";

import "../../styles/modales/modales.css"

function AccesosRapidos({onGuardado}) {

  const [modal,setModal]=useState(null);
  const cerrarModal = () => {
    setModal(null);
  };

  return (
    <><section className="accesos-rapidos">
      <div className="seccion-titulo">
        <h2>Accesos rápidos</h2>
      </div>
      {/* BOTONES */}
      <div className="accesos-grid">
        {/* MOVIMIENTOS */}
        <button onClick={()=>setModal("movimiento")}>
          <ArrowLeftRight size={17} />
          <span>Movimiento</span>
        </button>
        {/* META */}
        <button onClick={()=>setModal("meta")}>
          <Target size={17} />
          <span>Meta</span>
        </button>
        {/* CATEGORÍA */}
        <button onClick={()=>setModal("categoria")}>
          <Tag size={17} />
          <span>Categoría</span>
        </button>
        {/* OBLIGACIÓN */}
        <button onClick={()=>setModal("obligacion")}>
          <CalendarPlus size={17} />
          <span>Obligación</span>
        </button>
      </div>
    </section>
    {/* MODALES */}
    {modal === "movimiento" && (
      <ModalMovimiento onCerrar={cerrarModal} onGuardado={onGuardado}/>
    )}
    {modal === "meta" && (
      <ModalMeta onCerrar={cerrarModal} onGuardado={onGuardado}/>
    )}
    {modal === "categoria" && (
      <ModalCategoria onCerrar={cerrarModal} onGuardado={onGuardado}/>
    )}
    {modal === "obligacion" && (
      <ModalObligacion onCerrar={cerrarModal} onGuardado={onGuardado}/>
    )}

    </>
  );
}

export default AccesosRapidos;
