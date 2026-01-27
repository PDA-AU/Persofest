#!/bin/bash

set -e  # Exit immediately on error

echo "========================================"
echo " 🚀 Deploying PERSOFEST'26"
echo "========================================"

BASE_DIR="/home/ubuntu/persofest"
BACKEND_DIR="$BASE_DIR/backend"
FRONTEND_DIR="$BASE_DIR/frontend"

echo "📁 Moving to project directory"
cd "$BASE_DIR"

echo "🔄 Pulling latest code"
git pull

echo "----------------------------------------"
echo "🐍 Backend: Updating dependencies"
cd "$BACKEND_DIR"

source venv/bin/activate
pip install -r requirements.txt
deactivate

echo "🔁 Restarting backend (Supervisor)"
sudo supervisorctl restart persofest-backend

echo "----------------------------------------"
echo "🎨 Frontend: Installing dependencies"
cd "$FRONTEND_DIR"

yarn install

echo "🏗️ Building frontend"
yarn build

echo "----------------------------------------"
echo "✅ Deployment completed successfully!"
echo "🌐 Site is live"
echo "========================================"

