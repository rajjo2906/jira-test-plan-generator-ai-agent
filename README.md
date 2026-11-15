# QA Studio — Jira Test Plan Generator

## Run locally

1. Install backend and frontend dependencies: run `npm install` in `backend` and `frontend`.
2. The backend reads the project `.env` file at `01_Test_Planning_AIAgent/.env`.
3. Start the backend with `npm run dev` in `backend`.
4. Start the frontend with `npm run dev` in `frontend`.
5. Open <http://localhost:5173>, then use **Settings** to save or test Jira and Groq connections.

The backend runs at <http://localhost:4000>. Local settings are stored in `backend/data/settings.json`, which is excluded from Git. API secrets are never returned by the settings API.

## Deploy to Vercel

Deploy the `SRC` directory as the Vercel project root. Project names cannot contain underscores; use a valid hyphenated name.

Set these environment variables in Vercel Project Settings:

- `JIRA_BASE_URL`
- `JIRA_EMAIL`
- `JIRA_API_TOKEN`
- `GROQ_API_KEY`

Hosted settings are managed through Vercel environment variables and require a redeploy after changes. Never add keys to frontend environment variables or commit them.
