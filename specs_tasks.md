# Especificación de Tareas - Proyecto Body Health

Este documento detalla las tareas y pasos técnicos requeridos para poner en marcha, reparar e integrar el frontend y backend del proyecto **Body Health**.

---

## 📋 Lista de Tareas Pendientes

### 🔧 Fase 1: Corrección y Configuración del Backend (`backend/`)
El backend tiene archivos mezclados entre una base de datos local mock (`db-local`) y consultas SQL de PostgreSQL. Debemos estabilizarlo.

- [ ] **1.1. Corregir rutas de importación en `backend/src/index.js`**
  - Actualmente, `index.js` tiene imports como `../config.js` y `../user-repository.js` que fallan porque esos archivos no se encuentran en la raíz de `backend` o las rutas relativas están desalineadas.
  - Asegurar que la importación de `PORT` se lee correctamente de `src/config/config.js` y que el repositorio o modelo de base de datos se cargue desde la ubicación correcta.
- [ ] **1.2. Unificar la arquitectura de base de datos (PostgreSQL vs. Mock)**
  - **Decisión:** Usar el modelo relacional real con PostgreSQL (recomendado ya que tienes configurada una base de datos en Render en el `.env`) o quedarse con el archivo JSON local `db/user.json`.
  - **Si se elige PostgreSQL (Recomendado):**
    - Configurar `backend/src/index.js` para usar las rutas y controladores definidos en `backend/src/routes/user.routes.js` en lugar de declarar endpoints locales.
    - Habilitar una ruta de prueba `/ping` para verificar la conexión activa al pool de Render.
    - Asegurar que la tabla `usuario` en Postgres esté creada con las columnas esperadas: `u_id`, `u_nombres`, `u_apellidos`, `u_td_id`, `u_numero_documento`, `u_correo_electronico`, `u_contrasena`, `u_r_id`, `u_numero_contacto`, `u_eg_id`.
  - **Si se elige Mock Local:**
    - Completar el método `login` en `backend/user-repository.js` para buscar al usuario por username, verificar la contraseña usando hashing y retornar el resultado.
- [ ] **1.3. Implementar Autenticación Segura (JWT)**
  - Instalar `jsonwebtoken` en el backend.
  - Al hacer un login exitoso, firmar un token JWT con la información básica del usuario (ID, correo, rol) y retornarlo en la respuesta.
- [ ] **1.4. Middleware de Autenticación**
  - Crear un middleware en el backend para validar el token JWT en rutas protegidas futuras.

---

### 💻 Fase 2: Desarrollo del Frontend (`client/`)
El cliente es un cascarón inicial en React 19 y necesita interactividad y componentes reales.

- [ ] **2.1. Conexión con la API (Axios / Fetch)**
  - Configurar un cliente de red (por ejemplo, usando `fetch` nativo o instalando `axios`) que apunte a `VITE_BACKEND_URL` (definido en `.env` como `http://localhost:3000`).
- [ ] **2.2. Diseño e Implementación del `Navbar`**
  - Desarrollar [Navbar.jsx](file:///j:/bodyhealth/client/src/components/Navbar/Navbar.jsx). Debe contener:
    - Enlaces de navegación (Inicio, Servicios, Contacto).
    - Botones condicionales de "Iniciar Sesión" y "Registrarse" (si el usuario no está autenticado).
    - Botón de "Cerrar Sesión" (si el usuario ya inició sesión).
- [ ] **2.3. Crear Páginas de Autenticación**
  - **Página de Registro:** Crear formulario con campos como: Nombres, Apellidos, Tipo de Documento, Número de Documento, Correo Electrónico, Teléfono de Contacto y Contraseña. Enviar estos datos a `/register` en el backend.
  - **Página de Login:** Crear formulario con campos de Correo Electrónico y Contraseña. Enviar estos datos a `/login` en el backend.
- [ ] **2.4. Diseñar una Interfaz Premium para la `HomePage`**
  - Diseñar una página de aterrizaje (Landing Page) atractiva para Body Health, con colores coherentes, tipografías limpias (por ejemplo, Google Fonts como Inter u Outfit), y secciones para salud, bienestar físico y servicios.
- [ ] **2.5. Actualizar el Enrutador (`AppRouter.jsx`)**
  - Añadir las nuevas rutas de `/login` y `/register`.
  - Configurar redirecciones seguras para que los usuarios autenticados no puedan volver a la pantalla de login y viceversa.

---

### 🔗 Fase 3: Integración y Despliegue
- [ ] **3.1. Pruebas End-to-End**
  - Levantar cliente y servidor en simultáneo.
  - Probar el flujo: Registro de usuario ➡️ Login de usuario ➡️ Redirección a la zona protegida/HomePage con sesión activa.
- [ ] **3.2. Persistencia de Sesión**
  - Almacenar el token JWT devuelto por el backend en el `localStorage` o `sessionStorage` del navegador para que el usuario no pierda la sesión al recargar la página.
