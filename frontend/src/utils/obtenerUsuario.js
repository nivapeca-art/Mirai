const obtenerUsuarios = () => {
  const usuario = localStorage.getItem("usuario");
  return usuario ? JSON.parse(usuario) : null;
};
export default obtenerUsuarios;