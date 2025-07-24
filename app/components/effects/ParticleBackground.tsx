'use client'

import { useEffect, useState } from 'react'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number
}

export default function ParticleBackground() {
  const [isClient, setIsClient] = useState(false)
  const [particles, setParticles] = useState<Particle[]>([])
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  useEffect(() => {
    setIsClient(true)

    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      })
    }

    updateDimensions()
    window.addEventListener('resize', updateDimensions)

    const createParticles = () => {
      const newParticles: Particle[] = []
      const particleCount = Math.min(30, Math.floor((window.innerWidth * window.innerHeight) / 20000))
      
      for (let i = 0; i < particleCount; i++) {
        newParticles.push({
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          size: Math.random() * 3 + 1,
          opacity: Math.random() * 0.5 + 0.2
        })
      }
      setParticles(newParticles)
    }

    createParticles()

    let animationId: number
    const animate = () => {
      setParticles(prev => prev.map(particle => {
        let newX = particle.x + particle.vx
        let newY = particle.y + particle.vy
        let newVx = particle.vx
        let newVy = particle.vy

        if (newX <= 0 || newX >= window.innerWidth) {
          newVx = -newVx
          newX = Math.max(0, Math.min(window.innerWidth, newX))
        }
        if (newY <= 0 || newY >= window.innerHeight) {
          newVy = -newVy
          newY = Math.max(0, Math.min(window.innerHeight, newY))
        }

        return {
          ...particle,
          x: newX,
          y: newY,
          vx: newVx,
          vy: newVy
        }
      }))
      
      animationId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', updateDimensions)
      cancelAnimationFrame(animationId)
    }
  }, [])

  if (!isClient) {
    // 服务器端渲染或首次渲染时返回空容器
    return <div className="fixed inset-0 -z-10" />
  }

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <svg
        width={dimensions.width}
        height={dimensions.height}
        className="w-full h-full"
        style={{ background: 'transparent' }}
      >
        {particles.map((particle, i) => 
          particles.slice(i + 1).map((otherParticle, j) => {
            const distance = Math.sqrt(
              Math.pow(particle.x - otherParticle.x, 2) + 
              Math.pow(particle.y - otherParticle.y, 2)
            )
            
            if (distance < 120) {
              const opacity = Math.max(0, (120 - distance) / 120 * 0.3)
              return (
                <line
                  key={`${i}-${j}`}
                  x1={particle.x}
                  y1={particle.y}
                  x2={otherParticle.x}
                  y2={otherParticle.y}
                  stroke="#12ff80"
                  strokeWidth="1"
                  opacity={opacity}
                />
              )
            }
            return null
          })
        )}
        {particles.map((particle, i) => (
          <circle
            key={i}
            cx={particle.x}
            cy={particle.y}
            r={particle.size}
            fill="#12ff80"
            opacity={particle.opacity}
          />
        ))}
      </svg>
    </div>
  )
}
