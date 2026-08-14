from datetime import date, timedelta
from decimal import Decimal
from django.db.models import Sum
from ..models import Movimiento, Meta, Obligacion

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

def obtener_dashboard(usuario):
  hoy = date.today()
  # PERÍODO ACTUAL
  inicio_periodo = hoy.replace(day=1)
  # PERÍODO ANTERIOR
  fin_periodo_anterior = inicio_periodo - timedelta(days=1)
  inicio_periodo_anterior = fin_periodo_anterior.replace(day=1)
  # --------------------------------------------------
  # MOVIMIENTOS
  # --------------------------------------------------
  movimientos = Movimiento.objects.filter(usuario=usuario)
  # MOVIMIENTOS DEL MES ACTUAL
  movimientos_actuales = movimientos.filter(
    fecha__gte=inicio_periodo,
    fecha__lte=hoy
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
  # COMPARACIONES
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
    if obligacion.fecha_limite:
      dias_restantes = (
        obligacion.fecha_limite - hoy
      ).days
    else:
      dias_restantes = None
    obligaciones_data.append({
      "id": obligacion.id,
      "nombre": obligacion.nombre,
      "monto": int(obligacion.monto_estimado),
      "fecha_limite": obligacion.fecha_limite,
      "dias_restantes": dias_restantes
    })
  # --------------------------------------------------
  # GASTOS POR CATEGORÍA
  # --------------------------------------------------
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
  # RESPUESTA
  # --------------------------------------------------
  return {
    "periodo": {
      "nombre": "Mes actual",
      "inicio": inicio_periodo,
      "fin": hoy
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
      "comparacion": comparacion,
      "metas": metas_data,
      "obligaciones": obligaciones_data,
      "gastos_por_categoria": gastos_categoria_data
  }