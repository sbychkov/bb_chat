# Band of Blades Chat - Quick Start Script

This script helps you quickly test the Band of Blades Chat application.

## Prerequisites
- Docker and Docker Compose installed
- Modern browser with WebRTC support
- At least 4GB RAM available

## Quick Start

1. **Start the application**:
   ```bash
   docker-compose up --build
   ```

2. **Wait for all services to be healthy** (about 2-3 minutes):
   ```bash
   docker-compose ps
   ```
   All services should show "healthy" status.

3. **Open your browser** to `http://localhost:8888`

4. **Test the application**:
   - Enter a room ID (or leave empty for random)
   - Allow camera and microphone access
   - Open another browser tab/window to test with multiple users
   - Share the room ID with others to test multi-user functionality

## Testing Checklist

- [ ] Application loads without errors
- [ ] Can create/join rooms
- [ ] Camera and microphone access works
- [ ] Video stream displays correctly
- [ ] Multiple users can join same room
- [ ] Users can see each other's video streams
- [ ] Video/audio toggle controls work
- [ ] Users leaving room triggers proper cleanup

## Troubleshooting

If you encounter issues:

1. **Check container logs**:
   ```bash
   docker-compose logs backend
   docker-compose logs frontend
   docker-compose logs nginx
   ```

2. **Restart services**:
   ```bash
   docker-compose restart
   ```

3. **Check browser console** for WebRTC errors

4. **Verify network connectivity** to Google STUN servers

## Stopping the Application

```bash
docker-compose down
```

## Development Mode

For development with hot reload:

```bash
# Terminal 1 - Backend
cd backend && npm install && npm run dev

# Terminal 2 - Frontend  
cd frontend && npm install && npm run dev
```

Access at `http://localhost:5173` (frontend) and `http://localhost:3000` (backend).
