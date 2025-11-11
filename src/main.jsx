import React from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'
import StudentProfileView from './components/StudentProfileView'
import StudentSettingsView from './components/StudentSettingsView'

function App() {
  const [page, setPage] = React.useState('profile')
  return (
    <div className="min-h-screen bg-gradient p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex gap-4 mb-6">
          <button className="px-4 py-2 bg-indigo-600 text-white rounded" onClick={() => setPage('profile')}>Student Profile</button>
          <button className="px-4 py-2 bg-indigo-500 text-white rounded" onClick={() => setPage('settings')}>Student Settings</button>
        </div>
        {page === 'profile' ? <StudentProfileView /> : <StudentSettingsView />}
      </div>
    </div>
  )
}

createRoot(document.getElementById('root')).render(<App />)