import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function KudoForm() {
  const [message, setMessage] = useState('')
  const [signature, setSignature] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [sent, setSent] = useState(false)

  useEffect(() => {
    if (!sent) return
    const id = setTimeout(() => setSent(false), 2500)
    return () => clearTimeout(id)
  }, [sent])

  async function handleSubmit(e) {
    e.preventDefault()
    const trimmed = message.trim()
    if (!trimmed) return
    setSubmitting(true)
    setError(null)
    const { error: insertError } = await supabase.from('kudos').insert({
      message: trimmed,
      signature: signature.trim() || null,
    })
    setSubmitting(false)
    if (insertError) {
      setError(insertError.message)
      return
    }
    setMessage('')
    setSignature('')
    setSent(true)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200"
    >
      <label className="block">
        <span className="text-sm font-medium text-gray-700">Your kudo</span>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Say something kind…"
          rows={3}
          maxLength={1000}
          required
          className="mt-2 block w-full resize-none rounded-lg border-0 px-3 py-2 text-gray-900 ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-purple-500 focus:outline-none"
        />
      </label>

      <label className="mt-4 block">
        <span className="text-sm font-medium text-gray-700">
          Signature{' '}
          <span className="font-normal text-gray-400">(optional)</span>
        </span>
        <input
          type="text"
          value={signature}
          onChange={(e) => setSignature(e.target.value)}
          placeholder="Anonymous if left blank"
          maxLength={80}
          className="mt-2 block w-full rounded-lg border-0 px-3 py-2 text-gray-900 ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-purple-500 focus:outline-none"
        />
      </label>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      <div className="mt-4 flex items-center justify-end gap-3">
        {sent && (
          <span className="text-sm text-green-600">Sent. Thanks!</span>
        )}
        <button
          type="submit"
          disabled={submitting || !message.trim()}
          className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          {submitting ? 'Sending…' : 'Send kudo'}
        </button>
      </div>
    </form>
  )
}
