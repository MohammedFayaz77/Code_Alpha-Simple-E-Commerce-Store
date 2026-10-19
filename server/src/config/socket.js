let io = null;

function initSocket(socketIoInstance) {
  io = socketIoInstance;

  io.on('connection', (socket) => {
    // Join personal user room for direct notifications
    socket.on('join_user', (userId) => {
      if (userId) {
        socket.join(`user:${userId}`);
      }
    });

    // Join specific project room for live board collaboration
    socket.on('join_project', (projectId) => {
      if (projectId) {
        socket.join(`project:${projectId}`);
      }
    });

    // Leave project room
    socket.on('leave_project', (projectId) => {
      if (projectId) {
        socket.leave(`project:${projectId}`);
      }
    });

    socket.on('disconnect', () => {
      // Clean disconnect
    });
  });

  return io;
}

function getIO() {
  return io;
}

function emitToProject(projectId, event, data) {
  if (io && projectId) {
    io.to(`project:${projectId}`).emit(event, data);
  }
}

function emitToUser(userId, event, data) {
  if (io && userId) {
    io.to(`user:${userId}`).emit(event, data);
  }
}

module.exports = {
  initSocket,
  getIO,
  emitToProject,
  emitToUser
};
