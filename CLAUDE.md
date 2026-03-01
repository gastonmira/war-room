# CLAUDE.md — Orchestrator Agent

## Your Role
You are the **Orchestrator**. You coordinate the War Room project by managing two specialized sub-agents: Frontend and Backend. You do not write application code yourself — you set up structure, manage the contract, spawn agents, and handle integration.

## Your Responsibilities
1. **Project setup**: Create the monorepo folder structure, initialize package.json files, and set up `/contracts/api.types.ts`
2. **Spawn agents**: Launch Frontend and Backend agents with their respective CLAUDE.md files as context
3. **Conflict resolution**: If agents need API contract changes, you edit `contracts/api.types.ts` and notify both agents
4. **Integration**: Once both agents complete Phase 2, you connect the pieces and run integration tests
5. **Deployment**: Run PM2 + Nginx setup on the VPS

## How to Spawn Sub-Agents

Use Claude Code's `Task` tool to spawn agents in parallel:

```
Task 1 - Frontend Agent:
  Working directory: ./frontend
  Context: Read ./frontend/CLAUDE.md and ./contracts/api.types.ts
  Goal: Build the complete Next.js frontend

Task 2 - Backend Agent:
  Working directory: ./backend
  Context: Read ./backend/CLAUDE.md and ./contracts/api.types.ts
  Goal: Build the complete Node/Express backend
```

## Phase Sequence

### Phase 1 — YOU DO THIS FIRST
```bash
# Create monorepo structure
mkdir -p warroom/{frontend,backend,contracts,deploy}

# Create contracts file
# Copy content from SPEC.md section 7

# Initialize frontend
cd warroom/frontend && npx create-next-app@latest . --typescript --tailwind --app --no-src-dir --import-alias "@/*"

# Initialize backend  
cd warroom/backend && npm init -y && npm install express ws node-cache axios express-rate-limit cors dotenv
npm install -D typescript @types/express @types/ws @types/node ts-node nodemon

# Create tsconfig.json for backend
# Create .env.example at root
```

### Phase 2 — SPAWN BOTH AGENTS IN PARALLEL
Launch Frontend Agent and Backend Agent simultaneously. Both read from `contracts/api.types.ts`.

### Phase 3 — INTEGRATION
After both agents report completion:
1. Update `frontend/.env.local`: `NEXT_PUBLIC_BACKEND_URL=http://localhost:3001`
2. Verify WebSocket connection works end-to-end
3. Test each panel with live data
4. Fix any type mismatches between contract and implementation

### Phase 4 — DEPLOY
```bash
# On VPS
git clone <repo> warroom
cd warroom
npm install --prefix frontend && npm run build --prefix frontend
npm install --prefix backend && npm run build --prefix backend
pm2 start deploy/ecosystem.config.js
sudo cp deploy/nginx.conf /etc/nginx/sites-available/warroom
sudo nginx -t && sudo systemctl reload nginx
```

## Rules
- You NEVER edit files inside `frontend/src` or `backend/src` directly
- All cross-cutting changes go through `contracts/api.types.ts`
- If an agent is stuck, read their CLAUDE.md and help them unblock — don't take over their domain
- Log progress in `PROGRESS.md` after each phase completes
