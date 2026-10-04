from rest_framework import serializers
# Token al cambiar la contraseña
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.password_validation import validate_password
from django.db.models import Q
from .models import Moneda,Pais,User,Meta,Categoria,Movimiento,Obligacion,HistorialObligacion
from datetime import date
from django.utils import timezone

# -----------------------------------------------
# MONEDA
# -----------------------------------------------
class MonedaSerializer(serializers.ModelSerializer):
  class Meta:
    model = Moneda
    fields = '__all__'
    #read_only_fields = ['codigo', 'nombre', 'simbolo']

# -----------------------------------------------
# PAIS
# -----------------------------------------------
class PaisSerializer(serializers.ModelSerializer):
  moneda = MonedaSerializer(read_only = True) #El país devuelve automaticamente la moneda
  class Meta:
    model = Pais
    fields = '__all__' 

# -----------------------------------------------
# USUARIO
# -----------------------------------------------    
class UsuarioSerializer(serializers.ModelSerializer):
  email = serializers.EmailField(
    validators=[]
  )
  username = serializers.CharField(
    validators=[]
  )
  pais = serializers.PrimaryKeyRelatedField(queryset=Pais.objects.all())
  #Para que traiga la moneda
  pais_detalle = PaisSerializer(source='pais', read_only=True)
  class Meta:
    model = User
    fields = ['id','first_name','last_name','email','password','pais', 'pais_detalle','username']
    extra_kwargs = {'password':{'write_only':True}}#Para que no se muestre en la respuesta

  def validate_email(self, value):
    if User.objects.filter(email=value).exists():
      raise serializers.ValidationError(
        "Este correo electrónico ya está registrado."
      )
    return value

  def validate_username(self, value):
    if value and User.objects.filter(username=value).exists():
      raise serializers.ValidationError(
        "Este nombre de usuario ya está en uso."
      )
    return value
  
  def create(self, validated_data):
    password = validated_data.pop('password')
    validate_password(password)
    usuario = User(**validated_data)# usar nombre como username interno
    usuario.set_password(password)
    usuario.save()
    return usuario

# -----------------------------------------------
# LOGIN
# -----------------------------------------------
class LoginSerializer(TokenObtainPairSerializer):
  username_field = 'login'
  login = serializers.CharField()
  password = serializers.CharField(write_only=True)

  def validate(self, attrs):

    login = attrs.get('login')
    password = attrs.get('password')
    if '@' in login:
      usuario = User.objects.filter(email=login).first()
    else:
      usuario = User.objects.filter(username=login).first()
    # Verificar usuario y contraseña
    if usuario is None or not usuario.check_password(password):
      raise serializers.ValidationError(
        'Usuario/correo o contraseña incorrectos.'
      )
    #GUARDAR EL ÚLTIMO ACCESO ANTERIOR
    ultimo_acceso_anterior = usuario.last_login
    print("ANTES DE ACTUALIZAR:", ultimo_acceso_anterior)
    # ACTUALIZAR ÚLTIMO ACCESO
    usuario.last_login = timezone.now()
    usuario.save(update_fields=['last_login'])
    print("DESPUÉS DE ACTUALIZAR:", usuario.last_login)

    # GENERAR TOKEN
    refresh = self.get_token(usuario)

    return {
      'refresh': str(refresh),
      'access': str(refresh.access_token),

      'usuario': {
        'id': usuario.id,
        'username': usuario.username,
        'first_name': usuario.first_name,
        'last_name': usuario.last_name,
        'email': usuario.email,
        'pais': usuario.pais.id if usuario.pais else None,
        'pais_detalle': PaisSerializer(usuario.pais).data if usuario.pais else None,
        'ultimo_acceso': ultimo_acceso_anterior
      }
    }
  
# -----------------------------------------------
# CAMBIAR CONTRASEÑA DESDE EL PERFIL
# -----------------------------------------------
class CambiarPasswordSerializer(serializers.Serializer):
  password_actual = serializers.CharField(write_only=True)
  password_nueva = serializers.CharField(write_only=True)
  confirmar_password = serializers.CharField(write_only=True)

  def validate(self, attrs):
    usuario = self.context["request"].user
    password_actual = attrs.get("password_actual")
    password_nueva = attrs.get("password_nueva")
    confirmar_password = attrs.get("confirmar_password")

    # Comprobar contraseña actual
    if not usuario.check_password(password_actual):
      raise serializers.ValidationError({
        "password_actual": "La contraseña actual es incorrecta."
      })

    # Comprobar que las nuevas contraseñas coinciden
    if password_nueva != confirmar_password:
      raise serializers.ValidationError({
        "confirmar_password": "Las contraseñas nuevas no coinciden."
      })

    # Comprobar que la nueva contraseña no sea igual a la actual
    if password_actual == password_nueva:
      raise serializers.ValidationError({
        "password_nueva": "La nueva contraseña debe ser diferente a la actual."
      })

    # Validación de Django para la contraseña
    from django.contrib.auth.password_validation import validate_password
    validate_password(password_nueva, usuario)
    return attrs


# -----------------------------------------------
# OLVIDO LA CONTRASEÑA DESDE EL LOGIN
# -----------------------------------------------
User = get_user_model()
# Solicitar Recuperar contraseña
class SolicitarRecuperacionSerializer(serializers.Serializer):
  email = serializers.EmailField()
  def validate_email(self, value):
    value = value.lower().strip()
    if not User.objects.filter(email__iexact=value).exists():
      raise serializers.ValidationError(
        "No existe una cuenta registrada con este correo."
      )
    return value
# Restablecer Contraseña
class RestablecerPasswordSerializer(serializers.Serializer):
  uid = serializers.CharField()
  token = serializers.CharField()
  password_nueva = serializers.CharField(write_only=True)
  confirmar_password = serializers.CharField(write_only=True)

  def validate(self, attrs):
    try:
      usuario_id = int(attrs["uid"])
      usuario = User.objects.get(pk=usuario_id)
    except (ValueError, User.DoesNotExist):
      raise serializers.ValidationError({
        "token": "El enlace de recuperación no es válido."
      })

    token = attrs["token"]
    #Token de default
    if not default_token_generator.check_token(usuario, token):
      raise serializers.ValidationError({
          "token": "El enlace de recuperación no es válido o ha caducado."
      })
    password_nueva = attrs["password_nueva"]
    confirmar_password = attrs["confirmar_password"]
    #Comparar contraseñas
    if password_nueva != confirmar_password:
      raise serializers.ValidationError({
          "confirmar_password": "Las contraseñas nuevas no coinciden."
      })

    from django.contrib.auth.password_validation import validate_password
    validate_password(password_nueva, usuario)
    attrs["usuario"] = usuario
    return attrs
# -----------------------------------------------
# META
# -----------------------------------------------
class MetaSerializer(serializers.ModelSerializer):
  progreso = serializers.SerializerMethodField()
  class Meta:
    model = Meta
    fields = "__all__"
    read_only_fields = [
      "fecha_inicio",
      "usuario",
      "monto_actual",
      "progreso"
    ]

  def validate(self, data):
    monto_objetivo = data.get("monto_objetivo")
    if monto_objetivo is not None and monto_objetivo <= 0:
      raise serializers.ValidationError(
        "El monto objetivo debe ser mayor a 0."
      )
    return data

  def create(self, validated_data):
  # Toda meta nueva empieza en 0
    validated_data["monto_actual"] = 0
    meta = Meta.objects.create(
      **validated_data
    )
    return meta

  def get_progreso(self, obj):
    if obj.monto_objetivo == 0:
      return 0
    progreso = (
      obj.monto_actual /
      obj.monto_objetivo
    ) * 100
    return round(
      min(progreso, 100),
      2
    )

# -----------------------------------------------
# CATEGORIA
# -----------------------------------------------
class CategoriaSerializer(serializers.ModelSerializer):
  class Meta:
    model = Categoria
    fields = '__all__'

# -----------------------------------------------
# MOVIMIENTO
# -----------------------------------------------

class MovimientoSerializer(serializers.ModelSerializer):
  # Información detallada de la categoría
  categoria_detalle = CategoriaSerializer(source="categoria",read_only=True)
  # Información detallada de la meta
  meta_detalle = MetaSerializer(source="meta",read_only=True)

  class Meta:
    model = Movimiento
    fields = [
      "id",
      "categoria",
      "categoria_detalle",
      "meta",
      "meta_detalle",
      "descripcion",
      "fecha",
      "monto",
      "tipo",
      "usuario"
    ]
    read_only_fields = [
      "usuario",
      "categoria_detalle",
      "meta_detalle"
    ]

  def validate(self, data):
    usuario = self.context["request"].user
    tipo = data.get( "tipo", getattr(self.instance, "tipo", None))
    categoria = data.get( "categoria", getattr(self.instance, "categoria", None))
    meta = data.get( "meta", getattr(self.instance, "meta", None))
    # INGRESO / GASTO
    if tipo in ["INGRESO", "GASTO"]:

      if not categoria:
        raise serializers.ValidationError(
          "Debe tener categoría."
        )
      # Un ingreso o gasto no puede tener meta
      data["meta"] = None
      # Categoría global o del usuario
      if (
        categoria.creada is not None
        and categoria.creada != usuario
      ):
        raise serializers.ValidationError(
          "No tienes permiso para usar esta categoría."
        )
    # AHORRO
    elif tipo == "AHORRO":
      if not meta:
        raise serializers.ValidationError(
          "Debe tener una meta."
        )
      # La meta debe pertenecer al usuario
      if meta.usuario != usuario:
        raise serializers.ValidationError(
          "No tienes permiso para utilizar esta meta."
        )
      # Un ahorro no tiene categoría
      data["categoria"] = None
      # El monto debe ser positivo
      monto = data.get("monto")

      if monto is not None and monto <= 0:
        raise serializers.ValidationError(
          "El monto del ahorro debe ser mayor a 0."
        )
    return data

# -----------------------------------------------
# OBLIGACION
# -----------------------------------------------
class ObligacionSerializer(serializers.ModelSerializer):
  dias_restantes = serializers.SerializerMethodField()
  class Meta:
    model = Obligacion
    fields = '__all__'
    read_only_fields = ['usuario', 'fecha_creacion']

  def validate(self, data):
    categoria = data.get("categoria")
    usuario = self.context['request'].user
    # Solo validar categoría si viene en la petición
    if categoria is not None:
      if categoria.creada is not None and categoria.creada != usuario:
        raise serializers.ValidationError("No tienes permiso para utilizar esta categoría.")
    # Solo validar fecha si viene en la petición
    fecha_limite = data.get("fecha_limite")
    if fecha_limite is not None and fecha_limite < date.today():
      raise serializers.ValidationError("La fecha límite no puede ser pasada.")
    return data
  
  def get_dias_restantes(self, obj):
    return (obj.fecha_limite - date.today()).days

# -----------------------------------------------
# HISTORIAL DE OBLIGACIONES
# -----------------------------------------------
class HistorialObligacionSerializer(serializers.ModelSerializer):
  class Meta:
    model = HistorialObligacion
    fields = "__all__"
    read_only_fields = ["usuario", "fecha_realizada"]




  

