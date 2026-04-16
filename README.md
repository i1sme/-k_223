# MiniTwitter

A discussion platform built for ICT Modul 223. Users can post short messages, comment on them, react with likes/dislikes, and interact under different roles.

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js · TypeScript · Express · TypeORM |
| Database | PostgreSQL 16 |
| Frontend | Vanilla TypeScript · Webpack · Nginx |
| Auth | JWT · bcrypt |
| Infrastructure | Docker · Docker Compose |

## Getting Started

**Requirements:** Docker Desktop

```bash
git clone <repository-url>
cd uek_223
docker compose up
```

- Frontend: http://localhost:8080
- Backend API: http://localhost:3000

No additional configuration needed — all environment variables are defined in `docker-compose.yml`.

## Features

- **Authentication** — Register and login with username/password. Passwords are hashed with bcrypt. Sessions use JWT tokens.
- **Posts** — Create, edit, and delete posts (max 280 characters). Only the author, moderators, and admins can edit or delete.
- **Comments** — Comment on any post. Same ownership rules apply.
- **Reactions** — Like or dislike posts. One reaction per user per post; clicking the same reaction again removes it.
- **Feed** — Chronological list of all posts by all users.
- **Profile** — View own posts and comments. Update username and password.
- **Roles** — Three roles with increasing permissions:
  - `user` — manage own content
  - `moderator` — edit/delete any content
  - `admin` — everything + lock users and change roles

## Project Structure

```
k_223/
├── docker-compose.yml
├── backend/
│   └── src/
│       ├── entity/        # TypeORM database entities
│       ├── service/       # Business logic (extends BaseService)
│       ├── controller/    # HTTP request handlers
│       ├── router/        # Express route definitions
│       └── middleware/    # JWT auth, role guard
└── frontend/
    └── src/
        ├── api/           # ApiClient (fetch wrapper with JWT)
        ├── services/      # Frontend data access classes
        ├── router/        # Hash-based SPA router
        ├── views/         # Page render functions
        └── components/    # Navbar
```

## API Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | — | Register |
| POST | `/api/auth/login` | — | Login |
| GET | `/api/posts` | JWT | Get all posts |
| POST | `/api/posts` | JWT | Create post |
| PUT | `/api/posts/:id` | JWT | Update post |
| DELETE | `/api/posts/:id` | JWT | Delete post |
| POST | `/api/posts/:id/comments` | JWT | Add comment |
| PUT | `/api/comments/:id` | JWT | Update comment |
| DELETE | `/api/comments/:id` | JWT | Delete comment |
| POST | `/api/posts/:id/like` | JWT | Like or dislike |
| DELETE | `/api/posts/:id/like` | JWT | Remove reaction |
| GET | `/api/users/me` | JWT | Get own profile |
| PUT | `/api/users/me` | JWT | Update profile |
| GET | `/api/users` | Admin | List all users |
| PUT | `/api/users/:id/lock` | Admin | Lock/unlock user |
| PUT | `/api/users/:id/role` | Admin | Change user role |

## Docs

- `docs/erm.png` — Entity Relationship Model (crow's foot notation)
- `docs/testprotokoll.md` — Test cases and results
