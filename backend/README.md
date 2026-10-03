# Curearly API

Spring Boot API for patient profiles, secure authentication, MongoDB/GridFS file storage, and prediction records.

## Run locally

1. Copy the root `.env.example` to `.env` and replace the secrets.
2. Start the API and database: `docker compose --env-file .env up --build api`.
3. In another terminal: `cd frontend/curearly && npm run dev`.

Alternatively, install Maven and run the API directly: `cd backend && MONGODB_URI='mongodb://localhost:27017/curearly' JWT_SECRET='use-a-long-32-byte-minimum-development-secret' mvn spring-boot:run`.

The frontend sends credentials as an HttpOnly cookie. In production, set `COOKIE_SECURE=true`, serve both apps on HTTPS, configure the allowed `FRONTEND_URL`, and use a secret manager for `JWT_SECRET`.

## Google login

Create a Google OAuth web client with this redirect URI: `http://localhost:8082/login/oauth2/code/google`. Set the client ID and secret in the root `.env`, then start with the Google override:

```
SPRING_SECURITY_OAUTH2_CLIENT_REGISTRATION_GOOGLE_CLIENT_ID=...
SPRING_SECURITY_OAUTH2_CLIENT_REGISTRATION_GOOGLE_CLIENT_SECRET=...
```

`docker compose --env-file .env -f docker-compose.yml -f docker-compose.google.yml up --build api`

On success Curearly creates or links the patient record by Google `sub`, then emits the same HttpOnly session cookie as password login. Do not put Google client secrets in the React app.

## Data model migration

`patients` replaces the relational patient, history, medication, allergy, disease, and family-history tables with an owned aggregate document. `medical_files` stores private metadata and GridFS stores the binary PDF/image payloads. `predictions` stores immutable analysis runs.
