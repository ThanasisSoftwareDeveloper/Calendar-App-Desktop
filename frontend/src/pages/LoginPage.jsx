import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { authAPI } from '../api'
import { useAuthStore } from '../store'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const navigate = useNavigate()
  const { accessToken } = useAuthStore()

  useEffect(() => {
    if (accessToken) navigate('/')
  }, [accessToken, navigate])

  const handleGoogleLogin = async () => {
    try {
      const { data } = await authAPI.getGoogleAuthUrl()
      window.location.href = data.url
    } catch {
      toast.error('Failed to initiate Google login')
    }
  }

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center overflow-hidden relative">
      {/* Subtle grid background */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,255,136,0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,255,136,0.5) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px'
        }}
      />

      {/* Accent glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(0,255,136,0.04) 0%, transparent 70%)' }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-sm px-6"
      >
        {/* Logo */}
        <div className="mb-12 text-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="font-mono text-xs text-text-muted mb-6 tracking-[0.2em]"
          >
            CALENDAR-APP-DESKTOP
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl font-display font-bold text-text-primary leading-tight"
          >
            Your tasks,<br />
            <span className="text-accent">organized.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45 }}
            className="mt-4 text-text-secondary text-sm font-sans"
          >
            Calendar + task manager built for developers.
          </motion.p>
        </div>

        {/* Sign in card */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card p-6"
        >
          <p className="text-text-muted font-mono text-xs mb-5 tracking-wider">
            // SIGN IN
          </p>
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 bg-bg-hover border border-bg-border-bright text-text-primary font-sans text-sm font-medium py-3 px-4 rounded-sm hover:border-accent/40 hover:bg-bg-tertiary transition-all duration-200 group"
          >
            <GoogleIcon />
            <span>Continue with Google</span>
          </button>

          <div className="mt-6 pt-5 border-t border-bg-border">
            <div className="flex flex-col gap-2">
              {['Gmail task import', 'Google Calendar sync', 'Drag & drop scheduling'].map((feat, i) => (
                <div key={i} className="flex items-center gap-2 text-text-muted text-xs font-mono">
                  <span className="text-accent">✓</span>
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-center text-text-muted text-xs font-mono mt-6"
        >
          Built by{' '}
          <a
            href="https://www.thanasis-codes.eu"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline"
          >
            thanasis_codes
          </a>
        </motion.p>
      </motion.div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
      <path d="M3.964 10.707A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.96L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  )
}
