# Task API

A CRUD REST API with JWT authentication, built with Node.js, Express, and **PostgreSQL**.

Resource: **Tasks** — each user can create, read, update, and delete their own tasks. Passwords are hashed with bcrypt; all task routes require a valid JWT.

## Tech stack

- Node.js + Express
- PostgreSQL (via the `pg` package) — tables are created automatically on server startup if they don't exist
- bcryptjs — password hashing
- jsonwebtoken — auth tokens
- cors — configurable to allow only your deployed frontend's origin

## Local setup

You need a local PostgreSQL server running, or a free hosted one (e.g. a Render/Railway database used for local testing too).

```bash
npm install
cp .env.example .env
```

Edit `.env` with your local Postgres connection string, then:

```bash
npm start
```

Server runs on `http://localhost:3000`. Tables are created automatically on first run.

## Deploying to Render

1. Push this repo to GitHub.
2. In Render, choose **New → Blueprint** and point it at this repo — it will read `render.yaml` and set up both the web service and a free Postgres database automatically.
3. Once deployed, go to the `task-api` service → **Environment** tab, and set `FRONTEND_URL` to your deployed frontend's URL (e.g. `https://your-app.vercel.app`) once you have it — this restricts CORS to only your frontend's domain instead of allowing all origins.
4. Your API will be live at something like `https://task-api-xxxx.onrender.com`.

If you'd rather set it up manually instead of using the Blueprint: create a Postgres database on Render, then a Web Service from this repo with build command `npm install` and start command `npm start`, and set `DATABASE_URL` (from the database's connection string), `JWT_SECRET` (any long random string), and `FRONTEND_URL` as environment variables in the dashboard.

**Note on Render's free tier:** the database and web service both spin down after inactivity and take 30-60 seconds to wake up on the first request after idling. That's normal — not a bug.

## Authentication

Protected routes require an `Authorization: Bearer <token>` header. Get a token from `/api/auth/register` or `/api/auth/login`.

---

## Endpoints

### `GET /health`
Health check. Returns `{ "status": "ok" }`. Useful to confirm the deployed API is reachable.

### `POST /api/auth/register`
Create a new account.

**Request body**
```json
{ "email": "user@example.com", "password": "at-least-6-chars" }
```

**Responses**
- `201 Created` — `{ "user": { "id": 1, "email": "..." }, "token": "<jwt>" }`
- `400 Bad Request` — invalid email/password, or email already registered

---

### `POST /api/auth/login`
**Request body**
```json
{ "email": "user@example.com", "password": "your-password" }
```

**Responses**
- `200 OK` — `{ "user": {...}, "token": "<jwt>" }`
- `401 Unauthorized` — wrong email or password

---

### `GET /api/tasks` 🔒
List all tasks belonging to the logged-in user.

### `GET /api/tasks/:id` 🔒
Get a single task by ID (must belong to the logged-in user). `404` if not found or not yours.

### `POST /api/tasks` 🔒
**Request body:** `{ "title": "...", "description": "...", "completed": false }` (description and completed optional)

### `PUT /api/tasks/:id` 🔒
Update any subset of `title`, `description`, `completed`.

### `DELETE /api/tasks/:id` 🔒
Deletes the task.

## Status codes used

| Code | Meaning |
|---|---|
| 200 | Successful GET / PUT / DELETE |
| 201 | Resource created |
| 400 | Invalid input |
| 401 | Missing/invalid token, or wrong login credentials |
| 404 | Resource not found (or not owned by the requester) |

## Notes

- Each user can only see and modify their **own** tasks.
- Passwords are never stored or returned in plain text.
- Database schema is created automatically on server startup — no separate migration step needed for this project's scope.
- Tested end-to-end against a real PostgreSQL database: register, duplicate-email rejection, login failure, full task CRUD, ownership checks, and cross-origin request handling.
