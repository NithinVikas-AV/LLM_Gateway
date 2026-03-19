import { useEffect, useState } from 'react'
import { TrendingUp, Zap, Key, DollarSign } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { getMySummary, getMyUsage } from '../api/usage'
import { getUniversalKeys } from '../api/keys'

function MetricCard({ label, value, sub, subColor = 'text-[var(--text3)]', accent = false }) {
  return (
    <div className={`card ${accent ? 'border-[var(--accent)]' : ''}`}>
      <p className="text-xs text-[var(--text3)] uppercase tracking-wider mb-2">{label}</p>
      <p className="text-2xl font-semibold text-[var(--text)]">{value}</p>
      {sub && <p className={`text-xs mt-1 ${subColor}`}>{sub}</p>}
    </div>
  )
}

export default function Dashboard() {
  const [summary, setSummary] = useState(null)
  const [logs, setLogs] = useState([])
  const [keys, setKeys] = useState([])

  useEffect(() => {
    getMySummary().then(r => setSummary(r.data))
    getMyUsage().then(r => setLogs(r.data))
    getUniversalKeys().then(r => setKeys(r.data))
  }, [])

  const totalCalls = summary?.by_model?.reduce((a, b) => a + b.total_calls, 0) ?? 0
  const chartData = summary?.by_model?.map(m => ({
    name: m.model.split('-').slice(0, 2).join('-'),
    calls: m.total_calls,
    cost: m.total_cost_usd,
  })) ?? []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-[var(--text)]">Dashboard</h1>
        <p className="text-sm text-[var(--text3)] mt-0.5">Your usage overview for this month</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <MetricCard
          label="Cost this month"
          value={`$${summary?.total_cost_usd ?? '0.0000'}`}
          sub="across all models"
          accent
        />
        <MetricCard
          label="Total API calls"
          value={totalCalls}
          sub={`${summary?.by_model?.length ?? 0} models used`}
          subColor="text-blue-400"
        />
        <MetricCard
          label="Active keys"
          value={keys.length}
          sub="universal keys"
        />
      </div>

      {chartData.length > 0 && (
        <div className="card">
          <h2 className="text-sm font-semibold text-[var(--text)] mb-4">Usage by model</h2>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={chartData} barSize={32} style={{ background: 'transparent' }}>
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--text3)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text3)' }} axisLine={false} tickLine={false} />
              <Tooltip
                cursor={{ fill: 'var(--bg3)' }}
                contentStyle={{
                  background: 'var(--bg2)',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  fontSize: 12,
                  color: 'var(--text)'
                }}
                labelStyle={{ color: 'var(--text)' }}
                itemStyle={{ color: 'var(--text2)' }}
              />
              <Bar dataKey="calls" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>

          <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-[var(--border)]">
            {summary?.by_model?.map(m => (
              <div key={m.model} className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-mono text-[var(--text)]">{m.model}</p>
                  <p className="text-xs text-[var(--text3)]">{m.total_calls} calls · {m.total_input_tokens + m.total_output_tokens} tokens</p>
                </div>
                <span className="badge-purple">${m.total_cost_usd}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card">
        <h2 className="text-sm font-semibold text-[var(--text)] mb-4">Recent calls</h2>
        {logs.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-[var(--text3)] text-sm">No API calls yet.</p>
            <p className="text-[var(--text3)] text-xs mt-1">Head to the Playground to make your first call.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr>
                <th className="th">Model</th>
                <th className="th">Tokens</th>
                <th className="th">Cost</th>
                <th className="th">Status</th>
                <th className="th">Time</th>
              </tr>
            </thead>
            <tbody>
              {logs.slice(0, 8).map((log, i) => (
                <tr key={i}>
                  <td className="td font-mono text-xs text-[var(--text)]">{log.model}</td>
                  <td className="td">{log.input_tokens + log.output_tokens}</td>
                  <td className="td">${log.cost}</td>
                  <td className="td">
                    <span className={log.status === 'success' ? 'badge-green' : 'badge-red'}>
                      {log.status}
                    </span>
                  </td>
                  <td className="td text-[var(--text3)] text-xs">
                    {new Date(log.created_at).toLocaleTimeString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}