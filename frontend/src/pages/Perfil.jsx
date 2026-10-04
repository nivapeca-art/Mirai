import { useState } from "react";

import { User, Mail, MapPin, Coins, ShieldCheck, LockKeyhole, Eye, EyeOff, CheckCircle, AlertCircle} from "lucide-react";

import { cambiarPassword } from "../services/authServices";

import "../styles/perfil/perfil.css";

function Perfil() {
  const usuarioGuardado = localStorage.getItem("usuario");
  const usuario = usuarioGuardado ? JSON.parse(usuarioGuardado) : null;
  // Contraseña
  const [password, setPassword] = useState({
    password_actual: "",
    password_nueva: "",
    confirmar_password: "",
  });
  //Mostrar Contraseña
  const [mostrarPassword, setMostrarPassword] = useState({
    actual: false,
    nueva: false,
    confirmar: false,
  });
  //Mensaje
  const [mensaje, setMensaje] = useState({
    tipo: "",
    texto: "",
  });
  //Cargando
  const [cargando, setCargando] = useState(false);

  // CAMBIOS PASSWORD
  const cambiosPassword = (e) => {
    const { name, value } = e.target;
    setPassword({
      ...password,
      [name]: value,
    });
    setMensaje({
      tipo: "",
      texto: "",
    });
  };

  // MOSTRAR PASSWORD
  const alternarPassword = (campo) => {
    setMostrarPassword({
      ...mostrarPassword,
      [campo]: !mostrarPassword[campo],
    });
  };

  // CAMBIAR PASSWORD
  const manejoCambioPassword = async (e) => {
    e.preventDefault();
    setMensaje({
      tipo: "",
      texto: "",
    });
    // Comprobar campos vacíos
    if (
      !password.password_actual ||
      !password.password_nueva ||
      !password.confirmar_password
    ) {
      setMensaje({
        tipo: "error",
        texto: "Completa todos los campos.",
      });
      return;
    }
    // Comprobar longitud
    if (password.password_nueva.length < 8) {
      setMensaje({
        tipo: "error",
        texto: "La nueva contraseña debe tener al menos 8 caracteres.",
      });
      return;
    }
    // Comprobar mayúscula
    if (!/[A-Z]/.test(password.password_nueva)) {
      setMensaje({
        tipo: "error",
        texto: "La nueva contraseña debe contener al menos una mayúscula.",
      });
      return;
    }
    // Comprobar minúscula
    if (!/[a-z]/.test(password.password_nueva)) {
      setMensaje({
        tipo: "error",
        texto: "La nueva contraseña debe contener al menos una minúscula.",
      });
      return;
    }
    // Comprobar número
    if (!/[0-9]/.test(password.password_nueva)) {
      setMensaje({
        tipo: "error",
        texto: "La nueva contraseña debe contener al menos un número.",
      });
      return;
    }
    // Comprobar coincidencia
    if (password.password_nueva !== password.confirmar_password) {
      setMensaje({
        tipo: "error",
        texto: "Las contraseñas nuevas no coinciden.",
      });
      return;
    }
    setCargando(true);
    try {
      await cambiarPassword(password);
      setMensaje({
        tipo: "exito",
        texto: "La contraseña se ha cambiado correctamente.",
      });
      setPassword({
        password_actual: "",
        password_nueva: "",
        confirmar_password: "",
      });

    } catch (error) {
      console.error(error);
      if (error.response?.data) {
        const datos = error.response.data;
        if (typeof datos === "object") {
          const mensajes = Object.values(datos).flat().join(" ");
          setMensaje({
            tipo: "error",
            texto: mensajes,
          });
        } else {
          setMensaje({
            tipo: "error",
            texto: "No fue posible cambiar la contraseña.",
          });
        }
      } else {
        setMensaje({
          tipo: "error",
          texto: "No fue posible conectarse con el servidor.",
        });
      }

    } finally {
      setCargando(false);
    }
  };

  // DATOS MOSTRADOS
  const nombreCompleto = `${usuario?.first_name || ""} ${usuario?.last_name || ""}`.trim();
  const nombreMostrar = nombreCompleto || usuario?.username || "Usuario";
  const inicial =
    usuario?.first_name?.charAt(0).toUpperCase() ||
    usuario?.username?.charAt(0).toUpperCase() ||
    "U";
  const pais = usuario?.pais_detalle?.nombre || usuario?.pais_nombre || "No disponible";
  const moneda = usuario?.pais_detalle?.moneda;
  const monedaNombre = moneda?.nombre || "No disponible";
  const monedaCodigo = moneda?.codigo || "";
  const monedaSimbolo = moneda?.simbolo || "";

  return (
    <main className="perfil">
      {/* ENCABEZADO */}
      <header className="encabezado-perfil">
        <div className="titulo-perfil">
          <div className="icono-titulo-perfil">
            <User size={24} />
          </div>
          <div>
            <h1>Mi perfil</h1>
          </div>
        </div>
      </header>

      {/* INFORMACIÓN PERSONAL */}
      <section className="contenedor-perfil">
        {/* IDENTIDAD */}
        <div className="perfil-identidad">
          <div className="perfil-avatar-grande">{inicial}</div>
          <div className="perfil-identidad-datos">
            <h3>{nombreMostrar}</h3>
            <span>@{usuario?.username || "usuario"}</span>
          </div>
        </div>

        {/* DATOS */}
        <div className="grid-informacion-perfil">
          <div className="dato-perfil">
            <div className="icono-dato-perfil">
              <User size={18} />
            </div>
            <div>
              <span>Nombre</span>
              <strong>{usuario?.first_name || "No disponible"}</strong>
            </div>
          </div>

          <div className="dato-perfil">
            <div className="icono-dato-perfil">
              <User size={18} />
            </div>
            <div>
              <span>Apellidos</span>
              <strong>{usuario?.last_name || "No disponible"}</strong>
            </div>
          </div>

          <div className="dato-perfil">
            <div className="icono-dato-perfil">
              <Mail size={18} />
            </div>
            <div>
              <span>Correo electrónico</span>
              <strong>{usuario?.email || "No disponible"}</strong>
            </div>
          </div>

          <div className="dato-perfil">
            <div className="icono-dato-perfil">
              <MapPin size={18} />
            </div>
            <div>
              <span>País</span>
              <strong>{pais}</strong>
            </div>
          </div>

          <div className="dato-perfil">
            <div className="icono-dato-perfil">
              <Coins size={18} />
            </div>
            <div>
              <span>Moneda</span>
              <strong>{monedaNombre}</strong>
              {monedaCodigo && (
                <small>
                  {monedaCodigo} {monedaSimbolo}
                </small>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* SEGURIDAD */}
      <section className="contenedor-perfil seguridad-perfil">
        <div className="cabecera-perfil">
          <div className="icono-seguridad-perfil">
            <ShieldCheck size={21} />
          </div>
          <div>
            <h2>Seguridad</h2>
            <p>
              Mantén segura tu cuenta actualizando periódicamente tu contraseña.
            </p>
          </div>
        </div>

        {/* FORMULARIO PASSWORD */}
        <form className="formulario-password" onSubmit={manejoCambioPassword}>
          <div className="titulo-password">
            <LockKeyhole size={18} />
            <div>
              <strong>Cambiar contraseña</strong>
              <span>Introduce tu contraseña actual y establece una nueva.</span>
            </div>
          </div>

          {/* CONTRASEÑA ACTUAL */}
          <div className="campo-password">
            <label htmlFor="password_actual">Contraseña actual</label>
            <div className="input-password">
              <input
                id="password_actual"
                name="password_actual"
                type={mostrarPassword.actual ? "text" : "password"}
                value={password.password_actual}
                onChange={cambiosPassword}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => alternarPassword("actual")}
                aria-label={
                  mostrarPassword.actual
                    ? "Ocultar contraseña"
                    : "Mostrar contraseña"
                }
              >
                {mostrarPassword.actual ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>
          </div>

          {/* NUEVA CONTRASEÑA */}
          <div className="campo-password">
            <label htmlFor="password_nueva">Nueva contraseña</label>
            <div className="input-password">
              <input
                id="password_nueva"
                name="password_nueva"
                type={mostrarPassword.nueva ? "text" : "password"}
                value={password.password_nueva}
                onChange={cambiosPassword}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => alternarPassword("nueva")}
                aria-label={
                  mostrarPassword.nueva
                    ? "Ocultar contraseña"
                    : "Mostrar contraseña"
                }
              >
                {mostrarPassword.nueva ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>
          </div>

          {/* CONFIRMAR CONTRASEÑA */}
          <div className="campo-password">
            <label htmlFor="confirmar_password">
              Confirmar nueva contraseña
            </label>
            <div className="input-password">
              <input
                id="confirmar_password"
                name="confirmar_password"
                type={mostrarPassword.confirmar ? "text" : "password"}
                value={password.confirmar_password}
                onChange={cambiosPassword}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => alternarPassword("confirmar")}
                aria-label={
                  mostrarPassword.confirmar
                    ? "Ocultar contraseña"
                    : "Mostrar contraseña"
                }
              >
                {mostrarPassword.confirmar ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>
          </div>

          {/* REQUISITOS */}
          <div className="requisitos-password">
            <span>La nueva contraseña debe contener:</span>
            <ul>
              {/* 8 caracteres */}
              <li
                className={
                  password.password_nueva.length >= 8
                    ? "requisito-cumplido"
                    : ""
                }
              >
                {password.password_nueva.length >= 8 ? "✓" : "○"}
                Al menos 8 caracteres
              </li>
              {/* Mayúscula */}
              <li
                className={
                  /[A-Z]/.test(password.password_nueva)
                    ? "requisito-cumplido"
                    : ""
                }
              >
                {/[A-Z]/.test(password.password_nueva) ? "✓" : "○"}
                Una letra mayúscula
              </li>
              {/* Minúscula */}
              <li
                className={
                  /[a-z]/.test(password.password_nueva)
                    ? "requisito-cumplido"
                    : ""
                }
              >
                {/[a-z]/.test(password.password_nueva) ? "✓" : "○"}
                Una letra minúscula
              </li>
              {/* Número */}
              <li
                className={
                  /[0-9]/.test(password.password_nueva)
                    ? "requisito-cumplido"
                    : ""
                }
              >
                {/[0-9]/.test(password.password_nueva) ? "✓" : "○"}
                Un número
              </li>
            </ul>
          </div>

          {/* MENSAJE */}
          {mensaje.texto && (
            <div
              className={`mensaje-perfil ${
                mensaje.tipo === "exito"
                  ? "mensaje-perfil-exito"
                  : "mensaje-perfil-error"
              }`}
            >
              {mensaje.tipo === "exito" ? (
                <CheckCircle size={18} />
              ) : (
                <AlertCircle size={18} />
              )}
              <span>{mensaje.texto}</span>
            </div>
          )}

          {/* ACCIÓN */}
          <div className="acciones-password">
            <button
              type="submit"
              className="btn-cambiar-password"
              disabled={cargando}
            >
              {cargando ? (
                <>
                  <span className="spinner-perfil"></span>
                  Cambiando...
                </>
              ) : (
                <>
                  <LockKeyhole size={17} />
                  Cambiar contraseña
                </>
              )}
            </button>
          </div>
        </form>
        
      </section>
    </main>
  );
}

export default Perfil;
