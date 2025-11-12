import React, { useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'
import LoginView from './components/LoginView'
import StudentApp from './components/StudentDashboardView'
import ParentApp from './components/parentsALL'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userType, setUserType] = useState(null) // 'student' or 'parent'

  // 支持通过 URL hash 直达角色视图，例如 #student 或 #parent
  useEffect(() => {
    const hash = (window.location.hash || '').replace('#', '')
    if (hash === 'student' || hash === 'parent') {
      setUserType(hash)
      setIsLoggedIn(true)
    }
  }, [])

  const handleLogin = (type) => {
    setUserType(type)
    setIsLoggedIn(true)
    // 将角色写入 URL，便于刷新/直达与线上排障
    try {
      window.location.hash = `#${type}`
    } catch {}
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setUserType(null)
  }

  // 显示登录页面
  if (!isLoggedIn) {
    return <LoginView onLogin={handleLogin} />
  }

  // 根据用户类型显示对应的应用
  if (userType === 'student') {
    return <StudentApp onLogout={handleLogout} />
  } else if (userType === 'parent') {
    return <ParentApp onLogout={handleLogout} />
  }

  // 兜底：未知状态下回到登录
  return <LoginView onLogin={handleLogin} />
}

createRoot(document.getElementById('root')).render(<App />)