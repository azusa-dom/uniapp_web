import React from 'react'

function Field({ icon, label, value, onChange, placeholder }) {
  return (
    <div className="mb-4">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-9 h-9 rounded bg-indigo-50 flex items-center justify-center text-indigo-600">{icon}</div>
        <div className="font-semibold">{label}</div>
      </div>
      <input className="w-full p-3 rounded border border-gray-200" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  )
}

export default function StudentSettingsView() {
  const [name, setName] = React.useState("Zoya Huo")
  const [email, setEmail] = React.useState("ziying.huo.23@ucl.ac.uk")
  const [studentId, setStudentId] = React.useState("20241234")
  const [program, setProgram] = React.useState("MSc Health Data Science")
  const [year, setYear] = React.useState("Year 1")
  const [phone, setPhone] = React.useState("")
  const [bio, setBio] = React.useState("")

  return (
    <div>
      <div className="card p-6 mb-6 rounded-2xl">
        <div className="flex items-center gap-6">
          <div className="w-36 h-36 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-5xl">Z</div>
          <div className="flex-1">
            <div className="text-xl font-bold">{name}</div>
            <div className="text-sm text-gray-600">{email}</div>
            <div className="mt-4 flex gap-3">
              <button className="px-4 py-2 bg-indigo-600 text-white rounded">Choose Icon</button>
              <button className="px-4 py-2 border rounded">Pick Photo</button>
            </div>
          </div>
        </div>
      </div>

      <div className="card p-4 rounded-xl mb-6">
        <Field icon="👤" label="Name" value={name} onChange={setName} placeholder="Enter your name" />
        <Field icon="✉️" label="Email" value={email} onChange={setEmail} placeholder="Enter your email" />
        <Field icon="#" label="Student ID" value={studentId} onChange={setStudentId} placeholder="Enter student id" />
      </div>

      <div className="card p-4 rounded-xl mb-6">
        <Field icon="🎓" label="Program" value={program} onChange={setProgram} placeholder="Program" />
        <Field icon="📅" label="Year" value={year} onChange={setYear} placeholder="Year" />
      </div>

      <div className="card p-4 rounded-xl mb-6">
        <Field icon="📞" label="Phone" value={phone} onChange={setPhone} placeholder="Phone number" />
      </div>

      <div className="card p-4 rounded-xl">
        <div className="font-semibold mb-2">Bio</div>
        <textarea className="w-full p-3 rounded border border-gray-200" rows="6" value={bio} onChange={e => setBio(e.target.value)} />
        <div className="mt-3 text-right text-sm text-gray-500">{bio.length}/200</div>
      </div>
    </div>
  )
}