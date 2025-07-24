// Safe.global 风格主题配置
export const safeTheme = {
  colors: {
    // 主要颜色 - Safe绿色系
    primary: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e', // Safe主绿色
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d',
    },
    // 背景色 - 深色主题
    background: {
      primary: '#0a0a0a',
      secondary: '#111111',
      tertiary: '#1a1a1a',
      card: '#1e1e1e',
      hover: '#2a2a2a',
    },
    // 文本颜色
    text: {
      primary: '#ffffff',
      secondary: '#a3a3a3',
      muted: '#737373',
      accent: '#22c55e',
    },
    // 边框颜色
    border: {
      primary: '#2a2a2a',
      secondary: '#404040',
      accent: '#22c55e',
    },
    // 状态颜色
    status: {
      success: '#22c55e',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
    }
  },
  gradients: {
    primary: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
    secondary: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
    card: 'linear-gradient(135deg, #1e1e1e 0%, #2a2a2a 100%)',
    hero: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0a0a0a 100%)',
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(34, 197, 94, 0.05)',
    md: '0 4px 6px -1px rgba(34, 197, 94, 0.1), 0 2px 4px -1px rgba(34, 197, 94, 0.06)',
    lg: '0 10px 15px -3px rgba(34, 197, 94, 0.1), 0 4px 6px -2px rgba(34, 197, 94, 0.05)',
    xl: '0 20px 25px -5px rgba(34, 197, 94, 0.1), 0 10px 10px -5px rgba(34, 197, 94, 0.04)',
    glow: '0 0 20px rgba(34, 197, 94, 0.3)',
  },
  animations: {
    fadeIn: 'fadeIn 0.6s ease-out',
    slideUp: 'slideUp 0.8s ease-out',
    pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
    float: 'float 6s ease-in-out infinite',
  }
}

// CSS动画关键帧
export const keyframes = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes slideUp {
    from { opacity: 0; transform: translateY(40px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
  
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
  }
  
  @keyframes particles {
    0% { transform: translateY(0px) rotate(0deg); opacity: 1; }
    100% { transform: translateY(-100vh) rotate(360deg); opacity: 0; }
  }
`
