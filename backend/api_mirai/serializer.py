from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.password_validation import validate_password
from django.db.models import Q
from .models import Moneda,Pais,User,Meta,MetaMovimiento,Categoria,Movimiento,Obligacion
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

        # -----------------------------------------------
        # ACTUALIZAR ÚLTIMO ACCESO
        # -----------------------------------------------

        usuario.last_login = timezone.now()
        usuario.save(update_fields=['last_login'])

        # -----------------------------------------------
        # GENERAR TOKEN
        # -----------------------------------------------

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
            }
        }
# -----------------------------------------------
# META
# -----------------------------------------------
class MetaSerializer(serializers.ModelSerializer):
  progreso = serializers.SerializerMethodField()
  class Meta:
    model = Meta
    fields = '__all__'
    read_only_fields = [
      'fecha_inicio',
      'usuario',
      'progreso'
    ]

  def get_fields(self):
    fields = super().get_fields()
     # Al editar una meta, monto_actual no se puede modificar
    if self.instance is not None:
      fields['monto_actual'].read_only = True
    return fields
  
  def validate(self, data):
    if self.instance is None:
      monto_actual = data.get('monto_actual', 0)
      monto_objetivo = data.get('monto_objetivo')
      if monto_actual > monto_objetivo:
        raise serializers.ValidationError(
          "El monto actual no puede superar el monto objetivo."
        )
      return data

  def create(self, validated_data):
    meta = Meta.objects.create(**validated_data)
    if meta.monto_actual >= meta.monto_objetivo:
      meta.estado = "COMPLETADO"
      meta.save()
    return meta

  def get_progreso(self, obj):
    if obj.monto_objetivo == 0:
      return 0
    return round(
      (obj.monto_actual / obj.monto_objetivo) * 100, 2
    )

# -----------------------------------------------
# META MOVIMIENTO
# -----------------------------------------------
class MetaMovimientoSerializer(serializers.ModelSerializer):
  class Meta:
    model = MetaMovimiento
    fields = '__all__'
  #Validar si el ahorro sobrepasa el valor de la meta  
  def validate(self,data):
    meta = data['meta']
    monto = data['monto']
    #Obtener el usuario autenticado
    usuario = self.context['request'].user
    if meta.usuario != usuario:
      raise serializers.ValidationError("No tienes permiso para utilizar esta meta.")
    if monto <= 0:
      raise serializers.ValidationError("El monto debe ser mayor a 0.")
    if self.instance is None:
      if meta.monto_actual + monto > meta.monto_objetivo:
        raise serializers.ValidationError("Superas el monto objetivo.")
    return data

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
  class Meta:
    model = Movimiento
    fields = '__all__'
    read_only_fields = ['usuario']
    
  #Validar reglas
  def validate(self, data):
    tipo = data.get("tipo")
    categoria = data.get("categoria")
    meta = data.get("meta")
    usuario = self.context['request'].user
    # INGRESO Y GASTO
    if tipo in ["INGRESO", "GASTO"]:
      if not categoria:
        raise serializers.ValidationError("Debe tener categoría")
      data["meta"] = None
      #Si la categoría no tiene propietario es global
      if(categoria.creada is not None and categoria.creada != usuario):
        raise serializers.ValidationError("No tienes permiso para usar esta categoría.")
    #AHORRO
    elif tipo == "AHORRO":
      if not meta:
        raise serializers.ValidationError("Debe tener meta")
      # La meta debe pertenecer al usuario
      if meta.usuario != usuario:
        raise serializers.ValidationError("No tienes permiso para usar esta categoría.")
      data["categoria"] = None
    return data
  #Guardar logica
  def create(self, validated_data):
    movimiento = Movimiento.objects.create(**validated_data)
    if movimiento.tipo == "AHORRO" and movimiento.meta:
      #Sumar automaticamente a la meta
      meta = movimiento.meta
      meta.monto_actual += movimiento.monto
      #Cambiar el estado cuando la meta este completa
      if meta.monto_actual >= meta.monto_objetivo:
        meta.estado = "COMPLETADO"
      meta.save()
    return movimiento

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





  

