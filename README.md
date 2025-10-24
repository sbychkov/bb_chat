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
3. Open your browser to `https://localhost:8443` (or `http://localhost:8888` for HTTP redirect)

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

## SSL Configuration

The application supports SSL/TLS encryption using certificate files in the `ssl/` directory:

1. Place your SSL certificate as `ssl/cert.pem`
2. Place your SSL private key as `ssl/key.pem`
3. Access the application via `https://localhost:8443`

For development, you can generate self-signed certificates:
```bash
mkdir ssl
openssl genrsa -out ssl/key.pem 2048
openssl req -new -x509 -key ssl/key.pem -out ssl/cert.pem -days 365 -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"
```

## Production Deployment

1. Update environment variables in `docker-compose.yml` for production
2. Place production SSL certificates in `ssl/` directory
3. Run: `docker-compose up -d`
4. Access via `https://your-server:8443`

## Configuration

- Frontend API URL: Set via `VITE_API_URL` environment variable
- Backend CORS: Configure via `CORS_ORIGIN` environment variable
- STUN servers: Configured in WebRTC service (uses Google public STUN)

## Network Requirements

- **Minimum**: 4 CPU cores, 8 GB RAM, 100 Mbps symmetric network
- **Ports**: 8888 (HTTP redirect), 8443 (HTTPS)
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
