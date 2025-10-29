import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - JSON import for version
import pkg from '../package.json'

if (typeof window !== 'undefined') {
  // Log client version once on boot
  // Example: Planning Poker client v1.1.0
  // Using console.info to keep it visible but unobtrusive
  // This does not impact UI bundle size meaningfully
  // and helps support diagnose deployed build versions
  // Remove or downgrade to debug if not desired
  console.info(`Planning Poker client v${pkg.version}`)
}

const root = createRoot(document.getElementById('root')!)
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)


