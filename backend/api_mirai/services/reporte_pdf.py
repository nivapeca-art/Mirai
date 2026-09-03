from ..models import Meta, Movimiento, Obligacion
from django.http import HttpResponse
from django.db.models import Sum
from decimal import Decimal
from datetime import date, timedelta
from calendar import monthrange
from rest_framework.response import Response
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_RIGHT
from reportlab.lib.units import mm
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)

# GENERAR PDF
def generar_reporte_pdf(usuario, periodo, mes_seleccionado=None):
    hoy = date.today()

    # NOMBRE DEL USUARIO
    nombre_usuario = (
        f"{usuario.first_name} {usuario.last_name}"
    ).strip()

    if not nombre_usuario:
        nombre_usuario = usuario.username or "Usuario"

    # =========================================================
    # PERIODOS
    # =========================================================

    # 15 DÍAS
    if periodo == "15_dias":
        fecha_fin = hoy
        fecha_inicio = hoy - timedelta(days=14)

        periodo_anterior_fin = (
            fecha_inicio - timedelta(days=1)
        )

        periodo_anterior_inicio = (
            periodo_anterior_fin - timedelta(days=14)
        )

        nombre_periodo = "Últimos 15 días"

    # MENSUAL
    elif periodo == "mensual":
        nombres_meses = [
            "Enero",
            "Febrero",
            "Marzo",
            "Abril",
            "Mayo",
            "Junio",
            "Julio",
            "Agosto",
            "Septiembre",
            "Octubre",
            "Noviembre",
            "Diciembre",
        ]

        if mes_seleccionado:
            try:
                año, mes = map(
                    int,
                    mes_seleccionado.split("-")
                )

                if mes < 1 or mes > 12:
                    raise ValueError

                fecha_inicio = date(
                    año,
                    mes,
                    1
                )

                ultimo_dia = monthrange(
                    año,
                    mes
                )[1]

                fecha_fin = date(
                    año,
                    mes,
                    ultimo_dia
                )

                nombre_periodo = (
                    f"{nombres_meses[mes - 1]} "
                    f"{año}"
                )

                # PERIODO ANTERIOR
                periodo_anterior_fin = (
                    fecha_inicio - timedelta(days=1)
                )

                periodo_anterior_inicio = (
                    periodo_anterior_fin.replace(day=1)
                )

            except (ValueError, TypeError):
                return Response(
                    {
                        "error": (
                            "El mes seleccionado no es válido. "
                            "Usa el formato YYYY-MM."
                        )
                    },
                    status=400
                )

        else:
            fecha_inicio = hoy.replace(day=1)
            fecha_fin = hoy

            mes_anterior = (
                fecha_inicio - timedelta(days=1)
            )

            periodo_anterior_inicio = (
                mes_anterior.replace(day=1)
            )

            periodo_anterior_fin = mes_anterior

            nombre_periodo = (
                f"{nombres_meses[fecha_inicio.month - 1]} "
                f"{fecha_inicio.year}"
            )

    # 6 MESES
    elif periodo == "6_meses":
        fecha_fin = hoy

        mes_actual = hoy.month
        año_actual = hoy.year

        total_meses = 6

        mes_inicio = (
            mes_actual - total_meses + 1
        )

        año_inicio = año_actual

        while mes_inicio <= 0:
            mes_inicio += 12
            año_inicio -= 1

        fecha_inicio = date(
            año_inicio,
            mes_inicio,
            1
        )

        # PERIODO ANTERIOR
        periodo_anterior_fin = (
            fecha_inicio - timedelta(days=1)
        )

        mes_anterior_inicio = (
            periodo_anterior_fin.month - 5
        )

        año_anterior_inicio = (
            periodo_anterior_fin.year
        )

        while mes_anterior_inicio <= 0:
            mes_anterior_inicio += 12
            año_anterior_inicio -= 1

        periodo_anterior_inicio = date(
            año_anterior_inicio,
            mes_anterior_inicio,
            1
        )

        nombre_periodo = "Últimos 6 meses"

    # ANUAL
    elif periodo == "anual":
        fecha_inicio = date(
            hoy.year,
            1,
            1
        )

        fecha_fin = hoy

        periodo_anterior_inicio = date(
            hoy.year - 1,
            1,
            1
        )

        periodo_anterior_fin = date(
            hoy.year - 1,
            12,
            31
        )

        nombre_periodo = (
            f"Año {hoy.year}"
        )

    # PERIODO NO VÁLIDO
    else:
        return Response(
            {
                "error": (
                    "Periodo no válido. "
                    "Usa: 15_dias, mensual, 6_meses o anual."
                )
            },
            status=400
        )

    # =========================================================
    # MONEDA
    # =========================================================

    if (
        usuario.pais
        and usuario.pais.moneda
    ):
        moneda = usuario.pais.moneda
        simbolo = moneda.simbolo
        codigo_moneda = moneda.codigo
        nombre_moneda = moneda.nombre

    else:
        simbolo = "$"
        codigo_moneda = "COP"
        nombre_moneda = "Peso Colombiano"

    # =========================================================
    # DINERO
    # =========================================================

    def dinero(valor):
        valor = Decimal(valor or 0)

        # COP
        if codigo_moneda == "COP":
            numero = (
                f"{valor:,.0f}"
                .replace(",", ".")
            )

            return f"{simbolo} {numero}"

        # EUR
        elif codigo_moneda == "EUR":
            numero = (
                f"{valor:,.2f}"
                .replace(",", "X")
                .replace(".", ",")
                .replace("X", ".")
            )

            return f"{numero} {simbolo}"

        # USD
        elif codigo_moneda == "USD":
            return (
                f"{simbolo}"
                f"{valor:,.2f}"
            )

        # JPY
        elif codigo_moneda == "JPY":
            return (
                f"{simbolo}"
                f"{valor:,.0f}"
            )

        # GBP
        elif codigo_moneda == "GBP":
            return (
                f"{simbolo}"
                f"{valor:,.2f}"
            )

        # CAD
        elif codigo_moneda == "CAD":
            return (
                f"{simbolo}"
                f"{valor:,.2f}"
            )

        # AUD
        elif codigo_moneda == "AUD":
            return (
                f"{simbolo}"
                f"{valor:,.2f}"
            )

        # MXN
        elif codigo_moneda == "MXN":
            return (
                f"{simbolo}"
                f"{valor:,.2f}"
            )

        # BRL
        elif codigo_moneda == "BRL":
            numero = (
                f"{valor:,.2f}"
                .replace(",", "X")
                .replace(".", ",")
                .replace("X", ".")
            )

            return (
                f"{simbolo} "
                f"{numero}"
            )

        # ARS
        elif codigo_moneda == "ARS":
            numero = (
                f"{valor:,.2f}"
                .replace(",", "X")
                .replace(".", ",")
                .replace("X", ".")
            )

            return (
                f"{simbolo} "
                f"{numero}"
            )

        # CLP
        elif codigo_moneda == "CLP":
            numero = (
                f"{valor:,.0f}"
                .replace(",", ".")
            )

            return (
                f"{simbolo} "
                f"{numero}"
            )

        # PEN
        elif codigo_moneda == "PEN":
            return (
                f"{simbolo} "
                f"{valor:,.2f}"
            )

        # POR DEFECTO
        else:
            return (
                f"{simbolo} "
                f"{valor:,.2f}"
            )

    # =========================================================
    # MOVIMIENTOS
    # =========================================================

    movimientos = Movimiento.objects.filter(
        usuario=usuario,
        fecha__gte=fecha_inicio,
        fecha__lte=fecha_fin
    )

    ingresos = (
        movimientos
        .filter(tipo="INGRESO")
        .aggregate(
            total=Sum("monto")
        )["total"]
        or Decimal("0")
    )

    gastos = (
        movimientos
        .filter(tipo="GASTO")
        .aggregate(
            total=Sum("monto")
        )["total"]
        or Decimal("0")
    )

    ahorros = (
        movimientos
        .filter(tipo="AHORRO")
        .aggregate(
            total=Sum("monto")
        )["total"]
        or Decimal("0")
    )

    saldo = (
        ingresos
        - gastos
        - ahorros
    )

    # =========================================================
    # PERIODO ANTERIOR
    # =========================================================

    movimientos_anterior = Movimiento.objects.filter(
        usuario=usuario,
        fecha__gte=periodo_anterior_inicio,
        fecha__lte=periodo_anterior_fin
    )

    ahorros_anterior = (
        movimientos_anterior
        .filter(tipo="AHORRO")
        .aggregate(
            total=Sum("monto")
        )["total"]
        or Decimal("0")
    )

    if ahorros_anterior > 0:
        variacion_ahorro = (
            (
                ahorros
                - ahorros_anterior
            )
            / ahorros_anterior
        ) * Decimal("100")

    else:
        variacion_ahorro = None

    # =========================================================
    # GASTOS POR CATEGORÍA
    # =========================================================

    gastos_categoria = (
        movimientos
        .filter(
            tipo="GASTO",
            categoria__isnull=False
        )
        .values(
            "categoria__nombre"
        )
        .annotate(
            total=Sum("monto")
        )
        .order_by("-total")
    )

    # =========================================================
    # METAS
    # =========================================================

    metas = (
        Meta.objects
        .filter(usuario=usuario)
        .order_by("fecha_limite")
    )

    # =========================================================
    # OBLIGACIONES
    # =========================================================

    obligaciones = (
        Obligacion.objects
        .filter(
            usuario=usuario,
            activa=True
        )
        .order_by(
            "fecha_limite"
        )
    )

    # =========================================================
    # HTTP RESPUESTA
    # =========================================================

    response = HttpResponse(
        content_type="application/pdf"
    )

    response["Content-Disposition"] = (
        f'attachment; '
        f'filename="reporte_{periodo}.pdf"'
    )

    # =========================================================
    # DOCUMENTO
    # =========================================================

    doc = SimpleDocTemplate(
        response,
        pagesize=letter,
        rightMargin=15 * mm,
        leftMargin=15 * mm,
        topMargin=18 * mm,
        bottomMargin=20 * mm
    )

    # =========================================================
    # GUIA DE TONOS
    # =========================================================

    styles = getSampleStyleSheet()

    azul = colors.HexColor("#053b52")
    azul_oscuro = colors.HexColor("#073244")
    azul_claro = colors.HexColor("#EAF2F8")
    verde = colors.HexColor("#2E8B57")
    verde_claro = colors.HexColor("#E6F7E7")
    amarillo = colors.HexColor("#F7AD1A")
    amarillo_claro = colors.HexColor("#FFF6DC")
    rojo = colors.HexColor("#C62828")
    rojo_claro = colors.HexColor("#FDECEC")
    gris = colors.HexColor("#6B7280")
    gris_texto = colors.HexColor("#263238")
    gris_claro = colors.HexColor("#F7F8FA")
    gris_suave = colors.HexColor("#F1F4F7")
    gris_borde = colors.HexColor("#E1E6EB")

    # =========================================================
    # STYLES
    # =========================================================

    titulo = ParagraphStyle(
        "Titulo",
        parent=styles["Title"],
        fontName="Helvetica-Bold",
        fontSize=21,
        leading=25,
        textColor=azul,
        alignment=TA_CENTER,
        spaceAfter=4
    )

    subtitulo = ParagraphStyle(
        "Subtitulo",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9,
        leading=13,
        textColor=gris,
        alignment=TA_CENTER,
        spaceAfter=10
    )

    seccion = ParagraphStyle(
        "Seccion",
        parent=styles["Heading2"],
        fontName="Helvetica-Bold",
        fontSize=12,
        leading=15,
        textColor=azul,
        spaceBefore=13,
        spaceAfter=7
    )

    texto = ParagraphStyle(
        "Texto",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=8.5,
        leading=12,
        textColor=gris_texto
    )

    texto_centro = ParagraphStyle(
        "TextoCentro",
        parent=texto,
        alignment=TA_CENTER
    )

    texto_derecha = ParagraphStyle(
        "TextoDerecha",
        parent=texto,
        alignment=TA_RIGHT
    )

    texto_pequeno = ParagraphStyle(
        "TextoPequeno",
        parent=texto,
        fontSize=7.5,
        leading=10,
        textColor=gris
    )

    contenido = []

    # =========================================================
    # HEADER
    # =========================================================

    encabezado = Table(
        [
            [
                Paragraph(
                    "<b>MIRAI</b>",
                    ParagraphStyle(
                        "Logo",
                        parent=styles["Normal"],
                        fontName="Helvetica-Bold",
                        fontSize=20,
                        textColor=colors.white
                    )
                ),
                Paragraph(
                    f"""
                    <b>INFORME FINANCIERO</b>
                    <br/>
                    <font size="8">
                        Preparado para: {nombre_usuario}
                    </font>
                    """,
                    ParagraphStyle(
                        "TituloBlanco",
                        parent=styles["Normal"],
                        fontName="Helvetica-Bold",
                        fontSize=14,
                        leading=17,
                        textColor=colors.white,
                        alignment=TA_RIGHT
                    )
                )
            ]
        ],
        colWidths=[
            45 * mm,
            130 * mm
        ]
    )

    encabezado.setStyle(
        TableStyle(
            [
                (
                    "BACKGROUND",
                    (0, 0),
                    (-1, -1),
                    azul
                ),
                (
                    "VALIGN",
                    (0, 0),
                    (-1, -1),
                    "MIDDLE"
                ),
                (
                    "LEFTPADDING",
                    (0, 0),
                    (-1, -1),
                    13
                ),
                (
                    "RIGHTPADDING",
                    (0, 0),
                    (-1, -1),
                    13
                ),
                (
                    "TOPPADDING",
                    (0, 0),
                    (-1, -1),
                    11
                ),
                (
                    "BOTTOMPADDING",
                    (0, 0),
                    (-1, -1),
                    11
                )
            ]
        )
    )

    contenido.append(encabezado)
    contenido.append(
        Spacer(1, 7)
    )

    # =========================================================
    # INFORMACIÓN
    # =========================================================

    informacion = Table(
        [
            [
                Paragraph(
                    f"<b>Período</b><br/>{nombre_periodo}",
                    texto
                ),
                Paragraph(
                    f"<b>Fecha</b><br/>"
                    f"{fecha_inicio.strftime('%d/%m/%Y')} - "
                    f"{fecha_fin.strftime('%d/%m/%Y')}",
                    texto
                ),
                Paragraph(
                    f"<b>Moneda</b><br/>"
                    f"{codigo_moneda} - "
                    f"{nombre_moneda}",
                    texto
                )
            ]
        ],
        colWidths=[
            58 * mm,
            58 * mm,
            59 * mm
        ]
    )

    informacion.setStyle(
        TableStyle(
            [
                (
                    "BACKGROUND",
                    (0, 0),
                    (-1, -1),
                    gris_claro
                ),
                (
                    "BOX",
                    (0, 0),
                    (-1, -1),
                    0.6,
                    gris_borde
                ),
                (
                    "INNERGRID",
                    (0, 0),
                    (-1, -1),
                    0.5,
                    gris_borde
                ),
                (
                    "VALIGN",
                    (0, 0),
                    (-1, -1),
                    "MIDDLE"
                ),
                (
                    "TOPPADDING",
                    (0, 0),
                    (-1, -1),
                    7
                ),
                (
                    "BOTTOMPADDING",
                    (0, 0),
                    (-1, -1),
                    7
                ),
                (
                    "LEFTPADDING",
                    (0, 0),
                    (-1, -1),
                    9
                )
            ]
        )
    )

    contenido.append(informacion)

    # =========================================================
    # RESUMEN FINANCIERO
    # =========================================================

    contenido.append(
        Paragraph(
            "Resumen financiero",
            seccion
        )
    )

    tarjetas = Table(
        [
            [
                Paragraph(
                    f"<font size='7.5'>INGRESOS</font><br/>"
                    f"<b>{dinero(ingresos)}</b>",
                    texto_centro
                ),
                Paragraph(
                    f"<font size='7.5'>GASTOS</font><br/>"
                    f"<b>{dinero(gastos)}</b>",
                    texto_centro
                ),
                Paragraph(
                    f"<font size='7.5'>AHORROS</font><br/>"
                    f"<b>{dinero(ahorros)}</b>",
                    texto_centro
                ),
                Paragraph(
                    f"<font size='7.5'>SALDO</font><br/>"
                    f"<b>{dinero(saldo)}</b>",
                    texto_centro
                )
            ]
        ],
        colWidths=[
            44 * mm,
            44 * mm,
            44 * mm,
            44 * mm
        ]
    )

    tarjetas.setStyle(
        TableStyle(
            [
                (
                    "BACKGROUND",
                    (0, 0),
                    (0, 0),
                    verde_claro
                ),
                (
                    "BACKGROUND",
                    (1, 0),
                    (1, 0),
                    rojo_claro
                ),
                (
                    "BACKGROUND",
                    (2, 0),
                    (2, 0),
                    amarillo_claro
                ),
                (
                    "BACKGROUND",
                    (3, 0),
                    (3, 0),
                    azul_claro
                ),
                (
                    "BOX",
                    (0, 0),
                    (-1, -1),
                    0.5,
                    gris_borde
                ),
                (
                    "INNERGRID",
                    (0, 0),
                    (-1, -1),
                    0.5,
                    gris_borde
                ),
                (
                    "VALIGN",
                    (0, 0),
                    (-1, -1),
                    "MIDDLE"
                ),
                (
                    "TOPPADDING",
                    (0, 0),
                    (-1, -1),
                    9
                ),
                (
                    "BOTTOMPADDING",
                    (0, 0),
                    (-1, -1),
                    9
                )
            ]
        )
    )

    contenido.append(tarjetas)

    # =========================================================
    # EVOLUCIÓN DEL AHORRO
    # =========================================================

    contenido.append(
        Paragraph(
            "Evolución del ahorro",
            seccion
        )
    )

    if variacion_ahorro is None:
        texto_variacion = (
            "No hay suficientes datos del período anterior "
            "para calcular la variación del ahorro."
        )

    else:
        variacion = round(
            variacion_ahorro,
            2
        )

        if variacion > 0:
            texto_variacion = (
                f"<b>↑ Ahorro en aumento:</b> "
                f"El ahorro aumentó un "
                f"<b>{variacion}%</b> "
                f"respecto al período anterior."
            )

        elif variacion < 0:
            texto_variacion = (
                f"<b>↓ Ahorro en disminución:</b> "
                f"El ahorro disminuyó un "
                f"<b>{abs(variacion)}%</b> "
                f"respecto al período anterior."
            )

        else:
            texto_variacion = (
                "<b>→ Ahorro estable:</b> "
                "El ahorro se mantuvo igual "
                "respecto al período anterior."
            )

    comparacion = Table(
        [
            [
                Paragraph(
                    texto_variacion,
                    texto
                )
            ]
        ],
        colWidths=[
            176 * mm
        ]
    )

    comparacion.setStyle(
        TableStyle(
            [
                (
                    "BACKGROUND",
                    (0, 0),
                    (-1, -1),
                    gris_claro
                ),
                (
                    "BOX",
                    (0, 0),
                    (-1, -1),
                    0.5,
                    gris_borde
                ),
                (
                    "LEFTPADDING",
                    (0, 0),
                    (-1, -1),
                    10
                ),
                (
                    "RIGHTPADDING",
                    (0, 0),
                    (-1, -1),
                    10
                ),
                (
                    "TOPPADDING",
                    (0, 0),
                    (-1, -1),
                    8
                ),
                (
                    "BOTTOMPADDING",
                    (0, 0),
                    (-1, -1),
                    8
                )
            ]
        )
    )

    contenido.append(comparacion)

    # =========================================================
    # DISTRIBUCIÓN DE GASTOS
    # =========================================================

    contenido.append(
        Paragraph(
            "Distribución de gastos",
            seccion
        )
    )

    gastos_data = [
        [
            "Categoría",
            "Total",
            "Participación"
        ]
    ]

    for gasto in gastos_categoria:
        total = gasto["total"]

        if gastos > 0:
            porcentaje = (
                Decimal(total)
                / gastos
            ) * Decimal("100")

        else:
            porcentaje = Decimal("0")

        gastos_data.append(
            [
                gasto["categoria__nombre"],
                dinero(total),
                f"{porcentaje:.1f}%"
            ]
        )

    if len(gastos_data) == 1:
        gastos_data.append(
            [
                "No hay gastos registrados",
                "-",
                "-"
            ]
        )

    tabla_gastos = Table(
        gastos_data,
        colWidths=[
            80 * mm,
            55 * mm,
            41 * mm
        ],
        repeatRows=1
    )

    tabla_gastos.setStyle(
        TableStyle(
            [
                (
                    "BACKGROUND",
                    (0, 0),
                    (-1, 0),
                    azul
                ),
                (
                    "TEXTCOLOR",
                    (0, 0),
                    (-1, 0),
                    colors.white
                ),
                (
                    "FONTNAME",
                    (0, 0),
                    (-1, 0),
                    "Helvetica-Bold"
                ),
                (
                    "ALIGN",
                    (1, 1),
                    (-1, -1),
                    "RIGHT"
                ),
                (
                    "GRID",
                    (0, 0),
                    (-1, -1),
                    0.4,
                    gris_borde
                ),
                (
                    "ROWBACKGROUNDS",
                    (0, 1),
                    (-1, -1),
                    [
                        colors.white,
                        gris_claro
                    ]
                ),
                (
                    "FONTSIZE",
                    (0, 0),
                    (-1, -1),
                    8
                ),
                (
                    "TOPPADDING",
                    (0, 0),
                    (-1, -1),
                    7
                ),
                (
                    "BOTTOMPADDING",
                    (0, 0),
                    (-1, -1),
                    7
                )
            ]
        )
    )

    contenido.append(tabla_gastos)

    # =========================================================
    # DETALLE DE MOVIMIENTOS
    # SOLO PARA 15 DÍAS Y MENSUAL
    # =========================================================

    if periodo in [
        "15_dias",
        "mensual"
    ]:
        contenido.append(
            Paragraph(
                "Detalle de movimientos",
                seccion
            )
        )

        movimientos_detalle = (
            movimientos
            .order_by(
                "-fecha",
                "-id"
            )
        )

        movimientos_data = [
            [
                "Fecha",
                "Descripción",
                "Categoría",
                "Tipo",
                "Monto"
            ]
        ]

        for movimiento in movimientos_detalle:
            # TIPO
            if movimiento.tipo == "INGRESO":
                tipo_texto = "Ingreso"
                color_tipo = verde

            elif movimiento.tipo == "GASTO":
                tipo_texto = "Gasto"
                color_tipo = rojo

            elif movimiento.tipo == "AHORRO":
                tipo_texto = "Ahorro"
                color_tipo = amarillo

            else:
                tipo_texto = movimiento.tipo
                color_tipo = gris

            # CATEGORÍA
            if movimiento.categoria:
                nombre_categoria = (
                    movimiento.categoria.nombre
                )

            else:
                nombre_categoria = "-"

            # FECHA
            fecha_movimiento = (
                movimiento.fecha.strftime(
                    "%d/%m/%Y"
                )
            )

            # DESCRIPCIÓN
            descripcion = (
                movimiento.descripcion
                if movimiento.descripcion
                else "-"
            )

            # MONTO
            monto = dinero(
                movimiento.monto
            )

            movimientos_data.append(
                [
                    Paragraph(
                        fecha_movimiento,
                        texto_pequeno
                    ),
                    Paragraph(
                        descripcion,
                        texto_pequeno
                    ),
                    Paragraph(
                        nombre_categoria,
                        texto_pequeno
                    ),
                    Paragraph(
                        f"<font color='{color_tipo.hexval()}'>"
                        f"<b>{tipo_texto}</b>"
                        f"</font>",
                        texto_pequeno
                    ),
                    Paragraph(
                        f"<font color='{color_tipo.hexval()}'>"
                        f"<b>{monto}</b>"
                        f"</font>",
                        ParagraphStyle(
                            "MontoMovimiento",
                            parent=texto_pequeno,
                            alignment=TA_RIGHT
                        )
                    )
                ]
            )

        if len(movimientos_data) == 1:
            movimientos_data.append(
                [
                    "-",
                    "No hay movimientos registrados",
                    "-",
                    "-",
                    "-"
                ]
            )

        tabla_movimientos = Table(
            movimientos_data,
            colWidths=[
                27 * mm,
                50 * mm,
                38 * mm,
                28 * mm,
                33 * mm
            ],
            repeatRows=1
        )

        tabla_movimientos.setStyle(
            TableStyle(
                [
                    (
                        "BACKGROUND",
                        (0, 0),
                        (-1, 0),
                        azul
                    ),
                    (
                        "TEXTCOLOR",
                        (0, 0),
                        (-1, 0),
                        colors.white
                    ),
                    (
                        "FONTNAME",
                        (0, 0),
                        (-1, 0),
                        "Helvetica-Bold"
                    ),
                    (
                        "GRID",
                        (0, 0),
                        (-1, -1),
                        0.4,
                        gris_borde
                    ),
                    (
                        "ROWBACKGROUNDS",
                        (0, 1),
                        (-1, -1),
                        [
                            colors.white,
                            gris_claro
                        ]
                    ),
                    (
                        "VALIGN",
                        (0, 0),
                        (-1, -1),
                        "MIDDLE"
                    ),
                    (
                        "ALIGN",
                        (4, 1),
                        (4, -1),
                        "RIGHT"
                    ),
                    (
                        "TOPPADDING",
                        (0, 0),
                        (-1, -1),
                        5
                    ),
                    (
                        "BOTTOMPADDING",
                        (0, 0),
                        (-1, -1),
                        5
                    ),
                    (
                        "LEFTPADDING",
                        (0, 0),
                        (-1, -1),
                        5
                    ),
                    (
                        "RIGHTPADDING",
                        (0, 0),
                        (-1, -1),
                        5
                    )
                ]
            )
        )

        contenido.append(
            tabla_movimientos
        )

    # =========================================================
    # METAS
    # =========================================================

    contenido.append(
        Paragraph(
            "Metas financieras",
            seccion
        )
    )

    metas_data = [
        [
            "Meta",
            "Objetivo",
            "Actual",
            "Progreso",
            "Estado"
        ]
    ]

    for meta in metas:
        if meta.monto_objetivo > 0:
            progreso = (
                meta.monto_actual
                / meta.monto_objetivo
            ) * Decimal("100")

        else:
            progreso = Decimal("0")

        progreso = min(
            progreso,
            Decimal("100")
        )

        metas_data.append(
            [
                meta.nombre,
                dinero(
                    meta.monto_objetivo
                ),
                dinero(
                    meta.monto_actual
                ),
                f"{progreso:.1f}%",
                meta.get_estado_display()
            ]
        )

    if len(metas_data) == 1:
        metas_data.append(
            [
                "No hay metas registradas",
                "-",
                "-",
                "-",
                "-"
            ]
        )

    tabla_metas = Table(
        metas_data,
        colWidths=[
            43 * mm,
            34 * mm,
            34 * mm,
            28 * mm,
            37 * mm
        ],
        repeatRows=1
    )

    tabla_metas.setStyle(
        TableStyle(
            [
                (
                    "BACKGROUND",
                    (0, 0),
                    (-1, 0),
                    azul
                ),
                (
                    "TEXTCOLOR",
                    (0, 0),
                    (-1, 0),
                    colors.white
                ),
                (
                    "FONTNAME",
                    (0, 0),
                    (-1, 0),
                    "Helvetica-Bold"
                ),
                (
                    "GRID",
                    (0, 0),
                    (-1, -1),
                    0.4,
                    gris_borde
                ),
                (
                    "ALIGN",
                    (1, 1),
                    (3, -1),
                    "RIGHT"
                ),
                (
                    "ALIGN",
                    (4, 1),
                    (4, -1),
                    "CENTER"
                ),
                (
                    "FONTSIZE",
                    (0, 0),
                    (-1, -1),
                    8
                ),
                (
                    "ROWBACKGROUNDS",
                    (0, 1),
                    (-1, -1),
                    [
                        colors.white,
                        gris_claro
                    ]
                ),
                (
                    "TOPPADDING",
                    (0, 0),
                    (-1, -1),
                    6
                ),
                (
                    "BOTTOMPADDING",
                    (0, 0),
                    (-1, -1),
                    6
                )
            ]
        )
    )

    contenido.append(
        tabla_metas
    )

    # =========================================================
    # OBLIGACIONES
    # =========================================================

    contenido.append(
        Paragraph(
            "Obligaciones activas",
            seccion
        )
    )

    obligaciones_data = [
        [
            "Obligación",
            "Monto",
            "Fecha límite",
            "Días restantes"
        ]
    ]

    for obligacion in obligaciones:
        if obligacion.fecha_limite:
            dias_restantes = (
                obligacion.fecha_limite
                - hoy
            ).days

        else:
            dias_restantes = None

        obligaciones_data.append(
            [
                obligacion.nombre,
                dinero(
                    obligacion.monto_estimado
                ),
                (
                    obligacion.fecha_limite.strftime(
                        "%d/%m/%Y"
                    )
                    if obligacion.fecha_limite
                    else "-"
                ),
                (
                    dias_restantes
                    if dias_restantes is not None
                    else "-"
                )
            ]
        )

    if len(obligaciones_data) == 1:
        obligaciones_data.append(
            [
                "No hay obligaciones activas",
                "-",
                "-",
                "-"
            ]
        )

    tabla_obligaciones = Table(
        obligaciones_data,
        colWidths=[
            55 * mm,
            40 * mm,
            45 * mm,
            36 * mm
        ],
        repeatRows=1
    )

    tabla_obligaciones.setStyle(
        TableStyle(
            [
                (
                    "BACKGROUND",
                    (0, 0),
                    (-1, 0),
                    azul
                ),
                (
                    "TEXTCOLOR",
                    (0, 0),
                    (-1, 0),
                    colors.white
                ),
                (
                    "FONTNAME",
                    (0, 0),
                    (-1, 0),
                    "Helvetica-Bold"
                ),
                (
                    "GRID",
                    (0, 0),
                    (-1, -1),
                    0.4,
                    gris_borde
                ),
                (
                    "ALIGN",
                    (1, 1),
                    (-1, -1),
                    "RIGHT"
                ),
                (
                    "ROWBACKGROUNDS",
                    (0, 1),
                    (-1, -1),
                    [
                        colors.white,
                        gris_claro
                    ]
                ),
                (
                    "FONTSIZE",
                    (0, 0),
                    (-1, -1),
                    8
                ),
                (
                    "TOPPADDING",
                    (0, 0),
                    (-1, -1),
                    6
                ),
                (
                    "BOTTOMPADDING",
                    (0, 0),
                    (-1, -1),
                    6
                )
            ]
        )
    )

    contenido.append(
        tabla_obligaciones
    )

    # =========================================================
    # CONCLUSIÓN
    # =========================================================

    contenido.append(
        Paragraph(
            "Resumen del período",
            seccion
        )
    )

    if saldo > 0:
        conclusion = (
            f"Durante el período analizado se registraron "
            f"<b>{dinero(ingresos)}</b> en ingresos, "
            f"<b>{dinero(gastos)}</b> en gastos y "
            f"<b>{dinero(ahorros)}</b> destinados al ahorro. "
            f"El período finaliza con un saldo de "
            f"<b>{dinero(saldo)}</b>."
        )

    elif saldo == 0:
        conclusion = (
            "Durante el período analizado los ingresos, "
            "gastos y ahorros dieron como resultado "
            "un saldo equilibrado."
        )

    else:
        conclusion = (
            f"Durante el período analizado se registraron "
            f"movimientos superiores a los ingresos, "
            f"generando un saldo negativo de "
            f"<b>{dinero(abs(saldo))}</b>."
        )

    contenido.append(
        Table(
            [
                [
                    Paragraph(
                        conclusion,
                        texto
                    )
                ]
            ],
            colWidths=[
                176 * mm
            ],
            style=TableStyle(
                [
                    (
                        "BACKGROUND",
                        (0, 0),
                        (-1, -1),
                        azul_claro
                    ),
                    (
                        "BOX",
                        (0, 0),
                        (-1, -1),
                        0.5,
                        gris_borde
                    ),
                    (
                        "LEFTPADDING",
                        (0, 0),
                        (-1, -1),
                        10
                    ),
                    (
                        "RIGHTPADDING",
                        (0, 0),
                        (-1, -1),
                        10
                    ),
                    (
                        "TOPPADDING",
                        (0, 0),
                        (-1, -1),
                        9
                    ),
                    (
                        "BOTTOMPADDING",
                        (0, 0),
                        (-1, -1),
                        9
                    )
                ]
            )
        )
    )

    # =========================================================
    # FOOTER
    # =========================================================

    def pie_pagina(canvas, doc):
        canvas.saveState()

        # LÍNEA SUPERIOR
        canvas.setStrokeColor(
            gris_borde
        )

        canvas.line(
            15 * mm,
            13 * mm,
            195 * mm,
            13 * mm
        )

        # TEXTO DEL FOOTER
        canvas.setFont(
            "Helvetica",
            7
        )

        canvas.setFillColor(
            gris
        )

        canvas.drawString(
            15 * mm,
            8 * mm,
            f"MIRAI • {nombre_usuario} • {codigo_moneda}"
        )

        # NÚMERO DE PÁGINA
        canvas.drawRightString(
            195 * mm,
            8 * mm,
            f"Página {doc.page}"
        )

        canvas.restoreState()

    # =========================================================
    # CREAR PDF
    # =========================================================

    doc.build(
        contenido,
        onFirstPage=pie_pagina,
        onLaterPages=pie_pagina
    )

    return response
