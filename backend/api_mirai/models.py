from django.db import models
from django.conf import settings #Trae el modelo configurado
from django.contrib.auth.models import AbstractUser

# -----------------------------------------------
# MONEDA
# -----------------------------------------------
class Moneda(models.Model):
  codigo = models.CharField(max_length=3, unique=True) #COP, EUR ...
  nombre = models.CharField(max_length=50) #Peso colombiano, Euro ...
  simbolo = models.CharField(max_length=5) #$, € ... 
  def __str__(self):
    return f"{self.nombre} ({self.codigo})"

# -----------------------------------------------
# PAIS
# -----------------------------------------------
class Pais(models.Model):
  moneda = models.ForeignKey(Moneda, on_delete=models.PROTECT) #No permir borrar moneda si algun país la esta usando.
  nombre = models.CharField(max_length=50)
  class Meta:
    verbose_name = "Pais"
    verbose_name_plural = "Paises"
  def __str__(self):
    return self.nombre

# -----------------------------------------------
# USUARIO
# -----------------------------------------------
class User(AbstractUser):
  pais = models.ForeignKey(Pais, on_delete=models.PROTECT,null=True,blank=True) #No permir borrar país si algun usuario lo esta usando.
  email = models.EmailField(unique=True)
  def __str__(self):
    return f"{self.first_name} {self.last_name}"

# -----------------------------------------------
# METAS
# -----------------------------------------------
class Meta(models.Model):
  descripcion = models.TextField(blank=True)
  ESTADOS = [
    ("EN_PROCESO", "En proceso"),
    ("COMPLETADO", "Completado"),
    ("CANCELADO", "Cancelado")
  ]
  estado = models.CharField(max_length=20,choices=ESTADOS,default="EN_PROCESO")
  fecha_inicio = models.DateField(auto_now_add=True)
  fecha_limite = models.DateField(null=True,blank=True)
  monto_actual = models.DecimalField(max_digits=12,decimal_places=2,default=0)
  monto_objetivo = models.DecimalField(max_digits=12,decimal_places=2)
  nombre = models.CharField(max_length=100)
  usuario = models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.CASCADE)
  def __str__(self):
    return f"{self.usuario} {self.nombre}"
  
# -----------------------------------------------
# TIPO DE MOVIMIENTO
# -----------------------------------------------
class TipoMovimiento(models.TextChoices):
  AHORRO = "AHORRO", "Ahorro"
  GASTO = "GASTO","Gasto"
  INGRESO = "INGRESO", "Ingreso"

# -----------------------------------------------
# CATEGORÍA
# -----------------------------------------------
class Categoria(models.Model):
  #Las categorias globales (servicios, transporte, vivienda) tendras creada = NULL.
  #Las categorias creadas por usuarios (boda, viaje) tendran creada = Juan
  creada = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE,null=True, blank=True)
  nombre = models.CharField(max_length=100) #Agua
  tipo = models.CharField(max_length=10, choices=TipoMovimiento.choices) #Servicios
  def __str__(self):
    return f"{self.nombre} {self.creada} {self.tipo}"

# -----------------------------------------------
# MOVIMIENTO
# -----------------------------------------------
class Movimiento(models.Model):
  categoria = models.ForeignKey(Categoria,on_delete=models.PROTECT,null=True,blank=True)
  meta = models.ForeignKey(Meta,on_delete=models.SET_NULL,null=True,blank=True)
  descripcion = models.TextField(blank=True)
  fecha = models.DateField()
  monto = models.DecimalField(max_digits=12,decimal_places=2)
  tipo = models.CharField(max_length=10,choices=TipoMovimiento.choices)
  usuario = models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.CASCADE)
  def __str__(self):
        return f"{self.categoria} {self.meta} {self.monto}"
  
# -----------------------------------------------
# OBLIGACIONES
# -----------------------------------------------
class Obligacion(models.Model):
  categoria = models.ForeignKey(Categoria, on_delete=models.PROTECT)
  fecha_creacion = models.DateField(auto_now_add=True)  #Automática
  fecha_limite = models.DateField(null=True, blank=True)
  nombre = models.CharField(max_length=100)  #Agua, Arriendo
  monto_estimado = models.DecimalField(max_digits=12, decimal_places=2)
  frecuencia = models.CharField(max_length=20, blank=True)  #Mensual, anual, etc.
  activa = models.BooleanField(default=True)
  cumplida = models.BooleanField(default=False)
  usuario = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)