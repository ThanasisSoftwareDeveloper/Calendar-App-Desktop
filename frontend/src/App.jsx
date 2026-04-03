import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from './store'
import LoginPage from './pages/LoginPage'
import CalendarPage from './pages/CalendarPage'
import GoogleCallback from './pages/GoogleCallback'
import PrivacyPage from './pages/PrivacyPage'
import TermsPage from './pages/TermsPage'


function PrivateRoute({ children }) {
  const { accessToken } = useAuthStore()
  return accessToken ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/auth/callback" element={<GoogleCallback />} />
        <Route path="/" element={
          <PrivateRoute>
            <CalendarPage />
          </PrivateRoute>
        } />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#131313',
            color: '#f0f0f0',
            border: '1px solid #1e1e1e',
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: '13px',
            borderRadius: '4px',
          },
          success: { iconTheme: { primary: '#00ff88', secondary: '#080808' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#080808' } },
        }}
      />
    </>
  )
}
