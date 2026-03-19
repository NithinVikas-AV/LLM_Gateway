import { useEffect, useState } from 'react'
import { Plus, Trash2, Copy, Check } from 'lucide-react'
import {
  addProviderKey, getProviderKeys, deleteProviderKey,
  createUniversalKey, getUniversalKeys, revokeUniversalKey
} from '../api/keys'

export default function Keys() {
  const [providerKeys, setProviderKeys] = useState([])
  const [universalKeys, setUniversalKeys] = useState([])
  const [provider, setProvider] = useState('gemini')
  const [apiKey, setApiKey] = useState('')
  const [label, setLabel] = useState('')
  const [newRawKey, setNewRawKey] = useState(null)
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)

  const load = () => {
    getProviderKeys().then(r => setProviderKeys(r.data))
    getUniversalKeys().then(r => setUniversalKeys(r.data))
  }
  useEffect(() => { load() }, [])

  const handleAddProvider = async () => {
    if (!apiKey) return
    setLoading(true)
    try { await addProviderKey({ provider, api_key: apiKey }); setApiKey(''); load() }
    finally { setLoading(false) }
  }

  const handleCreateUniversal = async () => {
    setLoading(true)
    try { const r = await createUniversalKey({ label }); setNewRawKey(r.data.raw_key); setLabel(''); load() }
    finally { setLoading(false) }
  }

  const handleDeleteProviderKey = async (p) => {
    setProviderKeys(prev => prev.filter(k => k.provider !== p))
    await deleteProviderKey(p)
  }

  const handleRevokeUniversalKey = async (id) => {
    setUniversalKeys(prev => prev.filter(k => k.id !== id))
    await revokeUniversalKey(id)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(newRawKey)
    setCopied(true)
    setTimeout(() => { setCopied(false); setNewRawKey(null) }, 2000)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-[var(--text)]">API Keys</h1>
        <p className="text-sm text-[var(--text3)] mt-0.5">Manage your provider keys and generate universal keys</p>
      </div>

      <div className="card">
        <h2 className="text-sm font-semibold text-[var(--text)] mb-1">Provider keys</h2>
        <p className="text-xs text-[var(--text3)] mb-4">Your actual Gemini / Groq keys — stored encrypted, never exposed</p>

        <div className="flex gap-2 mb-4">
          <select
            value={provider}
            onChange={e => setProvider(e.target.value)}
            className="input-base w-32"
          >
            <option value="gemini">Gemini</option>
            <option value="groq">Groq</option>
          </select>
          <input
            className="input-base flex-1"
            placeholder="Paste your API key"
            value={apiKey}
            onChange={e => setApiKey(e.target.value)}
            type="password"
          />
          <button onClick={handleAddProvider} disabled={loading || !apiKey} className="btn-primary flex items-center gap-1.5">
            <Plus size={14} /> Save
          </button>
        </div>

        {providerKeys.length > 0 ? (
          <table className="w-full">
            <thead><tr>
              <th className="th">Provider</th>
              <th className="th">Status</th>
              <th className="th">Added</th>
              <th className="th"></th>
            </tr></thead>
            <tbody>
              {providerKeys.map(k => (
                <tr key={k.id}>
                  <td className="td font-medium capitalize text-[var(--text)]">{k.provider}</td>
                  <td className="td"><span className="badge-green">active</span></td>
                  <td className="td text-[var(--text3)]">{new Date(k.created_at).toLocaleDateString()}</td>
                  <td className="td">
                    <button onClick={() => handleDeleteProviderKey(k.provider)} className="text-[var(--text3)] hover:text-red-400 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-xs text-[var(--text3)] text-center py-4">No provider keys yet</p>
        )}
      </div>

      <div className="card">
        <h2 className="text-sm font-semibold text-[var(--text)] mb-1">Universal keys</h2>
        <p className="text-xs text-[var(--text3)] mb-4">Share these with your team — they never expose your provider keys</p>

        <div className="flex gap-2 mb-4">
          <input
            className="input-base flex-1"
            placeholder="Label (e.g. project-alpha)"
            value={label}
            onChange={e => setLabel(e.target.value)}
          />
          <button onClick={handleCreateUniversal} disabled={loading} className="btn-primary flex items-center gap-1.5">
            <Plus size={14} /> Generate
          </button>
        </div>

        {newRawKey && (
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 mb-4">
            <p className="text-xs font-medium text-amber-400 mb-2">Copy this key now — you will never see it again</p>
            <code className="text-xs font-mono text-amber-300 break-all block mb-3">{newRawKey}</code>
            <button onClick={handleCopy} className="flex items-center gap-1.5 text-xs btn-ghost">
              {copied ? <><Check size={13} className="text-green-400" /> Copied!</> : <><Copy size={13} /> Copy and dismiss</>}
            </button>
          </div>
        )}

        {universalKeys.length > 0 ? (
          <table className="w-full">
            <thead><tr>
              <th className="th">Label</th>
              <th className="th">Created</th>
              <th className="th"></th>
            </tr></thead>
            <tbody>
              {universalKeys.map(k => (
                <tr key={k.id}>
                  <td className="td text-[var(--text)]">{k.label || <span className="text-[var(--text3)]">unlabeled</span>}</td>
                  <td className="td text-[var(--text3)]">{new Date(k.created_at).toLocaleDateString()}</td>
                  <td className="td">
                    <button onClick={() => handleRevokeUniversalKey(k.id)} className="text-[var(--text3)] hover:text-red-400 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-xs text-[var(--text3)] text-center py-4">No universal keys yet</p>
        )}
      </div>
    </div>
  )
}