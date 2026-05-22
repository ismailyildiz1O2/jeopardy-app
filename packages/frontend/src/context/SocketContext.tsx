// =============================================
// Socket Context – manages connection lifecycle and
// exposes socket instance + status to the component tree
// =============================================
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import { socket } from '../lib/socket';
import type { Socket } from 'socket.io-client';

interface SocketContextValue {
  /** The shared Socket.io client instance */
  socket: Socket;
  /** Whether the socket is currently connected */
  isConnected: boolean;
  /** Number of other users in the current game room */
  onlineCount: number;
  /** Join a game room to receive real-time updates */
  joinGame: (gameId: string) => void;
  /** Leave a game room */
  leaveGame: (gameId: string) => void;
}

const SocketContext = createContext<SocketContextValue | null>(null);

interface SocketProviderProps {
  children: ReactNode;
}

export function SocketProvider({ children }: SocketProviderProps) {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [onlineCount, setOnlineCount] = useState(0);

  useEffect(() => {
    // Connect on mount
    socket.connect();

    function handleConnect() {
      setIsConnected(true);
      console.log('[Socket] Connected:', socket.id);
    }

    function handleDisconnect() {
      setIsConnected(false);
      console.log('[Socket] Disconnected');
    }

    function handleUserJoined(data: { userId: string; count: number }) {
      setOnlineCount(data.count);
    }

    function handleUserLeft(data: { userId: string; count: number }) {
      setOnlineCount(data.count);
    }

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('user-joined', handleUserJoined);
    socket.on('user-left', handleUserLeft);

    // Cleanup on unmount
    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('user-joined', handleUserJoined);
      socket.off('user-left', handleUserLeft);
      socket.disconnect();
    };
  }, []);

  /** Join a game room */
  const joinGame = useCallback((gameId: string) => {
    socket.emit('join-game', { gameId });
  }, []);

  /** Leave a game room */
  const leaveGame = useCallback((gameId: string) => {
    socket.emit('leave-game', { gameId });
  }, []);

  const value: SocketContextValue = {
    socket,
    isConnected,
    onlineCount,
    joinGame,
    leaveGame,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}

/** Hook to access socket context – throws if used outside provider */
export function useSocketContext(): SocketContextValue {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocketContext must be used within a SocketProvider');
  }
  return context;
}

export default SocketContext;
