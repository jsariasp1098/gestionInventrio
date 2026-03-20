# Sistema de Gestión de Inventario — OptiPlant

> Prueba técnica para cargo de Semillero de Desarrollo  
> Universidad del Quindío — Armenia, Quindío — 2026

---

## Propósito del Proyecto

Sistema web full-stack para la gestión de inventario multi-sucursal de la empresa OptiPlant. Permite controlar el stock de productos en tiempo real por sucursal, registrar ventas y compras, gestionar traslados entre sucursales y generar métricas del negocio mediante un dashboard interactivo.

El sistema diferencia tres roles de usuario (Vendedor, Administrador y Dueño) con permisos específicos por módulo, y utiliza autenticación segura con JWT.

---

## Arquitectura del Sistema

El proyecto sigue una arquitectura de **3 capas** con separación total entre cliente, servidor y datos:

```
┌─────────────────────────────────────────────────────┐
│              Cliente (Navegador)                     │
│         React 19 + Vite + TailwindCSS               │
└──────────────────┬──────────────────────────────────┘
                   │ HTTP REST + JWT
┌──────────────────▼──────────────────────────────────┐
│              Servidor (API REST)                     │
│   Spring Boot 3 — Controller → Service → Repository │
│         Spring Security + JWT Authentication        │
└──────────────────┬──────────────────────────────────┘
                   │ JPA / Hibernate
┌──────────────────▼──────────────────────────────────┐
│              Base de Datos                           │
│                  MariaDB                             │
└─────────────────────────────────────────────────────┘
```

### Capas del Backend

| Capa | Anotación | Responsabilidad |
|---|---|---|
| Controller | `@RestController` | Recibe HTTP, delega al servicio, retorna ResponseEntity |
| Service | `@Service` | Lógica de negocio, validaciones, transacciones |
| Repository | `JpaRepository` | Acceso a datos, queries JPQL |
| Model | `@Entity` | Mapeo objeto-relacional con JPA/Hibernate |
| DTO | `@Data` | Contrato de la API, desacopla el modelo interno |
| Config | `@Configuration` | Seguridad, CORS, manejo global de excepciones |

---

## Tecnologías Utilizadas

### Backend
| Tecnología | Versión | Uso |
|---|---|---|
| Java | 21 | Lenguaje principal |
| Spring Boot | 3.4 | Framework del servidor REST |
| Spring Security | 6 | Autenticación y autorización |
| JJWT | 0.12.6 | Generación y validación de tokens JWT |
| Spring Data JPA / Hibernate | - | ORM y gestión de transacciones |
| MariaDB | latest | Base de datos relacional |
| Lombok | - | Reducción de código boilerplate |
| Maven | 3.9 | Gestión de dependencias |

### Frontend
| Tecnología | Versión | Uso |
|---|---|---|
| React | 19 | Framework de UI basado en componentes |
| Vite | 5 | Servidor de desarrollo y build tool |
| React Router | v7 | Enrutamiento SPA del lado del cliente |
| Axios | - | Cliente HTTP con interceptores JWT |
| TailwindCSS | 3 | Framework de estilos utilitario |
| Recharts | - | Gráficas del dashboard |

### Infraestructura
| Tecnología | Uso |
|---|---|
| Docker | Contenedorización de servicios |
| Docker Compose | Orquestación multi-contenedor |
| Nginx | Servidor web para el frontend en producción |

---

## Estructura del Proyecto

```
Sistema Gestion de Inventario/
├── Backend/                          # API REST Spring Boot
│   ├── Dockerfile
│   ├── pom.xml
│   └── src/main/java/.../
│       ├── config/                   # SecurityConfig, JwtFilter, JwtUtil, CorsConfig
│       ├── controller/               # AuthController, ProductoController, VentaController...
│       ├── service/                  # AuthService, ProductoService, VentaService...
│       ├── repository/               # Interfaces JpaRepository
│       ├── model/                    # Entidades JPA + enums
│       └── dto/                      # Objetos de transferencia de datos
├── frontend/                         # SPA React + Vite
│   ├── Dockerfile
│   ├── src/
│   │   ├── api/axios.js              # Instancia Axios con interceptores JWT
│   │   ├── context/AuthContext.jsx   # Estado global de autenticación
│   │   ├── components/               # Layout, Sidebar, ProtectedRoute
│   │   └── pages/                    # Dashboard, Productos, Ventas, Compras...
│   └── package.json
├── docker-compose.yml                # Orquestación completa
└── README.md
```

---

## Pasos para Ejecutar el Proyecto

### Prerrequisitos
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado y corriendo
- Git instalado

### 1. Clonar el repositorio

```bash
git clone https://github.com/TU_USUARIO/TU_REPOSITORIO.git
cd "Sistema Gestion de Inventario"
```

### 2. Levantar todos los servicios con Docker

```bash
docker compose up --build -d
```

Este comando construye las imágenes del backend y frontend, levanta MariaDB, crea la base de datos automáticamente y ejecuta los datos iniciales de prueba.

### 3. Verificar que los servicios estén corriendo

```bash
docker compose ps
```

Todos los servicios deben mostrar el estado `Up`.

### 4. Acceder al sistema

| Servicio | URL |
|---|---|
| **Frontend** | http://localhost:5173 |
| **Backend API** | http://localhost:8081/api |
| **phpMyAdmin** | http://localhost:8080 |

### 5. Detener los servicios

```bash
docker compose down
```

---

### Ejecución en modo desarrollo (sin Docker)

**Backend** — requiere Java 21, Maven y MariaDB corriendo en localhost:3306

```bash
cd Backend
./mvnw spring-boot:run
```

**Frontend** — requiere Node.js 18+

```bash
cd frontend
npm install
npm run dev
```

---

## Usuarios de Prueba

| Rol | Email | Contraseña |
|---|---|---|
| Administrador | admin1@empresa.com | 1234 |
| Vendedor | vendedor1@empresa.com | 1234 |
| Dueño | dueno@empresa.com | 1234 |

---

## Módulos del Sistema

| Módulo | Descripción |
|---|---|
| **Dashboard** | Métricas del mes, gráficas de ventas/compras, alertas de stock bajo |
| **Productos** | CRUD de productos con precio de costo y precio de venta |
| **Inventario** | Stock por sucursal con indicadores de nivel mínimo |
| **Ventas** | Registro de ventas con detalle de productos, descuento de stock automático |
| **Compras** | Registro de compras a proveedores, aumento de stock automático |
| **Traslados** | Flujo completo: PENDIENTE → EN_TRANSITO → RECIBIDO_COMPLETO |
| **Sucursales** | CRUD de sucursales (solo Dueño) |
| **Usuarios** | Gestión de usuarios con roles diferenciados |

---

## Control de Acceso por Roles

| Módulo | Vendedor | Administrador | Dueño |
|---|:---:|:---:|:---:|
| Dashboard | ✅ | ✅ | ✅ |
| Inventario | ✅ | ✅ | ✅ |
| Ventas | ✅ | ✅ | ✅ |
| Traslados | ✅ | ✅ | ✅ |
| Productos | ❌ | ✅ | ✅ |
| Compras | ❌ | ✅ | ✅ |
| Usuarios | ❌ | ✅ (su sucursal) | ✅ (todas) |
| Sucursales | ❌ | ❌ | ✅ |

---

## Seguridad

El sistema implementa autenticación **stateless** con JSON Web Tokens (JWT):

1. El usuario envía email y contraseña a `POST /api/auth/login`
2. El servidor valida las credenciales con BCrypt y genera un token firmado con HMAC-SHA256
3. El token tiene expiración configurable (por defecto 15 minutos)
4. El frontend adjunta el token en cada petición: `Authorization: Bearer {token}`
5. `JwtFilter` intercepta y valida el token antes de cada request
6. Spring Security verifica el rol del usuario contra las reglas de acceso

Las contraseñas se almacenan hasheadas con **BCrypt** (nunca en texto plano).

---

## Endpoints Principales de la API

```
POST   /api/auth/login           # Autenticación
GET    /api/productos            # Listar productos
POST   /api/ventas               # Registrar venta
POST   /api/compras              # Registrar compra
GET    /api/inventario           # Ver inventario general
GET    /api/inventario/sucursal/{id}  # Inventario por sucursal
POST   /api/traslados            # Crear solicitud de traslado
PUT    /api/traslados/{id}/enviar      # Enviar traslado
PUT    /api/traslados/{id}/confirmar   # Confirmar recepción
GET    /api/dashboard            # Métricas del dashboard
```

---

## Modelo de Datos

El sistema cuenta con 10 entidades relacionadas:

`usuarios` · `sucursales` · `productos` · `inventario_sucursal` · `ventas` · `detalle_ventas` · `compras` · `detalle_compras` · `solicitudes_traslado` · `detalle_traslados` · `movimientos_inventario`

Cada cambio de stock genera un registro automático en `movimientos_inventario` para trazabilidad completa.

---

## Autor

**Juan Arias**  
Prueba Técnica — Semillero de Desarrollo  
Armenia, Quindío — 2026
