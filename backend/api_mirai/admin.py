from django.contrib import admin
from .models import Moneda, Pais, User, Meta, MetaMovimiento, Categoria, Movimiento,Obligacion

admin.site.register(Moneda)
admin.site.register(Pais)
admin.site.register(User)
admin.site.register(Meta)
admin.site.register(MetaMovimiento)
admin.site.register(Categoria)
admin.site.register(Movimiento)
admin.site.register(Obligacion)