import React, { useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'
import LoginView from './components/LoginView'
import StudentApp from './components/StudentDashboardView'
import ParentApp from './components/parentsALL'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userType, setUserType] = useState(null) // 'student' or 'parent'
  const [debugMsg, setDebugMsg] = useState('')

  // 支持通过 URL hash 直达角色视图，例如 #student 或 #parent
  useEffect(() => {
    const hash = (window.location.hash || '').replace('#', '')
    if (hash === 'student' || hash === 'parent') {
      setDebugMsg(`URL hash detected: ${hash}`)
      setUserType(hash)
      setIsLoggedIn(true)
    }
  }, [])

  const handleLogin = (type) => {
    setDebugMsg(`Login clicked: ${type}`)
    setUserType(type)
    setIsLoggedIn(true)
    // 将角色写入 URL，便于刷新/直达与线上排障
    try {
      window.location.hash = `#${type}`
    } catch {}
  }

  const handleLogout = () => {
    setDebugMsg('Logout')
    setIsLoggedIn(false)
    setUserType(null)
    window.location.hash = ''
  }

  // 开发调试：显示当前状态（仅在本地或需要排障时可见）
  const showDebug = import.meta.env.DEV || window.location.search.includes('debug=1')
  
  // 显示登录页面
  if (!isLoggedIn) {
    return (
      <>
        {showDebug && (
          <div style={{position:'fixed',top:0,left:0,right:0,zIndex:9999,background:'#ff0',color:'#000',padding:'8px',fontSize:'12px',fontFamily:'monospace'}}>
            🐛 Debug: isLoggedIn={String(isLoggedIn)} | userType={userType || 'null'} | hash={window.location.hash} | {debugMsg}
          </div>
        )}
        <LoginView onLogin={handleLogin} />
      </>
    )
  }

  // 根据用户类型显示对应的应用
  if (userType === 'student') {
    return (
      <>
        {showDebug && (
          <div style={{position:'fixed',top:0,left:0,right:0,zIndex:9999,background:'#0f0',color:'#000',padding:'8px',fontSize:'12px',fontFamily:'monospace'}}>
            🐛 Debug: Rendering StudentApp | {debugMsg}
          </div>
        )}
        <StudentApp onLogout={handleLogout} />
      </>
    )
  } else if (userType === 'parent') {
    return (
      <>
        {showDebug && (
          <div style={{position:'fixed',top:0,left:0,right:0,zIndex:9999,background:'#f0f',color:'#fff',padding:'8px',fontSize:'12px',fontFamily:'monospace'}}>
            🐛 Debug: Rendering ParentApp | {debugMsg}
          </div>
        )}
        <ParentApp onLogout={handleLogout} />
      </>
    )
  }

  // 兜底：未知状态下回到登录
  return (
    <>
      {showDebug && (
        <div style={{position:'fixed',top:0,left:0,right:0,zIndex:9999,background:'#f00',color:'#fff',padding:'8px',fontSize:'12px',fontFamily:'monospace'}}>
          🐛 Debug: FALLBACK to Login | isLoggedIn={String(isLoggedIn)} userType={userType} | {debugMsg}
        </div>
      )}
      <LoginView onLogin={handleLogin} />
    </>
  )
}

createRoot(document.getElementById('root')).render(<App />)