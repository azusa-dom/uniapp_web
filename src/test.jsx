import React from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'

function TestApp() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 p-8">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-6">
        <h1 className="text-3xl font-bold text-indigo-600 mb-4">测试页面</h1>
        <p className="text-gray-700">如果你能看到这个页面，说明 React 和 Tailwind 都正常工作了！</p>
        <button className="mt-4 px-6 py-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600">
          点击测试
        </button>
      </div>
    </div>
  )
}

createRoot(document.getElementById('root')).render(<TestApp />)
