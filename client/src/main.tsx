import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'

declare const __APP_VERSION__: string
if (typeof window !== 'undefined') {
  const ver = (import.meta as any)?.env?.VITE_APP_VERSION || __APP_VERSION__
  console.log(`Planning Poker client v${ver}`)
}

const root = createRoot(document.getElementById('root')!)
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)


