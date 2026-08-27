import { useEffect, useState } from "react";

import { TrendingUp, Calendar, Target, Wallet, Clock } from "lucide-react";

import ModalBase from "./ModalBase";

import { obtenerProyeccionMeta } from "../../services/proyeccionServices";

import "../../styles/modales/modalProyeccion.css";

function ModalProyeccion({ meta, onCerrar }) {

  const [proyeccion, setProyeccion] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  // CARGAR PROYECCIÓN
  useEffect(() => {
    cargarProyeccion();
  }, [meta]);

  const cargarProyeccion = async () => {
    try {
      setCargando(true);
      setError("");
      const data = await obtenerProyeccionMeta(meta.id);
      setProyeccion(data);

    } catch (error) {
      console.error("Error obteniendo proyección:", error);
      setError("No se pudo obtener la proyección de la meta.");

    } finally {
      setCargando(false);
    }
  };

  // FORMATEAR MONTO
  const formatearMonto = (monto) => {
    return Number(monto || 0).toLocaleString("es-CO");
  };

  // FORMATEAR FECHA
  const formatearFecha = (fecha) => {
    if (!fecha) {
      return "Sin fecha límite";
    }
    return new Date(`${fecha}T00:00:00`).toLocaleDateString("es-CO");
  };

  // FECHA PROYECTADA
  const obtenerFechaProyectada = () => {
    if (
      !proyeccion ||
      proyeccion.meses_estimados === null ||
      proyeccion.meses_estimados === 0
    ) {
      return null;
    }
    const fecha = new Date();
    fecha.setMonth(fecha.getMonth() + proyeccion.meses_estimados);
    return fecha.toLocaleDateString("es-CO");
  };

  // DIFERENCIA CON FECHA LÍMITE
  const obtenerDiferenciaFecha = () => {
    if (
      !proyeccion ||
      !proyeccion.meta.fecha_limite ||
      proyeccion.meses_estimados === null ||
      proyeccion.meses_estimados === 0
    ) {
      return null;
    }
    const hoy = new Date();
    const fechaProyectada = new Date(hoy);
    fechaProyectada.setMonth(
      fechaProyectada.getMonth() + proyeccion.meses_estimados,
    );
    const fechaLimite = new Date(`${proyeccion.meta.fecha_limite}T00:00:00`);
    const diferencia = fechaLimite.getTime() - fechaProyectada.getTime();
    return Math.round(diferencia / (1000 * 60 * 60 * 24));
  };

  // OBTENER ABONO PROYECTADO
  const obtenerAbonoProyectado = () => {
    if (
      !proyeccion ||
      !proyeccion.proyeccion ||
      proyeccion.proyeccion.length === 0
    ) {
      return 0;
    }
    return proyeccion.proyeccion[0].ahorro_estimado;
  };

  // DIFERENCIA DE FECHA
  const diferenciaFecha = obtenerDiferenciaFecha();

  return (
    <ModalBase titulo={`Proyección - ${meta.nombre}`} onCerrar={onCerrar}>
      {cargando ? (
        <div className="proyeccion-estado">
          <TrendingUp size={28} />
          <span>Calculando proyección...</span>
        </div>

      ) : error ? (
        <div className="proyeccion-error">{error}</div>

      ) : proyeccion ? (
        <div className="proyeccion-contenido">
          {/* RESUMEN */}
          <div className="proyeccion-resumen">
            <div className="proyeccion-resumen-item">
              <Wallet size={18} />
              <span>Ahorrado</span>
              <strong>${formatearMonto(proyeccion.meta.monto_actual)}</strong>
            </div>
            {/* Objetivo y falta */}
            <div className="proyeccion-resumen-item">
              <Target size={18} />
              <span>Objetivo</span>
              <strong>${formatearMonto(proyeccion.meta.monto_objetivo)}</strong>
            </div>

            <div className="proyeccion-resumen-item">
              <TrendingUp size={18} />
              <span>Falta</span>
              <strong>${formatearMonto(proyeccion.meta.monto_faltante)}</strong>
            </div>
          </div>

          {/* RITMO DE AHORRO */}
          {proyeccion.meses_estimados !== 0 &&
            proyeccion.meses_estimados !== 1 &&
            proyeccion.promedio_mensual > 0 && (
              <div className="proyeccion-recomendacion">
                <div className="proyeccion-recomendacion-icono">
                  <TrendingUp size={22} />
                </div>
                <div>
                  <span>Ritmo de ahorro actual</span>
                  <strong>
                    ${formatearMonto(proyeccion.promedio_mensual)} al mes
                  </strong>
                  <p>
                    Este es el promedio aproximado de tus abonos históricos a
                    esta meta.
                  </p>
                </div>
              </div>
            )}

          {/* RESULTADO */}
          <div className="proyeccion-resultado">
            {/* META COMPLETADA */}
            {proyeccion.meses_estimados === 0 ? (
              <>
                <div className="proyeccion-resultado-icono">🎉</div>

                <div>
                  <span>Meta completada</span>

                  <strong>¡Ya alcanzaste tu objetivo!</strong>
                </div>
              </>
            ) : proyeccion.meses_estimados === null ? (
              /* SIN SUFICIENTES ABONOS */
              <>
                <div className="proyeccion-resultado-icono">
                  <Clock size={22} />
                </div>
                <div>
                  <span>Proyección</span>
                  <strong>Aún no hay suficientes abonos</strong>
                  <p>
                    Realiza algunos abonos para poder calcular tu ritmo promedio
                    de ahorro.
                  </p>
                </div>
              </>
            ) : proyeccion.meses_estimados === 1 ? (
              /* SOLO FALTA UN ABONO */
              <>
                <div className="proyeccion-resultado-icono">🎯</div>
                <div>
                  <span>¡Vas por muy buen camino!</span>
                  <strong>
                    ¡Estás a un último abono de completar tu meta!
                  </strong>
                  <p>
                    Solo hace falta un abono de{" "}
                    <b>${formatearMonto(obtenerAbonoProyectado())}</b> para
                    alcanzar tu objetivo
                    {diferenciaFecha !== null && (
                      <>
                        {" "}
                        aproximadamente <b>
                          {Math.abs(diferenciaFecha)} días
                        </b>{" "}
                        {diferenciaFecha >= 0 ? "antes" : "después"} de la fecha
                        límite.
                      </>
                    )}
                  </p>
                </div>
              </>
            ) : (
              /* VARIOS MESES */
              <>
                <div className="proyeccion-resultado-icono">
                  <Clock size={22} />
                </div>
                <div>
                  <span>Tiempo estimado</span>
                  <strong>
                    {proyeccion.meses_estimados}{" "}
                    {proyeccion.meses_estimados === 1 ? "mes" : "meses"}
                  </strong>
                  <p>
                    Fecha aproximada de finalización:{" "}
                    <b>{obtenerFechaProyectada()}</b>
                  </p>
                </div>
              </>
            )}
          </div>

          {/* FECHA LÍMITE */}
          {proyeccion.meta.fecha_limite && (
            <div className="proyeccion-fecha">
              <div className="proyeccion-fecha-icono">
                <Calendar size={18} />
              </div>
              <div>
                <span>Fecha límite de la meta</span>
                <strong>{formatearFecha(proyeccion.meta.fecha_limite)}</strong>
              </div>
            </div>
          )}

          {/* COMPARACIÓN CON FECHA LÍMITE */}
          {diferenciaFecha !== null && (
            <div
              className={
                diferenciaFecha >= 0
                  ? "proyeccion-fecha-ok"
                  : "proyeccion-fecha-alerta"
              }
            >
              {diferenciaFecha >= 0 ? (
                <>
                  🎯 Con este ritmo alcanzarías tu meta aproximadamente{" "}
                  <strong>{diferenciaFecha} días</strong> antes de la fecha
                  límite.
                </>
              ) : (
                <>
                  ⚠️ Con este ritmo alcanzarías tu meta aproximadamente{" "}
                  <strong>{Math.abs(diferenciaFecha)} días</strong> después de
                  la fecha límite.
                  {proyeccion.ahorro_mensual_recomendado > 0 && (
                    <p>
                      Para cumplirla dentro de la fecha límite necesitas ahorrar
                      como mínimo{" "}
                      <strong>
                        ${formatearMonto(proyeccion.ahorro_mensual_recomendado)}
                      </strong>{" "}
                      al mes.
                    </p>
                  )}
                </>
              )}
            </div>
          )}

          {/* PROYECCIÓN MENSUAL */}
          {proyeccion.proyeccion.length > 0 && (
            <div className="proyeccion-tabla-contenedor">
              <div className="proyeccion-tabla-header">
                <div>
                  <h3>
                    {proyeccion.meses_estimados === 1
                      ? "Último abono"
                      : "Proyección mensual"}
                  </h3>

                  {proyeccion.meses_estimados === 1 ? (
                    <p>
                      Solo 1 abono más de{" "}
                      <strong>
                        ${formatearMonto(obtenerAbonoProyectado())}
                      </strong>{" "}
                      para cumplir tu meta.
                    </p>
                  ) : (
                    <p>
                      Manteniendo un abono aproximado de{" "}
                      <strong>
                        ${formatearMonto(proyeccion.promedio_mensual)}
                      </strong>{" "}
                      cada mes.
                    </p>
                  )}
                </div>
              </div>

              {/* TABLA DE PROYECCIÓN */}
              <div className="proyeccion-tabla">
                {/* Encabezado */}
                <div className="proyeccion-tabla-titulos">
                  <span>Mes</span>
                  <span>Abono</span>
                  <span>Total acumulado</span>
                  <span>Progreso</span>
                </div>
                {/* Filas */}
                <div className="proyeccion-tabla-filas">
                  {proyeccion.proyeccion.map((mes) => (
                    <div key={mes.mes} className="proyeccion-fila">
                      <span className="proyeccion-numero-mes">Mes {mes.mes}</span>
                      <span className="proyeccion-abono">${formatearMonto(mes.ahorro_estimado)}</span>
                      <strong className="proyeccion-acumulado">${formatearMonto(mes.acumulado_estimado)}</strong>
                      <div className="proyeccion-progreso">
                        <div className="proyeccion-progreso-barra">
                          <div
                            className="proyeccion-progreso-valor"
                            style={{
                              width: `${mes.progreso}%`,
                            }}
                          />
                        </div>
                        <span>{mes.progreso.toFixed(0)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* CERRAR */}
          <div className="modal-acciones">
            <button type="button" className="btn-cancelar" onClick={onCerrar}>
              Cerrar
            </button>
          </div>
        </div>
      ) : null}
    </ModalBase>
  );
}

export default ModalProyeccion;
