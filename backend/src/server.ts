import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { RoomHandler } from './handlers/room.handler';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:3000"
}));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API endpoints
app.get('/api/rooms', (req, res) => {
  // This could be expanded to return room statistics
  res.json({ message: 'Use Socket.IO for real-time room data' });
});

// Socket.IO connection handling
const roomHandler = new RoomHandler(io);

io.on('connection', (socket) => {
  roomHandler.handleConnection(socket);
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Band of Blades Chat signaling server running on port ${PORT}`);
  console.log(`📡 Socket.IO server ready for WebRTC signaling`);
  console.log(`🌐 CORS origin: ${process.env.CORS_ORIGIN || "http://localhost:3000"}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});
