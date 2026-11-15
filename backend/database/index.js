const { MongoClient } = require('mongodb');

let db;

/**
 * Initializes and caches connection to MongoDB.
 * Verifies compound index on comments collection for courseId and createdAt.
 */
async function connectToDatabase() {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/course_comments';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('[Database] Successfully connected to MongoDB');
    db = client.db();

    // Ensure compound index on comments collection
    await db.collection('comments').createIndex({ courseId: 1, createdAt: -1 });
    console.log('[Database] Verified compound index: { courseId: 1, createdAt: -1 }');

    return db;
  } catch (error) {
    console.error('[Database] Failed to connect to MongoDB:', error.message);
    process.exit(1);
  }
}

/**
 * Returns cached database handle.
 */
function getDatabase() {
  if (!db) {
    throw new Error('Database not initialized. Call connectToDatabase() first.');
  }
  return db;
}

module.exports = {
  connectToDatabase,
  getDatabase,
};
