# Beacon — Student Wellbeing Platform

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-7-DC382D?logo=redis)](https://redis.io/)
[![Python](https://img.shields.io/badge/Python-3.12-3776AB?logo=python)](https://python.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://typescriptlang.org/)
[![License](https://img.shields.io/badge/License-Proprietary-lightgrey)](#license)

> **A confidential, AI-assisted mental health and wellbeing platform for university students.**  
> Combines private mood tracking, personalized evidence-based coping tools, and campus-wide privacy-preserving analytics — with automated safety escalation to human counselors.

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              Beacon Platform                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────┐     HTTPS/REST      ┌──────────────┐                     │
│  │   Frontend   │ ◄─────────────────► │   Backend    │                     │
│  │  (Next.js 15)│                     │  (FastAPI)   │                     │
│  │  Port 3000   │                     │  Port 8000   │                     │
│  └──────────────┘                     └──────┬───────┘                     │
│                                               │                             │
│                    ┌──────────────────────────┼──────────────────────────┐  │
│                    ▼                          ▼                          ▼  │
│             ┌─────────────┐           ┌─────────────┐            ┌─────────────┐
│             │ PostgreSQL  │           │    Redis    │            │   Celery    │
│             │    16       │           │     7       │            │  Workers    │
│             └─────────────┘           └─────────────┘            └─────────────┘
│                    │                          │                          │
│                    ▼                          ▼                          ▼
│             ┌─────────────────────────────────────────────────────────────────┐
│             │                    Docker Compose Stack                         │
│             └─────────────────────────────────────────────────────────────────┘
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## ✨ Features

### For Students
- 📝 **Daily Check-in** — Mood, stress, energy, sleep, contributing factors
- 📊 **Mood Analytics** — 7/30-day trends, streak tracking, AI-identified patterns
- 🧠 **Periodic Assessments** — Structured self-screening (not diagnostic)
- 💡 **Personalized Recommendations** — Rule-based + LLM-assisted, with AI transparency
- 📚 **Resource Library** — Articles, audio, guides, campus services (searchable)
- 🤝 **Counseling Access** — Browse counselors, request appointments, manage bookings
- 🔒 **Privacy Controls** — Granular consent, data export, right to erasure (GDPR)
- 🔔 **Smart Notifications** — Check-in reminders, appointment confirmations

### For Staff (Counselors & Wellbeing Admins)
- 📈 **Campus Analytics Dashboard** — Aggregated trends, stress distribution, top factors
- 🎫 **Support Case Queue** — Escalated cases with priority, state machine workflow
- 📝 **Case Management** — Assignment, notes, status tracking, audit trail
- 📋 **Resource Management** — Publish/unpublish, engagement metrics

### For Admins
- 👥 **User Management** — Role assignment, activation/deactivation
- 📋 **Audit Logs** — Security compliance trail
- ⚙️ **System Configuration** — Feature flags, thresholds

---

## 🛡 Privacy & Security (Core Principles)

| Principle | Implementation |
|-----------|----------------|
| **Data Minimization** | Only collect what's necessary for wellbeing support |
| **Field-level Encryption** | AES-256-GCM for email, names, notes, meeting links |
| **Pseudonymization** | Student IDs stored as HMAC-SHA256 hashes |
| **k-Anonymity (k=10)** | All analytics suppress groups < 10 students |
| **Differential Privacy** | Laplace noise for small cohorts (10-20) |
| **No Diagnoses** | Never use clinical language; support levels only |
| **Human-in-the-Loop** | Automated escalation creates case — counselor decides |
| **Audit Everything** | Cross-role access logged with hashed IP/UA |
| **GDPR Ready** | Consent versioning, export, deletion workflows |

---

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 20+ (for frontend dev)
- Python 3.12+ (for backend dev)

### One-Command Start (Docker)

```bash
# Clone and start everything
git clone https://github.com/your-org/beacon.git
cd Beacon

# Start all services (PostgreSQL, Redis, Backend, Celery, Frontend)
docker-compose -f docker-compose.yml -f frontend/docker-compose.yml up -d

# Run database migrations
docker-compose exec backend python -m alembic upgrade head

# Frontend available at http://localhost:3000
# Backend API at http://localhost:8000
# API Docs at http://localhost:8000/docs
```

### Development Setup

**Backend:**
```bash
cd backend
cp .env.example .env
# Edit .env with your settings

python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Start PostgreSQL & Redis
docker-compose up -d postgres redis

# Migrate & run
python -m alembic upgrade head
uvicorn app.main:app --reload --port 8000

# Celery workers (separate terminals)
celery -A app.tasks.celery_app worker --loglevel=info
celery -A app.tasks.celery_app beat --loglevel=info
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
# Available at http://localhost:3000
```

---

## 📁 Project Structure

```
Beacon/
├── backend/                    # FastAPI Backend
│   ├── app/
│   │   ├── core/               # Security, permissions, privacy, exceptions
│   │   ├── database.py         # Async SQLAlchemy 2.0
│   │   ├── main.py             # FastAPI app factory
│   │   ├── config.py           # Pydantic Settings
│   │   ├── models/             # 11 SQLAlchemy ORM models
│   │   ├── schemas/            # 12 Pydantic request/response schemas
│   │   ├── routers/            # 11 API route modules
│   │   ├── services/           # Business logic (WIP)
│   │   ├── ml/                 # ML pipeline (WIP)
│   │   └── tasks/              # Celery tasks
│   ├── alembic/                # Database migrations
│   ├── tests/                  # Pytest suite
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── requirements.txt
│
├── frontend/                   # Next.js 15 Frontend
│   ├── src/
│   │   ├── app/                # App Router pages
│   │   │   ├── (student)/      # Student pages
│   │   │   └── staff/          # Staff pages
│   │   ├── components/         # React components
│   │   │   ├── student/        # Student-specific
│   │   │   ├── staff/          # Staff-specific
│   │   │   ├── ui/             # Base UI components
│   │   │   └── shared/         # Layout, navigation
│   │   ├── data/               # Mock data (dev)
│   │   ├── lib/                # Utilities
│   │   └── types/              # TypeScript types
│   ├── public/                 # Static assets
│   ├── package.json
│   ├── tsconfig.json
│   └── next.config.ts
│
├── docker-compose.yml          # Root compose (if needed)
└── README.md
```

---

## 🔧 Key Technologies

### Backend
| Layer | Technology |
|-------|------------|
| Framework | FastAPI 0.115 |
| Database | PostgreSQL 16 + asyncpg |
| ORM | SQLAlchemy 2.0 (async) |
| Migrations | Alembic |
| Cache/Queue | Redis 7 |
| Task Queue | Celery 5 |
| Auth | JWT (HS256) + Refresh Tokens + SAML 2.0 stubs |
| Validation | Pydantic v2 |
| Encryption | cryptography (AES-256-GCM) |
| Email | SendGrid |
| AI/ML | scikit-learn, sentence-transformers, OpenAI |

### Frontend
| Layer | Technology |
|-------|------------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 |
| UI Components | Radix UI + custom |
| Charts | Recharts 3 |
| State | React 19 + Server Components |
| Icons | Lucide React |

---

## 📚 API Documentation

| Environment | Swagger UI | ReDoc |
|-------------|------------|-------|
| Local | http://localhost:8000/docs | http://localhost:8000/redoc |
| Staging | https://staging-api.beacon.ashford.ac.uk/docs | https://staging-api.beacon.ashford.ac.uk/redoc |

### Example: Submit Check-in
```bash
curl -X POST http://localhost:8000/api/v1/check-ins \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "mood": "okay",
    "stress": "moderate",
    "energy": "moderate",
    "sleep": "adequate",
    "tags": ["academic_pressure", "sleep"],
    "note": "Midterms coming up"
  }'
```

---

## 🧪 Testing

```bash
# Backend
cd backend
pytest                    # All tests
pytest --cov=app         # With coverage
pytest tests/unit/       # Unit tests
pytest tests/integration/ # Integration tests

# Frontend
cd frontend
npm run test             # Unit tests
npm run test:e2e         # E2E tests (Playwright)
```

---

## 📦 Deployment

### Production Checklist
- [ ] `ENVIRONMENT=production`
- [ ] Strong `JWT_SECRET_KEY` (64+ chars, from KMS)
- [ ] `FIELD_ENCRYPTION_KEY` from Vault/KMS
- [ ] PostgreSQL with TDE enabled
- [ ] TLS 1.3 + HSTS + CSP headers
- [ ] SAML SSO configured with university IdP
- [ ] SendGrid verified sender
- [ ] S3 bucket for exports (encrypted)
- [ ] Log aggregation (Datadog/ELK/Splunk)
- [ ] Prometheus/Grafana monitoring
- [ ] Automated backups (RDS/PITR)
- [ ] WAF + DDoS protection

### Docker Production
```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

---

## 🤝 Contributing

1. **Branch naming**: `feature/`, `fix/`, `chore/`, `docs/`
2. **Commit messages**: Conventional Commits (`feat:`, `fix:`, `chore:`)
3. **Code style**: 
   - Backend: `ruff check`, `mypy`, `black`
   - Frontend: `eslint`, `prettier`
4. **Tests required** for new features
5. **Migrations** for schema changes
6. **Privacy review** for new analytics endpoints

---

## 📄 License

**Proprietary** — Ashford University Beacon Platform  
All rights reserved. Unauthorized copying, distribution, or modification prohibited.

---

## 🙏 Acknowledgments

- Built for student wellbeing at **Ashford University**
- Inspired by evidence-based mental health research
- UI components from [Radix UI](https://radix-ui.com/)
- Charts powered by [Recharts](https://recharts.org/)

---

**Made with care for student mental health** 💚
