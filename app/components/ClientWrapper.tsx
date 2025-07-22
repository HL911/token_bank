'use client'

import { useEffect, useState } from 'react'

interface ClientWrapperProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

// 客户端组件包装器，用于解决SSR水合错误
export default function ClientWrapper({ children, fallback = null }: ClientWrapperProps) {
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    setHasMounted(true)
  }, [])

  // 在服务端渲染期间或客户端还未挂载时，显示fallback内容
  if (!hasMounted) {
    return <>{fallback}</>
  }

  // 客户端挂载后显示实际内容
  return <>{children}</>
}
