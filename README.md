# Docker Compose Project: Next.js + Node.js + Redis

## Foreword

This is just a practice demo for me to understand how Docker works

## What This Demo Conceptually Solves 

This project addresses common challenges when building containerized full-stack applications:

- **Multi-container orchestration**: How to coordinate multiple services (frontend, backend, database) that need to communicate with each other
- **Service discovery**: How services find and communicate with each other using Docker's internal networking (service names instead of hardcoded IPs)
- **CORS avoidance**: How to handle cross-origin requests by using Next.js API routes as a server-side proxy, eliminating browser CORS issues
- **Production-ready patterns**: Implementing health checks, restart policies, and rate limiting for resilient applications
- **Development workflow**: Setting up a complete local development environment that mirrors production container architecture

## Solutions

[![Docker Compose Demo](media/docker-img.png)](media/docker-demo.mp4)
*Click the image above to watch the demo video (MP4, will open in your browser).*

> **Note:** GitHub READMEs do not support embedded video playback, so the video is provided as a downloadable or in-browser link.

This demo addresses each challenge with practical, production-ready implementations:

- **Multi-container orchestration** → Uses Docker Compose with `depends_on` and health check conditions to ensure services start in the correct order (Redis → Backend → Frontend)

- **Service discovery** → Services communicate using Docker's internal DNS network. Backend connects to Redis via `redis://redis:6379` and Next.js proxy calls backend via `http://backend:4000`, eliminating hardcoded IPs and port conflicts

- **CORS avoidance** → Next.js API route (`/api/proxy`) acts as a server-side proxy, making same-origin requests from the browser while the proxy handles cross-container communication over Docker's internal network

- **Production-ready patterns** → Implements health checks (Redis ping, backend HTTP health endpoint), restart policies (`restart: unless-stopped`), and rate limiting (30 requests/minute) to prevent abuse and ensure service resilience

- **Development workflow** → Single command (`docker compose up --build`) spins up the entire stack, with environment variables and service networking configured to match production container patterns

## Target Persona

This demo is specifically beneficial for **DevOps engineers and platform engineers** at different stages:

- **Junior DevOps engineers** learning container orchestration fundamentals and how to structure multi-service applications with proper dependency management
- **Mid-level DevOps engineers** who need a reference implementation for health checks, restart policies, and service communication patterns in Docker Compose
- **Platform engineers** building internal developer platforms who want to see how to structure containerized applications that developers can easily run locally
- **DevOps engineers transitioning from VMs to containers** who need to understand service discovery, container networking, and orchestration concepts
- **Site Reliability Engineers (SREs)** looking for examples of resilience patterns (health checks, auto-restart, rate limiting) in containerized environments

---

A complete multi-container Docker Compose application demonstrating:
- **Frontend**: Next.js (pages router) on port 3000
- **Backend**: Node.js + Express on port 4000
- **Cache**: Redis on port 6379

## Prerequisites

- Docker Desktop (or Docker Engine + Docker Compose)
- Git (optional, for cloning)

## How to Run

1. **Start all services:**
   ```bash
   docker compose up --build
   ```

2. **Run in detached mode (background):**
   ```bash
   docker compose up --build -d
   ```

3. **Stop all services:**
   ```bash
   docker compose down
   ```

## URLs to Test

- **Frontend**: http://localhost:3000 (primary entry point)
- **Backend Health Check**: http://localhost:4000/health
- **Backend API** (optional, direct access): http://localhost:4000/api

## How to View Logs

- **All services:**
  ```bash
  docker compose logs -f
  ```

- **Specific service:**
  ```bash
  docker compose logs -f frontend
  docker compose logs -f backend
  docker compose logs -f redis
  ```

## Check Service Health Status

View the health status of all services:

```bash
docker compose ps
```

This shows which services are running and their health status (healthy/unhealthy).

## How to Reset Redis Counter

To reset the Redis counter (and all Redis data), stop the containers and remove volumes:

```bash
docker compose down -v
```

Then start again:
```bash
docker compose up --build
```

## Architecture

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐      ┌─────────────┐
│   Frontend  │─────▶│ Next.js API  │─────▶│   Backend   │─────▶│    Redis   │
│  (Next.js)  │      │    Proxy     │      │  (Express)  │      │   (Cache)  │
│  Port 3000  │      │  (same-origin)│     │  Port 4000  │      │  Port 6379 │
└─────────────┘      └──────────────┘      └─────────────┘      └─────────────┘
```

**Request Flow:**
1. Browser calls Next.js frontend at `localhost:3000`
2. Frontend calls Next.js API proxy route `/api/proxy` (same-origin, no CORS)
3. Next.js proxy calls backend service via Docker network: `http://backend:4000/api`
4. Backend connects to Redis via service name: `redis://redis:6379`
5. Backend increments counter and returns JSON response
6. Response flows back through the chain to the browser

**Features:**
- **No CORS issues**: Frontend uses same-origin Next.js API route
- **Rate limiting**: Backend limits to 30 requests per minute
- **Health checks**: Redis and backend have health checks for proper startup
- **Auto-restart**: All services restart automatically unless stopped

## Project Structure

```
.
├── docker-compose.yml
├── README.md
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   └── server.js
└── frontend/
    ├── Dockerfile
    ├── package.json
    ├── next.config.js
    └── pages/
        ├── index.js
        └── api/
            └── proxy.js
```

## Environment Variables

### Backend
- `REDIS_URL`: Redis connection string (default: `redis://redis:6379`)
- `PORT`: Server port (default: `4000`)

### Frontend
- `API_INTERNAL_BASE`: Backend service URL for Next.js API proxy (default: `http://backend:4000`)

## Troubleshooting

- **Port already in use**: Stop other services using ports 3000, 4000, or 6379
- **Connection errors**: Ensure all services are healthy (check `docker compose ps`)
- **Rate limit errors**: Backend limits to 30 requests/minute - wait a minute and try again
- **Build issues**: Try `docker compose build --no-cache`
- **Service won't start**: Check health status with `docker compose ps` and logs with `docker compose logs [service-name]`

