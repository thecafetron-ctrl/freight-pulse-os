#!/bin/bash

# Freight Pulse OS launcher

set -e

BLUE='\033[0;34m'
CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║    🚀  Freight Pulse OS Launcher       ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"

echo -e "${CYAN}[1/4] Checking environment${NC}"

if [ ! -f ".env" ]; then
  echo -e "${YELLOW}Creating .env file placeholder (set OPENAI_API_KEY manually)${NC}"
  cat <<'EOF' > .env
# Populate your OpenAI key below
OPENAI_API_KEY=
EOF
fi

echo -e "${CYAN}[2/4] Installing frontend dependencies${NC}"
npm install >/dev/null

echo -e "${CYAN}[3/4] Installing server dependencies${NC}"
cd server
npm install >/dev/null
cd ..

echo -e "${CYAN}[4/4] Starting Freight Pulse OS (client + server)${NC}"
echo -e "${GREEN}Frontend → http://localhost:5173${NC}"
echo -e "${GREEN}Backend  → http://localhost:3001${NC}"

npm run dev

