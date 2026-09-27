const express = require('express');
const { getDatabase } = require('../database/index');
const { getPublisher } = require('../pubsub/index');

const router = express.Router({ mergeParams: true }); // to access courseId

router.post('/', async (req, res) => {
  const { courseId } = req.params;
  const { userId, text } = req.body;

  if (!userId || !text) {
    return res.status(400).json({ error: 'userId and text are required' });
  }

  try {
    const db = getDatabase();
    const commentsCollection = db.collection('comments');

    const comment = {
      courseId,
      userId,
      text,
      createdAt: new Date().toISOString()
    };

    const result = await commentsCollection.insertOne(comment);
    comment.id = result.insertedId.toString();

    // Remove _id from response
    delete comment._id;

    // Publish to Redis
    const publisher = getPublisher();
    const channel = `course:${courseId}:comments`;
    await publisher.publish(channel, JSON.stringify(comment));

    res.status(201).json(comment);
  } catch (error) {
    console.error('Error posting comment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/', async (req, res) => {
  const { courseId } = req.params;

  try {
    const db = getDatabase();
    const commentsCollection = db.collection('comments');

    const comments = await commentsCollection
      .find({ courseId })
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();

    // Map _id to id and reverse to return oldest first
    const mappedComments = comments.map(c => {
      const { _id, ...rest } = c;
      return { id: _id.toString(), ...rest };
    }).reverse();

    res.status(200).json(mappedComments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
