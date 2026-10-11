# Secure the Render `/scan` endpoint

The mobile app now sends the signed-in user's Supabase access token in the `Authorization: Bearer ...` header. The Render server verifies the token with Supabase Auth before parsing the image body or calling Gemini. Requests without a valid token are rejected.

## 1. Configure Render environment variables

In Render, open the existing `payment-scanner` web service (the service that hosts `https://payment-scanner.onrender.com`), then **Environment** and add:

- `SUPABASE_URL` — the Project URL from Supabase → Project Settings → API.
- `SUPABASE_ANON_KEY` — the project's publishable/anon key from Supabase → Project Settings → API. If Supabase shows a newer publishable key instead of a legacy anon key, use that publishable key.
- Keep `GEMINI_API_KEY` as it already is.

Do **not** use or expose the Supabase `service_role` / secret key. The server only needs a public/anon key to ask Supabase Auth to verify the user token.

## 2. Deploy the backend

Commit and push the updated `server/server.js` to the branch connected to Render. This implementation calls Supabase Auth's user-verification endpoint directly, so no new backend package is required. If Render's Root Directory is `server`, the existing `npm install` / `npm start` setup can remain. If the service uses the repository root as its Root Directory, ensure its build/start commands still target the `server` folder (for example, build `cd server && npm install`, start `cd server && npm start`).

Wait for Render to finish deploying before testing the updated mobile app. The endpoint will reject requests until `SUPABASE_URL` and `SUPABASE_ANON_KEY` are configured.

## 3. Update the mobile app

Use the updated `src/app/dashboard.tsx` from this project. It gets the current access token from the existing Supabase client and sends it with every scan request. No new mobile environment variables are needed.

## 4. Test

1. Log in to PaymentScanner and scan a test image; it should still work.
2. Send a request to `/scan` without an `Authorization` header; it should return HTTP `401` with `Authentication required`.
3. Log out and try scanning; the app should prompt the user to log in again rather than process the image.

The token check authenticates the user. It does not yet restrict scanning to the `admin` role; any valid signed-in account can scan.
