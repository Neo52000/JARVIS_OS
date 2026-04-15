#!/bin/bash
# JARVIS BUSINESS OS — Start Server
cd "$(dirname "$0")"
source venv/bin/activate 2>/dev/null || true

echo "🚀 Starting Jarvis Business OS..."
echo "   Dashboard: http://localhost:8000"
echo "   API Docs:  http://localhost:8000/docs"
echo ""

# Open browser
if command -v xdg-open &> /dev/null; then
    sleep 2 && xdg-open http://localhost:8000 &
elif command -v open &> /dev/null; then
    sleep 2 && open http://localhost:8000 &
fi

# Start server
python -m uvicorn api.main:app --host 0.0.0.0 --port 8000 --reload
