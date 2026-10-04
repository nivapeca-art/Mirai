import obtenerUsuarios from "./obtenerUsuario";

// ZONAS HORARIAS POR PAÍS
const zonasHorarias = {
  COP: "America/Bogota",
  EUR: "Europe/Madrid",
  USD: "America/New_York",
  JPY: "Asia/Tokyo",
  GBP: "Europe/London",
  CAD: "America/Toronto",
  AUD: "Australia/Sydney",
  MXN: "America/Mexico_City",
  BRL: "America/Sao_Paulo",
  ARS: "America/Argentina/Buenos_Aires",
  CLP: "America/Santiago",
  PEN: "America/Lima"
};

// OBTENER ZONA HORARIA
export const obtenerZonaHoraria = () => {
  const usuario = obtenerUsuarios();
  const codigoMoneda = usuario?.pais_detalle?.moneda?.codigo;
  return zonasHorarias[codigoMoneda] || "America/Bogota";
};

// OBTENER FECHA DE HOY
export const obtenerFechaHoy = (codigoPais) => {
  const zonaHoraria = obtenerZonaHoraria(codigoPais);
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: zonaHoraria,
  }).format(new Date());
};

// FORMATEAR FECHA
export const formatearFecha = (fecha) => {
  if (!fecha) return "Sin fecha límite";
  const [año, mes, dia] = fecha.split("-");
  const fechaLocal = new Date(
    Number(año),
    Number(mes) - 1,
    Number(dia)
  );
  return fechaLocal.toLocaleDateString("es-CO", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

// FECHA LOCAL
export const convertirFechaLocal = (fecha) => {
  if (!fecha) return null;
  const [año, mes, dia] = fecha.split("-");
  return new Date(
    Number(año),
    Number(mes) - 1,
    Number(dia)
  );
};