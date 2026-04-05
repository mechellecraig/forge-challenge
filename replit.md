# Forge Challenge

## Overview
A Node.js/Express web application serving a clean landing page.

## Tech Stack
- **Runtime:** Node.js 20
- **Framework:** Express 4
- **Frontend:** Vanilla HTML/CSS/JavaScript (in `public/`)

## Project Structure
```
forge-challenge/
├── server.js        # Express server, listens on port 5000
├── package.json     # Node.js dependencies
├── public/
│   ├── index.html   # Main HTML page
│   ├── style.css    # Styles
│   └── app.js       # Client-side JS
└── replit.md        # This file
```

## Running the App
- Workflow: "Start application" runs `node server.js`
- Server binds to `0.0.0.0:5000` for Replit proxy compatibility

## API Endpoints
- `GET /` — Serves the main HTML page
- `GET /api/health` — Health check JSON response

## Deployment
- Target: autoscale
- Run command: `node server.js`
