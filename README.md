# API_Management_Platform

# Projects Structure:

![alt text](Architecture_images/llm_gateway_architecture.svg)

# Planning:

# Day 1
* Project setup + Auth
* Init repo, folder structure, pick stack (Node.js + Express + PostgreSQL + React)
* Google OAuth login · JWT generation · protect a route with middleware
* Basic user table in DB
* ⚠ Auth always takes longer than expected. Don't skip this — it's the foundation.

# Day 2
* Provider key management
* Frontend settings page · HTTPS POST to backend
* Encrypt key (AES-256) · Save to DB · Decrypt at use
* CRUD endpoints: add / update / delete a provider key

# Day 3
* Universal key + model routing
* Generate universal keys per user · Route request to correct provider
* Proxy call to OpenAI / Gemini using stored key
* Return response back to caller

# Day 4
* RBAC + Rate limiting
* Assign roles: Admin / Employee · Role-based middleware
* Rate limit per user using Redis counters (requests/min, cost/month)
* Admin can set limits per user from dashboard

# Day 5
* Usage tracking + Dashboard UI
* Log every API call: user · model · tokens · cost · timestamp
* Dashboard: usage charts per user, total spend, rate limit status
* Guardrails: basic input keyword filter (can expand later)

# Day 6
* Docker + local everything
* Dockerfile for backend · Dockerfile for frontend
* docker-compose with backend + frontend + PostgreSQL + Redis
* Make sure the full app runs with one command: docker compose up

# Day 7
* Deploy + wrap up
* Push to Railway / Render / Fly.io (easiest for first deploy)
* Set environment variables in cloud · point domain if you have one
* Smoke test every feature end-to-end

# Tech Stack

![Architecture_images/recommended_techstack.png](Architecture_images/recommended_techstack.png)

# File Stack

![Architecture_images/project_file_structure.png](Architecture_images/project_file_structure.png)