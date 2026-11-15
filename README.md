# Real-Time Course Comment Feed

A high-performance real-time course comment feed powered by **WebSockets**, **MongoDB Atlas**, and **Redis Pub/Sub** for cross-instance message broadcast.

---

## System Architecture

```
Client (Browser / WS Client)
         │  ▲
         │  │ WebSocket Connection (ws://localhost:8080)
         ▼  │
 Express WebSocket Server
         ├───► MongoDB (Persistent comment store & indexes)
         └───► Redis Pub/Sub (Channel broadcast across cluster)
```

## Features
- **Real-Time Delivery:** Sub-second latency comment propagation to connected subscribers.
- **Horizontal Scalability:** Redis Pub/Sub enables seamless clustering across multiple WebSocket nodes.
- **Compound Indexing:** Optimized MongoDB query performance with `{ courseId: 1, createdAt: -1 }`.
- **Docker Compose Ready:** Single command spin-up for local MongoDB and Redis instances.

## Quick Start
```bash
# 1. Spin up Redis and MongoDB
docker-compose up -d

# 2. Install backend dependencies and launch
cd backend
npm install
npm start
```
