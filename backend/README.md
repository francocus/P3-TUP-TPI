# Backend

Backend inicial del gestor de expedientes para estudios juridicos, adaptado al estilo del repo de referencia de la facultad.

## Estructura

- `src/index.js`: inicializa Express, Sequelize y rutas.
- `src/db.js`: configuración de Sequelize con MySQL.
- `src/models/user/User.js`: modelo `User`.
- `src/services/user.service.js`: lógica de registro e inicio de sesión.
- `src/routes/users.routes.js`: rutas de usuarios.
- `src/middleware/auth.js`: verificación de JWT.
- `src/database/migrations/001_create_users.sql`: script SQL opcional de referencia.

## Puesta en marcha

1. Copia `.env.example` a `.env`.
2. Si vas a trabajar como el repo del profe, puedes usar SQLite sin configurar nada extra.
3. Si quieres MySQL, cambia `DB_DIALECT=mysql` y completa las credenciales en `.env`.
4. Desde `backend/`, ejecuta `npm run dev`.

Sequelize se encargará de sincronizar la tabla `users` al iniciar el backend.

## Endpoints iniciales

- `GET /api/health`
- `POST /api/users/register`
- `POST /api/users/login`
