import { useEffect, useState } from "react";

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";

import { obtenerProyeccion } from "../../services/proyeccionServices";

function Proyeccion() {

    const [proyeccion, setProyeccion] = useState(null);
    const [meses, setMeses] = useState(6);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");

    // -----------------------------------------------
    // OBTENER PROYECCIÓN
    // -----------------------------------------------

    const cargarProyeccion = async () => {

        try {

            setCargando(true);
            setError("");

            const datos = await obtenerProyeccion(meses);

            setProyeccion(datos);

        } catch (error) {

            console.error(
                "Error obteniendo proyección:",
                error
            );

            setError(
                "No se pudo cargar la proyección."
            );

        } finally {

            setCargando(false);

        }
    };

    // -----------------------------------------------
    // CARGAR CUANDO CAMBIA EL PERIODO
    // -----------------------------------------------

    useEffect(() => {

        cargarProyeccion();

    }, [meses]);

    // -----------------------------------------------
    // CARGANDO
    // -----------------------------------------------

    if (cargando) {
        return (
            <div className="proyeccion">
                <p>Cargando proyección...</p>
            </div>
        );
    }

    // -----------------------------------------------
    // ERROR
    // -----------------------------------------------

    if (error) {
        return (
            <div className="proyeccion">
                <p>{error}</p>
            </div>
        );
    }

    // -----------------------------------------------
    // DATOS
    // -----------------------------------------------

    const datosGrafica =
        proyeccion?.proyeccion || [];

    const promedio =
        proyeccion?.promedio_mensual || {};

    // -----------------------------------------------
    // RENDER
    // -----------------------------------------------

    return (

        <section className="proyeccion">

            {/* ------------------------------------ */}
            {/* ENCABEZADO */}
            {/* ------------------------------------ */}

            <div className="proyeccion-header">

                <div>

                    <h2>Proyección financiera</h2>

                    <p>
                        Estimación basada en tu
                        comportamiento financiero.
                    </p>

                </div>

                <select
                    value={meses}
                    onChange={(e) =>
                        setMeses(Number(e.target.value))
                    }
                >

                    <option value={3}>
                        3 meses
                    </option>

                    <option value={6}>
                        6 meses
                    </option>

                    <option value={12}>
                        12 meses
                    </option>

                </select>

            </div>

            {/* ------------------------------------ */}
            {/* RESUMEN */}
            {/* ------------------------------------ */}

            <div className="proyeccion-resumen">

                <div className="proyeccion-card">

                    <span>
                        Ingresos promedio
                    </span>

                    <strong>
                        ${Number(
                            promedio.ingresos || 0
                        ).toLocaleString("es-CO")}
                    </strong>

                </div>

                <div className="proyeccion-card">

                    <span>
                        Gastos promedio
                    </span>

                    <strong>
                        ${Number(
                            promedio.gastos || 0
                        ).toLocaleString("es-CO")}
                    </strong>

                </div>

                <div className="proyeccion-card">

                    <span>
                        Ahorro promedio
                    </span>

                    <strong>
                        ${Number(
                            promedio.ahorros || 0
                        ).toLocaleString("es-CO")}
                    </strong>

                </div>

                <div className="proyeccion-card">

                    <span>
                        Saldo promedio
                    </span>

                    <strong>
                        ${Number(
                            promedio.saldo || 0
                        ).toLocaleString("es-CO")}
                    </strong>

                </div>

            </div>

            {/* ------------------------------------ */}
            {/* GRÁFICA */}
            {/* ------------------------------------ */}

            <div className="proyeccion-grafica">

                <ResponsiveContainer
                    width="100%"
                    height={350}
                >

                    <LineChart
                        data={datosGrafica}
                    >

                        <CartesianGrid
                            strokeDasharray="3 3"
                        />

                        <XAxis
                            dataKey="mes"
                        />

                        <YAxis />

                        <Tooltip
                            formatter={(value) =>
                                `$${Number(
                                    value
                                ).toLocaleString(
                                    "es-CO"
                                )}`
                            }
                        />

                        <Legend />

                        <Line
                            type="monotone"
                            dataKey="ingresos"
                            name="Ingresos"
                            strokeWidth={2}
                        />

                        <Line
                            type="monotone"
                            dataKey="gastos"
                            name="Gastos"
                            strokeWidth={2}
                        />

                        <Line
                            type="monotone"
                            dataKey="ahorros"
                            name="Ahorros"
                            strokeWidth={2}
                        />

                        <Line
                            type="monotone"
                            dataKey="saldo"
                            name="Saldo"
                            strokeWidth={2}
                        />

                    </LineChart>

                </ResponsiveContainer>

            </div>

        </section>
    );
}

export default Proyeccion;

