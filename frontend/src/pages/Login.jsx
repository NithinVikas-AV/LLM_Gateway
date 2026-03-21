import { useEffect, useRef } from 'react'

const API_URL = import.meta.env.PROD
  ? 'https://llmgateway-production.up.railway.app'
  : 'http://localhost:8000'

/* ── tiny animated canvas for the hero background ── */
function GlowCanvas() {
  const ref = useRef(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animId

    const resize = () => {
      canvas.width = canvas.offsetWidth * 2
      canvas.height = canvas.offsetHeight * 2
      ctx.scale(2, 2)
    }
    resize()
    window.addEventListener('resize', resize)

    const orbs = Array.from({ length: 5 }, () => ({
      x: Math.random() * canvas.offsetWidth,
      y: Math.random() * canvas.offsetHeight,
      r: 120 + Math.random() * 180,
      dx: (Math.random() - 0.5) * 0.3,
      dy: (Math.random() - 0.5) * 0.3,
      hue: 230 + Math.random() * 60,
    }))

    const draw = () => {
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight)
      for (const o of orbs) {
        o.x += o.dx
        o.y += o.dy
        if (o.x < -o.r || o.x > canvas.offsetWidth + o.r) o.dx *= -1
        if (o.y < -o.r || o.y > canvas.offsetHeight + o.r) o.dy *= -1
        const g = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.r)
        g.addColorStop(0, `hsla(${o.hue}, 80%, 55%, .18)`)
        g.addColorStop(1, `hsla(${o.hue}, 80%, 55%, 0)`)
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2)
        ctx.fill()
      }
      animId = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={ref} className="login-glow-canvas" />
}

/* ── main page ── */
export default function Login() {
  return (
    <div className="login-page">
      {/* ─── LEFT: Hero Panel ─── */}
      <div className="login-hero">
        <GlowCanvas />
        <div className="login-hero-grid" />

        <div className="login-hero-content">
          {/* logo */}
          <div className="login-logo">
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
              <rect width="36" height="36" rx="10" fill="url(#lg)" />
              <path d="M10 24V12h2.5v10h6V24H10z" fill="#fff" />
              <path d="M20 24V12h2.5v10h3.5V24H20z" fill="#fff" opacity=".7" />
              <defs>
                <linearGradient id="lg" x1="0" y1="0" x2="36" y2="36">
                  <stop stopColor="#818cf8" />
                  <stop offset="1" stopColor="#6366f1" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          <h1 className="login-hero-title">LLM Gateway</h1>
          <p className="login-hero-subtitle">
            One unified API key for every model.<br />
            Route, monitor, and control AI spend<br />
            from a single dashboard.
          </p>

          {/* social proof strip */}
          <div className="login-hero-stats">
            <div className="login-stat">
              <span className="login-stat-value">2</span>
              <span className="login-stat-label">Providers</span>
            </div>
            <div className="login-stat-divider" />
            <div className="login-stat">
              <span className="login-stat-value">∞</span>
              <span className="login-stat-label">Models</span>
            </div>
            <div className="login-stat-divider" />
            <div className="login-stat">
              <span className="login-stat-value">24/7</span>
              <span className="login-stat-label">Monitoring</span>
            </div>
          </div>

          {/* provider logos */}
          <div className="login-providers">
            <span className="login-providers-label">Works with</span>
            <div className="login-provider-logos">
              {/* Google Gemini */}
              <div className="login-provider-chip">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M12 24C12 24 12 12 24 12C12 12 12 0 12 0C12 0 12 12 0 12C12 12 12 24 12 24Z" fill="#886FEE"/>
                </svg>
                <span>Gemini</span>
              </div>
              {/* Groq */}
              <div className="login-provider-chip">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="11" stroke="#F55036" strokeWidth="2" fill="none"/>
                  <circle cx="12" cy="12" r="5" fill="#F55036"/>
                </svg>
                <span>Groq</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── RIGHT: Sign-in Panel ─── */}
      <div className="login-auth">
        <div className="login-auth-inner">
          <div className="login-auth-header">
            <h2 className="login-auth-title">Welcome back</h2>
            <p className="login-auth-desc">
              Sign in to your account to continue
            </p>
          </div>

          <button
            id="google-sign-in"
            onClick={() => (window.location.href = `${API_URL}/auth/google`)}
            className="login-google-btn"
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.07 5.07 0 0 1-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09A6.97 6.97 0 0 1 5.49 12c0-.73.13-1.43.35-2.09V7.07H2.18A11 11 0 0 0 1 12c0 1.78.43 3.45 1.18 4.93l3.66-2.84z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>

          <div className="login-divider">
            <span>Secure authentication via Google OAuth 2.0</span>
          </div>

          <p className="login-footer-note">
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>

        <div className="login-auth-footer">
          <span>© {new Date().getFullYear()} LLM Gateway</span>
          <span className="login-footer-dot">·</span>
          <span>Secure</span>
          <span className="login-footer-dot">·</span>
          <span>Enterprise-ready</span>
        </div>
      </div>
    </div>
  )
}