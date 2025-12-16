# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project type
Node.js (CommonJS) Express API with MongoDB/Mongoose.

## Common commands

### Install
```sh
npm install
```

### Run the API
```sh
npm run server
```
This runs `node server.js`.

### Run with auto-reload (no script currently defined)
```sh
npx nodemon server.js
```

### Tests / lint
- `npm test` is currently a placeholder that exits with an error (no test runner configured).
- No lint/format scripts are defined in `package.json`.

## Required configuration (env vars)
The repo includes `env.example` documenting expected variables. Typical local setup:
- Copy `env.example` to `.env` and fill values.

Key variables used in code:
- `MONGODB_URI` (used by `src/db/db.js`)
- `JWT_SECRET` (used by `src/middlewares/auth.middlewares.js`)
- `PORT` (used by `server.js`; defaults to `8080`)
- `FRONTEND_URL` (used to generate reset-password URL in `src/controllers/auth.controller.js`)
- Email (used by forgot-password flow): `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS`
- ImageKit (used for video upload in `src/services/storage.service.js`): `IMAGEKIT_PUBLIC_KEY`, `IMAGEKIT_PRIVATE_KEY`, `IMAGEKIT_URL_ENDPOINT`

Auth cookies are set with:
- `secure: true` and `sameSite: "none"` in `src/controllers/auth.controller.js`, which generally requires HTTPS in browsers.

## High-level architecture

### Entry points
- `server.js`
  - Loads `.env` via `dotenv`
  - Connects to MongoDB (`src/db/db.js`)
  - Starts the Express app from `src/app.js`

- `src/app.js`
  - Configures CORS + cookie parsing + JSON parsing
  - Mounts route modules:
    - `/api/auth` → `src/routes/auth.routes.js`
    - `/api/food` → `src/routes/food.routes.js`
    - `/api/food-partner` → `src/routes/food-partner.routes.js`

### Routing style
Routes are kept thin and delegate to controllers:
- `src/routes/*.routes.js` defines endpoints + attaches middleware
- `src/controllers/*.controller.js` contains the request handlers

### Persistence layer (Mongoose models)
Models live in `src/models/`:
- `user.model.js`: users (also stores reset-password token/expiry)
- `foodpartner.model.js`: food partner accounts
- `food.model.js`: food “reel” items (video URL, partner owner, likes/saves counters)
- `likes.model.js`: join table linking `{ user, food }`
- `save.model.js`: join table linking `{ user, food }`

### Authn/authz
- Auth is cookie-based JWT.
- `src/middlewares/auth.middlewares.js` exports:
  - `authUserMiddleware`: verifies `req.cookies.token`, loads `user`, sets `req.user`
  - `authFoodPartnerMiddleware`: verifies `req.cookies.token`, loads `foodPartner`, sets `req.foodPartner`
- Routes use one of these middlewares depending on which actor is allowed.

Important behavior:
- Food creation is restricted to food partners: `POST /api/food` uses `authFoodPartnerMiddleware`.
- Like/bookmark endpoints are restricted to users: `POST /api/food/:id/like` and `POST /api/food/:id/bookmark` use `authUserMiddleware`.

### Media upload / storage
- `POST /api/food` accepts a multipart upload field named `video`.
- `src/routes/food.routes.js` uses `multer.memoryStorage()` so uploads are held in memory as `req.file.buffer`.
- `src/services/storage.service.js` uploads that buffer to ImageKit and returns the hosted URL.
- `src/controllers/food.controller.js` stores the resulting URL in `Food.video`.

### Food feed personalization (likes/saves)
- `GET /api/food` returns the food list.
- `src/controllers/food.controller.js:getFoodItems` can enrich results with `isLiked` / `isSaved` if `req.user` is present.
  - Note: the route currently does not attach `authUserMiddleware`, so `req.user` will typically be undefined unless a separate “optional auth” middleware is added.

### OAuth
- `src/passport/google.js` is a stub (Google strategy removed) to avoid runtime require errors.

## Where to make common changes
- Add a new API surface area: create a new `src/routes/*.routes.js` + `src/controllers/*.controller.js`, then mount it from `src/app.js`.
- Change auth behavior (cookies/JWT validation): `src/controllers/auth.controller.js` (cookie settings) and `src/middlewares/auth.middlewares.js` (token verification + user lookup).
- Change storage provider / upload behavior: `src/services/storage.service.js` and the upload middleware in `src/routes/food.routes.js`.