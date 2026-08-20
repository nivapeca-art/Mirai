// REACT
import { Link } from "react-router-dom";
// LIBRERIA
import { Eye, EyeOff, User, Lock, Mail, Globe } from "lucide-react";

function RegistroFormulario({
  registro,
  cambiosRegistro,
  manejoRegistro,
  mostrarContrasena,
  setMostrarContrasena,
  error,
  cargando,
  paises,
}) {
  const contrasena = registro.password;
  const requisitosContrasena = {
    longitud: contrasena.length >= 8,
    mayuscula: /[A-Z]/.test(contrasena),
    minuscula: /[a-z]/.test(contrasena),
    numero: /[0-9]/.test(contrasena),
  };

  return (
    <div className="formulario-container">

      <form className="formulario" onSubmit={manejoRegistro}>
        {/* NOMBRE */}
        <div className="campos">
          <User className="campo-icono" size={20} />
          <input
            id="first_name"
            name="first_name"
            type="text"
            value={registro.first_name}
            onChange={cambiosRegistro}
            placeholder=" "
            required
          />
          <label htmlFor="first_name">Nombre</label>
        </div>

        {/* APELLIDO */}
        <div className="campos">
          <User className="campo-icono" size={20} />
          <input
            id="last_name"
            name="last_name"
            type="text"
            value={registro.last_name}
            onChange={cambiosRegistro}
            placeholder=" "
            required
          />
          <label htmlFor="last_name">Apellido</label>
        </div>

        {/* USUARIO */}
        <div className="campos">
          <User className="campo-icono" size={20} />
          <input
            id="registro_username"
            name="username"
            type="text"
            value={registro.username}
            onChange={cambiosRegistro}
            placeholder=" "
            required
          />
          <label htmlFor="registro_username">Nombre de usuario</label>
        </div>

        {/* EMAIL */}
        <div className="campos">
          <Mail className="campo-icono" size={20} />
          <input
            id="email"
            name="email"
            type="email"
            value={registro.email}
            onChange={cambiosRegistro}
            placeholder=" "
            required
          />
          <label htmlFor="email">Correo electrónico</label>
        </div>

        {/* CONTRASEÑA */}
        <div className="campos">
          <Lock className="campo-icono" size={20} />
          <input
            id="registro_password"
            name="password"
            type={mostrarContrasena ? "text" : "password"}
            value={registro.password}
            onChange={cambiosRegistro}
            placeholder=" "
            minLength={8}
            required
          />
          <label htmlFor="registro_password">Contraseña</label>
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
        {registro.password && (
          <div className="requisitos-contrasena">
            <span>La contraseña debe contener:</span>

            <div className={requisitosContrasena.longitud ? "cumplido" : ""}>
              {requisitosContrasena.longitud ? "✓" : "○"}
              Al menos 8 caracteres
            </div>

            <div className={requisitosContrasena.mayuscula ? "cumplido" : ""}>
              {requisitosContrasena.mayuscula ? "✓" : "○"}
              Una mayúscula
            </div>

            <div className={requisitosContrasena.minuscula ? "cumplido" : ""}>
              {requisitosContrasena.minuscula ? "✓" : "○"}
              Una minúscula
            </div>

            <div className={requisitosContrasena.numero ? "cumplido" : ""}>
              {requisitosContrasena.numero ? "✓" : "○"}
              Un número
            </div>
          </div>
        )}

        {/* PAÍS */}
        <div className={`campos ${registro.pais ? "campo-seleccionado" : ""}`}>
          <Globe className="campo-icono" size={20} />
          <select
            name="pais"
            value={registro.pais}
            onChange={cambiosRegistro}
            required
          >
            <option value="" disabled hidden></option>
            {paises.map((pais) => (
              <option key={pais.id} value={pais.id}>
                {pais.nombre}
              </option>
            ))}
          </select>
          <label htmlFor="pais">Seleccione su país</label>
        </div>

        {/* ERROR */}
        {error && <div className="error">{error}</div>}

        {/* BOTÓN */}
        <button type="submit" className="boton" disabled={cargando}>
          {cargando ? "Creando cuenta..." : "Registrarme"}
        </button>
      </form>

      <div className="footer">
        <span>¿Ya tienes una cuenta?</span>
        <Link to="/login">Iniciar sesión</Link>
      </div>
    </div>
  );
}

export default RegistroFormulario;
