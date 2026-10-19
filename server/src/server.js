require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const prisma = require('./config/db');
const { initSocket } = require('./config/socket');

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Verify database connection
    await prisma.$connect();
    console.log('✅ Connected to database successfully.');

    // Create HTTP Server
    const server = http.createServer(app);

    // Initialize Socket.io with CORS
    const io = new Server(server, {
      cors: {
        origin: ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
        methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
        credentials: true
      }
    });

    initSocket(io);
    console.log('⚡ Socket.io real-time engine initialized.');

    server.listen(PORT, () => {
      console.log(`🚀 Fayaz Event Management Backend running on http://localhost:${PORT}`);
      console.log(`🩺 Health check available at: http://localhost:${PORT}/api/health`);
    });

    // Graceful shutdown
    const shutdown = async () => {
      console.log('🛑 Shutting down gracefully...');
      server.close(async () => {
        await prisma.$disconnect();
        console.log('🔒 Database connection closed. Server terminated.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

startServer();
