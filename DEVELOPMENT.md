# Band of Blades Chat - Development Guide

## Project Structure

```
bb_chat/
├── frontend/                 # Vue 3 application
│   ├── src/
│   │   ├── components/      # Vue components
│   │   │   ├── VideoGrid.vue
│   │   │   ├── ControlPanel.vue
│   │   │   └── RoomLobby.vue
│   │   ├── composables/     # Vue composables
│   │   │   ├── useWebRTC.ts
│   │   │   ├── useSocket.ts
│   │   │   └── useMediaDevices.ts
│   │   ├── stores/          # Pinia stores
│   │   │   └── room.ts
│   │   ├── services/        # Business logic
│   │   │   ├── webrtc.service.ts
│   │   │   └── signaling.service.ts
│   │   ├── types/           # TypeScript types
│   │   ├── App.vue
│   │   └── main.ts
│   ├── Dockerfile
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
├── backend/                  # Node.js signaling server
│   ├── src/
│   │   ├── server.ts        # Express + Socket.IO setup
│   │   ├── handlers/        # Socket event handlers
│   │   │   └── room.handler.ts
│   │   ├── services/        # Business logic
│   │   │   └── room.service.ts
│   │   ├── types/           # TypeScript types
│   │   └── config/          # Configuration
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
├── nginx/                    # Reverse proxy
│   ├── nginx.conf
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

## Development Setup

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for local development)
- Modern browser with WebRTC support

### Local Development

1. **Backend Development**:
   ```bash
   cd backend
   npm install
   npm run dev
   ```
   Backend runs on `http://localhost:5000`

2. **Frontend Development**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   Frontend runs on `http://localhost:5173`

3. **Full Stack with Docker**:
   ```bash
   docker-compose up --build
   ```
   Application accessible at `http://localhost:8080`

## Testing

### Manual Testing Checklist

1. **Connection Testing**:
   - [ ] Frontend connects to backend via Socket.IO
   - [ ] WebRTC configuration is received
   - [ ] Room creation and joining works

2. **Media Testing**:
   - [ ] Camera and microphone access granted
   - [ ] Video stream displays correctly
   - [ ] Audio is transmitted and received
   - [ ] Video/audio toggle controls work

3. **Multi-user Testing**:
   - [ ] Multiple users can join same room
   - [ ] Peer-to-peer connections established
   - [ ] Users can see each other's video streams
   - [ ] Users leaving room triggers cleanup

4. **Network Testing**:
   - [ ] Works behind NAT/firewall
   - [ ] STUN servers accessible
   - [ ] Connection recovery after network interruption

### Browser Compatibility

- **Chrome/Edge**: Full support
- **Firefox**: Full support
- **Safari**: Full support (iOS 11+)
- **Mobile browsers**: Supported with limitations

## Deployment

### Production Environment Variables

```bash
# Backend
NODE_ENV=production
PORT=3000
CORS_ORIGIN=https://yourdomain.com

# Frontend
VITE_API_URL=https://yourdomain.com
```

### SSL Configuration

For production with SSL, update nginx configuration:

```nginx
server {
    listen 443 ssl;
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    # ... rest of configuration
}
```

### Scaling Considerations

For > 100 users, consider:
1. Implementing SFU (Selective Forwarding Unit)
2. Adding Redis for multi-instance state management
3. Load balancing multiple signaling servers
4. Implementing room size limits

## Troubleshooting

### Common Issues

1. **WebRTC Connection Failed**:
   - Check firewall settings
   - Verify STUN server accessibility
   - Ensure HTTPS in production

2. **Media Access Denied**:
   - Check browser permissions
   - Verify HTTPS requirement
   - Test with different browsers

3. **Socket.IO Connection Issues**:
   - Check CORS configuration
   - Verify network connectivity
   - Check backend logs

### Debug Commands

```bash
# Check container logs
docker-compose logs backend
docker-compose logs frontend
docker-compose logs nginx

# Check container health
docker-compose ps

# Restart specific service
docker-compose restart backend
```

## Performance Monitoring

### Key Metrics
- WebRTC connection success rate
- Media stream quality
- Signaling server response time
- Memory usage per container

### Monitoring Tools
- Browser DevTools Network tab
- WebRTC stats API
- Docker stats
- Application logs
