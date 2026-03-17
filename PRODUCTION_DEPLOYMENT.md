# Production Deployment Guide

This guide outlines the steps to deploy the E-commerce Backend to your production server at `https://backend.bharatfoodsonline.com/`.

## 1. Prerequisites
- Node.js (v18+)
- PostgreSQL Database (Already configured to `websitedduniya`)
- Nginx (for reverse proxy and SSL)

## 2. Server Setup

### Clone or Transfer Files
Move the project files to your server. If you use Git:
```bash
git clone https://github.com/Ritwik2511/Ecom_api.git
cd Ecom_api
```

### Install Dependencies
```bash
npm install --production
```

### Environment Configuration
The `.env` file has been updated with:
- `DATABASE_URL`: `postgresql://websitedduniya:India%402026@localhost:5432/websiteduniya`
- `API_BASE_URL`: `https://backend.bharatfoodsonline.com`
- `NODE_ENV`: `production`

Ensure you also set a secure `JWT_SECRET` in `.env`.

### Database Sync
Run Prisma to sync the schema with your production database:
```bash
npx prisma generate
npx prisma db push
```

## 3. Running the Application

It is recommended to use **PM2** to keep the application running in the background.

```bash
# Install PM2 globally
npm install -g pm2

# Start the application
pm2 start index.js --name ecom-backend

# Set up PM2 to start on boot
pm2 startup
pm2 save
```

## 4. Nginx Configuration (SSL)

To point `backend.bharatfoodsonline.com` to your Node.js app (running on port 3000), use the following Nginx config:

```nginx
server {
    listen 80;
    server_name backend.bharatfoodsonline.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

*Note: You should use Certbot to enable HTTPS (SSL) for this domain.*

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d backend.bharatfoodsonline.com
```
