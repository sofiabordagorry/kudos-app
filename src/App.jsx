import { useState } from 'react'
import KudoForm from './components/KudoForm'
import PresentationMode from './components/PresentationMode'

export default function App() {
  const [mode, setMode] = useState('home')

  if (mode === 'presentation') {
    return <PresentationMode onExit={() => setMode('home')} />
  }

  return (
    <div className="min-h-screen px-4 py-10 sm:py-16">
      <div className="mx-auto max-w-2xl">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
            Kudos
          </h1>
          <p className="mt-2 text-gray-600">
            Leave a kind word. Anonymous or signed.
          </p>
        </header>

        <KudoForm />

        <div className="mt-10 flex justify-center">
          <button
            onClick={() => setMode('presentation')}
            className="rounded-lg bg-purple-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-purple-700"
          >
            Presentation mode →
          </button>
        </div>
      </div>
    </div>
  )
}
