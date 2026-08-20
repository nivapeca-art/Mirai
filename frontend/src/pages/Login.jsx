// REACT
import { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
// COMPONENTES
import LoginFormulario from "../components/LoginFormulario";
import RegistroFormulario from "../components/RegistroFormulario";
// SERVICIOS
import { iniciarSesion, registrarUsuario } from "../services/authServices";
import { obtenerPais } from "../services/paisServices";
// ESTILOS
import "../styles/login.css";

function Autenticar() {
  // =========================================
  // CONSTANTES
  // =========================================
  const navegar = useNavigate();
  const localizar = useLocation();
  const registrar = localizar.pathname === "/registro";

  // =========================================
  // ESTADOS
  // =========================================
  // LOGIN
  const [login, setLogin] = useState({
    login: "",
    password: "",
  });
  // REGISTRO
  const [registro, setRegistro] = useState({
    username: "",
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    pais: "",
  });
  const [mostrarContrasena, setMostrarContrasena] = useState(false);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const [paises, setPaises] = useState([]);
  // =========================================
  // EFECTOS
  // =========================================
  useEffect(() => {
    cargarPaises();
  }, []);

  // =========================================
  // FUNCIONES
  // =========================================

  // LOGIN
  const cambiosLogin = (e) => {
    const { name, value } = e.target;
    setLogin({
      ...login,
      [name]: value,
    });
  };

  const manejoLogin = async (e) => {
    e.preventDefault();
    setError("");
    setCargando(true);
    try {
      const respuesta = await iniciarSesion(login);
      localStorage.setItem("access_token", respuesta.access);
      localStorage.setItem("usuario", JSON.stringify(respuesta.usuario));
      if (respuesta.refresh) {
        localStorage.setItem("refresh_token", respuesta.refresh);
      }
      navegar("/dashboard");
    } catch (error) {
      console.error(error);
      if (error.response?.data) {
        const datos = error.response.data;
        if (datos.detail) {
          setError(datos.detail);
        } else {
          setError("Usuario o contraseña incorrectos.");
        }
      } else {
        setError("No fue posible conectarse con el servidor.");
      }
    } finally {
      setCargando(false);
    }
  };
  // REGISTRO
  const cambiosRegistro = (e) => {
    const { name, value } = e.target;
    setRegistro({
      ...registro,
      [name]: value,
    });
  };
  //Traer la lista de paises para mostrar los nombres
  const cargarPaises = async () => {
    try {
      const datos = await obtenerPais();
      setPaises(datos);
    } catch (error) {
      console.error(error);
    }
  };

  const manejoRegistro = async (e) => {
    e.preventDefault();
    setError("");
    setCargando(true);
    try {
      await registrarUsuario(registro);
      navegar("/login");
    } catch (error) {
      console.error(error);
      if (error.response?.data) {
        const datos = error.response.data;
        if (typeof datos === "object") {
          const mensajes = Object.values(datos).flat().join(" ");
          setError(mensajes);
        } else {
          setError("No fue posible crear la cuenta.");
        }
      } else {
        setError("No fue posible conectarse con el servidor.");
      }
    } finally {
      setCargando(false);
    }
  };

  return (
    <main className={`auth ${registrar ? "auth--registro" : ""}`}>
      <section className="formularios-contenedor">
        <div className="formulario-card">

          {/* LOGO */}
          <img src="/logo.png" alt="Logo de Mirai" className="logo-app" />

          {/* FORMULARIOS */}
          {!registrar ? (
            <LoginFormulario
              login={login}
              cambiosLogin={cambiosLogin}
              manejoLogin={manejoLogin}
              mostrarContrasena={mostrarContrasena}
              setMostrarContrasena={setMostrarContrasena}
              error={error}
              cargando={cargando}
            />
          ) : (
            <RegistroFormulario
              registro={registro}
              cambiosRegistro={cambiosRegistro}
              manejoRegistro={manejoRegistro}
              mostrarContrasena={mostrarContrasena}
              setMostrarContrasena={setMostrarContrasena}
              error={error}
              cargando={cargando}
              paises={paises}
            />
          )}
        </div>
      {/* PESTAÑAS */}
      <nav className="vistas">
        <Link to="/login" className={!registrar ? "active" : ""}>
          Iniciar sesión
        </Link>
        <Link to="/registro" className={registrar ? "active" : ""}>
          Registrarme
        </Link>
      </nav>
      </section>

    </main>
  );
}

export default Autenticar;
