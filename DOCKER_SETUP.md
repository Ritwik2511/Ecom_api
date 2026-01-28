# E-Commerce Backend - Docker Setup Guide

## 🚀 Quick Start

### Prerequisites
- Docker Desktop installed and running
- Docker Compose v2.0+

### Development Setup

1. **Start all services:**
```bash
docker-compose up -d
```

2. **View logs:**
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f api
docker-compose logs -f postgres
docker-compose logs -f redis
```

3. **Stop all services:**
```bash
docker-compose down
```

4. **Stop and remove volumes (⚠️ deletes all data):**
```bash
docker-compose down -v
```

---

## 📋 Services

### 🗄️ **PostgreSQL Database**
- **Container:** `ecom-postgres`
- **Port:** `5433:5432` (host:container)
- **Credentials:** See `.env` file
- **Health Check:** Automatic with retry logic
- **Data Persistence:** `postgres_data` volume

### 🔴 **Redis Cache**
- **Container:** `ecom-redis`
- **Port:** `6379:6379` (host:container)
- **Password:** Optional (set in `.env`)
- **Data Persistence:** `redis_data` volume with AOF enabled

### 🌐 **API Service**
- **Container:** `ecom-api`
- **Port:** `3000:3000` (configurable via `.env`)
- **Features:**
  - Auto Prisma client generation
  - Auto database migrations
  - Hot reload in development
  - Health check endpoint: `/health`
  - Swagger docs: `/api-docs`

---

## 🔧 Configuration

### Environment Variables

All configuration is managed through the `.env` file:

```env
# Application
NODE_ENV=development
PORT=3000

# Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=ecom
POSTGRES_CONTAINER_NAME=ecom-postgres
DB_HOST_PORT=5433

# Redis
REDIS_CONTAINER_NAME=ecom-redis
REDIS_HOST_PORT=6379
REDIS_PASSWORD=

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRY=7d

# CORS
CORS_ORIGIN=*
DEVELOPMENT_ORIGINS=http://localhost:3000,http://localhost:3001
```

---

## 🛠️ Common Commands

### Database Management

**Run Prisma migrations:**
```bash
docker-compose exec api npx prisma migrate dev
```

**Generate Prisma client:**
```bash
docker-compose exec api npx prisma generate
```

**Open Prisma Studio:**
```bash
docker-compose exec api npx prisma studio
```

**Reset database (⚠️ deletes all data):**
```bash
docker-compose exec api npx prisma migrate reset
```

### Service Management

**Rebuild specific service:**
```bash
docker-compose up -d --build api
```

**Restart specific service:**
```bash
docker-compose restart api
```

**View service status:**
```bash
docker-compose ps
```

**Execute commands in container:**
```bash
docker-compose exec api sh
```

### Logs and Debugging

**Follow logs:**
```bash
docker-compose logs -f api
```

**View last 100 lines:**
```bash
docker-compose logs --tail=100 api
```

**Check health status:**
```bash
curl http://localhost:3000/health
```

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────┐
│           Docker Network (ecom-network)      │
│                                              │
│  ┌──────────┐    ┌──────────┐    ┌────────┐│
│  │   API    │───▶│ Postgres │    │ Redis  ││
│  │  :3000   │    │  :5432   │    │ :6379  ││
│  └──────────┘    └──────────┘    └────────┘│
│       │                                      │
└───────┼──────────────────────────────────────┘
        │
        ▼
   Host Machine
   localhost:3000
```

### Network Isolation
- All services communicate via `ecom-network` (bridge network)
- Internal services use container names for DNS resolution
- Only API port is exposed to host machine

### Volume Management
- `postgres_data`: PostgreSQL data persistence
- `redis_data`: Redis data persistence
- `prisma_client`: Prisma generated client cache

---

## 🔒 Security Best Practices

### Development
✅ Ports exposed for debugging
✅ Hot reload enabled
✅ Detailed logging

### Production Checklist
- [ ] Set `NODE_ENV=production`
- [ ] Generate strong `JWT_SECRET`
- [ ] Set strong `POSTGRES_PASSWORD`
- [ ] Set `REDIS_PASSWORD`
- [ ] Remove port mappings for internal services (use `expose` only)
- [ ] Configure proper `CORS_ORIGIN`
- [ ] Enable SSL/TLS for database connections
- [ ] Use Docker secrets for sensitive data
- [ ] Implement rate limiting
- [ ] Set up monitoring and logging

---

## 🐛 Troubleshooting

### Container won't start
```bash
# Check logs
docker-compose logs api

# Rebuild from scratch
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

### Database connection issues
```bash
# Check database health
docker-compose exec postgres pg_isready -U postgres

# Check connection from API
docker-compose exec api sh -c "npx prisma db pull"
```

### Prisma client errors
```bash
# Regenerate Prisma client
docker-compose exec api npx prisma generate

# Check Prisma schema
docker-compose exec api npx prisma validate
```

### Port already in use
```bash
# Change port in .env file
PORT=3001
DB_HOST_PORT=5434
REDIS_HOST_PORT=6380

# Restart services
docker-compose down
docker-compose up -d
```

---

## 📦 Adding New Services

To add a new service (e.g., frontend):

1. **Uncomment in `docker-compose.yml`:**
```yaml
frontend:
  build:
    context: ./frontend
    dockerfile: Dockerfile
  container_name: ecom-frontend
  ports:
    - "3001:3000"
  networks:
    - ecom-network
```

2. **Add to `.env`:**
```env
FRONTEND_PORT=3001
FRONTEND_CONTAINER_NAME=ecom-frontend
```

3. **Start the service:**
```bash
docker-compose up -d frontend
```

---

## 🎯 Production Deployment

### Using Docker Swarm
```bash
docker stack deploy -c docker-compose.yml ecom
```

### Using Kubernetes
Convert to K8s manifests:
```bash
kompose convert -f docker-compose.yml
```

### Using Cloud Providers
- **AWS ECS:** Use `docker-compose` with ECS CLI
- **Google Cloud Run:** Deploy individual services
- **Azure Container Instances:** Use Docker Compose integration

---

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Redis Documentation](https://redis.io/documentation)

---

## 🤝 Support

For issues and questions:
1. Check logs: `docker-compose logs -f`
2. Verify health: `curl http://localhost:3000/health`
3. Review `.env` configuration
4. Rebuild containers: `docker-compose up -d --build`

---

**Happy Coding! 🚀**
