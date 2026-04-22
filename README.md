# SIGEPA

SIGEPA es un sistema de gestión interna para un club u operación de paracaidismo. Centraliza en una sola aplicación la administración de usuarios, cuotas, movimientos contables, vuelos, cuenta corriente de cada socio y la configuración operativa del sistema.

El proyecto está dividido en:

- `front/`: aplicación web en React + TypeScript.
- `server/`: API REST en Express + TypeScript + MongoDB.

## Qué hace el sistema

SIGEPA cubre los flujos principales de administración y operación:

- Autenticación de usuarios y perfil personal.
- Dashboard con resumen operativo y financiero.
- Gestión de usuarios con roles y habilitación/deshabilitación.
- Gestión de categorías contables.
- Registro manual de movimientos contables y balance general.
- Generación y seguimiento de cuotas sociales.
- Registro de vuelos con pilotos y paracaidistas.
- Generación de cargos por vuelo y alquiler de equipo.
- Cobro de cargos pendientes con impacto contable automático.
- Cuenta corriente personal para cada usuario.
- Historial de vuelos personales.
- Configuración general del sistema.

## Módulos principales

### Dashboard

Muestra una vista general del estado del sistema y del perfil del usuario autenticado, incluyendo métricas personales y accesos rápidos.

### Usuarios

Permite:

- listar usuarios;
- crear usuarios;
- editar usuarios;
- ver detalle;
- cambiar estado de habilitación;
- administrar roles.

Cada usuario puede almacenar, entre otros datos:

- nombre y apellido;
- email;
- DNI;
- teléfono;
- licencia FAP;
- vencimiento de CMA;
- vencimiento de licencia;
- datos de contacto y perfil.

### Contabilidad

Incluye:

- categorías contables;
- alta y edición de movimientos;
- balance contable acumulado;
- visualización de ingresos y egresos.

Cuando se cobra un cargo de vuelo, el sistema registra automáticamente un ingreso contable asociado.

### Cuotas

Permite administrar las cuotas sociales por período y consultar el estado de deuda de los usuarios.

### Vuelos

Permite:

- registrar vuelos;
- asignar uno o dos pilotos;
- cargar paracaidistas por vuelo;
- cargar valor de salto y alquiler;
- generar cargos pendientes;
- registrar pagos;
- consultar historial de vuelos;
- ver una tabla simplificada de todos los vuelos;
- consultar el detalle de cada vuelo.

Además, cada usuario puede consultar sus propios vuelos desde su perfil.

### Cuenta corriente

Cada usuario autenticado puede ver su deuda y el estado de sus cargos, tanto por cuotas como por vuelos.

### Configuración

El backend incluye un módulo de configuración general del sistema para inicialización y actualización de parámetros globales.

## Roles y permisos

El sistema trabaja con roles de usuario. Actualmente existen estos roles en el modelo:

- `admin`
- `secretaria`
- `instructor`
- `paracaidista`
- `socio`
- `piloto`
- `contable`

En el frontend ya están aplicadas restricciones de navegación y acceso por ruta para distintas secciones, por ejemplo dashboard, contabilidad, vuelos y administración.

## Arquitectura

### Frontend

Stack principal:

- React 19
- TypeScript
- Vite
- React Router
- TanStack Query
- React Hook Form
- Tailwind CSS
- Axios
- Recharts

Responsabilidades:

- interfaz de usuario;
- navegación por vistas;
- consumo de la API;
- control de sesión en cliente;
- formularios y validaciones básicas;
- dashboards, tablas y vistas operativas.

### Backend

Stack principal:

- Node.js
- Express 5
- TypeScript
- MongoDB
- Mongoose
- JWT
- bcrypt
- express-validator
- nodemailer

Responsabilidades:

- autenticación;
- validación de requests;
- acceso a MongoDB;
- reglas de negocio;
- generación de cargos y asientos relacionados;
- exposición de endpoints REST para frontend.

## Estructura del proyecto

```text
sigepa/
├── front/
│   ├── src/
│   │   ├── api/                  # Clientes HTTP por módulo
│   │   ├── components/           # Componentes reutilizables
│   │   ├── hooks/                # Hooks de auth y permisos
│   │   ├── layouts/              # Layouts y guards
│   │   ├── types/                # Tipos compartidos del frontend
│   │   ├── views/                # Pantallas del sistema
│   │   └── router.tsx            # Rutas del frontend
│   └── package.json
├── server/
│   ├── src/
│   │   ├── config/               # Mongo y CORS
│   │   ├── controllers/          # Lógica por recurso
│   │   ├── helpers/              # JWT, mail, balance, hashing, etc.
│   │   ├── middleware/           # Auth y validaciones
│   │   ├── models/               # Modelos Mongoose
│   │   ├── routes/               # Endpoints REST
│   │   ├── templates/            # Templates de email
│   │   ├── utils/                # Utilidades varias
│   │   ├── server.ts             # App Express
│   │   └── index.ts              # Bootstrap del servidor
│   └── package.json
└── README.md
```

## Endpoints del backend

Los recursos principales expuestos por la API son:

- `/api/usuarios`
- `/api/configuracion`
- `/api/categorias-contables`
- `/api/movimientos-contables`
- `/api/cuotas`
- `/api/cuenta-corriente`
- `/api/vuelos`

## Requisitos

- Node.js 20+ recomendado
- npm
- MongoDB local o remoto

## Variables de entorno

### Backend

Crear `server/.env`:

```env
PORT=4001
DATABASE_MONGO=mongodb://localhost:27017/sigepa
JWT_SECRET=tu_clave
FRONTEND_URL=http://localhost:5173

SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
SMTP_FROM_NAME=SIGEPA
SMTP_FROM_EMAIL=no-reply@sigepa.local

IMAGEKIT_PUBLIC_KEY=
IMAGEKIT_PRIVATE_KEY=
```

### Frontend

Crear `front/.env.local`:

```env
VITE_API_URL=http://localhost:4001/api
```

## Instalación

### 1. Clonar el repositorio

```bash
git clone <repo>
cd sigepa
```

### 2. Instalar dependencias

```bash
cd server && npm install
cd ../front && npm install
```

## Ejecución en desarrollo

### Backend

```bash
cd server
npm run dev
```

### Frontend

```bash
cd front
npm run dev
```

Con la configuración actual, el frontend espera la API en `http://localhost:4001/api`.

## Build

### Backend

```bash
cd server
npm run build
npm start
```

### Frontend

```bash
cd front
npm run build
```

## Scripts disponibles

### `server/`

- `npm run dev`: levanta el backend con nodemon.
- `npm run build`: compila TypeScript a `dist/`.
- `npm start`: ejecuta el build compilado.

### `front/`

- `npm run dev`: levanta Vite en desarrollo.
- `npm run build`: compila TypeScript y genera el build productivo.
- `npm run lint`: ejecuta ESLint.
- `npm run preview`: sirve el build generado.

## Notas funcionales importantes

- La contraseña inicial de los usuarios creados desde el backend se genera a partir del DNI.
- Los vuelos generan cargos por salto y/o alquiler.
- El cobro de esos cargos impacta en contabilidad.
- Existen vistas personales y vistas administrativas separadas.
- El sistema usa roles tanto para navegación como para protección de rutas.

## Estado actual del proyecto

El proyecto ya no es una base vacía: tiene frontend, backend, autenticación, módulos de negocio y flujo operativo real para administración del club.

## Licencia

Uso interno del proyecto, salvo que se defina otra licencia más adelante.
