import { useEffect } from 'react'
import { Route, Routes, Navigate } from 'react-router-dom'
import HomePage from './pages/HomePage'
import RoomPage from './pages/RoomPage'

export default function App() {
  // Log client version when app mounts (once)
  useEffect(() => {
    const ver = (import.meta as any)?.env?.VITE_APP_VERSION || (globalThis as any).__APP_VERSION__ || 'dev'
    if (!(window as any).__PP_VER_LOGGED__) {
      ;(window as any).__PP_VER_LOGGED__ = true
      ;(window as any).__APP_VERSION__ = ver
      console.log(`Planning Poker client v${ver}`)
    }
  }, [])
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/room/:roomId" element={<RoomPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}


