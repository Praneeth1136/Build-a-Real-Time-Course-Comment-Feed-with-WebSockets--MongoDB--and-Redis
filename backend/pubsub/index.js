const { createClient } = require('redis');
const { broadcastToRoom } = require('../websocket/index');

let publisherClient;
let subscriberClient;

async function initRedis() {
  const url = process.env.REDIS_URL || 'redis://localhost:6379';

  publisherClient = createClient({ url });
  subscriberClient = createClient({ url });

  publisherClient.on('error', (err) => console.log('Redis Publisher Error', err));
  subscriberClient.on('error', (err) => console.log('Redis Subscriber Error', err));

  await publisherClient.connect();
  await subscriberClient.connect();

  console.log('Connected to Redis Publisher and Subscriber');

  await subscriberClient.pSubscribe('course:*:comments', (message, channel) => {
    try {
      const courseId = channel.split(':')[1];
      const parsedPayload = JSON.parse(message);

      broadcastToRoom(courseId, parsedPayload);
    } catch (err) {
      console.error('Error handling redis message', err);
    }
  });
}

function getPublisher() {
  if (!publisherClient) {
    throw new Error('Redis Publisher not initialized');
  }
  return publisherClient;
}

module.exports = {
  initRedis,
  getPublisher
};
