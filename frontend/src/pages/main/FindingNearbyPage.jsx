import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

const FindingNearbyPage = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/main/home', { replace: true })
    }, 3000)
    return () => clearTimeout(timer)
  }, [navigate])

  const avatar = user?.primaryPhoto?.url || null
  const initials = (user?.name || user?.email || 'U')[0].toUpperCase()

  return (
    <div
      className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden"
      style={{
        background: 'linear-gradient(160deg, #7C3AED 0%, #6D28D9 40%, #9333EA 100%)',
      }}
    >
      {/* Map street names watermark */}
      <div
        className="absolute inset-0 pointer-events-none select-none overflow-hidden"
        style={{ opacity: 0.18 }}
      >
        {[
          { text: '17th St', top: '5%', left: '55%', rotate: 0 },
          { text: 'Market St', top: '3%', right: '5%', rotate: 0 },
          { text: 'Mars St', top: '14%', left: '22%', rotate: -60 },
          { text: 'el St', top: '14%', left: '0%', rotate: 0 },
          { text: 'Deming St', top: '18%', left: '12%', rotate: 0 },
          { text: 'Market St', top: '24%', left: '30%', rotate: 0 },
          { text: 'Danvers St', top: '26%', left: '42%', rotate: -70 },
          { text: 'Douglas St', top: '18%', right: '0%', rotate: -70 },
          { text: 'Caselli Ave', top: '24%', right: '8%', rotate: 0 },
          { text: 'Hill', top: '22%', left: '2%', rotate: 0 },
          { text: 'Thorp Ln', top: '28%', left: '55%', rotate: 0 },
          { text: '19th St', top: '30%', left: '38%', rotate: 0 },
          { text: 'Clayton St', top: '36%', left: '8%', rotate: 0 },
          { text: 'Crown Ct', top: '44%', left: '0%', rotate: 0 },
          { text: 'Seward Street Slides', top: '40%', right: '0%', rotate: 0 },
          { text: 'Burnett Ave', top: '50%', left: '12%', rotate: 0 },
          { text: 'Romain St', top: '52%', right: '5%', rotate: 0 },
          { text: 'Market St', top: '55%', left: '50%', rotate: -70 },
          { text: 'Worth St', top: '62%', right: '0%', rotate: -70 },
          { text: 'Twin Peaks', top: '64%', left: '0%', rotate: 0 },
          { text: 'A...Ele...', top: '70%', right: '0%', rotate: 0 },
          { text: '23rd St', top: '82%', left: '50%', rotate: 0 },
          { text: 'Elizabeth St', top: '88%', right: '5%', rotate: 0 },
          { text: 'Parkwood...aks', top: '85%', left: '0%', rotate: -70 },
          { text: 'Cuesta Ct', top: '90%', left: '35%', rotate: 0 },
          { text: 'Market Ct', top: '92%', left: '45%', rotate: 0 },
          { text: 'Fountain St', top: '93%', left: '55%', rotate: -70 },
          { text: 'Homestead St', top: '90%', right: '0%', rotate: -70 },
          { text: '24th St', top: '88%', right: '12%', rotate: 0 },
          { text: 'Crestline Dr', top: '94%', left: '5%', rotate: 0 },
          { text: 'Clipper St', top: '96%', right: '5%', rotate: 0 },
          { text: 'Burnett Dr...', bottom: '3%', left: '20%', rotate: -30 },
          { text: 'Downview Way', bottom: '2%', left: '5%', rotate: 0 },
          { text: 'Surview Dr', bottom: '0%', left: '0%', rotate: 0 },
        ].map((s, i) => (
          <span
            key={i}
            className="absolute text-white text-xs font-medium whitespace-nowrap"
            style={{
              top: s.top,
              left: s.left,
              right: s.right,
              bottom: s.bottom,
              transform: `rotate(${s.rotate}deg)`,
            }}
          >
            {s.text}
          </span>
        ))}
      </div>

      {/* Radar rings */}
      <div className="relative flex items-center justify-center" style={{ width: 320, height: 320 }}>
        {/* Outer ring */}
        <div
          className="absolute rounded-full animate-pulse"
          style={{
            width: 320, height: 320,
            background: 'rgba(255,255,255,0.07)',
            animationDuration: '2s',
          }}
        />
        {/* Middle ring */}
        <div
          className="absolute rounded-full animate-pulse"
          style={{
            width: 220, height: 220,
            background: 'rgba(255,255,255,0.10)',
            animationDuration: '2s',
            animationDelay: '0.3s',
          }}
        />
        {/* Inner ring */}
        <div
          className="absolute rounded-full animate-pulse"
          style={{
            width: 130, height: 130,
            background: 'rgba(255,255,255,0.15)',
            animationDuration: '2s',
            animationDelay: '0.6s',
          }}
        />

        {/* Avatar */}
        <div
          className="relative z-10 rounded-full overflow-hidden border-4 border-white shadow-2xl"
          style={{ width: 80, height: 80 }}
        >
          {avatar ? (
            <img src={avatar} alt="You" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-primary-400 flex items-center justify-center">
              <span className="text-white text-2xl font-bold">{initials}</span>
            </div>
          )}
        </div>
      </div>

      {/* Label */}
      <p className="text-white text-xl font-semibold mt-8 animate-pulse">
        Finding people near you ...
      </p>
    </div>
  )
}

export default FindingNearbyPage
