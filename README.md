# Band of Blades Chat

A containerized WebRTC video chat application built with Vue 3 frontend and Node.js backend.

## Features

- Real-time video and audio communication using WebRTC
- Anonymous access (no user accounts required)
- Room-based chat sessions
- Peer-to-peer mesh topology for up to 100 concurrent users
- Containerized deployment with Docker Compose
- Google STUN servers for NAT traversal

## Architecture

- **Frontend**: Vue 3 + TypeScript + Vite
- **Backend**: Node.js + Express + Socket.IO + TypeScript
- **Communication**: WebSocket for signaling, WebRTC for media streams
- **STUN**: Google public STUN servers for NAT traversal
- **Proxy**: Nginx reverse proxy for routing and load balancing

## Quick Start

1. Clone the repository
2. Run the application:
   ```bash
   docker-compose up --build
   ```
3. Open your browser to `http://localhost:8888`

## Development

### Frontend Development
```bash
cd frontend
npm install
npm run dev
```

### Backend Development
```bash
cd backend
npm install
npm run dev
```

## Production Deployment

1. Update environment variables in `docker-compose.yml` for production
2. Run: `docker-compose up -d`
3. Access via `http://your-server:8888`

## Configuration

- Frontend API URL: Set via `VITE_API_URL` environment variable
- Backend CORS: Configure via `CORS_ORIGIN` environment variable
- STUN servers: Configured in WebRTC service (uses Google public STUN)

## Network Requirements

- **Minimum**: 4 CPU cores, 8 GB RAM, 100 Mbps symmetric network
- **Ports**: 8888 (nginx proxy)
- **Firewall**: Allow WebRTC traffic (UDP ports 49152-65535)

## Troubleshooting

- Check browser console for WebRTC connection errors
- Verify STUN server accessibility
- Ensure proper firewall configuration for WebRTC traffic
- Check Docker container logs: `docker-compose logs [service-name]`

## API Endpoints

- `GET /health` - Health check endpoint
- `GET /api/rooms` - Room information (use Socket.IO for real-time data)

## Socket.IO Events

### Client to Server
- `join-room` - Join a room with roomId and userId
- `webrtc-signaling` - Send WebRTC signaling messages
- `get-webrtc-config` - Request WebRTC configuration
- `get-rooms` - Request list of available rooms

### Server to Client
- `user-joined` - New user joined the room
- `user-left` - User left the room
- `room-users` - List of users in current room
- `webrtc-signaling` - WebRTC signaling messages
- `webrtc-config` - WebRTC configuration with STUN servers
- `rooms-list` - List of available rooms
