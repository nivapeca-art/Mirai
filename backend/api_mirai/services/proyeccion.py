from decimal import Decimal, ROUND_CEILING
from datetime import date
import calendar

from django.db.models import Sum

from ..models import Meta, Movimiento


def obtener_proyeccion_meta(usuario, meta_id):

    # Calcula la proyección de una meta específica.
    #
    # Utiliza:
    # - El promedio mensual histórico de abonos.
    # - La fecha límite de la meta.
    # - El monto actual y el monto objetivo.
    #
    # Devuelve:
    # - Ritmo actual de ahorro.
    # - Meses estimados.
    # - Fecha estimada de finalización.
    # - Días de diferencia respecto a la fecha límite.
    # - Ahorro mensual recomendado para cumplir la fecha límite.
    # - Proyección mensual.


    # -----------------------------------------------
    # META
    # -----------------------------------------------

    meta = Meta.objects.filter(
        id=meta_id,
        usuario=usuario
    ).first()

    if not meta:
        return None


    # -----------------------------------------------
    # MOVIMIENTOS DE LA META
    # -----------------------------------------------

    movimientos = Movimiento.objects.filter(
        usuario=usuario,
        meta=meta,
        tipo="AHORRO"
    )


    # -----------------------------------------------
    # TOTAL ABONADO
    # -----------------------------------------------

    total_ahorrado = (
        movimientos
        .aggregate(total=Sum("monto"))
        ["total"]
        or Decimal("0")
    )


    # -----------------------------------------------
    # MESES CON ABONOS
    # -----------------------------------------------

    meses_historicos = (
        movimientos
        .values("fecha__year", "fecha__month")
        .distinct()
        .count()
    )


    # -----------------------------------------------
    # MONTOS DE LA META
    # -----------------------------------------------

    monto_actual = meta.monto_actual or Decimal("0")
    monto_objetivo = meta.monto_objetivo or Decimal("0")

    monto_faltante = max(
        Decimal("0"),
        monto_objetivo - monto_actual
    )


    # -----------------------------------------------
    # PROMEDIO MENSUAL HISTÓRICO
    # -----------------------------------------------

    if meses_historicos > 0:

        promedio_mensual = (
            total_ahorrado /
            Decimal(meses_historicos)
        )

    else:

        promedio_mensual = Decimal("0")


    # -----------------------------------------------
    # FECHA ACTUAL
    # -----------------------------------------------

    hoy = date.today()


    # -----------------------------------------------
    # META YA COMPLETADA
    # -----------------------------------------------

    if monto_faltante <= 0:

        return {

            "meta": {

                "id": meta.id,

                "nombre": meta.nombre,

                "monto_actual": round(
                    monto_actual,
                    2
                ),

                "monto_objetivo": round(
                    monto_objetivo,
                    2
                ),

                "monto_faltante": Decimal("0"),

                "fecha_limite": meta.fecha_limite,

                "estado": meta.estado,

            },

            "historico": {

                "total_abonado": round(
                    total_ahorrado,
                    2
                ),

                "meses_con_abonos": meses_historicos,

            },

            "promedio_mensual": round(
                promedio_mensual,
                2
            ),

            "meses_estimados": 0,

            "fecha_estimada": hoy,

            "dias_diferencia": (

                (hoy - meta.fecha_limite).days

                if meta.fecha_limite

                else None

            ),

            "cumple_fecha_limite": (

                True

                if not meta.fecha_limite

                else hoy <= meta.fecha_limite

            ),

            "ahorro_mensual_recomendado": Decimal("0"),

            "proyeccion": [],

        }


    # -----------------------------------------------
    # MESES DISPONIBLES HASTA LA FECHA LÍMITE
    # -----------------------------------------------

    meses_disponibles = None

    if meta.fecha_limite:

        if meta.fecha_limite > hoy:

            meses_disponibles = (

                (meta.fecha_limite.year - hoy.year) * 12

                + (
                    meta.fecha_limite.month
                    - hoy.month
                )

            )

            # Si estamos dentro del mismo mes,
            # todavía existe este mes como periodo
            # de ahorro.

            if meses_disponibles < 1:

                meses_disponibles = 1

        else:

            meses_disponibles = 0


    # -----------------------------------------------
    # AHORRO MENSUAL RECOMENDADO
    # -----------------------------------------------

    if meses_disponibles and meses_disponibles > 0:

        ahorro_mensual_recomendado = (

            monto_faltante /
            Decimal(meses_disponibles)

        )

        ahorro_mensual_recomendado = (
            ahorro_mensual_recomendado.quantize(
                Decimal("0.01")
            )
        )

    else:

        ahorro_mensual_recomendado = Decimal("0")


    # -----------------------------------------------
    # MESES ESTIMADOS CON EL RITMO ACTUAL
    # -----------------------------------------------

    if promedio_mensual > 0:

        meses_estimados_decimal = (

            monto_faltante /
            promedio_mensual

        )

        meses_estimados = int(
            meses_estimados_decimal.to_integral_value(
                rounding=ROUND_CEILING
            )
        )

    else:

        meses_estimados = None


    # -----------------------------------------------
    # FECHA ESTIMADA
    # -----------------------------------------------

    fecha_estimada = None

    if meses_estimados is not None:

        anio = hoy.year

        mes = hoy.month + meses_estimados

        anio += (mes - 1) // 12

        mes = ((mes - 1) % 12) + 1

        # Evitamos problemas con meses que no tienen
        # el mismo número de días.

        dia = min(
            hoy.day,
            calendar.monthrange(
                anio,
                mes
            )[1]
        )

        fecha_estimada = date(
            anio,
            mes,
            dia
        )


    # -----------------------------------------------
    # COMPARACIÓN CON FECHA LÍMITE
    # -----------------------------------------------

    cumple_fecha_limite = None
    dias_diferencia = None

    if meta.fecha_limite and fecha_estimada:

        dias_diferencia = (
            fecha_estimada -
            meta.fecha_limite
        ).days

        cumple_fecha_limite = (
            fecha_estimada <=
            meta.fecha_limite
        )


    # -----------------------------------------------
    # PROYECCIÓN MENSUAL
    # -----------------------------------------------

    proyeccion = []

    if promedio_mensual > 0:

        acumulado = monto_actual

        cantidad_meses = meses_estimados or 0

        for numero_mes in range(
            1,
            cantidad_meses + 1
        ):

            # ---------------------------------------
            # CALCULAR CUÁNTO FALTA
            # ---------------------------------------

            faltante_mes = (
                monto_objetivo -
                acumulado
            )

            # ---------------------------------------
            # ABONO DEL MES
            #
            # Normalmente será el promedio mensual.
            #
            # Pero si el promedio es superior a lo
            # que falta para completar la meta,
            # solamente mostramos lo que realmente falta.
            # ---------------------------------------

            ahorro_del_mes = min(
                promedio_mensual,
                faltante_mes
            )

            # Evitamos valores negativos
            # por seguridad.

            ahorro_del_mes = max(
                Decimal("0"),
                ahorro_del_mes
            )


            # ---------------------------------------
            # NUEVO ACUMULADO
            # ---------------------------------------

            acumulado += ahorro_del_mes


            # ---------------------------------------
            # NO SUPERAR EL OBJETIVO
            # ---------------------------------------

            if acumulado >= monto_objetivo:

                acumulado = monto_objetivo


            # ---------------------------------------
            # PROGRESO
            # ---------------------------------------

            progreso = (

                acumulado /
                monto_objetivo

            ) * 100


            # ---------------------------------------
            # GUARDAR PROYECCIÓN
            # ---------------------------------------

            proyeccion.append({

                "mes": numero_mes,

                # Lo que realmente se debería
                # abonar ese mes.

                "ahorro_estimado": round(
                    ahorro_del_mes,
                    2
                ),

                # Cómo quedaría la meta después
                # de realizar ese abono.

                "acumulado_estimado": round(
                    acumulado,
                    2
                ),

                "progreso": round(
                    min(progreso, 100),
                    2
                )

            })


    # -----------------------------------------------
    # RESULTADO
    # -----------------------------------------------

    return {

        "meta": {

            "id": meta.id,

            "nombre": meta.nombre,

            "monto_actual": round(
                monto_actual,
                2
            ),

            "monto_objetivo": round(
                monto_objetivo,
                2
            ),

            "monto_faltante": round(
                monto_faltante,
                2
            ),

            "fecha_limite": meta.fecha_limite,

            "estado": meta.estado,

        },


        # -------------------------------------------
        # HISTÓRICO
        # -------------------------------------------

        "historico": {

            "total_abonado": round(
                total_ahorrado,
                2
            ),

            "meses_con_abonos": meses_historicos,

        },


        # -------------------------------------------
        # RITMO ACTUAL
        # -------------------------------------------

        "promedio_mensual": round(
            promedio_mensual,
            2
        ),


        # -------------------------------------------
        # PROYECCIÓN CON RITMO ACTUAL
        # -------------------------------------------

        "meses_estimados": meses_estimados,

        "fecha_estimada": fecha_estimada,

        "dias_diferencia": dias_diferencia,

        "cumple_fecha_limite": cumple_fecha_limite,


        # -------------------------------------------
        # RECOMENDACIÓN
        # -------------------------------------------

        "ahorro_mensual_recomendado": round(
            ahorro_mensual_recomendado,
            2
        ),


        # -------------------------------------------
        # PROYECCIÓN MENSUAL
        # -------------------------------------------

        "proyeccion": proyeccion,

    }