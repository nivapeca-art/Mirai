# Mirai

Aplicación web para la gestión y planificación de las finanzas personales.

## Descripción

**Mirai** es una aplicación web desarrollada como Trabajo Fin de Máster (TFM) cuyo objetivo es facilitar el control y la planificación de las finanzas personales.

La aplicación permite al usuario registrar manualmente sus ingresos y gastos, gestionar categorías, controlar obligaciones económicas y establecer metas de ahorro. A partir de esta información, Mirai proporciona indicadores, comparaciones y proyecciones que ayudan al usuario a comprender su situación financiera y tomar decisiones orientadas al cumplimiento de sus objetivos.

La aplicación no realiza conexiones con entidades bancarias ni obtiene información financiera de fuentes externas. Todos los datos económicos son introducidos manualmente por el usuario.

## Funcionalidades principales

- Registro e inicio de sesión de usuarios.
- Recuperación y restablecimiento de contraseña.
- Gestión del perfil de usuario.
- Registro y gestión de ingresos y gastos.
- Organización de movimientos mediante categorías.
- Gestión de obligaciones económicas.
- Historial de obligaciones.
- Creación y seguimiento de metas de ahorro.
- Registro de abonos destinados a metas.
- Historial y proyección de metas de ahorro.
- Dashboard con resumen de la situación financiera.
- Gráficas y comparaciones de información financiera.
- Generación de indicadores y proyecciones.
- Sistema de notificaciones sobre metas y obligaciones.
- Soporte para diferentes monedas según el país del usuario.

## Tecnologías utilizadas

### Frontend

- React
- Vite
- JavaScript
- Axios
- React Router
- Recharts
- Lucide React

### Backend

- Python
- Django
- Django REST Framework
- Simple JWT
- SQLite durante el desarrollo

### Herramientas

- Visual Studio Code
- Git
- GitHub

## Estructura del proyecto

```text
Mirai/
├── backend/
│   ├── api_mirai/
│   ├── manage.py
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   ├── package.json
│   └── package-lock.json
│
├── .gitignore
└── README.md
```

## Instalación

### 1. Clonar el repositorio

```bash
git clone URL_DEL_REPOSITORIO
cd Mirai
```

### 2. Configurar el backend

Entrar en la carpeta del backend:

```bash
cd backend
```

Crear y activar un entorno virtual:

```bash
python -m venv venv
```

En Windows PowerShell:

```powershell
.\venv\Scripts\Activate
```

Instalar las dependencias:

```bash
pip install -r requirements.txt
```

Aplicar las migraciones:

```bash
python manage.py migrate
```

Iniciar el servidor:

```bash
python manage.py runserver
```

El backend estará disponible normalmente en:

```text
http://127.0.0.1:8000/
```

### 3. Configurar el frontend

Desde la carpeta raíz del proyecto:

```bash
cd frontend
```

Instalar las dependencias:

```bash
npm install
```

Iniciar el servidor de desarrollo:

```bash
npm run dev
```

Vite mostrará en la terminal la dirección local desde la que se puede acceder a la aplicación.

## Base de datos

Durante el desarrollo se utiliza SQLite como base de datos local.

El archivo de base de datos (`db.sqlite3`) no se incluye en el repositorio, ya que está excluido mediante `.gitignore`. La estructura de la base de datos puede generarse mediante las migraciones de Django:

```bash
python manage.py migrate
```

## Autenticación

La aplicación utiliza autenticación basada en tokens JWT mediante Django REST Framework y Simple JWT.

El frontend almacena los tokens necesarios para mantener la sesión del usuario y utiliza las rutas protegidas para restringir el acceso a las funcionalidades que requieren autenticación.

## Recuperación de contraseña

Mirai incorpora un flujo de recuperación y restablecimiento de contraseña.

Durante el desarrollo local, los correos de recuperación se gestionan mediante el backend de correo de prueba de Django. Por este motivo, **el correo de recuperación no se envía a una cuenta de correo real**, sino que su contenido se muestra directamente en la terminal donde se está ejecutando el servidor Django.

Para probar esta funcionalidad:

1. Iniciar el backend:

```powershell
python manage.py runserver
```

2. Desde la aplicación, acceder a la opción **¿Olvidaste tu contraseña?**.

3. Introducir el correo electrónico de un usuario registrado.

4. Revisar la terminal donde está ejecutándose Django. Allí aparecerá el mensaje de recuperación junto con el enlace para restablecer la contraseña.

> Para un entorno de producción sería necesario configurar un servicio de correo electrónico mediante SMTP u otro proveedor de envío de correo.

## Objetivo académico

Este proyecto ha sido desarrollado como Trabajo Fin de Máster del **Máster Universitario en Desarrollo de Aplicaciones Web** de la **Universidad Europea**.

## Autor

**Nicolle Perez**

2026