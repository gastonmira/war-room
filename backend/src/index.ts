import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import rateLimit from 'express-rate-limit';

import { wss } from './websocket';
import newsRouter from './routes/news';
import marketsRouter from './routes/markets';
import socialRouter from './routes/social';
import articleRouter from './routes/article';
import { startWorkers } from './workers';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000' }));
app.use(express.json());
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);

app.use('/api/news', newsRouter);
app.use('/api/markets', marketsRouter);
app.use('/api/social', socialRouter);
app.use('/api/article', articleRouter);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const server = createServer(app);

// Attach WebSocket server to the same HTTP server
server.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit('connection', ws, request);
  });
});

server.listen(PORT, () => {
  console.log(`[WAR ROOM] Backend running on port ${PORT}`);
  startWorkers();
});
