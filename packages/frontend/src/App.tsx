// =============================================
// App – main application component with routing
// =============================================
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { SocketProvider } from './context/SocketContext';
import { GameProvider } from './context/GameContext';
import Home from './pages/Home';
import GameEditor from './pages/GameEditor';
import GamePlay from './pages/GamePlay';

/**
 * Wrapper that provides both Socket and Game contexts
 * to game-specific routes.
 */
function GameRouteWrapper({ children }: { children: React.ReactNode }) {
  return (
    <GameProvider>
      {children}
    </GameProvider>
  );
}

export default function App() {
  return (
    <SocketProvider>
      {/* Global toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#181842',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px',
            fontSize: '13px',
            backdropFilter: 'blur(10px)',
          },
          success: {
            iconTheme: {
              primary: '#22c55e',
              secondary: '#181842',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#181842',
            },
          },
        }}
      />

      <Routes>
        {/* Landing page – no game context needed */}
        <Route path="/" element={<Home />} />

        {/* Game editor */}
        <Route
          path="/game/:id/edit"
          element={
            <GameRouteWrapper>
              <GameEditor />
            </GameRouteWrapper>
          }
        />

        {/* Game play */}
        <Route
          path="/game/:id/play"
          element={
            <GameRouteWrapper>
              <GamePlay />
            </GameRouteWrapper>
          }
        />

        {/* 404 fallback */}
        <Route
          path="*"
          element={
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <p className="text-6xl mb-4">🔍</p>
                <h1 className="text-2xl font-bold text-white mb-2">
                  Sayfa Bulunamadı
                </h1>
                <p className="text-sm text-white/40 mb-6">
                  Aradığınız sayfa mevcut değil.
                </p>
                <a href="/" className="btn-primary">
                  Ana Sayfaya Dön
                </a>
              </div>
            </div>
          }
        />
      </Routes>
    </SocketProvider>
  );
}
