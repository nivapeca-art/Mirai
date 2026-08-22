from rest_framework import generics
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated,AllowAny
from django.contrib.auth import get_user_model 
from django.db.models import Q
from .models import Moneda,Pais,Meta,MetaMovimiento,Categoria,Movimiento,Obligacion
from .serializer import MonedaSerializer,PaisSerializer,UsuarioSerializer,MetaSerializer,MetaMovimientoSerializer,CategoriaSerializer,MovimientoSerializer,ObligacionSerializer,LoginSerializer
#Dashboard y PDF
from rest_framework.views import APIView
from .services.dashboard import obtener_dashboard
# Dashboard
from rest_framework.response import Response
# PDF
from .services.reporte_pdf import generar_reporte_pdf

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
# MOVIMIENTOS DE METAS
# -----------------------------------------------
class MetaMovimientoViewSet(ModelViewSet):
  permission_classes = [IsAuthenticated]
  serializer_class = MetaMovimientoSerializer

  def get_queryset(self):
    return MetaMovimiento.objects.filter(
      meta__usuario=self.request.user
    )

  def perform_create(self, serializer):
    movimiento = serializer.save()
    meta = movimiento.meta
      # Sumar el nuevo ahorro
    meta.monto_actual += movimiento.monto
    # Comprobar si la meta se completó
    if meta.monto_actual >= meta.monto_objetivo:
      meta.estado = "COMPLETADO"
    meta.save()

  def perform_update(self, serializer):
    movimiento_anterior = self.get_object()
    monto_anterior = movimiento_anterior.monto
    movimiento = serializer.save()
    meta = movimiento.meta
    # Quitar el monto anterior
    meta.monto_actual -= monto_anterior
    # Agregar el nuevo monto
    meta.monto_actual += movimiento.monto
    # Actualizar estado
    if meta.monto_actual >= meta.monto_objetivo:
      meta.estado = "COMPLETADO"
    else:
      meta.estado = "EN_PROCESO"
    meta.save()

  def perform_destroy(self, instance):
    meta = instance.meta
    # Quitar el ahorro eliminado
    meta.monto_actual -= instance.monto
    # Si ya no alcanza el objetivo, vuelve a proceso
    if meta.monto_actual < meta.monto_objetivo:
        meta.estado = "EN_PROCESO"
    meta.save()
    instance.delete()

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
  def perform_create(self, serializer):
    serializer.save(usuario=self.request.user)

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