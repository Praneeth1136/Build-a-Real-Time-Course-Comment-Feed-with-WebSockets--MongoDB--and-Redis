const express = require('express');
const cors = require('cors');
const http = require('http');
const path = require('path');
const { connectToDatabase } = require('./database/index');
const { initRedis } = require('./pubsub/index');
const { initWebSocket } = require('./websocket/index');
const commentsRouter = require('./routes/comments');

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/courses/:courseId/comments', commentsRouter);

// Serve frontend
app.use(express.static(path.join(__dirname, '../frontend')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Initialize WebSocket
initWebSocket(server);

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await connectToDatabase();
    await initRedis();
    
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
