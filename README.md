# DevHub - Business Management Platform

A modern, single-tenant business management hub built with Next.js and FastAPI.

**Author:** UzumakiU  
**Repository:** [https://github.com/UzumakiU/devhub](https://github.com/UzumakiU/devhub)

## Quick Start

### Frontend (Next.js)

```bash
cd devhub
pnpm install
pnpm dev --port 3005
```

### Backend (FastAPI)

```bash
cd devhub-api
poetry install
poetry run uvicorn src.devhub_api.main:app --host 0.0.0.0 --port 8005 --reload
```

## Access

- **Frontend**: [http://localhost:3005](http://localhost:3005)
- **Backend API**: [http://localhost:8005](http://localhost:8005)
- **API Docs**: [http://localhost:8005/docs](http://localhost:8005/docs)

## Architecture

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: FastAPI, SQLAlchemy, PostgreSQL, Redis
- **Pattern**: Single-tenant smart (future multi-tenant ready)
- **ID System**: Prefixed sequential (USR-001, PRJ-001, etc.)

## Configuration

Environment variables are automatically loaded from:

- Workspace: `.env.workspace`
- Frontend: `devhub/.env.local`
- Backend: `devhub-api/.env`

## Development Status

✅ Basic setup complete
✅ Frontend/Backend communication working
⏳ Database setup (next)
⏳ Authentication system (next)
⏳ Core modules (in progress)
