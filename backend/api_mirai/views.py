from rest_framework import generics,status
from rest_framework.decorators import action
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated,AllowAny
from django.contrib.auth import get_user_model 
from django.db.models import Q
from dateutil.relativedelta import relativedelta #Maneja correctamente los cambios de mes
from .models import Moneda,Pais,Meta,Categoria,Movimiento,Obligacion,HistorialObligacion
from .serializer import (
  MonedaSerializer,
  PaisSerializer,
  UsuarioSerializer,
  MetaSerializer,
  CategoriaSerializer,
  MovimientoSerializer,
  ObligacionSerializer,
  LoginSerializer,
  CambiarPasswordSerializer,
  SolicitarRecuperacionSerializer,
  RestablecerPasswordSerializer,
  HistorialObligacionSerializer)
#Cambio de contraseña
from django.conf import settings
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
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
# CAMBIAR CONTRASEÑA DESDE EL PERFIL
# -----------------------------------------------
class CambiarPasswordView(APIView):
  permission_classes = [IsAuthenticated]
  def post(self, request):
    serializer = CambiarPasswordSerializer(
      data=request.data,
      context={"request": request}
    )
    if serializer.is_valid():
      usuario = request.user
      usuario.set_password(
        serializer.validated_data["password_nueva"]
      )
      usuario.save()
      return Response(
        {
          "detail": "La contraseña se ha cambiado correctamente."
        },
        status=status.HTTP_200_OK
      )
    return Response(
      serializer.errors,
      status=status.HTTP_400_BAD_REQUEST
    )

# -----------------------------------------------
# OLVIDAR CONTRASEÑA DESDE EL LOGIN
# -----------------------------------------------
#Solicitar recuperación
class SolicitarRecuperacionView(APIView):
  permission_classes = [AllowAny]
  def post(self, request):
    serializer = SolicitarRecuperacionSerializer(data=request.data)
    if not serializer.is_valid():
      return Response(
        serializer.errors,
        status=status.HTTP_400_BAD_REQUEST
      )
    email = serializer.validated_data["email"]
    usuario = User.objects.get(email__iexact=email)
    uid = str(usuario.pk)
    token = default_token_generator.make_token(usuario)
    enlace = (
            f"http://localhost:5173/"
            f"restablecer-password/{uid}/{token}"
    )
    print("\n" + "=" * 70)
    print("ENLACE DE RECUPERACIÓN:")
    print(enlace)
    print("=" * 70 + "\n")
    send_mail(
      subject="Restablecimiento de contraseña - Mirai",
      message=(
        "Has solicitado restablecer tu contraseña de Mirai.\n\n"
        f"Utiliza el siguiente enlace:\n\n{enlace}\n\n"
        "Si no solicitaste este cambio, puedes ignorar este mensaje."
      ),
      from_email=settings.DEFAULT_FROM_EMAIL,
      recipient_list=[email],
      fail_silently=False,
    )
    return Response(
      {
        "detail": (
            "Si el correo está registrado, "
            "se ha generado un enlace de recuperación."
        )
      },
      status=status.HTTP_200_OK
    )
# Restablecer contraseña
class RestablecerPasswordView(APIView):
  permission_classes = [AllowAny]
  def post(self, request):
    serializer = RestablecerPasswordSerializer(
      data=request.data
    )
    if serializer.is_valid():
      usuario = serializer.validated_data["usuario"]
      usuario.set_password(
        serializer.validated_data["password_nueva"]
      )
      usuario.save()
      return Response(
        {
          "detail": (
            "La contraseña se ha restablecido correctamente."
          )
        },
        status=status.HTTP_200_OK
      )
    return Response(
      serializer.errors,
      status=status.HTTP_400_BAD_REQUEST
    )

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
    queryset = Obligacion.objects.filter(usuario=self.request.user)
    activa = self.request.query_params.get("activa")
    if activa is not None:
      queryset = queryset.filter(activa=activa.lower() == "true")
    return queryset

  def perform_create(self, serializer):
    serializer.save(usuario=self.request.user)

  # MARCAR / DESMARCAR OBLIGACIÓN
  def perform_update(self, serializer):
    obligacion = self.get_object()
    cumplida = self.request.data.get("cumplida")

    # MARCAR COMO CUMPLIDA
    if cumplida is True or cumplida == "true":
      # Guardamos la fecha original en el historial
      HistorialObligacion.objects.create(
        obligacion=obligacion,
        usuario=obligacion.usuario,
        nombre=obligacion.nombre,
        categoria=obligacion.categoria,
        monto_estimado=obligacion.monto_estimado,
        frecuencia=obligacion.frecuencia,
        fecha_limite=obligacion.fecha_limite,
      )
      # Calcula la siguiente fecha
      nueva_fecha = self.calcular_siguiente_fecha(
        obligacion.fecha_limite,
        obligacion.frecuencia
      )
      # Si tiene una frecuencia recurrente, avanza la fecha y deja la obligación pendiente
      if nueva_fecha != obligacion.fecha_limite:
        serializer.save( fecha_limite=nueva_fecha, cumplida=False)
      # Si no es recurrente, queda cumplida
      else:
        serializer.save(cumplida=True)
      return

    # DESMARCAR COMO CUMPLIDA
    if cumplida is False or cumplida == "false":
      serializer.save(cumplida=False)
      return

    # CUALQUIER OTRA EDICIÓN NORMAL
    serializer.save()

  # CALCULAR SIGUIENTE FECHA
  def calcular_siguiente_fecha(self, fecha, frecuencia):
    frecuencia = (frecuencia or "").strip().lower()
    if frecuencia == "semanal":
      return fecha + relativedelta(weeks=1)
    if frecuencia == "mensual":
      return fecha + relativedelta(months=1)
    if frecuencia == "bimestral":
      return fecha + relativedelta(months=2)
    if frecuencia == "trimestral":
      return fecha + relativedelta(months=3)
    if frecuencia == "semestral":
      return fecha + relativedelta(months=6)
    if frecuencia == "anual":
      return fecha + relativedelta(years=1)
    # Sin frecuencia o frecuencia no reconocida
    return fecha

  # HISTORIAL
  @action(detail=True, methods=["get"])
  def historial(self, request, pk=None):
    obligacion = self.get_object()
    historial = HistorialObligacion.objects.filter( obligacion=obligacion, usuario=request.user).order_by("-fecha_limite")
    serializer = HistorialObligacionSerializer( historial, many=True)
    return Response(serializer.data)

  # DESHACER OBLIGACIÓN CUMPLIDA
  @action(detail=True, methods=["post"])
  def deshacer_cumplida(self, request, pk=None):
    obligacion = self.get_object()
    # Buscamos la última realización
    ultimo_registro = HistorialObligacion.objects.filter( obligacion=obligacion, usuario=request.user
    ).order_by( "-fecha_realizada", "-id"
    ).first()
    # No hay nada que deshacer
    if not ultimo_registro:
      return Response(
        {
          "detail": "No existe un registro para deshacer."
        },
        status=400
      )

    # Si era una obligación recurrente, devuelve la fecha anterior
    if ultimo_registro.fecha_limite != obligacion.fecha_limite:
      obligacion.fecha_limite = (ultimo_registro.fecha_limite)
    # Vuelve a dejarla pendiente
    obligacion.cumplida = False
    obligacion.save(
      update_fields=[
        "fecha_limite",
        "cumplida"
      ]
    )
    # Eliminamos el registro del historial
    ultimo_registro.delete()
    return Response({
      "detail": "La realización de la obligación fue deshecha."
    })
  
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
    periodo = request.query_params.get(
      "periodo",
      "mensual"
    )
    mes = request.query_params.get(
      "mes",
      None
    )
    return generar_reporte_pdf(
      request.user,
      periodo,
      mes
    )

# -----------------------------------------------
# PROYECCIÓN DE META
# -----------------------------------------------
class ProyeccionView(APIView):
  permission_classes = [IsAuthenticated]
  def get(self, request):
    meta_id = request.query_params.get("meta")
    # VALIDAR META
    if not meta_id:
      return Response(
        { "error": "Debe indicar el ID de la meta." }, status=400
      )
    try:
      meta_id = int(meta_id)
    except (TypeError, ValueError):
      return Response(
        {"error": "El ID de la meta no es válido."}, status=400
      )
    # OBTENER PROYECCIÓN
    datos = obtener_proyeccion_meta(
      request.user,
      meta_id
    )
    # META NO ENCONTRADA
    if datos is None:
      return Response(
        {
          "error": "La meta no existe o no pertenece al usuario."
        },
        status=404
      )
    return Response(datos)


