# Environment

## Current Vite Config

- Dev server port: `5173`.
- `strictPort: true`.
- Proxy: `/api` to `http://localhost:8080`.

## Runtime Env

Frontend env is centralized in `src/config/env.js`.

```txt
VITE_API_BASE_URL=http://localhost:8080
VITE_APP_ENV=development
```

If `VITE_API_BASE_URL` is missing, the app falls back to `http://localhost:8080`.

## Rules

- Only expose frontend env vars with the `VITE_` prefix.
- Do not hard-code backend URLs in components.
- Keep env access inside config/client modules.
- Do not commit secrets into frontend env files.

