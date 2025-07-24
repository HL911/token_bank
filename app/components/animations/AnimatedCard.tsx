'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface AnimatedCardProps {
  children: ReactNode
  className?: string
  delay?: number
  duration?: number
  hover?: boolean
}

export function AnimatedCard({ 
  children, 
  className = '', 
  delay = 0, 
  duration = 0.6,
  hover = true 
}: AnimatedCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration, 
        delay,
        ease: [0.25, 0.46, 0.45, 0.94] // easeOutQuart
      }}
      whileHover={hover ? { 
        y: -5, 
        scale: 1.02,
        boxShadow: '0 20px 40px rgba(34, 197, 94, 0.15)'
      } : undefined}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function FadeInUp({ 
  children, 
  className = '', 
  delay = 0 
}: { 
  children: ReactNode
  className?: string
  delay?: number 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.8, 
        delay,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function SlideInLeft({ 
  children, 
  className = '', 
  delay = 0 
}: { 
  children: ReactNode
  className?: string
  delay?: number 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ 
        duration: 0.7, 
        delay,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function PulseGlow({ 
  children, 
  className = '' 
}: { 
  children: ReactNode
  className?: string 
}) {
  return (
    <motion.div
      animate={{
        boxShadow: [
          '0 0 20px rgba(34, 197, 94, 0.3)',
          '0 0 40px rgba(34, 197, 94, 0.5)',
          '0 0 20px rgba(34, 197, 94, 0.3)'
        ]
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut'
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
