import React from 'react'

function IconCircle({ icon, colorClass }) {
  return (
    <div className={`w-10 h-10 rounded-full ${colorClass} flex items-center justify-center`}>
      <span className="text-white">{icon}</span>
    </div>
  )
}

function ProfileHeaderCard() {
  return (
    <div className="card p-6 mb-6 rounded-2xl">
      <div className="flex items-center gap-6">
        <div className="relative">
          <div className="w-28 h-28 rounded-full bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center text-white text-4xl shadow-lg">Z</div>
          <div className="absolute -right-3 -bottom-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow">
            <svg width="14" height="14" viewBox="0 0 24 24"><path fill="#8B5CF6" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z"/></svg>
          </div>
        </div>
        <div>
          <div className="text-2xl font-bold">Zoya Huo</div>
          <div className="text-sm text-gray-600">MSc Health Data Science</div>
          <div className="mt-3 inline-flex items-center bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm">
            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2L15 8l6 1-4.5 4 1 6L12 17l-5.5 3 1-6L3 9l6-1z"/></svg>
            Student ID: 20241234
          </div>
        </div>
      </div>
    </div>
  )
}

function SettingsRow({ icon, title, value, onClick }) {
  return (
    <button onClick={onClick} className="w-full text-left flex items-center gap-4 px-4 py-3 hover:bg-gray-50 rounded">
      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
        <span>{icon}</span>
      </div>
      <div className="flex-1">
        <div className="font-medium">{title}</div>
        {value && <div className="text-sm text-gray-500">{value}</div>}
      </div>
      <div className="text-gray-400">&gt;</div>
    </button>
  )
}

export default function StudentProfileView() {
  return (
    <div>
      <ProfileHeaderCard />
      <div className="card p-4 rounded-xl mb-6">
        <SettingsRow icon="🌐" title="Language" value="English" onClick={() => {}} />
        <hr className="my-2" />
        <SettingsRow icon="🔔" title="Notifications" value="On" onClick={() => {}} />
        <hr className="my-2" />
        <SettingsRow icon="🔒" title="Privacy" value="" onClick={() => {}} />
      </div>

      <div className="card p-4 rounded-xl mb-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">👥</div>
          <div className="font-bold">Data Sharing</div>
        </div>
        <div className="space-y-3">
          <label className="flex items-center justify-between p-3 bg-white rounded">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded bg-indigo-50 flex items-center justify-center text-indigo-600">🎓</div>
              <div>
                <div className="font-semibold">Share Grades</div>
                <div className="text-sm text-gray-500">Share grades with parents</div>
              </div>
            </div>
            <input type="checkbox" defaultChecked />
          </label>

          <label className="flex items-center justify-between p-3 bg-white rounded">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded bg-yellow-50 flex items-center justify-center text-yellow-600">📅</div>
              <div>
                <div className="font-semibold">Share Calendar</div>
                <div className="text-sm text-gray-500">Share schedule with parents</div>
              </div>
            </div>
            <input type="checkbox" defaultChecked />
          </label>

          <div className="text-sm text-gray-500 flex items-center gap-2"><span>ℹ️</span> Data sharing description: You can toggle sharing with parents.</div>
        </div>
      </div>

      <div className="card p-4 rounded-xl mb-4">
        <button className="w-full text-left text-red-600 font-semibold">Log out</button>
      </div>

      <div className="card p-4 rounded-xl">
        <button className="w-full bg-gradient-to-r from-indigo-500 to-indigo-400 text-white py-3 rounded">Switch to Parent View</button>
      </div>
    </div>
  )
}