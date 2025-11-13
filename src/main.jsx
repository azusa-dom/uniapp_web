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
  const [isInitialized, setIsInitialized] = useState(false)

  // 初始化：从 localStorage 或 URL hash 恢复登录状态
  useEffect(() => {
    const hash = (window.location.hash || '').replace('#', '')
    const savedUserType = localStorage.getItem('userType')
    
    if (hash === 'student' || hash === 'parent') {
      // URL hash 优先
      setDebugMsg(`✅ URL hash detected: #${hash}`)
      setUserType(hash)
      setIsLoggedIn(true)
      localStorage.setItem('userType', hash)
    } else if (savedUserType && (savedUserType === 'student' || savedUserType === 'parent')) {
      // 恢复 localStorage 中的登录状态
      setDebugMsg(`✅ Restored from localStorage: ${savedUserType}`)
      setUserType(savedUserType)
      setIsLoggedIn(true)
      window.location.hash = `#${savedUserType}`
    } else {
      // 未登录状态
      setDebugMsg('❌ No saved state, showing login')
      localStorage.removeItem('userType')
      window.location.hash = ''
    }
    
    setIsInitialized(true)
  }, [])

  const handleLogin = (type) => {
    setDebugMsg(`✅ Login clicked: ${type}`)
    setUserType(type)
    setIsLoggedIn(true)
    // 保存登录状态
    localStorage.setItem('userType', type)
    // 将角色写入 URL
    window.location.hash = `#${type}`
  }

  const handleLogout = () => {
    setDebugMsg('🚪 Logout')
    setIsLoggedIn(false)
    setUserType(null)
    localStorage.removeItem('userType')
    window.location.hash = ''
  }

  // 开发调试：显示当前状态（仅在本地或需要排障时可见）
  const showDebug = import.meta.env.DEV || window.location.search.includes('debug=1')
  
  // 等待初始化完成
  if (!isInitialized) {
    return <div style={{display:'flex', justifyContent:'center', alignItems:'center', height:'100vh', background:'#f0f0f0'}}>Loading...</div>
  }
  
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