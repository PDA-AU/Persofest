#!/bin/bash

# PERSOFEST'26 Automated Setup Script
# This script automates the deployment of PERSOFEST'26 on Ubuntu/Debian servers

set -e  # Exit on error

echo "=========================================="
echo "  PERSOFEST'26 Automated Setup"
echo "=========================================="
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Helper functions
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "→ $1"
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    print_error "Please run this script as root or with sudo"
    exit 1
fi

print_info "Starting installation process..."
echo ""

# Step 1: Update system
print_info "Step 1/9: Updating system packages..."
apt update -qq && apt upgrade -y -qq
print_success "System packages updated"
echo ""

# Step 2: Install PostgreSQL
print_info "Step 2/9: Installing PostgreSQL..."
apt install -y postgresql postgresql-contrib > /dev/null 2>&1
systemctl start postgresql
systemctl enable postgresql
print_success "PostgreSQL installed and started"
echo ""

# Step 3: Install Python
print_info "Step 3/9: Installing Python 3 and pip..."
apt install -y python3 python3-pip python3-venv > /dev/null 2>&1
print_success "Python 3 installed"
echo ""

# Step 4: Install Node.js and Yarn
print_info "Step 4/9: Installing Node.js and Yarn..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash - > /dev/null 2>&1
apt install -y nodejs > /dev/null 2>&1
npm install -g yarn > /dev/null 2>&1
print_success "Node.js and Yarn installed"
echo ""

# Step 5: Install Nginx
print_info "Step 5/9: Installing Nginx..."
apt install -y nginx > /dev/null 2>&1
print_success "Nginx installed"
echo ""

# Step 6: Install Supervisor
print_info "Step 6/9: Installing Supervisor..."
apt install -y supervisor > /dev/null 2>&1
systemctl start supervisor
systemctl enable supervisor
print_success "Supervisor installed and started"
echo ""

# Step 7: Setup PostgreSQL Database
print_info "Step 7/9: Setting up PostgreSQL database..."

# Get database password from user
print_warning "Please enter a secure password for the PostgreSQL user 'persofest':"
read -s DB_PASSWORD
echo ""

# Create database and user
sudo -u postgres psql > /dev/null 2>&1 <<EOF
CREATE DATABASE persofest_db;
CREATE USER persofest WITH PASSWORD '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE persofest_db TO persofest;
EOF

print_success "Database 'persofest_db' created"
echo ""

# Step 8: Setup Backend
print_info "Step 8/9: Setting up backend..."

if [ ! -d "/app/backend" ]; then
    print_error "Backend directory not found at /app/backend"
    print_warning "Please ensure the application is placed in /app directory"
    exit 1
fi

cd /app/backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt > /dev/null 2>&1

# Create/Update .env file
cat > .env <<EOF
DATABASE_URL=postgresql://persofest:${DB_PASSWORD}@localhost:5432/persofest_db
SECRET_KEY=$(openssl rand -hex 32)
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
UPLOAD_DIR=/app/backend/uploads
EOF

# Create uploads directory
mkdir -p /app/backend/uploads
chmod 755 /app/backend/uploads

deactivate
print_success "Backend setup completed"
echo ""

# Step 9: Setup Frontend
print_info "Step 9/9: Setting up frontend..."

if [ ! -d "/app/frontend" ]; then
    print_error "Frontend directory not found at /app/frontend"
    exit 1
fi

cd /app/frontend

# Install dependencies
yarn install > /dev/null 2>&1

# Get server IP or domain
SERVER_IP=$(hostname -I | awk '{print $1}')

# Update .env file
cat > .env <<EOF
REACT_APP_BACKEND_URL=http://${SERVER_IP}:8001
EOF

print_success "Frontend setup completed"
echo ""

# Configure Supervisor for Backend
print_info "Configuring Supervisor for backend..."
cat > /etc/supervisor/conf.d/persofest-backend.conf <<EOF
[program:persofest-backend]
directory=/app/backend
command=/app/backend/venv/bin/python server.py
user=root
autostart=true
autorestart=true
stderr_logfile=/var/log/persofest-backend.err.log
stdout_logfile=/var/log/persofest-backend.out.log
environment=PATH="/app/backend/venv/bin"
EOF

# Configure Supervisor for Frontend
print_info "Configuring Supervisor for frontend..."
cat > /etc/supervisor/conf.d/persofest-frontend.conf <<EOF
[program:persofest-frontend]
directory=/app/frontend
command=/usr/bin/yarn start
user=root
autostart=true
autorestart=true
stderr_logfile=/var/log/persofest-frontend.err.log
stdout_logfile=/var/log/persofest-frontend.out.log
EOF

# Reload and start services
supervisorctl reread > /dev/null 2>&1
supervisorctl update > /dev/null 2>&1
sleep 2
supervisorctl start all > /dev/null 2>&1

print_success "Services configured and started"
echo ""

# Configure basic firewall
print_info "Configuring firewall..."
ufw --force enable > /dev/null 2>&1
ufw allow 22/tcp > /dev/null 2>&1
ufw allow 80/tcp > /dev/null 2>&1
ufw allow 443/tcp > /dev/null 2>&1
ufw allow 3000/tcp > /dev/null 2>&1
ufw allow 8001/tcp > /dev/null 2>&1
print_success "Firewall configured"
echo ""

# Verify installation
echo "=========================================="
echo "  Verifying Installation"
echo "=========================================="
echo ""

sleep 5

print_info "Checking backend health..."
if curl -s http://localhost:8001/api/health > /dev/null 2>&1; then
    print_success "Backend is running"
else
    print_warning "Backend health check failed (may need more time to start)"
fi

print_info "Checking frontend..."
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    print_success "Frontend is running"
else
    print_warning "Frontend is starting (may take a minute)"
fi

print_info "Checking supervisor status..."
supervisorctl status

echo ""
echo "=========================================="
echo "  Installation Complete!"
echo "=========================================="
echo ""
print_success "PERSOFEST'26 has been successfully deployed!"
echo ""
echo "Access your application:"
echo "  Frontend: http://${SERVER_IP}:3000"
echo "  Backend API: http://${SERVER_IP}:8001"
echo "  API Health: http://${SERVER_IP}:8001/api/health"
echo ""
echo "Useful commands:"
echo "  Check status: sudo supervisorctl status"
echo "  Restart backend: sudo supervisorctl restart persofest-backend"
echo "  Restart frontend: sudo supervisorctl restart persofest-frontend"
echo "  View backend logs: tail -f /var/log/persofest-backend.out.log"
echo "  View frontend logs: tail -f /var/log/persofest-frontend.out.log"
echo ""
print_warning "Next steps:"
echo "  1. Configure your domain (if applicable)"
echo "  2. Setup SSL with Let's Encrypt (certbot)"
echo "  3. Configure Nginx reverse proxy for production"
echo "  4. Review security settings in .env files"
echo "  5. Setup regular database backups"
echo ""
print_info "For detailed instructions, refer to setup.md"
echo ""
