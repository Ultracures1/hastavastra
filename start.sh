#!/bin/bash
set -e

echo "=== Hastavastra Ecommerce Platform ==="
echo ""

# Start backend
echo "Starting API server on port 5000..."
cd "$(dirname "$0")/backend"
python3 server.py &
BACKEND_PID=$!

sleep 1

# Seed if DB doesn't exist or is empty
if ! python3 -c "import sqlite3; conn = sqlite3.connect('hastavastra.db'); c = conn.execute('SELECT COUNT(*) FROM products').fetchone(); conn.close(); exit(0 if c[0] > 0 else 1)" 2>/dev/null; then
  echo "Seeding database..."
  python3 seed.py
fi

echo "✓ API running at http://localhost:5000"

# Start frontend
echo "Starting frontend on port 3000..."
cd "$(dirname "$0")/frontend"
http-server -p 3000 --cors -c-1 -s &
FRONTEND_PID=$!

echo "✓ Frontend running at http://localhost:3000"
echo ""
echo "=== App is ready! ==="
echo "  → Frontend: http://localhost:3000"
echo "  → API:      http://localhost:5000/api/health"
echo ""
echo "Demo credentials:"
echo "  Admin: admin@hastavastra.com / admin123"
echo "  User:  test@example.com / test123"
echo ""
echo "Coupons: WELCOME10 | FLAT200 | FIRST15"
echo ""
echo "Press Ctrl+C to stop"

wait
