const { MongoClient } = require('mongodb');

let db;

async function connectToDatabase() {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/course_comments';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB');
    db = client.db();

    // Ensure index on comments collection
    await db.collection('comments').createIndex({ courseId: 1, createdAt: -1 });
    console.log('Index on { courseId: 1, createdAt: -1 } created or verified');
    
    return db;
  } catch (error) {
    console.error('Failed to connect to MongoDB', error);
    process.exit(1);
  }
}

function getDatabase() {
  if (!db) {
    throw new Error('Database not initialized');
  }
  return db;
}

module.exports = {
  connectToDatabase,
  getDatabase
};
