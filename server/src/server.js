require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = require('./app');
const socketHandler = require('./socket/socketHandler');

// CORS setup for frontend
app.use(
  cors({
    origin: ['http://localhost:5173', 'http://localhost:3004', 'http://localhost:3000', process.env.CLIENT_URL, 'https://sehattelmed.vercel.app'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Handle preflight requests
app.options('*', cors());

// Port
const PORT = process.env.PORT || 5001;

// Create HTTP server
const server = http.createServer(app);

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:3004', 'http://localhost:3000', process.env.CLIENT_URL],
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Initialize sockets
socketHandler(io);

// Start server
server.listen(PORT, () => {
  console.log(`🏥 Sehat Server running on port ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 API: http://localhost:${PORT}/api/health`);
});