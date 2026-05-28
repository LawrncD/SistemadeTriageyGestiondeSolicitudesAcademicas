# Sistema de Triage y Gestión de Solicitudes Académicas

Bienvenido al repositorio oficial del **Sistema de Triage y Gestión de Solicitudes Académicas** del programa de Ingeniería de Sistemas y Computación.

Esta implementación corresponde al **Hito 3 (Entrega Final)**: *Frontend en Angular, Seguridad JWT estricta, Base de Datos PostgreSQL, Integración real con Inteligencia Artificial (Gemini) y Despliegue en la nube con Railway y vercel*

---

## Autores

Stefania Herrera 

Lawrence Daniel

Santiago Aguirre

---

## 🚀 Arquitectura y Tecnologías

- **Backend**: Java 17, Spring Boot 3.2.3, Spring Security (JWT), Spring Data JPA
- **Frontend**: Angular 17+ (Standalone Components), Node.js, TypeScript
- **Base de Datos**: PostgreSQL 16
- **Inteligencia Artificial**: Google Gemini API (3.5 Flash)
- **Contenedores**: Docker, Docker Compose
- **CI/CD**: GitHub Actions
- **Despliegue**: Railway (Backend), Vercel (Frontend)

---

## 🛑 Prerrequisitos

### Para Desarrollo Local (sin Docker)
- **Java 17** - JDK configurado en `JAVA_HOME`
- **Maven 3.9+** - Para compilar el backend
- **Node.js 18+** - Para Angular
- **PostgreSQL 16** - Base de datos

### Para Docker Local
- **Docker** - Motor de contenedores
- **Docker Compose** - Orquestación de contenedores

---

## 🔑 Configuración de Variables de Entorno

Copia `.env.example` a `.env` y completa los valores:

```bash
cp .env.example .env
```

**Variables requeridas:**
```env
DB_PASSWORD=tu_password_postgres
JWT_SECRET=tu_jwt_secret_seguro_minimo_64_caracteres
GEMINI_API_KEY=tu_gemini_api_key
```

---

## 📦 Opciones de Ejecución

### Opción 1: Docker Compose Local (Recomendado para Desarrollo)

La forma más rápida de levantar todo el sistema localmente.

```bash
# 1. Asegúrate de tener .env configurado
cp .env.example .env
# Edita .env con tus valores

# 2. Levanta todos los servicios
docker-compose up --build -d

# 3. Accede a la aplicación
# Frontend: http://localhost/
# API REST: http://localhost/api
# Swagger UI: http://localhost/swagger-ui.html
```

**Detener servicios:**
```bash
docker-compose down
```

**Ver logs:**
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
```

---

### Opción 2: Despliegue en la Nube

#### Railway (Backend)

El backend está desplegado automáticamente en Railway mediante CI/CD.

**URLs de Producción:**
- 🔗 **API REST**: `https://web-production-9ae79.up.railway.app/api`
- 📚 **Swagger UI**: `https://web-production-9ae79.up.railway.app/swagger-ui.html`

#### Vercel (Frontend)

El frontend está desplegado automáticamente en Vercel mediante CI/CD.

**URL de Producción:**
- 🌐 **Aplicación**: `https://sistemade-triagey-gestionde-solicit.vercel.app`

## 🔐 Usuarios de Prueba

| Email | Contraseña | Rol |
|-------|-----------|-----|
| `juan.perez@uq.edu.co` | `123456` | ESTUDIANTE |
| `carlos.lopez@uq.edu.co` | `123456` | RESPONSABLE |

---

### Ejemplo de Llamada a la API

```bash
curl -X POST https://web-production-9ae79.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"juan.perez@uq.edu.co","password":"123456"}'
```

---

## 🔄 CI/CD Pipeline

El repositorio incluye dos flujos de trabajo automáticos:

### `.github/workflows/ci.yml`
- Se ejecuta en cada `push` o `pull_request`
- Compila y valida backend (Maven)
- Compila y valida frontend (Angular)
- Ejecuta tests unitarios

### `.github/workflows/cd.yml`
- Se ejecuta en cada `push` a `main`
- Construye imágenes Docker
- Publica en GitHub Container Registry (GHCR)
- Despliega backend en Railway
- Despliega frontend en Vercel

---

## 🧪 Ejecutar Tests Localmente

```bash
# Tests del backend
mvn test

# Tests del frontend
cd frontend
npm test
```

---

## 📁 Estructura del Proyecto

```
sistematriageexperimental/
├── README.md                  # Este archivo
├── .env.example               # Plantilla de variables de entorno
├── docker-compose.yml         # Orquestación de contenedores
├── docker-compose.dev.yml     # Configuración de desarrollo
├── Dockerfile                 # (Eliminado - usar src/Dockerfile)
├── src/
│   ├── Dockerfile             # Backend (Maven + Java 17)
│   ├── main/
│   │   ├── java/              # Código fuente Java
│   │   └── resources/         # Configuración y recursos
│   └── test/                  # Tests unitarios
├── frontend/
│   ├── Dockerfile             # Frontend (Angular + Nginx)
│   ├── src/                   # Código fuente Angular
│   └── package.json           # Dependencias Node
├── .github/
│   └── workflows/
│       ├── ci.yml             # Pipeline de integración continua
│       └── cd.yml             # Pipeline de despliegue continuo
└── pom.xml                    # Dependencias Maven
```

---

## 🆘 Troubleshooting

### Docker

**Error: "Port 80 already in use"**
```bash
# Encuentra el proceso usando el puerto
netstat -ano | findstr :80

# Mata el proceso (reemplaza PID)
taskkill /PID <PID> /F
```

**Error: "Cannot connect to Docker daemon"**
- Verifica que Docker Desktop esté corriendo
- En Linux, verifica que el servicio Docker esté activo: `sudo systemctl start docker`

### Base de Datos

**Error: "Connection refused" en PostgreSQL**
- Verifica que PostgreSQL esté corriendo en el contenedor: `docker-compose ps`
- Verifica las credenciales en `.env`

### Frontend

**Error: "npm not found"**
- Reinstala Node.js desde https://nodejs.org/

**Error: "Port 4200 already in use"**
```bash
# Encuentra el proceso
netstat -ano | findstr :4200

# Mata el proceso
taskkill /PID <PID> /F
```

---

## 📝 Notas Importantes

- El archivo `.env` **NUNCA debe subirse a Git** (está en `.gitignore`)
- En el primer arranque, Hibernate creará todas las tablas automáticamente
- Los usuarios de prueba se crean automáticamente en la primera ejecución
- Los logs se mostrarán en la consola o en `docker-compose logs`
- El JWT_SECRET debe ser seguro y de mínimo 64 caracteres

---

## 📄 Licencia

Proyecto académico de la Universidad del Quindío.

---