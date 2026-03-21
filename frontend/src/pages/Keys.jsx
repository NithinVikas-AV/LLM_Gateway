import { useEffect, useState } from 'react'
import { Plus, Trash2, Copy, Check, ChevronDown, ChevronRight } from 'lucide-react'
import {
  addProviderKey, getProviderKeys, deleteProviderKey,
  createUniversalKey, getUniversalKeys, revokeUniversalKey,
  setPermission, getPermissions, deletePermission
} from '../api/keys'

const MODELS = ['gemini-2.5-flash', 'llama-3.3-70b-versatile']

function QuotaEditor({ keyId }) {
  const [quotas, setQuotas] = useState([])
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({
    model: MODELS[0],
    rpm_limit: null,
    daily_token_limit: null,
    monthly_cost_limit: null
  })

  const loadQuotas = () => getPermissions(keyId).then(r => setQuotas(r.data))
  useEffect(() => { loadQuotas() }, [keyId])

  const handleSave = async () => {
    await setPermission(keyId, form)
    setAdding(false)
    setForm({ model: MODELS[0], rpm_limit: null, daily_token_limit: null, monthly_cost_limit: null })
    loadQuotas()
  }

  const handleDelete = async (model) => {
    await deletePermission(keyId, model)
    loadQuotas()
  }

  return (
    <div className="px-4 pb-4 pt-3 bg-[var(--bg3)] rounded-b-lg">
      <p className="text-xs text-[var(--text3)] mb-3">
        Add which models this key can access. No quota set = all models blocked.
        Set a limit or check Unlimited for each field.
      </p>

      {quotas.length > 0 && (
        <table className="w-full text-xs mb-4">
          <thead>
            <tr>
              <th className="text-left pb-2 text-[var(--text3)] font-normal">Model</th>
              <th className="text-left pb-2 text-[var(--text3)] font-normal">RPM</th>
              <th className="text-left pb-2 text-[var(--text3)] font-normal">Daily tokens</th>
              <th className="text-left pb-2 text-[var(--text3)] font-normal">Monthly $</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {quotas.map(q => (
              <tr key={q.model} className="border-t border-[var(--border)]">
                <td className="py-2 font-mono text-[var(--text)]">{q.model}</td>
                <td className="py-2 text-[var(--text2)]">
                  {q.rpm_limit != null ? `${q.rpm_limit}/min` : <span className="text-green-400">Unlimited</span>}
                </td>
                <td className="py-2 text-[var(--text2)]">
                  {q.daily_token_limit != null ? q.daily_token_limit.toLocaleString() : <span className="text-green-400">Unlimited</span>}
                </td>
                <td className="py-2 text-[var(--text2)]">
                  {q.monthly_cost_limit != null ? `$${q.monthly_cost_limit}` : <span className="text-green-400">Unlimited</span>}
                </td>
                <td className="py-2">
                  <button
                    onClick={() => handleDelete(q.model)}
                    className="text-[var(--text3)] hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={12} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {!adding ? (
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-1.5 text-xs text-[var(--text3)] hover:text-[var(--text)] transition-colors"
        >
          <Plus size={12} /> Add model quota
        </button>
      ) : (
        <div className="bg-[var(--bg2)] border border-[var(--border)] rounded-lg p-3 space-y-3">
          <div>
            <label className="text-xs text-[var(--text3)] block mb-1">Model</label>
            <select
              value={form.model}
              onChange={e => setForm({ ...form, model: e.target.value })}
              className="input-base text-xs py-1.5 w-full"
            >
              {MODELS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-xs text-[var(--text3)] block mb-1">RPM limit</label>
              <input
                type="number"
                disabled={form.rpm_limit === null}
                value={form.rpm_limit ?? ''}
                onChange={e => setForm({ ...form, rpm_limit: parseInt(e.target.value) || null })}
                placeholder="e.g. 60"
                className="input-base text-xs py-1.5 w-full disabled:opacity-40"
              />
              <label className="flex items-center gap-1.5 cursor-pointer mt-1.5">
                <input
                  type="checkbox"
                  checked={form.rpm_limit === null}
                  onChange={e => setForm({ ...form, rpm_limit: e.target.checked ? null : 60 })}
                  className="w-3 h-3"
                />
                <span className="text-xs text-[var(--text3)]">Unlimited</span>
              </label>
            </div>

            <div>
              <label className="text-xs text-[var(--text3)] block mb-1">Daily tokens</label>
              <input
                type="number"
                disabled={form.daily_token_limit === null}
                value={form.daily_token_limit ?? ''}
                onChange={e => setForm({ ...form, daily_token_limit: parseInt(e.target.value) || null })}
                placeholder="e.g. 100000"
                className="input-base text-xs py-1.5 w-full disabled:opacity-40"
              />
              <label className="flex items-center gap-1.5 cursor-pointer mt-1.5">
                <input
                  type="checkbox"
                  checked={form.daily_token_limit === null}
                  onChange={e => setForm({ ...form, daily_token_limit: e.target.checked ? null : 100000 })}
                  className="w-3 h-3"
                />
                <span className="text-xs text-[var(--text3)]">Unlimited</span>
              </label>
            </div>

            <div>
              <label className="text-xs text-[var(--text3)] block mb-1">Monthly $ cap</label>
              <input
                type="number"
                step="0.5"
                disabled={form.monthly_cost_limit === null}
                value={form.monthly_cost_limit ?? ''}
                onChange={e => setForm({ ...form, monthly_cost_limit: parseFloat(e.target.value) || null })}
                placeholder="e.g. 10.00"
                className="input-base text-xs py-1.5 w-full disabled:opacity-40"
              />
              <label className="flex items-center gap-1.5 cursor-pointer mt-1.5">
                <input
                  type="checkbox"
                  checked={form.monthly_cost_limit === null}
                  onChange={e => setForm({ ...form, monthly_cost_limit: e.target.checked ? null : 10.0 })}
                  className="w-3 h-3"
                />
                <span className="text-xs text-[var(--text3)]">Unlimited</span>
              </label>
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button onClick={handleSave} className="btn-primary text-xs py-1.5 px-3">Save</button>
            <button
              onClick={() => {
                setAdding(false)
                setForm({ model: MODELS[0], rpm_limit: null, daily_token_limit: null, monthly_cost_limit: null })
              }}
              className="btn-ghost text-xs py-1.5 px-3"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function Keys() {
  const [providerKeys, setProviderKeys] = useState([])
  const [universalKeys, setUniversalKeys] = useState([])
  const [provider, setProvider] = useState('gemini')
  const [apiKey, setApiKey] = useState('')
  const [label, setLabel] = useState('')
  const [newRawKey, setNewRawKey] = useState(null)
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)
  const [expandedKey, setExpandedKey] = useState(null)

  const load = () => {
    getProviderKeys().then(r => setProviderKeys(r.data))
    getUniversalKeys().then(r => setUniversalKeys(r.data))
  }
  useEffect(() => { load() }, [])

  const handleAddProvider = async () => {
    if (!apiKey) return
    setLoading(true)
    try {
      await addProviderKey({ provider, api_key: apiKey })
      setApiKey('')
      load()
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUniversal = async () => {
    setLoading(true)
    try {
      const r = await createUniversalKey({ label })
      setNewRawKey(r.data.raw_key)
      setLabel('')
      load()
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteProviderKey = async (p) => {
    setProviderKeys(prev => prev.filter(k => k.provider !== p))
    await deleteProviderKey(p)
  }

  const handleRevokeUniversalKey = async (id) => {
    setUniversalKeys(prev => prev.filter(k => k.id !== id))
    if (expandedKey === id) setExpandedKey(null)
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
        <p className="text-sm text-[var(--text3)] mt-0.5">
          Manage your provider keys, universal keys and their quotas
        </p>
      </div>

      {/* Provider Keys */}
      <div className="card">
        <h2 className="text-sm font-semibold text-[var(--text)] mb-1">Provider keys</h2>
        <p className="text-xs text-[var(--text3)] mb-4">
          Your actual Gemini / Groq keys — stored encrypted, never exposed
        </p>

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
          <button
            onClick={handleAddProvider}
            disabled={loading || !apiKey}
            className="btn-primary flex items-center gap-1.5"
          >
            <Plus size={14} /> Save
          </button>
        </div>

        {providerKeys.length > 0 ? (
          <table className="w-full">
            <thead>
              <tr>
                <th className="th">Provider</th>
                <th className="th">Status</th>
                <th className="th">Added</th>
                <th className="th"></th>
              </tr>
            </thead>
            <tbody>
              {providerKeys.map(k => (
                <tr key={k.id}>
                  <td className="td font-medium capitalize text-[var(--text)]">{k.provider}</td>
                  <td className="td"><span className="badge-green">active</span></td>
                  <td className="td text-[var(--text3)]">{new Date(k.created_at).toLocaleDateString()}</td>
                  <td className="td">
                    <button
                      onClick={() => handleDeleteProviderKey(k.provider)}
                      className="text-[var(--text3)] hover:text-red-400 transition-colors"
                    >
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

      {/* Universal Keys */}
      <div className="card">
        <h2 className="text-sm font-semibold text-[var(--text)] mb-1">Universal keys</h2>
        <p className="text-xs text-[var(--text3)] mb-4">
          Share with anyone — click a key to set model access and quota limits
        </p>

        <div className="flex gap-2 mb-4">
          <input
            className="input-base flex-1"
            placeholder="Label (e.g. project-alpha)"
            value={label}
            onChange={e => setLabel(e.target.value)}
          />
          <button
            onClick={handleCreateUniversal}
            disabled={loading}
            className="btn-primary flex items-center gap-1.5"
          >
            <Plus size={14} /> Generate
          </button>
        </div>

        {newRawKey && (
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 mb-4">
            <p className="text-xs font-medium text-amber-400 mb-2">
              Copy this key now — you will never see it again
            </p>
            <code className="text-xs font-mono text-amber-300 break-all block mb-3">
              {newRawKey}
            </code>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 text-xs btn-ghost"
            >
              {copied
                ? <><Check size={13} className="text-green-400" /> Copied!</>
                : <><Copy size={13} /> Copy and dismiss</>
              }
            </button>
          </div>
        )}

        {universalKeys.length === 0 ? (
          <p className="text-xs text-[var(--text3)] text-center py-4">No universal keys yet</p>
        ) : (
          <div className="space-y-2">
            {universalKeys.map(k => (
              <div key={k.id} className="border border-[var(--border)] rounded-lg overflow-hidden">
                <div className="flex items-center justify-between px-3 py-2.5 bg-[var(--bg2)]">
                  <button
                    onClick={() => setExpandedKey(expandedKey === k.id ? null : k.id)}
                    className="flex items-center gap-2 text-sm hover:text-[var(--text)] transition-colors flex-1 text-left"
                  >
                    {expandedKey === k.id
                      ? <ChevronDown size={14} className="text-[var(--text3)]" />
                      : <ChevronRight size={14} className="text-[var(--text3)]" />
                    }
                    <span className="font-medium text-[var(--text)]">
                      {k.label || 'unlabeled'}
                    </span>
                    <span className="text-xs text-[var(--text3)]">
                      · created {new Date(k.created_at).toLocaleDateString()}
                    </span>
                  </button>
                  <button
                    onClick={() => handleRevokeUniversalKey(k.id)}
                    className="text-[var(--text3)] hover:text-red-400 transition-colors ml-2 flex-shrink-0"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                {expandedKey === k.id && <QuotaEditor keyId={k.id} />}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}