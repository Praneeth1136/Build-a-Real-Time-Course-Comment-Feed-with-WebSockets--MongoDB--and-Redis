const WebSocket = require('ws');
const { parse } = require('url');

const courseRooms = new Map();

function initWebSocket(server) {
  const wss = new WebSocket.Server({ noServer: true });

  server.on('upgrade', (request, socket, head) => {
    const { pathname } = parse(request.url);

    const match = pathname.match(/^\/ws\/courses\/([^/]+)$/);
    if (match) {
      const courseId = match[1];
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request, courseId);
      });
    } else {
      socket.destroy();
    }
  });

  wss.on('connection', (ws, request, courseId) => {
    console.log(`New WS connection for course ${courseId}`);

    if (!courseRooms.has(courseId)) {
      courseRooms.set(courseId, new Set());
    }
    courseRooms.get(courseId).add(ws);

    // Heartbeat mechanism (Ping/Pong and application-level)
    let isAlive = true;
    ws.on('pong', () => {
      isAlive = true;
    });

    ws.on('message', (message) => {
      try {
        const parsed = JSON.parse(message);
        if (parsed.type === 'ping') {
          ws.send(JSON.stringify({ type: 'pong' }));
        }
      } catch (err) {
        // Ignore non-JSON messages for heartbeat purposes
      }
    });

    const interval = setInterval(() => {
      if (isAlive === false) {
        clearInterval(interval);
        return ws.terminate();
      }
      isAlive = false;
      ws.ping();
    }, 30000);

    ws.on('close', () => {
      clearInterval(interval);
      const room = courseRooms.get(courseId);
      if (room) {
        room.delete(ws);
        if (room.size === 0) {
          courseRooms.delete(courseId);
        }
      }
    });
  });
}

function broadcastToRoom(courseId, message) {
  const room = courseRooms.get(courseId);
  if (room) {
    for (const client of room) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    }
  }
}

module.exports = {
  initWebSocket,
  broadcastToRoom
};
