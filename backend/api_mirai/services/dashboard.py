from datetime import date, timedelta
from django.utils import timezone
from decimal import Decimal
from django.db.models import Sum
from ..models import Movimiento, Meta, Obligacion, HistorialObligacion

MESES = [
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
    "Diciembre"
]

def calcular_variacion(actual, anterior):
  actual = Decimal(actual or 0)
  anterior = Decimal(anterior or 0)
  # Si no había nada en el período anterior
  if anterior == 0:
    if actual > 0:
      return {
        "porcentaje": None,
        "tendencia": "AUMENTO",
        "mensaje": "No había registros en el período anterior"
      }
    return {
      "porcentaje": 0,
      "tendencia": "IGUAL",
      "mensaje": "Sin cambios"
    }
  variacion = ((actual - anterior) / anterior) * Decimal("100")
  variacion = round(variacion, 2)
  # Si variación es mayor a 0
  if variacion > 0:
    tendencia = "AUMENTO"
  # Si variación es menor a 0
  elif variacion < 0:
    tendencia = "DISMINUCION"
  # Si no es ninguna condición
  else:
    tendencia = "IGUAL"
  return {
    "porcentaje": float(abs(variacion)),
    "tendencia": tendencia,
    "mensaje": "Aumento" if variacion > 0
    else "Disminución" if variacion < 0
    else "Sin cambios"
  }

def obtener_notificaciones(usuario, hoy):
  notificaciones = []
  # NOTIFICACIONES DE METAS
  metas = Meta.objects.filter(
    usuario=usuario
  ).order_by("fecha_limite")
  for meta in metas:
    # Ignorar metas completadas
    if meta.estado == "COMPLETADA":
      continue

    if not meta.fecha_limite:
      continue

    restante = (
      Decimal(meta.monto_objetivo)
      - Decimal(meta.monto_actual)
    )
    # Si ya alcanzó el objetivo
    if restante <= 0:
      continue
    dias_restantes = (
      meta.fecha_limite - hoy
    ).days
    # Si la fecha ya pasó
    if dias_restantes <= 0:
      continue
    # CALCULAR MESES RESTANTES
    meses_restantes = max(
      1,
      round(dias_restantes / 30)
    )
    ahorro_mensual = (
      restante / Decimal(meses_restantes)
    )
    ahorro_mensual = round(
      ahorro_mensual,
      2
    )
    notificaciones.append({
      "tipo": "META",
      "icono": "ahorro",
      "titulo": "Planifica tu ahorro",
      "mensaje": (
        "Puedes realizar un abono de "
        "{monto} "
        "para estar un paso más cerca "
        f'de tu meta "{meta.nombre}".'
      ),
      "monto": ahorro_mensual,
      "meta_id": meta.id,
      "fecha": meta.fecha_limite
    })

  # NOTIFICACIONES DE OBLIGACIONES
  obligaciones = Obligacion.objects.filter(
    usuario=usuario,
    activa=True,
    cumplida=False
  ).order_by("fecha_limite")
  for obligacion in obligaciones:
    if not obligacion.fecha_limite:
      continue
    dias_restantes = (
      obligacion.fecha_limite - hoy
    ).days
    # Mostrar únicamente cuando faltan 15 días o menos
    if 0 <= dias_restantes <= 15:
      if dias_restantes == 0:
        mensaje = (
          f"Hoy vence tu obligación "
          f"\"{obligacion.nombre}\"."
        )
      elif dias_restantes == 1:
        mensaje = (
          f"Te queda 1 día para llegar al límite "
          f"de tu obligación \"{obligacion.nombre}\"."
        )
      else:
        mensaje = (
          f"Estás a {dias_restantes} días de llegar "
          f"al límite de tu obligación "
          f"\"{obligacion.nombre}\"."
        )

      notificaciones.append({
        "tipo": "OBLIGACION",
        "icono": "obligacion",
        "titulo": "Obligación próxima",
        "mensaje": mensaje,
        "monto_estimado": obligacion.monto_estimado,
        "obligacion_id": obligacion.id,
        "fecha": obligacion.fecha_limite,
        "dias_restantes": dias_restantes
      })

  return notificaciones

def obtener_dashboard(usuario, periodo="mes"):
  print("PERIODO RECIBIDO:", periodo)
  if periodo not in ["mes", "comparacion", "anual"]:
    periodo = "mes"
  hoy = timezone.localdate()
  # --------------------------------------------------
  # DEFINIR PERÍODOS
  # --------------------------------------------------
  inicio_mes_actual = hoy.replace(day=1)
  fin_mes_anterior = inicio_mes_actual - timedelta(days=1)
  inicio_mes_anterior = fin_mes_anterior.replace(day=1)
  # Primer día del año
  inicio_anio = hoy.replace(
    month=1,
    day=1
  )
  # --------------------------------------------------
  # PERÍODO PRINCIPAL
  # --------------------------------------------------

  if periodo == "mes":
    inicio_periodo = inicio_mes_actual
    fin_periodo = hoy
    inicio_periodo_anterior = inicio_mes_anterior
    fin_periodo_anterior = fin_mes_anterior
    nombre_periodo = "Mes actual"

  elif periodo == "comparacion":
    inicio_periodo = inicio_mes_actual
    fin_periodo = hoy
    inicio_periodo_anterior = inicio_mes_anterior
    fin_periodo_anterior = min(
      fin_mes_anterior,
      inicio_mes_anterior + timedelta(days=hoy.day - 1)
    )
    nombre_periodo = "Mes vs mes anterior"

  elif periodo == "anual":
    inicio_periodo = inicio_anio
    fin_periodo = hoy
    inicio_periodo_anterior = inicio_anio
    fin_periodo_anterior = hoy
    nombre_periodo = "Año actual"

  # --------------------------------------------------
  # MOVIMIENTOS
  # --------------------------------------------------
  movimientos = Movimiento.objects.filter(usuario=usuario)
  # MOVIMIENTOS DEL MES ACTUAL
  movimientos_actuales = movimientos.filter(
    fecha__gte=inicio_periodo,
    fecha__lte=fin_periodo
  )
  ingresos = (
    movimientos_actuales
    .filter(tipo="INGRESO")
    .aggregate(total=Sum("monto"))["total"]
    or Decimal("0")
  )
  gastos = (
    movimientos_actuales
    .filter(tipo="GASTO")
    .aggregate(total=Sum("monto"))["total"]
    or Decimal("0")
  )
  ahorros = (
    movimientos_actuales
    .filter(tipo="AHORRO")
    .aggregate(total=Sum("monto"))["total"]
    or Decimal("0")
  )
  saldo = ingresos - gastos - ahorros

  # MOVIMIENTOS DEL MES ANTERIOR
  movimientos_anterior = movimientos.filter(
    fecha__gte=inicio_periodo_anterior,
    fecha__lte=fin_periodo_anterior
  )
  ingresos_anterior = (
    movimientos_anterior
    .filter(tipo="INGRESO")
    .aggregate(total=Sum("monto"))["total"]
    or Decimal("0")
  )
  gastos_anterior = (
    movimientos_anterior
    .filter(tipo="GASTO")
    .aggregate(total=Sum("monto"))["total"]
    or Decimal("0")
  )
  ahorros_anterior = (
    movimientos_anterior
    .filter(tipo="AHORRO")
    .aggregate(total=Sum("monto"))["total"]
    or Decimal("0")
  )
  saldo_anterior = (
    ingresos_anterior
    - gastos_anterior
    - ahorros_anterior
  )

# --------------------------------------------------
# BALANCE
# --------------------------------------------------
  balance_data = []
# --------------------------------------------------
# MES ACTUAL
# --------------------------------------------------
  if periodo == "mes":
    saldo_acumulado = Decimal("0")
    fecha_actual = inicio_periodo
    while fecha_actual <= fin_periodo:
      movimientos_dia = movimientos.filter(
        fecha=fecha_actual
      )

      ingresos_dia = (
        movimientos_dia
        .filter(tipo="INGRESO")
        .aggregate(total=Sum("monto"))["total"]
        or Decimal("0")
      )

      gastos_dia = (
        movimientos_dia
        .filter(tipo="GASTO")
        .aggregate(total=Sum("monto"))["total"]
        or Decimal("0")
      )

      ahorros_dia = (
        movimientos_dia
        .filter(tipo="AHORRO")
        .aggregate(total=Sum("monto"))["total"]
        or Decimal("0")
      )

      variacion_dia = (
        ingresos_dia
        - gastos_dia
        - ahorros_dia
      )
      saldo_acumulado += variacion_dia
      balance_data.append({
        "fecha": fecha_actual,
        "dia": fecha_actual.day,
        "ingresos": int(ingresos_dia),
        "gastos": int(gastos_dia),
        "ahorros": int(ahorros_dia),
        "saldo": int(saldo_acumulado)
      })
      fecha_actual += timedelta(days=1)
  # --------------------------------------------------
# MES VS MES ANTERIOR
# --------------------------------------------------

  elif periodo == "comparacion":

    dia_hasta = hoy.day

    for dia in range(1, dia_hasta + 1):

        # ------------------------------------------
        # FECHA MES ACTUAL
        # ------------------------------------------

        fecha_actual = inicio_mes_actual.replace(day=dia)

        # ------------------------------------------
        # FECHA MES ANTERIOR
        # ------------------------------------------

        try:
            fecha_anterior = inicio_mes_anterior.replace(day=dia)
        except ValueError:
            fecha_anterior = None

        # ------------------------------------------
        # MOVIMIENTOS ACTUALES
        # ------------------------------------------

        movimientos_actual_dia = movimientos.filter(
            fecha=fecha_actual
        )

        ingresos_actual = (
            movimientos_actual_dia
            .filter(tipo="INGRESO")
            .aggregate(total=Sum("monto"))["total"]
            or Decimal("0")
        )

        gastos_actual = (
            movimientos_actual_dia
            .filter(tipo="GASTO")
            .aggregate(total=Sum("monto"))["total"]
            or Decimal("0")
        )

        ahorros_actual = (
            movimientos_actual_dia
            .filter(tipo="AHORRO")
            .aggregate(total=Sum("monto"))["total"]
            or Decimal("0")
        )

        # ------------------------------------------
        # MOVIMIENTOS MES ANTERIOR
        # ------------------------------------------

        if fecha_anterior:

            movimientos_anterior_dia = movimientos.filter(
                fecha=fecha_anterior
            )

            ingresos_anterior_dia = (
                movimientos_anterior_dia
                .filter(tipo="INGRESO")
                .aggregate(total=Sum("monto"))["total"]
                or Decimal("0")
            )

            gastos_anterior_dia = (
                movimientos_anterior_dia
                .filter(tipo="GASTO")
                .aggregate(total=Sum("monto"))["total"]
                or Decimal("0")
            )

            ahorros_anterior_dia = (
                movimientos_anterior_dia
                .filter(tipo="AHORRO")
                .aggregate(total=Sum("monto"))["total"]
                or Decimal("0")
            )

        else:

            ingresos_anterior_dia = Decimal("0")
            gastos_anterior_dia = Decimal("0")
            ahorros_anterior_dia = Decimal("0")

        # ------------------------------------------
        # AGREGAR DÍA
        # ------------------------------------------

        balance_data.append({
            "dia": dia,

            "actual": {
                "ingresos": int(ingresos_actual),
                "gastos": int(gastos_actual),
                "ahorros": int(ahorros_actual),
            },

            "anterior": {
                "ingresos": int(ingresos_anterior_dia),
                "gastos": int(gastos_anterior_dia),
                "ahorros": int(ahorros_anterior_dia),
            }
        })


# --------------------------------------------------
# ANUAL
# --------------------------------------------------

  else:

    saldo_acumulado = Decimal("0")

    for mes in range(1, hoy.month + 1):

        inicio_mes = date(
            hoy.year,
            mes,
            1
        )

        # Primer día del siguiente mes
        if mes == 12:

            fin_mes = date(
                hoy.year + 1,
                1,
                1
            ) - timedelta(days=1)

        else:

            fin_mes = date(
                hoy.year,
                mes + 1,
                1
            ) - timedelta(days=1)

        # Si es el mes actual,
        # solo llegamos hasta hoy
        if mes == hoy.month:

            fin_mes = hoy

        movimientos_mes = movimientos.filter(
            fecha__gte=inicio_mes,
            fecha__lte=fin_mes
        )

        ingresos_mes = (
            movimientos_mes
            .filter(tipo="INGRESO")
            .aggregate(total=Sum("monto"))["total"]
            or Decimal("0")
        )

        gastos_mes = (
            movimientos_mes
            .filter(tipo="GASTO")
            .aggregate(total=Sum("monto"))["total"]
            or Decimal("0")
        )

        ahorros_mes = (
            movimientos_mes
            .filter(tipo="AHORRO")
            .aggregate(total=Sum("monto"))["total"]
            or Decimal("0")
        )

        variacion_mes = (
            ingresos_mes
            - gastos_mes
            - ahorros_mes
        )

        saldo_acumulado += variacion_mes

        balance_data.append({

            "fecha": inicio_mes,

            "mes": MESES[mes - 1],

            "mes_numero": mes,

            "ingresos": int(ingresos_mes),

            "gastos": int(gastos_mes),

            "ahorros": int(ahorros_mes),

            "saldo": int(saldo_acumulado)

        })

  # --------------------------------------------------
  # COMPARACIONES
  # --------------------------------------------------
  comparacion = {
    "ingresos": calcular_variacion(
      ingresos,
      ingresos_anterior
    ),
    "gastos": calcular_variacion(
      gastos,
      gastos_anterior
    ),
    "ahorros": calcular_variacion(
      ahorros,
      ahorros_anterior
    ),
    "saldo": calcular_variacion(
      saldo,
      saldo_anterior
    )
  }
  
  # --------------------------------------------------
  # METAS
  # --------------------------------------------------
  metas = Meta.objects.filter(usuario=usuario).order_by("fecha_limite")
  metas_data = []
  for meta in metas:
    if meta.monto_objetivo == 0:
      progreso = 0
    else:
      progreso = round((
          meta.monto_actual / meta.monto_objetivo
        ) * 100,2
      )
    # Evitar que visualmente supere 100%
    progreso = min(progreso, 100)
    metas_data.append({
      "id": meta.id,
      "nombre": meta.nombre,
      "monto_objetivo": int(meta.monto_objetivo),
      "monto_actual": int(meta.monto_actual),
      "progreso": progreso,
      "estado": meta.estado,
      "fecha_limite": meta.fecha_limite
    })

  # --------------------------------------------------
  # OBLIGACIONES
  # --------------------------------------------------

  obligaciones = (
    Obligacion.objects
    .filter(
      usuario=usuario,
      activa=True
    )
    .order_by("fecha_limite")
  )

  obligaciones_data = []

  for obligacion in obligaciones:

    # -----------------------------------------------
    # DÍAS RESTANTES
    # -----------------------------------------------

    if obligacion.fecha_limite:
      dias_restantes = (
        obligacion.fecha_limite - hoy
      ).days
    else:
      dias_restantes = None

    # -----------------------------------------------
    # ÚLTIMA REALIZACIÓN
    # -----------------------------------------------

    ultimo_registro = (
      HistorialObligacion.objects
      .filter(
        obligacion=obligacion,
        usuario=usuario
      )
      .order_by(
        "-fecha_realizada",
        "-id"
      )
      .first()
    )

    if ultimo_registro:
      ultima_fecha_realizada = (
        ultimo_registro.fecha_realizada
      )
    else:
      ultima_fecha_realizada = None

    # -----------------------------------------------
    # ¿SE CUMPLIÓ HOY?
    # -----------------------------------------------

    cumplida_hoy = (
      ultima_fecha_realizada == hoy
    )

    obligaciones_data.append({
      "id": obligacion.id,
      "nombre": obligacion.nombre,
      "monto_estimado": int(obligacion.monto_estimado),
      "fecha_limite": obligacion.fecha_limite,
      "dias_restantes": dias_restantes,
      "activa": obligacion.activa,
      "cumplida": obligacion.cumplida,
      "cumplida_hoy": cumplida_hoy,
      "ultima_fecha_realizada": ultima_fecha_realizada
    })
  # --------------------------------------------------
  # CATEGORÍA
  # --------------------------------------------------
  # GASTOS
  gastos_categoria = (
    movimientos_actuales
    .filter(
      tipo="GASTO",
      categoria__isnull=False
    )
    .values(
      "categoria__id",
      "categoria__nombre"
    )
    .annotate(
      total=Sum("monto")
    )
    .order_by("-total")
  )
  gastos_categoria_data = []
  for gasto in gastos_categoria:
    gastos_categoria_data.append({
      "categoria_id": gasto["categoria__id"],
      "categoria": gasto["categoria__nombre"],
      "total": int(gasto["total"])
    })
  # COMPARACIÓN 
  # Siempre inicializamos la lista
  gastos_categoria_anterior_data = []
  # En el período anual no se compara de categorías contra otro período.
  if periodo != "anual":
    gastos_categoria_anterior = (
      movimientos_anterior
      .filter(
        tipo="GASTO",
        categoria__isnull=False
      )
      .values(
        "categoria__id",
        "categoria__nombre"
      )
      .annotate(
        total=Sum("monto")
      )
      .order_by("-total")
    )
    for gasto in gastos_categoria_anterior:
      gastos_categoria_anterior_data.append({
        "categoria_id": gasto["categoria__id"],
        "categoria": gasto["categoria__nombre"],
        "total": int(gasto["total"])
      })
  # --------------------------------------------------
  # MONEDA
  # --------------------------------------------------
  if usuario.pais and usuario.pais.moneda:
    moneda = {
      "codigo": usuario.pais.moneda.codigo,
      "nombre": usuario.pais.moneda.nombre,
      "simbolo": usuario.pais.moneda.simbolo
    }
  else:
    moneda = {
      "codigo": "",
      "nombre": "",
      "simbolo": "$"
    }

  # --------------------------------------------------
  # NOTIFICACIONES
  # --------------------------------------------------
  notificaciones = obtener_notificaciones(
    usuario,
    hoy
  )
  # --------------------------------------------------
  # RESPUESTA
  # --------------------------------------------------
  return {
    "usuario": {
        "id": usuario.id,
        "username": usuario.username,
        "nombre": usuario.get_full_name(),
        "email": usuario.email,
        "ultimo_acceso": usuario.last_login
    },
    "periodo": {
      "nombre": nombre_periodo,
      "inicio": inicio_periodo,
      "fin": fin_periodo
    },
    "periodo_anterior": {
      "inicio": inicio_periodo_anterior,
      "fin": fin_periodo_anterior
    },
      "moneda": moneda,
      "ingresos": int(ingresos),
      "gastos": int(gastos),
      "ahorros": int(ahorros),
      "saldo": int(saldo),
      "ingresos_anterior": int(ingresos_anterior),
      "gastos_anterior": int(gastos_anterior),
      "ahorros_anterior": int(ahorros_anterior),
      "saldo_anterior": int(saldo_anterior),
      "comparacion": comparacion,
      "balance": balance_data,
      "metas": metas_data,
      "obligaciones": obligaciones_data,
      "gastos_por_categoria": gastos_categoria_data,
      "gastos_por_categoria_anterior": gastos_categoria_anterior_data,
      "notificaciones": notificaciones
  }