function connectToCourseSocket(courseId, onMessageCallback) {
  let ws = null;
  let reconnectTimeout = 1000;
  const maxReconnectTimeout = 10000;

  function connect() {
    // Dynamically determine WS URL based on current host
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/courses/${courseId}`;

    ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('Connected to real-time feed');
      reconnectTimeout = 1000; // Reset backoff
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'pong') {
          // Heartbeat response, ignore
          return;
        }
        onMessageCallback(data);
      } catch (err) {
        console.error('Error parsing WS message', err);
      }
    };

    ws.onclose = () => {
      console.log(`Connection lost. Reconnecting in ${reconnectTimeout}ms...`);
      setTimeout(connect, reconnectTimeout);
      reconnectTimeout = Math.min(reconnectTimeout * 1.5, maxReconnectTimeout);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      ws.close(); // Force close to trigger reconnect
    };
  }

  connect();

  return () => {
    ws.onclose = null;
    ws.close();
  };
}
