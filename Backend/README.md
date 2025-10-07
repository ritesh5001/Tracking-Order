# Shipment Tracking Backend

Express + MongoDB backend for the tracking app.

## Environment Variables

Create a `.env` file at the backend root with the following values:

```
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_random_secret
# Optional: lock down CORS to your deployed frontend origins (comma-separated)
# e.g. FRONTEND_ORIGIN=https://your-frontend.site,https://staging-frontend.site
FRONTEND_ORIGIN=
```

## Running Locally

1. Install deps: `npm install`
2. Start dev server: `npm run dev`

## Deploy notes

- If you deploy the backend to Render, the public base URL will look like `https://<service>.onrender.com`.
- Configure your frontend to call the backend by setting `REACT_APP_API_BASE_URL` to `https://<service>.onrender.com/api` during the build.
- Optionally set `FRONTEND_ORIGIN` in backend environment to your frontend origin(s) to restrict CORS.

