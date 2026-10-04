from django.urls import path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (TokenObtainPairView,TokenRefreshView,)
from .views import (
  MonedaViewSet,
  PaisViewSet, 
  UsuarioViewSet, 
  MetaViewSet, 
  CategoriaViewSet, 
  MovimientoViewSet,
  ObligacionViewSet,
  RegisterView,
  DashboardView,
  ReportePDFView,
  LoginView, 
  ProyeccionView,
  CambiarPasswordView,
  SolicitarRecuperacionView,
  RestablecerPasswordView)

router = DefaultRouter()
router.register('monedas', MonedaViewSet, basename='monedas')
router.register('paises', PaisViewSet, basename='paises') 
router.register('usuarios', UsuarioViewSet, basename='usuarios')
router.register('metas', MetaViewSet, basename='metas')
router.register('categorias', CategoriaViewSet, basename='categorias')
router.register('movimientos', MovimientoViewSet, basename='movimientos')
router.register('obligaciones', ObligacionViewSet, basename='obligaciones')

urlpatterns = router.urls + [
  path("register/", RegisterView.as_view(), name="register"),
  path('login/', LoginView.as_view(), name='login'),
  path( "cambiar-password/", CambiarPasswordView.as_view(), name="cambiar-password"),
  path("recuperar-password/",SolicitarRecuperacionView.as_view(),name="recuperar-password"),
  path("restablecer-password/",RestablecerPasswordView.as_view(),name="restablecer-password"),
  path('refresh/', TokenRefreshView.as_view(), name='refresh'),
  path('dashboard/',DashboardView.as_view(), name='dashboard'),
  path("dashboard/pdf/", ReportePDFView.as_view(), name="dashboard-pdf"),
  path("proyeccion/", ProyeccionView.as_view(), name="proyeccion")
]