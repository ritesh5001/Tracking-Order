# Tracking Order

A shipment tracking application with an Express + MongoDB API and a Create React App dashboard for administrators. Backend APIs are mounted under `/api` and protected with JWT-based auth, while the frontend consumes those endpoints and shows live shipment status updates.

## Repository layout
- `Backend/` – Express API, Mongoose models, auth middleware, and tests for the server.
- `Frontend/admin-dashboard/` – React dashboard styled with local CSS modules and routed pages for managing shipments.

## Backend setup
1. `cd Backend`
2. Copy `.env.example` (if present) or create `.env` with the required keys shown below.
3. Run `npm install` then `npm run dev` to start the server with `nodemon` on the default `PORT`.

### Environment variables
```
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_random_secret
FRONTEND_ORIGIN= https://your-frontend.site,https://staging.site
```
- `FRONTEND_ORIGIN` is optional and can be used to restrict which origins can reach the API.

### Running
- Production: `npm start`
- Development: `npm run dev` (uses `nodemon`)

## Frontend setup
1. `cd Frontend/admin-dashboard`
2. Run `npm install`.
3. Use `npm run dev` (or `npm start`) to serve on `http://localhost:3000`; requests are proxied to `http://localhost:5001` by default.

### Environment variables for production builds
Set `REACT_APP_API_BASE_URL` to the backend base URL (including `/api`) before running `npm run build`.
Example:
```
REACT_APP_API_BASE_URL=https://tracking-order.onrender.com/api
```

## Running tests
- Backend tests (if configured) live under `Backend/tests`. Add a `test` script to `Backend/package.json` if needed.
- Frontend tests: `npm test` in `Frontend/admin-dashboard`.

## Deployment notes
- Deploy backend and frontend from their respective folders. After backend deployment, update `REACT_APP_API_BASE_URL` in the frontend build environment to point at the deployed API (e.g., `https://<service>.onrender.com/api`).
- Optionally set `FRONTEND_ORIGIN` on the backend deployment to the URL of the built dashboard for tighter CORS control.

## Additional references
- Backend-specific info: see `Backend/README.md`
- Frontend-specific info: see `Frontend/admin-dashboard/README.md`
