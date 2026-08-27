from rest_framework import generics
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated,AllowAny
from django.contrib.auth import get_user_model 
from django.db.models import Q
from .models import Moneda,Pais,Meta,Categoria,Movimiento,Obligacion
from .serializer import MonedaSerializer,PaisSerializer,UsuarioSerializer,MetaSerializer,CategoriaSerializer,MovimientoSerializer,ObligacionSerializer,LoginSerializer
#Dashboard y PDF
from rest_framework.views import APIView
from .services.dashboard import obtener_dashboard
# Dashboard
from rest_framework.response import Response
# PDF
from .services.reporte_pdf import generar_reporte_pdf
# Proyección de ahorro
from .services.proyeccion import obtener_proyeccion_meta

User=get_user_model()

# -----------------------------------------------
# MONEDAS
# -----------------------------------------------
class MonedaViewSet (ModelViewSet):
  queryset = Moneda.objects.all()
  serializer_class = MonedaSerializer

# -----------------------------------------------
# PAISES
# -----------------------------------------------
class PaisViewSet (ModelViewSet):
  queryset = Pais.objects.all()
  serializer_class = PaisSerializer

# -----------------------------------------------
# USUARIOS
# -----------------------------------------------
class UsuarioViewSet (ModelViewSet):
  permission_classes = [IsAuthenticated]
  queryset = User.objects.all()
  serializer_class = UsuarioSerializer
  http_method_names = ['get', 'patch', 'head', 'options']
  def get_queryset(self):
    return User.objects.filter(id=self.request.user.id)

# -----------------------------------------------
# LOGIN
# -----------------------------------------------
class LoginView(TokenObtainPairView):
    serializer_class = LoginSerializer

# -----------------------------------------------
# METAS
# -----------------------------------------------

class MetaViewSet(ModelViewSet):

  permission_classes = [IsAuthenticated]
  serializer_class = MetaSerializer

  def get_queryset(self):
    return Meta.objects.filter(usuario=self.request.user)

  def perform_create(self, serializer):
    serializer.save(usuario=self.request.user)

# -----------------------------------------------
# CATEGORIAS
# ----------------------------------------------- 
class CategoriaViewSet (ModelViewSet):
  permission_classes = [IsAuthenticated]
  serializer_class = CategoriaSerializer
  def get_queryset(self):
    return Categoria.objects.filter(
      Q(creada__isnull=True) | Q(creada=self.request.user)
    )
  def perform_create(self, serializer):
    return serializer.save(creada=self.request.user)

# -----------------------------------------------
# MOVIMIENTOS
# -----------------------------------------------

class MovimientoViewSet(ModelViewSet):
  permission_classes = [IsAuthenticated]
  serializer_class = MovimientoSerializer

  def get_queryset(self):
    return Movimiento.objects.filter(usuario=self.request.user)

  # CREAR
  def perform_create(self, serializer):
    movimiento = serializer.save(usuario=self.request.user)
    # Si es un ahorro asociado a una meta
    if ( movimiento.tipo == "AHORRO" and movimiento.meta
    ):
      meta = movimiento.meta
      meta.monto_actual += movimiento.monto
      # Comprobar si completó la meta
      if (
        meta.monto_actual >=
        meta.monto_objetivo
      ):
        meta.estado = "COMPLETADO"
      meta.save()

  # EDITAR
  def perform_update(self, serializer):
    movimiento_anterior = self.get_object()
    # Guardamos los datos anteriores
    tipo_anterior = movimiento_anterior.tipo
    meta_anterior = movimiento_anterior.meta
    monto_anterior = movimiento_anterior.monto
    # Guardar cambios
    movimiento = serializer.save()

    # QUITAR EFECTO DEL MOVIMIENTO ANTERIOR
    if (
      tipo_anterior == "AHORRO"
      and meta_anterior
    ):
      meta_anterior.monto_actual -= monto_anterior
      # Evitar valores negativos
      if meta_anterior.monto_actual < 0:
        meta_anterior.monto_actual = 0
      # Actualizar estado
      if (
        meta_anterior.monto_actual >=
        meta_anterior.monto_objetivo
      ):
        meta_anterior.estado = "COMPLETADO"
      else:
        meta_anterior.estado = "EN_PROCESO"
      meta_anterior.save()

      # APLICAR NUEVO EFECTO
      if (
        movimiento.tipo == "AHORRO"
        and movimiento.meta
      ):
        meta_nueva = movimiento.meta
        meta_nueva.monto_actual += movimiento.monto
        if (
          meta_nueva.monto_actual >=
          meta_nueva.monto_objetivo
        ):
          meta_nueva.estado = "COMPLETADO"
        else:
          meta_nueva.estado = "EN_PROCESO"
        meta_nueva.save()

  # ELIMINAR
  def perform_destroy(self, instance):

    # Si es un ahorro asociado a una meta
    if (
      instance.tipo == "AHORRO" and instance.meta
    ):
      meta = instance.meta
      meta.monto_actual -= instance.monto
      # Evitar negativos
      if meta.monto_actual < 0:
        meta.monto_actual = 0
      # Si ya no está completa, vuelve a EN_PROCESO
      if (
        meta.monto_actual <
        meta.monto_objetivo
      ):
        meta.estado = "EN_PROCESO"
      meta.save()

    instance.delete()

# -----------------------------------------------
# OBLIGACIONES
# -----------------------------------------------  
class ObligacionViewSet(ModelViewSet):
  permission_classes = [IsAuthenticated]
  serializer_class = ObligacionSerializer
  def get_queryset(self):
    queryset = Obligacion.objects.filter(
      usuario=self.request.user)
    activa = self.request.query_params.get("activa")
    if activa is not None:
      queryset = queryset.filter(activa=activa.lower() == "true")
    return queryset
  
  def perform_create(self, serializer):
    serializer.save(usuario=self.request.user)

# -----------------------------------------------
# REGISTRO
# -----------------------------------------------
class RegisterView(generics.CreateAPIView):
  queryset = User.objects.all()
  serializer_class = UsuarioSerializer
  permission_classes = [AllowAny]

# -----------------------------------------------
# DASHBOARD
# -----------------------------------------------
class DashboardView(APIView):
  permission_classes = [IsAuthenticated]
  def get(self, request):
    periodo = request.query_params.get(
      "periodo",
      "mes"
    )
    datos = obtener_dashboard(
      request.user,
      periodo
    )
    return Response(datos)

# -----------------------------------------------
# REPORTE PDF
# -----------------------------------------------
class ReportePDFView(APIView):
  permission_classes = [IsAuthenticated]

  def get(self, request):
    periodo = request.query_params.get("periodo", "mensual")
    return generar_reporte_pdf(
      request.user,
      periodo
    )


# -----------------------------------------------
# PROYECCIÓN DE META
# -----------------------------------------------

class ProyeccionView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        meta_id = request.query_params.get("meta")

        # -----------------------------------------------
        # VALIDAR META
        # -----------------------------------------------

        if not meta_id:
            return Response(
                {
                    "error": "Debe indicar el ID de la meta."
                },
                status=400
            )

        try:
            meta_id = int(meta_id)

        except (TypeError, ValueError):

            return Response(
                {
                    "error": "El ID de la meta no es válido."
                },
                status=400
            )

        # -----------------------------------------------
        # OBTENER PROYECCIÓN
        # -----------------------------------------------

        datos = obtener_proyeccion_meta(
            request.user,
            meta_id
        )

        # -----------------------------------------------
        # META NO ENCONTRADA
        # -----------------------------------------------

        if datos is None:

            return Response(
                {
                    "error": "La meta no existe o no pertenece al usuario."
                },
                status=404
            )

        return Response(datos)


