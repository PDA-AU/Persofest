# PERSOFEST'26 - Deployment Guide

This guide will help you deploy the PERSOFEST'26 event registration portal on an EC2 instance or any Linux-based server.

## Prerequisites

- Ubuntu/Debian-based Linux server (tested on Ubuntu 20.04+)
- Root or sudo access
- Domain name (optional, for production)
- At least 2GB RAM and 20GB storage

## Tech Stack

- **Frontend**: React.js with Tailwind CSS
- **Backend**: FastAPI (Python)
- **Database**: PostgreSQL
- **Web Server**: Nginx (for production)
- **Process Manager**: Supervisor

## Quick Start

For automated setup, run:

```bash
chmod +x setup.sh
sudo ./setup.sh
```

## Manual Setup Instructions

### 1. Update System Packages

```bash
sudo apt update
sudo apt upgrade -y
```

### 2. Install Required Dependencies

#### Install PostgreSQL

```bash
sudo apt install -y postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### Install Python 3.9+ and pip

```bash
sudo apt install -y python3 python3-pip python3-venv
```

#### Install Node.js and Yarn

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g yarn
```

#### Install Nginx (for production)

```bash
sudo apt install -y nginx
```

#### Install Supervisor

```bash
sudo apt install -y supervisor
```

### 3. Setup PostgreSQL Database

```bash
# Switch to postgres user
sudo -u postgres psql

# In PostgreSQL shell, run:
CREATE DATABASE persofest_db;
CREATE USER persofest WITH PASSWORD 'persofest123';
GRANT ALL PRIVILEGES ON DATABASE persofest_db TO persofest;
\q
```

**Note**: Change the password `persofest123` to a strong password in production!

### 4. Clone or Upload Application

```bash
# If using Git
git clone <your-repository-url> /app
cd /app

# Or upload files manually to /app directory
```

### 5. Backend Setup

```bash
cd /app/backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

#### Configure Backend Environment Variables

Create/Edit `/app/backend/.env`:

```env
DATABASE_URL=postgresql://persofest:persofest123@localhost:5432/persofest_db
SECRET_KEY=your_super_secret_jwt_key_change_this_in_production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
UPLOAD_DIR=/app/backend/uploads
```

**Important**: Change `SECRET_KEY` to a strong random string in production!

#### Initialize Database Tables

```bash
# The tables will be created automatically on first run
# Or manually run:
python3 -c "from database import engine, Base; from models import *; Base.metadata.create_all(bind=engine)"
```

### 6. Frontend Setup

```bash
cd /app/frontend

# Install dependencies
yarn install

# Configure environment variables
```

Create/Edit `/app/frontend/.env`:

```env
REACT_APP_BACKEND_URL=http://your-server-ip:8001
```

For production with domain:
```env
REACT_APP_BACKEND_URL=https://api.yourdomain.com
```

#### Build Frontend for Production

```bash
yarn build
```

### 7. Configure Supervisor (Process Manager)

Create backend supervisor config at `/etc/supervisor/conf.d/persofest-backend.conf`:

```ini
[program:persofest-backend]
directory=/app/backend
command=/app/backend/venv/bin/python server.py
user=root
autostart=true
autorestart=true
stderr_logfile=/var/log/persofest-backend.err.log
stdout_logfile=/var/log/persofest-backend.out.log
environment=PATH="/app/backend/venv/bin"
```

Create frontend supervisor config at `/etc/supervisor/conf.d/persofest-frontend.conf`:

```ini
[program:persofest-frontend]
directory=/app/frontend
command=/usr/bin/yarn start
user=root
autostart=true
autorestart=true
stderr_logfile=/var/log/persofest-frontend.err.log
stdout_logfile=/var/log/persofest-frontend.out.log
```

Reload supervisor:

```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start all
```

### 8. Configure Nginx (Production)

Create Nginx config at `/etc/nginx/sites-available/persofest`:

```nginx
# Backend API
server {
    listen 80;
    server_name api.yourdomain.com;  # Change this

    location / {
        proxy_pass http://127.0.0.1:8001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Frontend
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;  # Change this

    root /app/frontend/build;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /static/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/persofest /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 9. Setup SSL with Let's Encrypt (Production)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com -d api.yourdomain.com
```

### 10. Configure Firewall

```bash
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

## Verifying Installation

### Check Backend

```bash
curl http://localhost:8001/api/health
# Should return: {"status":"healthy","message":"PERSOFEST'26 API is running"}
```

### Check Frontend

```bash
curl http://localhost:3000
# Should return HTML content
```

### Check Supervisor Status

```bash
sudo supervisorctl status
# Both services should show RUNNING
```

### Check Logs

```bash
# Backend logs
tail -f /var/log/persofest-backend.out.log
tail -f /var/log/persofest-backend.err.log

# Frontend logs
tail -f /var/log/persofest-frontend.out.log

# Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

## Managing the Application

### Restart Services

```bash
# Restart backend
sudo supervisorctl restart persofest-backend

# Restart frontend
sudo supervisorctl restart persofest-frontend

# Restart Nginx
sudo systemctl restart nginx
```

### Stop Services

```bash
sudo supervisorctl stop persofest-backend
sudo supervisorctl stop persofest-frontend
```

### View Service Status

```bash
sudo supervisorctl status
```

## Updating the Application

```bash
# Pull latest changes
cd /app
git pull

# Update backend
cd /app/backend
source venv/bin/activate
pip install -r requirements.txt
deactivate
sudo supervisorctl restart persofest-backend

# Update frontend
cd /app/frontend
yarn install
yarn build
sudo supervisorctl restart persofest-frontend
```

## Troubleshooting

### Backend not starting

1. Check PostgreSQL is running:
   ```bash
   sudo systemctl status postgresql
   ```

2. Check database connection:
   ```bash
   sudo -u postgres psql -l
   ```

3. Check backend logs:
   ```bash
   tail -100 /var/log/persofest-backend.err.log
   ```

### Frontend not loading

1. Check if build exists:
   ```bash
   ls -la /app/frontend/build
   ```

2. Rebuild frontend:
   ```bash
   cd /app/frontend
   yarn build
   ```

### Database connection issues

Verify database credentials in `/app/backend/.env` match PostgreSQL settings.

### Port already in use

```bash
# Check what's using port 8001
sudo lsof -i :8001

# Kill the process if needed
sudo kill -9 <PID>
```

## Security Recommendations for Production

1. **Change default passwords** in `.env` files
2. **Setup firewall** to restrict access
3. **Enable SSL/TLS** with Let's Encrypt
4. **Regular backups** of PostgreSQL database
5. **Keep system updated** with security patches
6. **Use environment-specific secrets** (don't commit `.env` to git)
7. **Setup monitoring** (e.g., Prometheus, Grafana)
8. **Configure rate limiting** in Nginx
9. **Enable CORS** only for trusted domains
10. **Regular security audits**

## Backup Database

```bash
# Backup
sudo -u postgres pg_dump persofest_db > backup_$(date +%Y%m%d).sql

# Restore
sudo -u postgres psql persofest_db < backup_20261201.sql
```

## Support

For issues or questions:
- Check application logs
- Review this documentation
- Check GitHub issues (if applicable)

---

**Note**: This is a comprehensive deployment guide. Adjust paths, domain names, and credentials according to your specific setup.
