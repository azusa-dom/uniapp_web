import React, { useState } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'
import LoginView from './components/LoginView'
import StudentApp from './components/StudentDashboardView'
import ParentApp from './components/parentsALL'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userType, setUserType] = useState(null) // 'student' or 'parent'

  const handleLogin = (type) => {
    setUserType(type)
    setIsLoggedIn(true)
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

  return null
}

createRoot(document.getElementById('root')).render(<App />)