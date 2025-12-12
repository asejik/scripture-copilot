import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// --- ADD THESE LINES ---
import { registerSW } from 'virtual:pwa-register'

// Auto-update the app when a new version is available
const updateSW = registerSW({
  onNeedRefresh() {},
  onOfflineReady() {},
})
// -----------------------

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)