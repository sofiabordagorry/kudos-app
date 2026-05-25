import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'

const PRESETS = [
  { key: 'today', label: 'Today' },
  { key: 'week', label: 'Last week' },
  { key: 'month', label: 'Last month' },
  { key: 'all', label: 'All time' },
]

const ADVANCE_MS = 6000

function presetRange(preset) {
  if (preset === 'all') return [null, null]
  const end = new Date()
  const start = new Date(end)
  if (preset === 'today') start.setHours(0, 0, 0, 0)
  if (preset === 'week') start.setDate(start.getDate() - 7)
  if (preset === 'month') start.setMonth(start.getMonth() - 1)
  return [start, end]
}

export default function PresentationMode({ onExit }) {
  const [kudos, setKudos] = useState([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(null)

  const [preset, setPreset] = useState('week')
  const [useCustom, setUseCustom] = useState(false)
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd] = useState('')
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('kudos')
        .select('*')
        .order('created_at', { ascending: false })
      if (cancelled) return
      if (error) setFetchError(error.message)
      else setKudos(data ?? [])
      setLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const filtered = useMemo(() => {
    let start = null
    let end = null
    if (useCustom) {
      start = customStart ? new Date(`${customStart}T00:00:00`) : null
      end = customEnd ? new Date(`${customEnd}T23:59:59.999`) : null
    } else {
      ;[start, end] = presetRange(preset)
    }
    return kudos.filter((k) => {
      const t = new Date(k.created_at)
      if (start && t < start) return false
      if (end && t > end) return false
      return true
    })
  }, [kudos, preset, useCustom, customStart, customEnd])

  useEffect(() => {
    setIndex(0)
  }, [filtered.length, preset, useCustom, customStart, customEnd])

  useEffect(() => {
    if (paused || filtered.length <= 1) return
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % filtered.length)
    }, ADVANCE_MS)
    return () => clearInterval(id)
  }, [paused, filtered.length])

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onExit()
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault()
        if (filtered.length > 0)
          setIndex((i) => (i + 1) % filtered.length)
      }
      if (e.key === 'ArrowLeft') {
        if (filtered.length > 0)
          setIndex((i) => (i - 1 + filtered.length) % filtered.length)
      }
      if (e.key.toLowerCase() === 'p') setPaused((p) => !p)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [filtered.length, onExit])

  const current = filtered[index]

  return (
    <div className="fixed inset-0 flex flex-col bg-gradient-to-br from-purple-100 via-indigo-100 to-cyan-100">
      <div className="flex flex-wrap items-center gap-3 border-b border-white/40 bg-white/40 px-6 py-3 backdrop-blur">
        <div className="flex flex-wrap gap-1">
          {PRESETS.map((p) => (
            <button
              key={p.key}
              onClick={() => {
                setUseCustom(false)
                setPreset(p.key)
              }}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                !useCustom && preset === p.key
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-gray-700 hover:bg-white/60'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-700">
          <label className="flex items-center gap-1">
            <span className="text-xs uppercase tracking-wide text-gray-500">From</span>
            <input
              type="date"
              value={customStart}
              onChange={(e) => {
                setCustomStart(e.target.value)
                setUseCustom(true)
              }}
              className="rounded border border-gray-300 bg-white/80 px-2 py-1 text-sm"
            />
          </label>
          <label className="flex items-center gap-1">
            <span className="text-xs uppercase tracking-wide text-gray-500">To</span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => {
                setCustomEnd(e.target.value)
                setUseCustom(true)
              }}
              className="rounded border border-gray-300 bg-white/80 px-2 py-1 text-sm"
            />
          </label>
        </div>

        <div className="ml-auto flex items-center gap-2 text-sm">
          <button
            onClick={() => setPaused((p) => !p)}
            className="rounded-md bg-white/70 px-3 py-1.5 font-medium text-gray-700 hover:bg-white"
          >
            {paused ? '▶ Play' : '⏸ Pause'}
          </button>
          <button
            onClick={onExit}
            className="rounded-md bg-white/70 px-3 py-1.5 font-medium text-gray-700 hover:bg-white"
          >
            Exit (Esc)
          </button>
        </div>
      </div>

      <div className="relative flex flex-1 items-center justify-center overflow-hidden px-4 sm:px-12">
        {loading ? (
          <p className="text-xl text-gray-500">Loading…</p>
        ) : fetchError ? (
          <p className="text-xl text-red-600">{fetchError}</p>
        ) : filtered.length === 0 ? (
          <p className="text-xl text-gray-500">No kudos in this range.</p>
        ) : (
          <KudoCard kudo={current} />
        )}

        {filtered.length > 1 && (
          <>
            <button
              onClick={() =>
                setIndex((i) => (i - 1 + filtered.length) % filtered.length)
              }
              aria-label="Previous"
              className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/70 px-4 py-2 text-2xl text-gray-700 shadow-sm hover:bg-white"
            >
              ‹
            </button>
            <button
              onClick={() => setIndex((i) => (i + 1) % filtered.length)}
              aria-label="Next"
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/70 px-4 py-2 text-2xl text-gray-700 shadow-sm hover:bg-white"
            >
              ›
            </button>
          </>
        )}
      </div>

      {filtered.length > 0 && (
        <div className="border-t border-white/40 bg-white/30 px-6 py-2 text-center text-sm text-gray-600 backdrop-blur">
          {index + 1} / {filtered.length} · ← → to navigate · space to advance · P to pause
        </div>
      )}
    </div>
  )
}

function KudoCard({ kudo }) {
  return (
    <article
      key={kudo.id}
      className="max-w-3xl rounded-3xl bg-white/90 px-8 py-12 text-center shadow-2xl ring-1 ring-white/60 sm:px-14 sm:py-16"
      style={{ animation: 'kudoIn 500ms ease-out' }}
    >
      <p className="whitespace-pre-wrap text-2xl leading-relaxed text-gray-800 sm:text-3xl">
        “{kudo.message}”
      </p>
      <p className="mt-8 text-base text-gray-500">
        — {kudo.signature || 'Anonymous'}
      </p>
      <p className="mt-2 text-xs text-gray-400">
        {new Date(kudo.created_at).toLocaleDateString(undefined, {
          dateStyle: 'long',
        })}
      </p>
    </article>
  )
}
