# TU-Recommend

Express.js API with Prisma, MinIO, Redis, and Mailpit.

## Project Structure

```
src/
├── config/           # Configuration files (database, redis, minio, mail)
├── common/           # Shared code
│   ├── middleware/   # Express middleware
│   └── utils/        # Utility functions
├── modules/          # Feature modules (organized by domain)
│   └── user/         # Example user module
│       ├── user.routes.ts
│       ├── user.controller.ts
│       ├── user.service.ts
│       ├── user.validation.ts
│       ├── user.types.ts
│       └── index.ts
├── app.ts            # Express app setup
└── index.ts          # Application entry point
```

## Prerequisites

- Node.js 18+
- Docker & Docker Compose
- npm or yarn

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Environment

```bash
cp .env.example .env
```

### 3. Start Docker Services

```bash
npm run docker:start
# or
./scripts/docker-start.sh
```

This starts:
- **PostgreSQL** on port 5432
- **Redis** on port 6379
- **MinIO** API on port 9000, Console on port 9001
- **Mailpit** SMTP on port 1025, Web UI on port 8025

### 4. Setup Database

```bash
npm run prisma:generate
npm run prisma:migrate
```

### 5. Run Development Server

```bash
npm run dev
```

The server will start on http://localhost:3000

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build TypeScript to JavaScript |
| `npm run start` | Start production server |
| `npm run prisma:generate` | Generate Prisma client |
| `npm run prisma:migrate` | Run database migrations |
| `npm run prisma:studio` | Open Prisma Studio |
| `npm run docker:start` | Start Docker containers |
| `npm run docker:stop` | Stop Docker containers |

## API Endpoints

### Health Check
- `GET /health` - Health check endpoint

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

## Services Access

| Service | URL | Credentials |
|---------|-----|-------------|
| MinIO Console | http://localhost:9001 | minioadmin / minioadmin |
| Mailpit UI | http://localhost:8025 | - |
| Prisma Studio | http://localhost:5555 | - |

## Adding New Modules

To add a new module, create a folder under `src/modules/` with the following structure:

```
src/modules/your-module/
├── your-module.routes.ts      # Route definitions
├── your-module.controller.ts  # Request handlers
├── your-module.service.ts     # Business logic
├── your-module.validation.ts  # Zod schemas
├── your-module.types.ts       # TypeScript types
└── index.ts                   # Module exports
```

Then import and register the routes in `src/app.ts`.

## License

ISC
