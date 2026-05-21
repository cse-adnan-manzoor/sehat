import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

let socket = null;

export const initSocket = (userId) => {
  if (socket) return socket;
  socket = io(SOCKET_URL, { withCredentials: true, transports: ['websocket', 'polling'] });
  socket.on('connect', () => { console.log('[Socket] Connected'); socket.emit('user_online', userId); });
  socket.on('disconnect', () => console.log('[Socket] Disconnected'));
  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) { socket.disconnect(); socket = null; }
};

export default { initSocket, getSocket, disconnectSocket };
