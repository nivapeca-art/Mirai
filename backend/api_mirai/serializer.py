from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.password_validation import validate_password
from django.db.models import Q
from .models import Moneda,Pais,User,Meta,Categoria,Movimiento,Obligacion
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
    
    # ACTUALIZAR ÚLTIMO ACCESO
    usuario.last_login = timezone.now()
    usuario.save(update_fields=['last_login'])

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
      }
    }
    
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





  

