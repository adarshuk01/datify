import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/common/Button'
import MatchesIllustration from '../../components/onboarding/MatchesIllustration'
import ProfileIllustration from '../../components/onboarding/ProfileIllustration'
import MatchIllustration from '../../components/onboarding/MatchIllustration'
import { slides } from './slides'

const illustrations = {
  matches: MatchesIllustration,
  profile: ProfileIllustration,
  match: MatchIllustration,
}

const PaginationDots = ({ total, current }) => (
  <div className="flex items-center gap-2 justify-center">
    {Array.from({ length: total }).map((_, i) => (
      <div
        key={i}
        className={`rounded-full transition-all duration-300 ${
          i === current
            ? 'w-8 h-2.5 bg-primary-600'
            : 'w-2.5 h-2.5 bg-gray-200'
        }`}
      />
    ))}
  </div>
)

const OnboardingPage = () => {
  const navigate = useNavigate()
  const [current, setCurrent] = useState(0)
  const isLast = current === slides.length - 1

  const handleContinue = () => {
    if (isLast) navigate('/login')
    else setCurrent((prev) => prev + 1)
  }

  const handleSkip = () => navigate('/login')

  const slide = slides[current]
  const Illustration = illustrations[slide.illustration]

  return (
    <div className="flex flex-col min-h-screen bg-white">

      {/*
        ══════════════════════════════════════════════════
        TOP SECTION — stacking context
        Purple BG fills ~57vh.
        Phone image is z-1 (below the curve).
        White arch SVG is z-2 (above the image, clips it).
        This creates the "phone cut in half by curve" effect.
        ══════════════════════════════════════════════════
      */}
      <div className="relative overflow-hidden" style={{ height: '57vh' }}>

        {/* Layer 0 — Purple gradient background */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(155deg, #7C3AED 0%, #6D28D9 45%, #9333EA 100%)',
            zIndex: 0,
          }}
        >
          {/* Decorative faint circles */}
          <div
            className="absolute rounded-full bg-white/5 pointer-events-none"
            style={{ width: 180, height: 180, top: -50, right: -50 }}
          />
          <div
            className="absolute rounded-full bg-white/5 pointer-events-none"
            style={{ width: 120, height: 120, bottom: 20, left: -40 }}
          />
        </div>

        {/* Layer 1 — Phone mockup image (behind the arch) */}
        {/*
          The image is positioned so its top aligns to the top
          of this container. Since the container is only 57vh tall
          and the image is taller, the bottom ~40% of the phone
          is naturally hidden when the arch clips it.
        */}
        <div
          key={`img-${current}`}
          className="absolute top-0 left-0 right-0 animate-slide-up flex justify-center"
          style={{ zIndex: 1, paddingTop: '20px' }}
        >
          <Illustration />
        </div>

        {/* Layer 2 — White arch SVG (above the image, cuts the phone in half) */}
        {/*
          Sits at the very bottom of the 57vh container.
          It draws a white arch that visually "clips" the lower
          portion of the phone image, matching the design exactly.
        */}
        <div
          className="absolute bottom-0 left-0 right-0 pointer-events-none"
          style={{ height: '72px', zIndex: 2 }}
        >
          <svg
            viewBox="0 0 390 72"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ width: '100%', height: '100%', display: 'block' }}
          >
            {/*
              Convex-UP curve: white starts full at the bottom,
              then the top edge curves UP in the centre (like a hill).
              - Bottom-left  (0, 72)  → top-left  (0, 72)
              - Control point Q(195, 72) pulls centre UP to y=0
              - Top-right (390, 72) → bottom-right (390, 72)
              The path fills white from that curved top edge down to the bottom.
            */}
            <path d="M0,72 Q195,0 390,72 Z" fill="white" />
          </svg>
        </div>
      </div>

      {/*
        ══════════════════════════════════════════════
        BOTTOM SECTION — white, text + dots + buttons
        ══════════════════════════════════════════════
      */}
      <div className="flex-1 flex flex-col px-6 pt-5 pb-8 bg-white">

        {/* Title + description */}
        <div
          key={`text-${current}`}
          className="flex-1 flex flex-col items-center text-center gap-3 animate-fade-in"
        >
          <h2 className="text-[22px] font-extrabold text-gray-900 leading-snug">
            {slide.title}
          </h2>
          <p className="text-gray-500 text-[14px] leading-relaxed max-w-xs">
            {slide.description}
          </p>
        </div>

        {/* Pagination dots */}
        <div className="mt-6 mb-6">
          <PaginationDots total={slides.length} current={current} />
        </div>

        {/* Buttons */}
        {isLast ? (
          <Button variant="primary" onClick={handleContinue} fullWidth>
            Continue
          </Button>
        ) : (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSkip}
              className="flex-1 py-4 rounded-full bg-primary-50 text-primary-600 font-semibold
                         text-base transition-all duration-200 hover:bg-primary-100
                         active:scale-95 focus:outline-none"
            >
              Skip
            </button>
            <button
              type="button"
              onClick={handleContinue}
              className="flex-1 py-4 rounded-full bg-primary-600 text-white font-semibold
                         text-base shadow-lg shadow-primary-200 transition-all duration-200
                         hover:bg-primary-700 active:scale-95 focus:outline-none"
            >
              Continue
            </button>
          </div>
        )}
      </div>

    </div>
  )
}

export default OnboardingPage
