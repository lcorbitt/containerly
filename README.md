# Containerly

A full-stack multi-tenant application for container and shipment lookups with real-time updates via WebSocket.

## Architecture

This is a monorepo containing:

- **Client** (`apps/client`): Next.js 14 frontend with TypeScript, Tailwind CSS, and TanStack Query
- **API** (`apps/api`): NestJS backend with authentication, REST APIs, and WebSocket gateway
- **Worker** (`apps/worker`): Background job processor using BullMQ
- **Packages**:
  - `@containerly/common`: Shared types, constants, and utilities
  - `@containerly/db`: Database entities and repository using TypeORM

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS, TanStack Query
- **Backend**: NestJS, TypeORM, PostgreSQL, Redis, BullMQ, Socket.io
- **Infrastructure**: Docker, Docker Compose
- **Multi-tenancy**: Organization-based with role-based access control (RBAC)

## Multi-Tenancy & User Roles

The application supports multi-tenant organizations with the following user roles:

- **SUPER_ADMIN**: Containerly admin with access to everything across all organizations
- **ORG_ADMIN**: Organization admins with full access within their organization (can invite other users)
- **MEMBER**: Basic users with access to their organization's data

On signup, a new organization is automatically created and the user is assigned the `ORG_ADMIN` role.

## Prerequisites

Before setting up the application locally, ensure you have the following installed:

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **Docker** and **Docker Compose** ([Download](https://www.docker.com/get-started))
- **PostgreSQL** 15+ (or use Docker)
- **Redis** 7+ (or use Docker)

## Local Development Setup

### Step 1: Clone and Navigate to Project

```bash
cd /Users/lukascorbitt/Documents/containerly
```

### Step 2: Install Dependencies

This is a **Turborepo monorepo**, which means all dependencies are managed from the root. Simply run:

```bash
npm install
```

This will install dependencies for all apps and packages in the monorepo:
- `apps/api` (NestJS backend)
- `apps/client` (Next.js frontend)
- `apps/worker` (Background job processor)
- `lib/common` (Shared types and utilities)
- `lib/db` (Database entities)

### Step 3: Set Up Environment Variables

Create environment files for each service:

#### API Environment (`apps/api/.env`)

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/containerly

# JWT
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=7d

# API
API_PORT=3001
CLIENT_URL=http://localhost:3000

# Redis
REDIS_URL=redis://localhost:6379
REDIS_HOST=localhost
REDIS_PORT=6379

# Environment
NODE_ENV=development
```

#### Client Environment (`apps/client/.env.local`)

```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=ws://localhost:3001
```

#### Worker Environment (`apps/worker/.env`)

```bash
DATABASE_URL=postgresql://user:password@localhost:5432/containerly
REDIS_URL=redis://localhost:6379
API_URL=http://localhost:3001
```

### Step 4: Start Everything

Run all services with one command:

```bash
npm run dev:all
```

This command:
1. Starts PostgreSQL and Redis in Docker (background)
2. Runs API, Client, and Worker locally via Turborepo (logs stream to your terminal)

**Logs**: You'll see logs from all three apps (API, Client, Worker) streaming in your terminal. To see PostgreSQL and Redis logs, open another terminal and run: `docker-compose logs -f postgres redis`

**Alternative**: If you want to start infrastructure separately:

```bash
# 1. Start only infrastructure (PostgreSQL & Redis)
npm run dev:infra

# 2. In a separate terminal, start all apps
npm run dev
```

### Step 5: Run Database Migrations

Once PostgreSQL is running, run migrations using TypeORM CLI:

```bash
# From the root directory
npm run migration:run
```

**TypeORM Migration Commands:**

- **Run migrations**: `npm run migration:run`
- **Generate new migration**: 
  ```bash
  cd apps/api
  npx typeorm-ts-node-commonjs migration:generate ../../lib/db/src/migrations/AddUsersAndOrgs -d ../../lib/db/src/data-source.ts
  ```
  - Replace `AddUsersAndOrgs` with your migration name
  - This will create a new migration file in `lib/db/src/migrations/`
- **Show migration status**: `npm run migration:show`
- **Revert last migration**: `npm run migration:revert`

**Note**: Migrations are generated and stored in `lib/db/src/migrations/`. The data source file at `lib/db/src/data-source.ts` is used by TypeORM CLI to connect to the database.

### Step 6: Seed Database (Optional)

Create a test user and organization:

```bash
npm run seed
```

This creates:
- Organization: "Test Organization"
- User: `test@example.com` / `password123` (ORG_ADMIN role)
- Sample lookup records

### Step 7: Verify Setup

1. **Check API Health**: Open `http://localhost:3001` (should see NestJS welcome or error page)
2. **Check Client**: Open `http://localhost:3000` (should see the application)
3. **Test Signup**: 
   - Go to `http://localhost:3000`
   - Click "Sign up"
   - Enter email, organization name, and password
   - You should be redirected to the dashboard

## Development Workflow

### Making Changes

1. **Frontend Changes**: Edit files in `apps/client/` - Next.js hot-reloads automatically
2. **Backend Changes**: Edit files in `apps/api/` - NestJS restarts automatically
3. **Database Changes**: 
   - Update entities in `lib/db/src/entities/`
   - Generate migration: `npm run migration:generate -- -n YourMigrationName`
   - Run migration: `npm run migration:run`

### Database Triggers

All tables have automatic `updated_at` triggers that update the timestamp whenever a record is modified. This is handled by PostgreSQL triggers defined in `001_create_updated_at_trigger.sql`.

## Project Structure

```
containerly/
├── apps/
│   ├── client/          # Next.js frontend
│   │   ├── app/         # Next.js app directory
│   │   ├── lib/         # API client, WebSocket, auth helpers
│   │   ├── queries/     # TanStack Query hooks
│   │   └── styles/      # Tailwind CSS
│   ├── api/             # NestJS backend
│   │   ├── src/
│   │   │   ├── auth/    # Authentication module
│   │   │   ├── lookups/ # Lookups CRUD
│   │   │   ├── queue/   # BullMQ queue setup
│   │   │   └── gateways/# WebSocket gateway
│   │   └── Dockerfile
│   └── worker/          # Background job processor
│       ├── src/
│       │   ├── processor.ts
│       │   └── services/
│       └── Dockerfile
├── lib/
│   ├── common/          # Shared types, constants, utils
│   └── db/              # Database entities & migrations
├── scripts/             # Utility scripts (seed, etc.)
└── docker-compose.yml   # Docker services
```

## API Endpoints

### Authentication
- `POST /auth/signup` - Create new user and organization
  - Body: `{ email, password, organizationName }`
  - Returns: `{ user, organization, token }`
- `POST /auth/login` - Login user
  - Body: `{ email, password }`
  - Returns: `{ user, organization, token }`
- `POST /auth/logout` - Logout user (requires auth)
- `GET /auth/me` - Get current user (requires auth)

### Lookups
- `GET /lookups` - Get all lookups for current user's organization (requires auth)
- `GET /lookups/:id` - Get specific lookup (requires auth, org-scoped)
- `POST /lookups` - Create new lookup (requires auth)
  - Body: `{ query }`
- `POST /lookups/:id/refresh` - Refresh lookup (requires auth, org-scoped)

## WebSocket Events

Connect to `ws://localhost:3001?token=<JWT_TOKEN>`

- `lookup:update` - Lookup status updated
- `lookup:complete` - Lookup completed
- `lookup:error` - Lookup failed

## Running Everything in Docker

If you want to run all services (including apps) in Docker containers:

```bash
# Build and start all services (infrastructure + apps)
docker-compose up --build

# Start in background
docker-compose up -d

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f api
docker-compose logs -f client
docker-compose logs -f worker
```

**Note**: For development, it's recommended to run only infrastructure in Docker (`npm run dev:infra`) and run apps locally for better hot-reload. Use `docker-compose up` when you want everything containerized.

### Stop Services

```bash
docker-compose down

# Remove volumes (clears database)
docker-compose down -v
```

### Access Services in Docker

- **Client**: http://localhost:3000
- **API**: http://localhost:3001
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

## Troubleshooting

### Database Connection Issues

```bash
# Check if PostgreSQL is running
docker-compose ps postgres

# Check PostgreSQL logs
docker-compose logs postgres

# Test connection
psql postgresql://user:password@localhost:5432/containerly
```

### Port Already in Use

If ports 3000, 3001, 5432, or 6379 are already in use:

1. **Change ports in docker-compose.yml**:
   ```yaml
   ports:
     - "3002:3001"  # Change API port
   ```

2. **Update environment variables** accordingly

### Migration Issues

If migrations fail:

1. Ensure PostgreSQL is running: `docker-compose ps postgres`
2. Check `DATABASE_URL` in `apps/api/.env` matches your PostgreSQL connection
3. Verify the data source file exists: `lib/db/src/data-source.ts`
4. Try running migrations from the API directory: `cd apps/api && npm run migration:run`

### Module Not Found Errors

If you see "Cannot find module '@containerly/common'":

1. Run `npm install` from the root directory
2. Rebuild TypeScript: `npm run type-check`
3. Restart the dev server

## Production Deployment

For production:

1. Set strong `JWT_SECRET` in environment
2. Use production database (not local)
3. Configure proper CORS origins
4. Set `NODE_ENV=production`
5. Build and optimize client: `cd apps/client && npm run build`
6. Use process manager (PM2, systemd) for API and Worker

## License

MIT
