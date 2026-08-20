// REACT
import { Link } from "react-router-dom";
// LIBRERIA
import { Eye, EyeOff, User, Lock } from "lucide-react";

function LoginFormulario({
  login,
  cambiosLogin,
  manejoLogin,
  mostrarContrasena,
  setMostrarContrasena,
  error,
  cargando,
}) {
  return (
    <div className="formulario-container">
      <form className="formulario" onSubmit={manejoLogin}>

        {/* USUARIO O CORREO */}
        <div className="campos">
          <User className="campo-icono" size={20} />
          <input
            id="login"
            name="login"
            type="text"
            value={login.login}
            onChange={cambiosLogin}
            placeholder=" "
            required
          />
          <label htmlFor="login">Usuario o correo electrónico</label>
        </div>

        {/* CONTRASEÑA */}
        <div className="campos">
          <Lock className="campo-icono" size={20} />
          <input
            id="password"
            name="password"
            type={mostrarContrasena ? "text" : "password"}
            value={login.password}
            onChange={cambiosLogin}
            placeholder=" "
            required
          />
          <label htmlFor="password">Ingresa tu contraseña</label>

          <button
            type="button"
            className="icono-contrasena"
            onClick={() => setMostrarContrasena(!mostrarContrasena)}
            aria-label={
              mostrarContrasena ? "Ocultar contraseña" : "Mostrar contraseña"
            }
          >
            {mostrarContrasena ? <EyeOff size={19} /> : <Eye size={19} />}
          </button>
        </div>

        {/* ERROR */}

        {error && <div className="error">{error}</div>}

        {/* BOTÓN */}

        <button type="submit" className="boton" disabled={cargando}>
          {cargando ? "Iniciando sesión..." : "Ingresar"}
        </button>
      </form>

      <div className="footer">
        <span>¿No tienes una cuenta?</span>

        <Link to="/registro">Registrarme</Link>
      </div>
    </div>
  );
}

export default LoginFormulario;
