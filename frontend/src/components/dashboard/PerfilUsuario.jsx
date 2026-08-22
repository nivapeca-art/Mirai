import { useNavigate } from "react-router-dom";

function PerfilUsuario({ dashboard }) {
  const { usuario } = dashboard;
  const navegar = useNavigate();

  return (
    <section className="perfil-usuario" onClick={() => navegar("/perfil")} title="Ver Perfil">
      {/* AVATAR */}
      <div className="perfil-avatar">
        {usuario?.nombre ? usuario.nombre.charAt(0).toUpperCase() : "U"}
      </div>
      {/* NOMBRE O USERNAME */}
      <div className="perfil-datos">
        <h3>{usuario?.nombre || usuario?.username}</h3>
        <span>@{usuario?.username}</span>
        <span>Ver perfil</span>
      </div>
    </section>
  );
}

export default PerfilUsuario;
