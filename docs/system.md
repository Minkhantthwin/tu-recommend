# TU-Recommend System Documentation

## 1. Overview

TU-Recommend is a full-stack university recommendation and application system for Myanmar technological universities. It helps applicants maintain personal and matriculation data, discover programs, receive eligibility-based recommendations, rank program choices, and submit applications. Administrators manage users, universities, programs, interests, and application reviews.

The project is split into two sibling repositories:

- `tu-recommend`: Express REST API, business rules, database access, file storage, and email integration.
- `tu-recommend-client`: Next.js web application for applicants and administrators.

## 2. System Architecture

```text
Browser
  |
  | HTTPS/JSON + Bearer JWT
  v
Next.js client (:3001)
  |
  | /api requests
  v
Express API (:3000)
  |-- PostgreSQL via Prisma
  |-- Redis
  |-- MinIO object storage
  `-- SMTP/Mailpit
```

Backend uses a module-based request flow:

```text
Route -> authentication/validation middleware -> controller -> service -> Prisma/external service
```

Client uses a feature-oriented flow:

```text
App Router page -> component/hook -> TanStack Query mutation/query -> Axios API endpoint
```

## 3. Technology Stack

### Backend

- Node.js and TypeScript
- Express 4
- Prisma 5 with PostgreSQL
- Zod 3 request validation
- JWT access and refresh tokens
- bcryptjs password hashing
- Redis through ioredis
- MinIO S3-compatible object storage
- Multer uploads
- Nodemailer with Mailpit for local email testing
- Helmet and CORS
- Swagger/OpenAPI documentation
- pnpm 10

### Client

- Next.js 16 App Router
- React 19 and TypeScript
- TanStack Query 5 for server state
- Axios for HTTP requests
- React Hook Form and Zod 4 for forms
- Tailwind CSS 4
- Radix UI primitives
- Recharts for admin charts
- Sonner notifications
- pnpm

## 4. Repository Structure

### Backend

```text
tu-recommend/
├── src/
│   ├── app.ts                 Express app, middleware, and route registration
│   ├── index.ts               service startup and graceful shutdown
│   ├── common/                shared middleware and utilities
│   ├── config/                database, Redis, MinIO, mail, and Swagger
│   ├── modules/
│   │   ├── auth/              registration, login, JWT, passwords
│   │   ├── user/              accounts and profiles
│   │   ├── university/        universities, programs, requirements
│   │   ├── interest/          interest catalog and user interests
│   │   ├── metriculation/     matriculation result operations
│   │   ├── recommendation/    eligibility, ranking, and comparison
│   │   ├── application/       application lifecycle and review
│   │   ├── upload/            MinIO uploads and file access
│   │   └── admin/             aggregate admin statistics
│   └── prisma/
│       ├── schema.prisma      database schema
│       ├── migrations/        database migrations
│       └── seed.ts            seed data
├── scripts/                   Docker, dependency, and flow checks
├── docs/                      project documentation
└── docker-compose.yml         local infrastructure
```

Each backend feature normally contains routes, controller, service, validation, types, and module exports. Shared error handling returns API errors after route processing.

### Client

```text
tu-recommend-client/
├── src/
│   ├── app/
│   │   ├── (auth)/            login, registration, password recovery
│   │   ├── (main)/            applicant pages
│   │   └── admin/             administration pages
│   ├── components/            forms, layouts, UI, dashboard, admin views
│   ├── hooks/                 TanStack Query and client-state hooks
│   ├── lib/api/               Axios client and endpoint functions
│   ├── config/                environment, navigation, and site metadata
│   ├── types/                 API and domain types
│   └── middleware.ts          route authentication redirects
└── public/                    static assets
```

## 5. Main User Flows

### Authentication

1. User registers with email and password.
2. Backend hashes password and creates a `USER` account.
3. Login returns access and refresh tokens.
4. Client stores tokens locally and sends access token as `Authorization: Bearer <token>`.
5. Client middleware redirects unauthenticated users away from protected pages.
6. Backend remains authoritative: protected and admin routes verify JWT and role.

### Applicant onboarding

1. User completes personal and guardian profile data.
2. User enters matriculation subjects and scores.
3. User selects interests used for recommendation scoring.
4. User browses universities and programs.
5. Recommendation endpoints combine matriculation eligibility and interests.

### Recommendation and eligibility

A program is eligible only when:

- Program status is `ACTIVE`.
- Applicant total score meets `Program.minScore`.
- Applicant meets every non-null subject requirement.
- Applicant meets `ProgramRequirement.minTotalScore` when present.
- A biology requirement fails when applicant has no biology score.

Eligible results can be filtered by region, university, search text, page, and limit. Suggested results add interest-based matching. Comparison accepts 2 to 5 unique program IDs.

### Application lifecycle

```text
DRAFT -> SUBMITTED -> UNDER_REVIEW -> ACCEPTED
                         |
                         `-> REJECTED

SUBMITTED or UNDER_REVIEW -> WITHDRAWN
```

- Applicant selects one required and up to two optional, unique program choices.
- Every selected program must exist, be active, and match matriculation requirements.
- Only draft applications can be edited, have documents attached, submitted, or deleted.
- Submission requires accepted declaration, complete profile, matriculation result, required documents, and still-valid choices.
- Submission assigns `TU-<year>-<application id>` as application number.
- Matriculation results cannot be updated or deleted while an application is `SUBMITTED`, `UNDER_REVIEW`, or `ACCEPTED`.
- Admin review accepts only `SUBMITTED` or `UNDER_REVIEW` applications.
- Accepted program must be one of applicant choices, active, and below quota.
- Review clears accepted-program or rejection data when status makes that data irrelevant.

## 6. Backend API

Base URL in local client configuration: `http://localhost:3000/api`.

Interactive Swagger documentation: `http://localhost:3000/api-docs`.

OpenAPI JSON: `http://localhost:3000/api-docs.json`.

Health check: `GET http://localhost:3000/health`.

### Endpoint groups

| Group | Main endpoints | Access |
| --- | --- | --- |
| Authentication | `/api/auth/register`, `/login`, `/refresh`, `/me`, `/change-password`, `/admin/create` | Public, user, or admin by operation |
| Users and profiles | `/api/users`, `/api/users/:id`, `/api/users/:id/profile` | User and admin |
| Universities | `/api/universities`, `/api/universities/:id`, `/api/universities/:id/programs` | Public reads; admin writes |
| Programs | `/api/programs`, `/api/programs/:id`, `/api/programs/requirements` | Public reads; admin writes |
| Interests | `/api/interests`, `/api/me/interests`, `/api/me/interests/bulk` | Public catalog; authenticated selection; admin writes |
| Matriculation | `/api/me/matriculation`, `/api/matriculations`, `/api/matriculations/stats` | User self-service; admin reporting |
| Recommendations | `/api/recommendations/eligible`, `/suggested`, `/top`, `/compare` | Authenticated user |
| Applications | `/api/applications`, `/:id/documents`, `/:id/submit`, `/:id/withdraw` | Authenticated user |
| Application review | `/api/admin/applications`, `/stats`, `/:id`, `/:id/review` | Admin |
| Uploads | `/api/upload/profile`, `/document`, `/image`, `/presigned/:key`, `/:key` | Authenticated; some operations admin-only |
| Admin dashboard | `/api/admin/stats` | Admin |

Successful API responses generally use:

```json
{
  "success": true,
  "data": {}
}
```

Validation failures return HTTP `400` with field-level details. Authentication failures use `401`; authorization failures use `403`; missing resources use `404`.

## 7. Data Model

### Core entities

| Model | Purpose | Important relations and constraints |
| --- | --- | --- |
| `User` | Login identity and role | Unique email; one profile and matriculation result; many interests and applications |
| `UserProfile` | Personal, contact, address, and guardian data | Unique user and NRC; deleted with user |
| `Interest` | Recommendation interest category | Unique name; many users through `UserInterest` |
| `UserInterest` | User-to-interest join | Unique `(userId, interestId)` pair |
| `MatriculationResult` | Exam identity and subject scores | One per user; biology optional; stores computed total score |
| `University` | Technological university | Owns many programs |
| `Program` | Degree program and capacity | Belongs to university; has status, minimum score, optional quota, and requirements |
| `ProgramRequirement` | Per-subject and total minimums | Belongs to program; nullable fields mean no requirement |
| `Application` | Ranked choices and review state | UUID ID; unique application number; belongs to user and selected programs |

### Enumerations

- `UserRole`: `USER`, `ADMIN`
- `ApplicationStatus`: `DRAFT`, `SUBMITTED`, `UNDER_REVIEW`, `ACCEPTED`, `REJECTED`, `WITHDRAWN`
- `ProgramStatus`: `ACTIVE`, `INACTIVE`, `SUSPENDED`
- `Degree`: `BACHELOR`, `MASTER`, `DIPLOMA`
- Profile enums: `Gender`, `Religion`, and `MaritalStatus`

## 8. Client Application

### Applicant pages

- Dashboard with top and suggested programs
- Profile view and edit
- Matriculation result form
- Interest selection
- University list and detail
- Program list, filtering, selection, and detail
- Recommendation page
- Application list, choice ordering, and draft creation
- Settings

### Admin pages

- Dashboard statistics
- User list and detail
- University create, read, update, and delete views
- Program create, read, update, and delete views
- Interest create, update, and delete views
- Application list

TanStack Query owns API cache and mutation invalidation. Applicant program choices are temporarily stored in browser local storage. Axios adds access tokens to outgoing requests and clears local authentication state after a `401` response.

## 9. Local Development

### Prerequisites

- Node.js 20 or compatible current LTS
- pnpm 10
- Docker with Docker Compose

### Backend setup

```bash
cd tu-recommend
pnpm install
cp .env.example .env
pnpm docker:start
pnpm prisma:generate
pnpm prisma:migrate
pnpm prisma:seed
pnpm dev
```

Backend runs at `http://localhost:3000` by default.

Docker Compose exposes PostgreSQL on host port `5433` and Redis on host port `6380`. When backend runs on host machine, set `DATABASE_URL` and `REDIS_PORT` to those host ports. Current `.env.example` uses container-default ports `5432` and `6379`, so copy values must be adjusted for this Compose setup.

### Client setup

```bash
cd tu-recommend-client
pnpm install
pnpm dev
```

Client runs at `http://localhost:3001`. Expected local variables:

```dotenv
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_APP_URL=http://localhost:3001
NEXT_PUBLIC_ENABLE_ANALYTICS=false
```

### Local service URLs

| Service | URL |
| --- | --- |
| Client | `http://localhost:3001` |
| API | `http://localhost:3000` |
| Swagger UI | `http://localhost:3000/api-docs` |
| PostgreSQL | `localhost:5433` |
| Redis | `localhost:6380` |
| MinIO API | `http://localhost:9000` |
| MinIO console | `http://localhost:9001` |
| Mailpit SMTP | `localhost:1025` |
| Mailpit UI | `http://localhost:8025` |

## 10. Build and Checks

### Backend

```bash
pnpm build
pnpm test:flow
pnpm deps:check
```

`test:flow` builds backend and runs a small assertion-based check for eligibility and duplicate program comparison behavior.

### Client

```bash
pnpm lint
pnpm build
```

## 11. Security and Operations

- Change JWT secrets and MinIO credentials outside local development.
- Configure `ALLOWED_ORIGINS` for deployed client origins.
- Use HTTPS for client, API, and public object URLs.
- Backend role checks protect admin APIs even though client middleware does not currently verify admin role.
- MinIO bucket is configured for public reads; do not upload private documents without revisiting access policy and using presigned access.
- API startup requires PostgreSQL, Redis, and MinIO to be reachable.
- SIGINT and SIGTERM handlers disconnect Prisma and Redis cleanly.

## 12. Current Integration Notes

These are current implementation gaps, not intended system behavior:

- Client application detail page is a placeholder; document upload, submission, withdrawal, and deletion are not exposed there yet.
- Client defines logout, forgot-password, and reset-password calls that have no matching backend routes.
- Client application update endpoint uses `PUT`, while backend route uses `PATCH`.
- General program browsing can include inactive or ineligible programs, but backend rejects those choices during application creation and submission.
- Client matriculation input does not yet send `null` when an existing biology score is cleared.
- Client displays generic Axios errors in several mutations instead of backend field-level validation messages.
- Client middleware checks token presence but not admin role; API authorization remains enforced server-side.
- Client environment module has a fallback API URL of `http://localhost:5000/api/v1`; checked-in local environment correctly overrides it with `http://localhost:3000/api`.
