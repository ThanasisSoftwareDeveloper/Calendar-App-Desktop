import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '../store'
import toast from 'react-hot-toast'

export default function GoogleCallback() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)

  useEffect(() => {
    const code = params.get('code')
    if (!code) {
      toast.error('Google auth failed')
      navigate('/login')
      return
    }
    const apiUrl = import.meta.env.VITE_API_URL || ''
    fetch(`${apiUrl}/api/auth/google/callback/?code=${code}`)
      .then(r => r.json())
      .then(data => {
        if (data.access) {
          setAuth(data.user, data.access, data.refresh)
          toast.success(`Welcome, ${data.user.name || data.user.username}!`)
          navigate('/')
        } else {
          toast.error(data.error || 'Authentication failed')
          navigate('/login')
        }
      })
      .catch(() => {
        toast.error('Authentication failed')
        navigate('/login')
      })
  }, [])

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center">
      <div className="text-center">
        <div className="font-mono text-accent text-sm mb-2">// authenticating</div>
        <div className="w-6 h-6 border border-accent border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    </div>
  )
}
