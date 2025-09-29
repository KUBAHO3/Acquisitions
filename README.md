# Acquisitions Application - Docker Setup

This repository contains a Node.js application that's configured to work with Neon Database in both development and production environments using Docker.

## 🏗️ Architecture Overview

- **Development**: Uses Neon Local via Docker for local development with ephemeral database branches
- **Production**: Uses Neon Cloud Database for production workloads
- **Database**: PostgreSQL via Neon with Drizzle ORM
- **Runtime**: Node.js 20 with Express.js

## 📋 Prerequisites

- Docker Desktop installed
- Docker Compose installed
- Neon account and project created at [https://console.neon.tech](https://console.neon.tech)
- Basic knowledge of Node.js and PostgreSQL

## 🛠️ Development Environment Setup

### 1. Configure Neon Credentials

First, get your Neon credentials from the [Neon Console](https://console.neon.tech):

1. **NEON_API_KEY**: Go to Account Settings → API Keys
2. **NEON_PROJECT_ID**: Found in Project Settings → General
3. **PARENT_BRANCH_ID**: Usually your main/default branch ID

### 2. Setup Environment File

Copy and configure the development environment file:

```powershell
cp .env.development .env.dev.local
```

Edit `.env.dev.local` and replace the placeholder values:

```bash
# Required: Replace these with your actual Neon values
NEON_API_KEY=your_actual_neon_api_key_here
NEON_PROJECT_ID=your_actual_neon_project_id_here
PARENT_BRANCH_ID=your_parent_branch_id_here
```

### 3. Start Development Environment

Use Docker Compose to start both Neon Local and your application:

```powershell
# Start development environment
docker-compose --env-file .env.dev.local -f docker-compose.dev.yml up --build

# Or run in detached mode
docker-compose --env-file .env.dev.local -f docker-compose.dev.yml up -d --build
```

### 4. Access Your Application

- **Application**: [http://localhost:3000](http://localhost:3000)
- **Database**: `postgres://neon:npg@localhost:5432/neondb?sslmode=require`
- **Drizzle Studio** (if needed): Run `npm run db-studio` from within the container

### 5. Development Workflow

The development environment provides:

- **Hot Reloading**: Code changes are automatically reloaded
- **Ephemeral Database Branches**: Each container start creates a fresh database branch
- **Automatic Cleanup**: Database branches are deleted when containers stop
- **Local PostgreSQL Interface**: Connect via standard PostgreSQL tools on port 5432

### 6. Stop Development Environment

```powershell
docker-compose -f docker-compose.dev.yml down
```

## 🚀 Production Environment Setup

### 1. Configure Production Environment

Copy and configure the production environment file:

```powershell
cp .env.production .env.prod.local
```

Edit `.env.prod.local` with your production Neon Cloud database URL:

```bash
# Replace with your actual Neon Cloud database URL
DATABASE_URL=postgres://username:password@ep-example-123456.us-east-1.aws.neon.tech/dbname?sslmode=require
```

### 2. Deploy to Production

```powershell
# Build and start production environment
docker-compose --env-file .env.prod.local -f docker-compose.prod.yml up --build -d

# Or without nginx reverse proxy (app only)
docker-compose --env-file .env.prod.local -f docker-compose.prod.yml up app --build -d
```

### 3. Production Features

The production setup includes:

- **Optimized Docker Image**: Multi-stage build with production dependencies only
- **Security Hardening**: Non-root user, read-only filesystem, dropped capabilities
- **Health Checks**: Built-in health monitoring
- **Nginx Reverse Proxy**: Load balancing, rate limiting, and security headers
- **Resource Limits**: Memory and CPU constraints
- **Logging**: Structured logging with rotation

### 4. Access Production Application

- **Application** (via Nginx): [http://localhost](http://localhost)
- **Direct Application**: [http://localhost:3000](http://localhost:3000)
- **Health Check**: [http://localhost/health](http://localhost/health)

## 🔧 Database Operations

### Development (Neon Local)

```powershell
# Run database migrations
docker-compose -f docker-compose.dev.yml exec app npm run db:migrate

# Generate new migration
docker-compose -f docker-compose.dev.yml exec app npm run db:generate

# Access database directly
docker-compose -f docker-compose.dev.yml exec neon-local psql -U neon -d neondb
```

### Production (Neon Cloud)

```powershell
# Run database migrations
docker-compose -f docker-compose.prod.yml exec app npm run db:migrate

# Generate new migration
docker-compose -f docker-compose.prod.yml exec app npm run db:generate
```

## 📁 File Structure

```
.
├── Dockerfile                 # Multi-stage Docker image
├── docker-compose.dev.yml     # Development environment with Neon Local
├── docker-compose.prod.yml    # Production environment
├── nginx.conf                 # Nginx reverse proxy configuration
├── .env.example              # Environment variables template
├── .env.development          # Development environment template
├── .env.production           # Production environment template  
├── .dockerignore             # Docker build exclusions
├── .gitignore               # Git exclusions
├── drizzle.config.js        # Database configuration
├── package.json             # Node.js dependencies
└── src/
    ├── index.js            # Application entry point
    ├── server.js           # Server setup
    └── app.js             # Express app configuration
```

## 🔐 Security Considerations

### Development
- Uses ephemeral database branches for isolation
- Self-signed certificates for local SSL
- Debug logging enabled

### Production
- Non-root container user
- Read-only root filesystem
- Dropped Linux capabilities
- Rate limiting via Nginx
- Security headers
- Resource constraints
- Structured logging

## 🐛 Troubleshooting

### Common Issues

**1. Neon Local Connection Issues**
```powershell
# Check Neon Local container logs
docker-compose -f docker-compose.dev.yml logs neon-local

# Verify environment variables
docker-compose -f docker-compose.dev.yml exec neon-local env | grep NEON
```

**2. Application Won't Start**
```powershell
# Check application logs
docker-compose -f docker-compose.dev.yml logs app

# Verify database connectivity
docker-compose -f docker-compose.dev.yml exec app npm run db:migrate
```

**3. Port Conflicts**
```powershell
# Check what's using port 5432 or 3000
netstat -an | findstr :5432
netstat -an | findstr :3000

# Kill conflicting processes or change ports in docker-compose files
```

**4. Permission Issues (Linux/macOS)**
```bash
# Fix file permissions
sudo chown -R $USER:$USER .
chmod -R 755 .
```

### Health Checks

```powershell
# Check container health
docker ps

# Check application health endpoint
curl http://localhost:3000/health   # Development
curl http://localhost/health        # Production
```

## 🔄 Environment Variables Reference

### Development (.env.development)
| Variable | Description | Required |
|----------|-------------|----------|
| `NEON_API_KEY` | Your Neon API key | Yes |
| `NEON_PROJECT_ID` | Your Neon project ID | Yes |
| `PARENT_BRANCH_ID` | Parent branch for ephemeral branches | Yes |
| `BRANCH_ID` | Specific branch ID (alternative to PARENT_BRANCH_ID) | No |

### Production (.env.production)
| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | Full Neon Cloud database connection string | Yes |
| `NODE_ENV` | Set to 'production' | Yes |
| `PORT` | Application port (default: 3000) | No |
| `LOG_LEVEL` | Logging level (info, error, debug) | No |

## 📚 Additional Resources

- [Neon Documentation](https://neon.tech/docs)
- [Neon Local Documentation](https://neon.com/docs/local/neon-local)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with both development and production environments
5. Submit a pull request

## 📝 License

This project is licensed under the ISC License - see the package.json file for details.

---

For questions or support, please refer to the project's issue tracker or contact the development team.