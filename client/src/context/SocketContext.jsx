import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export function SocketProvider({ children }) {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Connect to server (using window.location.origin in dev via proxy or direct port 5000)
    const socketInstance = io(window.location.hostname === 'localhost' ? 'http://localhost:5000' : window.location.origin, {
      transports: ['websocket', 'polling'],
      withCredentials: true
    });

    socketInstance.on('connect', () => {
      // Join personal room for notifications
      if (user?.id) {
        socketInstance.emit('join_user', user.id);
      }
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [user?.id]);

  const joinProject = (projectId) => {
    if (socket && projectId) {
      socket.emit('join_project', projectId);
    }
  };

  const leaveProject = (projectId) => {
    if (socket && projectId) {
      socket.emit('leave_project', projectId);
    }
  };

  return (
    <SocketContext.Provider value={{ socket, joinProject, leaveProject }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
