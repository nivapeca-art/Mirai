// =========================================
// OBTENER MONEDA DEL USUARIO
// =========================================

export const obtenerMonedaUsuario = () => {
  const usuarioGuardado = localStorage.getItem("usuario");

  if (!usuarioGuardado) {
    return {
      codigo: "COP",
      nombre: "Peso Colombiano",
      simbolo: "$",
    };
  }

  try {
    const usuario = JSON.parse(usuarioGuardado);

    return (
      usuario?.pais_detalle?.moneda || {
        codigo: "COP",
        nombre: "Peso Colombiano",
        simbolo: "$",
      }
    );
  } catch (error) {
    console.error("Error obteniendo moneda del usuario:", error);

    return {
      codigo: "COP",
      nombre: "Peso Colombiano",
      simbolo: "$",
    };
  }
};


// =========================================
// OBTENER LOCALE SEGÚN MONEDA
// =========================================

const obtenerLocale = (codigoMoneda) => {
  const locales = {
    COP: "es-CO",
    EUR: "es-ES",
    USD: "en-US",
    JPY: "ja-JP",
    GBP: "en-GB",
    CAD: "en-CA",
    AUD: "en-AU",
    MXN: "es-MX",
    BRL: "pt-BR",
    ARS: "es-AR",
    CLP: "es-CL",
    PEN: "es-PE",
  };

  return locales[codigoMoneda] || "es-CO";
};


// =========================================
// FORMATEAR MONTO PARA MOSTRAR
// =========================================

export const formatearMonto = (
  valor,
  codigoMoneda = "COP"
) => {
  if (
    valor === null ||
    valor === undefined ||
    valor === ""
  ) {
    return "";
  }

  const numero = Number(valor);

  if (Number.isNaN(numero)) {
    return "";
  }

  const locale = obtenerLocale(codigoMoneda);

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: codigoMoneda,
  }).format(numero);
};


// =========================================
// FORMATEAR MONTO DENTRO DE UN INPUT
// =========================================

export const formatearMontoInput = (
  valor,
  codigoMoneda = "COP"
) => {
  if (!valor) {
    return "";
  }

  const locale = obtenerLocale(codigoMoneda);

  const separadorDecimal =
    new Intl.NumberFormat(locale)
      .format(1.1)
      .replace(/\d/g, "")
      .charAt(0);

  let texto = valor.replace(/[^\d.,]/g, "");

  if (!texto) {
    return "";
  }

  if (separadorDecimal === ",") {
    texto = texto.replace(/\./g, "");

    const partes = texto.split(",");

    const parteEntera = partes[0] || "";

    const parteDecimal = partes
      .slice(1)
      .join("")
      .slice(0, 2);

    const numeroEntero = Number(parteEntera);

    if (Number.isNaN(numeroEntero)) {
      return "";
    }

    const enteroFormateado =
      new Intl.NumberFormat(locale, {
        maximumFractionDigits: 0,
      }).format(numeroEntero);

    if (texto.includes(",")) {
      return `${enteroFormateado},${parteDecimal}`;
    }

    return enteroFormateado;
  }

  texto = texto.replace(/,/g, "");

  const partes = texto.split(".");

  const parteEntera = partes[0] || "";

  const parteDecimal = partes
    .slice(1)
    .join("")
    .slice(0, 2);

  const numeroEntero = Number(parteEntera);

  if (Number.isNaN(numeroEntero)) {
    return "";
  }

  const enteroFormateado =
    new Intl.NumberFormat(locale, {
      maximumFractionDigits: 0,
    }).format(numeroEntero);

  if (texto.includes(".")) {
    return `${enteroFormateado}.${parteDecimal}`;
  }

  return enteroFormateado;
};


// =========================================
// CONVERTIR MONTO DEL INPUT PARA LA API
// =========================================

export const convertirMontoParaAPI = (
  valor,
  codigoMoneda = "COP"
) => {
  if (!valor) {
    return 0;
  }

  const locale = obtenerLocale(codigoMoneda);

  const separadorDecimal =
    new Intl.NumberFormat(locale)
      .format(1.1)
      .replace(/\d/g, "")
      .charAt(0);

  let texto = valor.replace(/[^\d.,-]/g, "");

  if (separadorDecimal === ",") {
    texto = texto
      .replace(/\./g, "")
      .replace(",", ".");
  } else {
    texto = texto.replace(/,/g, "");
  }

  return Number(texto);
};