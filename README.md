# Sistema de Triage y Gestión de Solicitudes Académicas

Bienvenido al repositorio del backend para el **Sistema de Triage y Gestión de Solicitudes Académicas** del programa de Ingeniería de Sistemas y Computación.

Esta implementación corresponde al **Hito 2** del cronograma oficial: *Backend y Lógica (Spring Boot, persistencia con ORM y motor de reglas)*.

## 🚀 Tecnologías Utilizadas
- **Java 17**
- **Spring Boot 3.2.3**
- **Spring Data JPA** (ORM)
- **H2 Database** (En memoria)
- **SpringDoc OpenAPI** (Swagger para documentación GUI)
- **Lombok**

## ⚙️ Instrucciones de Ejecución

1. Clona el repositorio y asegúrate de tener Java 17 y Maven instalados.
2. Abre una terminal en la raíz del proyecto.
3. Ejecuta el siguiente comando para levantar el servidor:
   ```bash
   mvn spring-boot:run
   ```
4. El servidor se iniciará en `http://localhost:8080`.

## 🌐 Herramientas y Consolas Integradas

Una vez que la aplicación esté corriendo, tienes a disposición las siguientes interfaces web:

- **Swagger UI (Documentación Interactiva):**
  [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)
  *Desde aquí puedes realizar pruebas de envío y recepción a todos los endpoints.*

- **Consola H2 (Base de Datos):**
  [http://localhost:8080/h2-console](http://localhost:8080/h2-console)
  *(Credenciales por defecto -> URL: jdbc:h2:mem:solicitudesdb | Username: sa | Password: [vacío])*

## 🧪 Pruebas del Hito 2 (Mock Authorization)

Actualmente, el **Hito 3 (Seguridad y JWT)** está implementado a nivel de código, pero para facilitar de manera exclusiva la revisión del **Hito 2** sin lidiar con la firma de tokens persistentes, se incorporó una directiva "Backdoor" o **Mock de Cabecera**.

Para realizar pruebas desde Swagger o Postman, simplemente deberás inyectar un **Header Adicional** en tu petición que simulará quién está operando:

**Key del Header:** `X-Mock-User-Email`
**Value (Emails de prueba pre-creados):**

| Usuario de Prueba           | Rol            | Funciones Clave                        |
|-----------------------------|----------------|----------------------------------------|
| `juan.perez@uq.edu.co`      | `ESTUDIANTE`   | Registrar Solicitud, Consultar estados.|
| `carlos.lopez@uq.edu.co`    | `RESPONSABLE`  | Cambiar Estados, Atender.              |
| `ana.martinez@uq.edu.co`    | `ADMINISTRATIVO`| Crear y Asignar Usuarios responsables. |

### Ejemplo en Swagger:
Al no haber interfaz de Login para el Hito 2, deberás hacer uso de este header directo para validar el **RF-13 (Restricción por Roles)**. Si abres Swagger, puedes pasar esta key en los campos habilitados para Headers.

## 📦 Funcionalidades Implementadas (RF-01 al RF-13)
- ✅ Registro de solicitudes académicas.
- ✅ Clasificación, Priorización (manual / motor local) y Ciclo de Vida auditable.
- ✅ Asignación de responsables y cambios de estado restringidos.
- ✅ Módulo de Asistencia IA (Simulador local mediante heurísticas como base futura).
- ✅ Tests unitarios en capas controladoras, repositorios e integraciones.
