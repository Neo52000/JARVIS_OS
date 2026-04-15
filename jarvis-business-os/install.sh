#!/bin/bash
# ══════════════════════════════════════════════════
# JARVIS BUSINESS OS — Installation
# ══════════════════════════════════════════════════

set -e

echo "╔══════════════════════════════════════════╗"
echo "║      JARVIS BUSINESS OS — Install        ║"
echo "╚══════════════════════════════════════════╝"
echo ""

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 not found. Install Python 3.10+ first."
    exit 1
fi

PYTHON_VERSION=$(python3 -c 'import sys; print(f"{sys.version_info.major}.{sys.version_info.minor}")')
echo "✅ Python $PYTHON_VERSION detected"

# Create virtual environment
echo ""
echo "📦 Creating virtual environment..."
python3 -m venv venv
source venv/bin/activate

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# Create data directories
echo ""
echo "📁 Creating data directories..."
mkdir -p data/chroma data/logs data/exports

# Check .env
if [ ! -f .env ] || grep -q "your_mistral_api_key_here" .env; then
    echo ""
    echo "⚠️  IMPORTANT: Edit .env and add your Mistral API key"
    echo "   Get one at: https://console.mistral.ai"
fi

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║         ✅ Installation complete!         ║"
echo "╠══════════════════════════════════════════╣"
echo "║                                          ║"
echo "║  1. Edit .env → add MISTRAL_API_KEY      ║"
echo "║  2. Run: ./start.sh                      ║"
echo "║  3. Open: http://localhost:8000           ║"
echo "║                                          ║"
echo "╚══════════════════════════════════════════╝"
