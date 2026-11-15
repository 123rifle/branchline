# Branchline prototype + Admin dashboard

Open `index.html` in Chrome or Edge. No build step. Everything works straight from disk.
(To edit the JSON live, serve the folder instead, e.g. `python3 -m http.server`, and open http://localhost:8000.)

## Admin login
Go to `#/admin` (or the "Admin" link in the sidebar / Settings page).
- user: `alexadmin`
- pass: `alexadminpass`

Credentials, session length (8 h) and lockout rules (5 wrong tries = 2 min lock) live in `data/admin.json`.
NOTE: this is a front-end-only prototype, so the login is a gate for the demo, not real security.
Before going live, move authentication to a server.

## Dashboard tabs
Overview (users, DAU/WAU/MAU, time spent, ARR/MRR, revenue, churn, LTV, CAC, funnel) · Users (per-user time spent and
post interactions, click a row for details) · Content (per-story views, votes, likes, comments, dwell, traffic sources) ·
Engagement (retention cohorts, feature adoption, time-spent buckets) · Revenue · Live (real tracking of this browser) · Data & export (CSV/JSON).

## Files
- `index.html`, `styles.css`, `app.js` : the app (UI arrangement improved, tracking hooks added)
- `admin.js`, `admin.css` : login + dashboard
- `tracker.js` : records real time-in-app and every interaction in this browser (shown in the "Live" tab)
- `data/*.json` : admin, users, posts, daily, monthly, transactions, metrics, meta (synthetic DEMO data)
- `data/bundle.js` : same data as one script so it also works from `file://` (regenerate with the tool below)
- `tools/generate_data.py` : regenerates all data files. To use real data, replace the JSON files (same shape) and rebuild `bundle.js`.
