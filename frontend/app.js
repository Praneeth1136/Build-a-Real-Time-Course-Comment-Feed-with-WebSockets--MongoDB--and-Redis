document.addEventListener('DOMContentLoaded', () => {
  const courseId = 'course-123'; // Default for demo
  document.getElementById('course-id-display').textContent = courseId;
  
  const commentList = document.getElementById('comment-list');
  const commentForm = document.getElementById('comment-form');
  const userIdInput = document.getElementById('user-id');
  const textInput = document.getElementById('comment-input');
  const feedContainer = document.querySelector('.feed-container');

  // Track existing IDs to prevent duplicates
  const existingComments = new Set();

  function renderComment(comment) {
    if (existingComments.has(comment.id)) {
      return;
    }
    existingComments.add(comment.id);

    const commentEl = document.createElement('div');
    commentEl.className = 'comment-item';
    commentEl.setAttribute('data-testid', `comment-item-${comment.id}`);

    const date = new Date(comment.createdAt);
    const timeString = isNaN(date.getTime()) ? '' : date.toLocaleTimeString();

    commentEl.innerHTML = `
      <div class="comment-header">
        <span class="comment-author">${escapeHTML(comment.userId)}</span>
        <span class="comment-time">${timeString}</span>
      </div>
      <p class="comment-text">${escapeHTML(comment.text)}</p>
    `;

    commentList.appendChild(commentEl);
    scrollToBottom();
  }

  function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
      tag => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
      }[tag])
    );
  }

  function scrollToBottom() {
    feedContainer.scrollTop = feedContainer.scrollHeight;
  }

  async function fetchHistory() {
    try {
      const res = await fetch(`/api/courses/${courseId}/comments`);
      if (res.ok) {
        const comments = await res.json();
        comments.forEach(renderComment);
      }
    } catch (err) {
      console.error('Failed to fetch history', err);
    }
  }

  commentForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const userId = userIdInput.value.trim();
    const text = textInput.value.trim();

    if (!userId || !text) return;

    textInput.value = '';

    try {
      const res = await fetch(`/api/courses/${courseId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, text })
      });

      if (res.ok) {
        const newComment = await res.json();
        // Since WebSocket also broadcasts it, we check in renderComment to avoid duplication.
        renderComment(newComment);
      }
    } catch (err) {
      console.error('Failed to post comment', err);
    }
  });

  // Initialize
  fetchHistory();
  
  // Setup WS connection
  connectToCourseSocket(courseId, (newComment) => {
    renderComment(newComment);
  });
});
