// =============================================
// Socket.io client – single shared instance
// =============================================
import { io, Socket } from 'socket.io-client';

/**
 * Socket URL.
 * In development the Vite proxy handles /socket.io, so we connect
 * to the same origin. In production set VITE_SOCKET_URL to the
 * backend's origin.
 */
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || '';

/**
 * Single Socket.io client instance, shared app-wide.
 * - autoConnect is false so we can control connection lifecycle
 *   from the SocketContext provider.
 * - reconnection is enabled with exponential backoff.
 */
export const socket: Socket = io(SOCKET_URL, {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 10000,
  transports: ['websocket', 'polling'],
});

export default socket;
