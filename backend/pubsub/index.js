const Redis = require('ioredis');

let publisher;
let subscriber;

/**
 * Initializes Redis publisher and subscriber clients with error resilience.
 */
function initPubSub() {
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

  publisher = new Redis(redisUrl, {
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
  });

  subscriber = new Redis(redisUrl, {
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
  });

  publisher.on('error', (err) => console.error('[Redis Publisher Error]', err.message));
  subscriber.on('error', (err) => console.error('[Redis Subscriber Error]', err.message));

  publisher.on('connect', () => console.log('[Redis] Publisher connected'));
  subscriber.on('connect', () => console.log('[Redis] Subscriber connected'));

  return { publisher, subscriber };
}

function getPublisher() {
  if (!publisher) throw new Error('Publisher not initialized');
  return publisher;
}

function getSubscriber() {
  if (!subscriber) throw new Error('Subscriber not initialized');
  return subscriber;
}

module.exports = {
  initPubSub,
  getPublisher,
  getSubscriber,
};
