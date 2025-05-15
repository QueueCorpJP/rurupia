import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { Toaster } from '@/components/ui/toaster'
import { initializeStorage } from './supabase/storage-setup.ts'
import { authDebug } from './utils/auth-debug.ts'

// Initialize storage buckets
initializeStorage();

// Expose auth debugging utilities for browser console
if (typeof window !== 'undefined') {
  window.authDebug = authDebug;
  console.log('Auth debugging utilities available! Try: authDebug.checkState()');
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
    <Toaster />
  </React.StrictMode>,
)
