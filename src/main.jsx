import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#0c1730',
            color: '#fff',
            fontFamily: 'DM Sans, sans-serif',
            fontSize: '13.5px',
            borderRadius: '12px',
            padding: '14px 18px',
          },
          success: { iconTheme: { primary: '#0fa968', secondary: '#fff' } },
          error:   { iconTheme: { primary: '#e02c2c', secondary: '#fff' } },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
)
