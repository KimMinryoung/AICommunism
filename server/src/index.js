const path = require('path');

// .env 파일 로드 (프로젝트 루트)
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const express = require('express');
const cors = require('cors');
const gameRoutes = require('./routes/game');
const storyData = require('./game/data/story_logic');

const app = express();
const PORT = process.env.PORT || process.env.SERVER_PORT || 3001;

// Middleware
app.use(cors({
  origin: [
    'https://ai-communism-client.onrender.com',
    'http://localhost:3000',
    'http://localhost:3002',
    'http://localhost:3001'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}));
app.use(express.json());

// Routes
app.use('/api/game', gameRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'AI Communism Simulation Server is running' });
});

// Initialize and start server
async function startServer() {
  try {
    // legacy DB initialization removed
    storyData.reinitialize();

    app.listen(PORT, () => {
      console.log(`✅ AI Communism Simulation Server is running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

startServer();
