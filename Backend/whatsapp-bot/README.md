# WhatsApp Product Bot — Backend

Node.js/Express/MongoDB backend covering two pieces:

1. **Admin Authentication Module** — JWT-based login, refresh tokens, forgot/reset/change
   password, and profile management for a single admin account.
2. **WhatsApp AI Product Bot** — Meta Cloud API webhook that greets customers with a
   product catalog, shows product details on selection, and answers free-form
   questions using an AI layer grounded in your real product data (Google Gemini API).

## Folder structure

```
src/
  config/       env + MongoDB connection
  models/       Admin, Product, Session, MessageLog (Mongoose)
  utils/        ApiResponse, ApiError, asyncHandler, JWT helpers, mailer
  middlewares/  auth, error handling, validation, rate limiting, file upload
  validators/   express-validator rule sets
  services/     business logic (admin, tokens, products, WhatsApp, AI)
  controllers/  thin request/response layer calling into services
  routes/       route wiring
  app.js        Express app (middleware + routes)
  server.js     entrypoint — connects DB, starts HTTP server
docs/swagger.yaml                          Swagger/OpenAPI spec (served at /api-docs)
postman/WhatsApp-Bot-API.postman_collection.json
scripts/seedAdmin.js                       creates the one admin account from .env
```

## Setup

```bash
npm install
cp .env.example .env      # then fill in real values
node scripts/seedAdmin.js # creates the admin using SEED_ADMIN_* values in .env
npm run dev                # nodemon, or: npm start
```

Server runs on `http://localhost:5000` by default. Swagger UI: `http://localhost:5000/api-docs`.

## Admin Authentication APIs

| Method | Route | Auth | Purpose |
|---|---|---|---|
| POST | `/api/admin/login` | Public | Login, returns access + refresh token |
| POST | `/api/admin/logout` | Bearer | Revokes stored refresh token |
| POST | `/api/admin/refresh-token` | Public (needs refresh token) | Rotates access + refresh token |
| POST | `/api/admin/forgot-password` | Public | Emails a reset link (30 min expiry) |
| POST | `/api/admin/reset-password` | Public (needs reset token) | Sets a new password |
| POST | `/api/admin/change-password` | Bearer | Change password while logged in |
| GET  | `/api/admin/profile` | Bearer | Get logged-in admin's profile |
| PUT  | `/api/admin/profile` | Bearer | Update name/email/phone/profile image |

Access tokens are short-lived (15m default) and sent as `Authorization: Bearer <token>`.
Refresh tokens (7d default) are returned in the JSON body **and** set as an httpOnly cookie;
use whichever your frontend prefers. Refresh tokens are single-session: logging in again,
refreshing, changing password, or resetting password all rotate/invalidate the stored token.

## Product APIs (admin-only, all require Bearer token)

`POST/GET /api/admin/products`, `GET/PUT/DELETE /api/admin/products/:id`.
Product images upload via `multipart/form-data` (field name `image`), served from `/uploads`.

## WhatsApp Bot

- `GET /api/whatsapp/webhook` — one-time Meta subscription verification
  (set the **Verify Token** in Meta's App Dashboard to match `WHATSAPP_VERIFY_TOKEN`).
- `POST /api/whatsapp/webhook` — receives every inbound message/status update.

Flow: greeting ("hi") → interactive product list → tap a product → full details →
any other free-form text → AI answer grounded in matched product data (falls back
to a "connecting you to our team" handoff message when it can't answer confidently).

Conversation state lives in the `sessions` collection (last product viewed, short
rolling history); every inbound/outbound message is written to `messages_log` for
debugging and audit.

To go live you need: a verified WABA + phone number in Meta Business Manager, a
permanent System User access token, and a public HTTPS URL for this server's
`/api/whatsapp/webhook` endpoint registered in the Meta App Dashboard.

## Notes

- Passwords are hashed with bcrypt (cost factor 12); the field is `select: false` so it's
  never returned by default.
- All admin/product routes are protected by `authenticate` middleware verifying the JWT
  access token and re-checking the admin's `status` on every request.
- `express-rate-limit` throttles login/forgot-password (10 requests / 15 min) and the
  WhatsApp webhook (60 requests / min) to blunt brute force and spam.
- For production message volume, move the webhook's processing block onto a queue
  (e.g. BullMQ) after the immediate `200` ack — Meta expects fast acknowledgment and
  will retry on timeout.
