import { useState } from 'react'
import { Send } from 'lucide-react'
import { chatWithGateway } from '../api/gateway'

const MODELS = ['gemini-2.5-flash', 'llama-3.3-70b-versatile']

export default function Playground() {
  const [universalKey, setUniversalKey] = useState('')
  const [model, setModel] = useState(MODELS[0])
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [lastUsage, setLastUsage] = useState(null)

  const handleSend = async () => {
    if (!input.trim() || !universalKey) return
    const newMessages = [...messages, { role: 'user', content: input }]
    setMessages(newMessages)
    setInput('')
    setLoading(true)
    try {
      const res = await chatWithGateway(universalKey, model, newMessages)
      setMessages([...newMessages, { role: 'assistant', content: res.data.content }])
      setLastUsage({ tokens: res.data.input_tokens + res.data.output_tokens, cost: res.data.cost_usd })
    } catch (err) {
      const detail = err.response?.data?.detail || 'Something went wrong'
      setMessages([...newMessages, { role: 'assistant', content: `Error: ${detail}` }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4 flex flex-col h-full">
      <div>
        <h1 className="text-xl font-semibold text-[var(--text)]">Playground</h1>
        <p className="text-sm text-[var(--text3)] mt-0.5">Test your gateway live</p>
      </div>

      <div className="card flex gap-3">
        <input
          className="input-base flex-1 font-mono text-xs"
          placeholder="Paste your universal key (llmgw-...)"
          value={universalKey}
          onChange={e => setUniversalKey(e.target.value)}
        />
        <select
          value={model}
          onChange={e => setModel(e.target.value)}
          className="input-base w-52"
        >
          {MODELS.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>

      <div className="card flex-1 flex flex-col min-h-96">
        <div className="flex-1 space-y-3 overflow-auto mb-4 min-h-64">
          {messages.length === 0 && (
            <div className="flex items-center justify-center h-48">
              <p className="text-[var(--text3)] text-sm">Enter your universal key above and start chatting</p>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-2xl rounded-xl px-4 py-2.5 text-sm leading-relaxed ${
                m.role === 'user'
                  ? 'bg-[var(--accent)] text-white'
                  : 'bg-[var(--bg3)] text-[var(--text)]'
              }`}>
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-[var(--bg3)] rounded-xl px-4 py-2.5 text-sm text-[var(--text3)]">
                <span className="animate-pulse">Thinking...</span>
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-[var(--border)] pt-3 flex gap-2">
          <input
            className="input-base flex-1"
            placeholder="Type a message..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
          />
          <button
            onClick={handleSend}
            disabled={loading || !universalKey || !input.trim()}
            className="btn-primary flex items-center gap-1.5"
          >
            <Send size={14} /> Send
          </button>
        </div>
      </div>

      {lastUsage && (
        <p className="text-xs text-[var(--text3)] text-right">
          Last call: {lastUsage.tokens} tokens · ${lastUsage.cost} USD
        </p>
      )}
    </div>
  )
}