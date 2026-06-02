import React, { useMemo } from 'react'
import { FaHeart } from 'react-icons/fa'

const FloatingHearts = ({ count = 12, light = true }) => {
  const hearts = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      size: Math.random() * 16 + 10,
      left: `${Math.random() * 90 + 5}%`,
      top: `${Math.random() * 90 + 5}%`,
      delay: `${Math.random() * 4}s`,
      duration: `${Math.random() * 3 + 3}s`,
      opacity: Math.random() * 0.3 + 0.1,
    }))
  }, [count])

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {hearts.map((heart) => (
        <FaHeart
          key={heart.id}
          style={{
            position: 'absolute',
            left: heart.left,
            top: heart.top,
            fontSize: heart.size,
            opacity: heart.opacity,
            color: light ? 'white' : '#7C3AED',
            animation: `float ${heart.duration} ease-in-out ${heart.delay} infinite`,
          }}
        />
      ))}
    </div>
  )
}

export default FloatingHearts
