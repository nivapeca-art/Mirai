import { useState } from "react";
import { Link } from "react-router-dom";

import { Mail, ArrowLeft, Send } from "lucide-react";

import { solicitarRecuperacion } from "../services/authServices";

import "../styles/recuperarContrasena.css";

function RecuperarPassword() {
  const [email, setEmail] = useState("");
  const [mensaje, setMensaje] = useState({
    tipo: "",
    texto: "",
  });

  const [cargando, setCargando] = useState(false);

  const manejarEnvio = async (e) => {
    e.preventDefault();
    setMensaje({
      tipo: "",
      texto: "",
    });
    // Correo electrónico
    if (!email.trim()) {
      setMensaje({
        tipo: "error",
        texto: "Introduce tu correo electrónico.",
      });
      return;
    }

    try {
      setCargando(true);
      const respuesta = await solicitarRecuperacion(email.trim());
      setMensaje({
        tipo: "exito",
        texto: respuesta.detail,
      });
      setEmail("");

    } catch (error) {
      const datos = error.response?.data;
      let texto = "No se pudo procesar la solicitud.";
      if (datos?.email) {
        texto = datos.email[0];
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
    <main className="recuperar-password">
      <section className="recuperar-card">
        <div className="recuperar-icono">
          <Mail size={28} />
        </div>
        <h1>¿Olvidaste tu contraseña?</h1>
        <p className="recuperar-descripcion">
          Introduce el correo electrónico asociado a tu cuenta y te enviaremos
          un enlace para restablecer tu contraseña.
        </p>

        <form onSubmit={manejarEnvio}>
          <label htmlFor="email">Correo electrónico</label>
          <div className="campo-recuperar">
            <Mail size={18} />
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="correo@ejemplo.com"
              autoComplete="email"
            />
          </div>
          {mensaje.texto && (
            <div className={`mensaje-recuperar ${mensaje.tipo}`}>
              {mensaje.texto}
            </div>
          )}
          <button type="submit" disabled={cargando}>
            <Send size={17} />
            {cargando ? "Generando enlace..." : "Restablecer contraseña"}
          </button>
        </form>

        <Link to="/login" className="volver-login">
          <ArrowLeft size={16} />
          Volver al inicio de sesión
        </Link>
      </section>
    </main>
  );
}

export default RecuperarPassword;
