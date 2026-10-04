import { useState } from "react";

import { Link, useNavigate, useParams } from "react-router-dom";

import { LockKeyhole, Eye, EyeOff, CheckCircle, ArrowLeft, ShieldCheck} from "lucide-react";

import { restablecerPassword } from "../services/authServices";

import "../styles/restablecerContrasena.css";

function RestablecerPassword() {
  const { uid, token } = useParams();
  const navegar = useNavigate();

  const [password, setPassword] = useState({
    password_nueva: "",
    confirmar_password: "",
  });

  const [mostrarPassword, setMostrarPassword] = useState({
    nueva: false,
    confirmar: false,
  });

  const [mensaje, setMensaje] = useState({
    tipo: "",
    texto: "",
  });

  const [cargando, setCargando] = useState(false);
  const [restablecido, setRestablecido] = useState(false);

  const cambiarPassword = (campo, valor) => {
    setPassword((previo) => ({
      ...previo,
      [campo]: valor,
    }));
    setMensaje({
      tipo: "",
      texto: "",
    });
  };

  const alternarPassword = (campo) => {
    setMostrarPassword((previo) => ({
      ...previo,
      [campo]: !previo[campo],
    }));
  };
  // Coincidencia al escribir las contraseñas
  const contrasenasCoinciden =
    password.confirmar_password.length > 0 &&
    password.password_nueva === password.confirmar_password;

  const manejarRestablecimiento = async (e) => {
    e.preventDefault();
    setMensaje({
      tipo: "",
      texto: "",
    });
    const passwordNueva = password.password_nueva;
    const confirmarPassword = password.confirmar_password;
    if (!passwordNueva || !confirmarPassword) {
      setMensaje({
        tipo: "error",
        texto: "Completa todos los campos.",
      });
      return;
    }
    // 8 caracteres
    if (passwordNueva.length < 8) {
      setMensaje({
        tipo: "error",
        texto: "La contraseña debe tener al menos 8 caracteres.",
      });
      return;
    }
    // Mayúscula
    if (!/[A-Z]/.test(passwordNueva)) {
      setMensaje({
        tipo: "error",
        texto: "La contraseña debe contener una letra mayúscula.",
      });
      return;
    }
    // Minúscula
    if (!/[a-z]/.test(passwordNueva)) {
      setMensaje({
        tipo: "error",
        texto: "La contraseña debe contener una letra minúscula.",
      });
      return;
    }
    // Número
    if (!/[0-9]/.test(passwordNueva)) {
      setMensaje({
        tipo: "error",
        texto: "La contraseña debe contener un número.",
      });
      return;
    }
    //Contraseñas no coincides
    if (passwordNueva !== confirmarPassword) {
      setMensaje({
        tipo: "error",
        texto: "Las contraseñas nuevas no coinciden.",
      });
      return;
    }

    try {
      setCargando(true);
      console.log("UID:", uid);
      console.log("TOKEN:", token);
      const respuesta = await restablecerPassword({
        uid,
        token,
        password_nueva: passwordNueva,
        confirmar_password: confirmarPassword,
      });
      setMensaje({
        tipo: "exito",
        texto: respuesta.detail,
      });
      setRestablecido(true);
      setPassword({
        password_nueva: "",
        confirmar_password: "",
      });

    } catch (error) {
      const datos = error.response?.data;
      console.log("ERROR COMPLETO:", datos);
      let texto = "No se pudo restablecer la contraseña.";
      if (datos) {
        if (datos.token) {
          texto = Array.isArray(datos.token) ? datos.token[0] : datos.token;
        } else if (datos.confirmar_password) {
          texto = Array.isArray(datos.confirmar_password)
            ? datos.confirmar_password[0]
            : datos.confirmar_password;
        } else if (datos.password_nueva) {
          texto = Array.isArray(datos.password_nueva)
            ? datos.password_nueva[0]
            : datos.password_nueva;
        } else if (datos.non_field_errors) {
          texto = Array.isArray(datos.non_field_errors)
            ? datos.non_field_errors[0]
            : datos.non_field_errors;
        } else if (datos.detail) {
          texto = datos.detail;
        }
      }
      setMensaje({
        tipo: "error",
        texto,
      });

    } finally {
      setCargando(false);
    }
  };

  return (
    <main className="restablecer-password">
      <section className="restablecer-card">
        {!restablecido ? (
          <>
            <div className="restablecer-icono">
              <LockKeyhole size={28} />
            </div>
            <h1>Restablecer contraseña</h1>
            <p className="restablecer-descripcion">
              Crea una nueva contraseña para volver a acceder a tu cuenta de
              Mirai.
            </p>

            <form onSubmit={manejarRestablecimiento}>
              {/* NUEVA CONTRASEÑA */}
              <label htmlFor="password_nueva">Nueva contraseña</label>
              <div className="campo-restablecer">
                <LockKeyhole size={17} />
                <input
                  id="password_nueva"
                  type={mostrarPassword.nueva ? "text" : "password"}
                  value={password.password_nueva}
                  onChange={(e) =>
                    cambiarPassword("password_nueva", e.target.value)
                  }
                  placeholder="Introduce tu nueva contraseña"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="boton-mostrar-password"
                  onClick={() => alternarPassword("nueva")}
                  aria-label={
                    mostrarPassword.nueva
                      ? "Ocultar contraseña"
                      : "Mostrar contraseña"
                  }
                >
                  {mostrarPassword.nueva ? (
                    <EyeOff size={17} />
                  ) : (
                    <Eye size={17} />
                  )}
                </button>
              </div>
              {/* REQUISITOS */}
              <div className="requisitos-password">
                <span>La nueva contraseña debe contener:</span>
                <ul>
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
              {/* CONFIRMAR CONTRASEÑA */}
              <label htmlFor="confirmar_password">Confirmar contraseña</label>
              <div className="campo-restablecer">
                <LockKeyhole size={17} />
                <input
                  id="confirmar_password"
                  type={mostrarPassword.confirmar ? "text" : "password"}
                  value={password.confirmar_password}
                  onChange={(e) =>
                    cambiarPassword("confirmar_password", e.target.value)
                  }
                  placeholder="Repite tu nueva contraseña"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="boton-mostrar-password"
                  onClick={() => alternarPassword("confirmar")}
                  aria-label={
                    mostrarPassword.confirmar
                      ? "Ocultar contraseña"
                      : "Mostrar contraseña"
                  }
                >
                  {mostrarPassword.confirmar ? (
                    <EyeOff size={17} />
                  ) : (
                    <Eye size={17} />
                  )}
                </button>
              </div>
              {/* MENSAJE */}
              {password.confirmar_password && (
                <div
                  className={
                    contrasenasCoinciden
                      ? "confirmacion-password coincide"
                      : "confirmacion-password no-coincide"
                  }
                >
                  {contrasenasCoinciden
                    ? "✓ Las contraseñas coinciden"
                    : "✕ Las contraseñas no coinciden"}
                </div>
              )}
              {mensaje.texto && (
                <div className={`mensaje-restablecer ${mensaje.tipo}`}>
                  {mensaje.texto}
                </div>
              )}
              {/* BOTON */}
              <button
                type="submit"
                className="boton-restablecer"
                disabled={cargando}
              >
                <CheckCircle size={17} />
                {cargando ? "Restableciendo..." : "Restablecer contraseña"}
              </button>
            </form>
            
            <Link to="/login" className="volver-login">
              <ArrowLeft size={16} />
              Volver al inicio de sesión
            </Link>
          </>
        ) : (
          /* CONTRASEÑA RESTABLECIDA */
          <div className="restablecer-exito">
            <div className="restablecer-icono exito">
              <ShieldCheck size={30} />
            </div>
            <h1>¡Contraseña actualizada!</h1>
            <p>
              Tu contraseña se ha restablecido correctamente. Ya puedes iniciar
              sesión en Mirai con tu nueva contraseña.
            </p>
            <button
              type="button"
              className="boton-restablecer"
              onClick={() => navegar("/login")}
            >
              Ir al inicio de sesión
            </button>
          </div>
        )}
      </section>
    </main>
  );
}

export default RestablecerPassword;
