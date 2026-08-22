import { X } from "lucide-react";

function ModalBase({ titulo, children, onCerrar }) {

  return (
    <div className="modal" onClick={onCerrar}>
      <div className="modal-contenido" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{titulo}</h2>
          <button type="button" className="modal-cerrar" onClick={onCerrar}>
            <X size={20} />
          </button>
        </div>
        <div className="body">{children}</div>
      </div>
    </div>
  );
  
}

export default ModalBase;
