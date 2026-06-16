import { useState, useEffect, useCallback } from 'react'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, Brush, Cell,
} from 'recharts'
import { Card, StatCard } from '../../components/ui/index.jsx'
import { dashboardService, branchService, expenseService } from '../../services/api'
import clsx from 'clsx'
import toast from 'react-hot-toast'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white dark:bg-dark-800 border border-slate-100 dark:border-dark-700 rounded-xl p-3 shadow-lg text-sm">
      <p className="font-medium text-dark dark:text-slate-100 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>{p.name}: {typeof p.value === 'number' && p.value > 999 ? `৳${p.value.toLocaleString()}` : p.value}</p>
      ))}
    </div>
  )
}

const PERIOD_LABELS = { daily: 'Today', weekly: 'This Week', monthly: 'This Month', yearly: 'This Year' }
const PERIOD_SHORT = { daily: 'today', weekly: 'this week', monthly: 'this month', yearly: 'this year' }

export default function AnalyticsPage() {
  const [period, setPeriod] = useState('monthly')
  const [hiddenSeries, setHiddenSeries] = useState({})
  const [data, setData] = useState({
    stats: null, salesChart: [], topProducts: [],
    customerGrowth: [], monthlyExpenses: [], branches: [],
  })

  const loadAll = useCallback(() => {
    dashboardService.getStats(period).then(({ data: d }) => setData(prev => ({ ...prev, stats: d.data }))).catch(() => {})
    dashboardService.getSalesChart(period).then(({ data: d }) => setData(prev => ({ ...prev, salesChart: d.data || [] }))).catch(() => {})
    dashboardService.getTopProducts().then(({ data: d }) => setData(prev => ({ ...prev, topProducts: d.data || [] }))).catch(() => {})
    dashboardService.getCustomerGrowth(period).then(({ data: d }) => setData(prev => ({ ...prev, customerGrowth: d.data || [] }))).catch(() => {})
    dashboardService.getMonthlyExpenses(period).then(({ data: d }) => setData(prev => ({ ...prev, monthlyExpenses: d.data || [] }))).catch(() => {})
    branchService.getAll().then(({ data: d }) => setData(prev => ({ ...prev, branches: d.data || [] }))).catch(() => {})
  }, [period])

  useEffect(() => { loadAll() }, [loadAll])

  const { stats, salesChart, topProducts, customerGrowth, monthlyExpenses, branches } = data

  const periodLabel = PERIOD_LABELS[period] || 'Monthly'
  const periodSubtitle = PERIOD_SHORT[period] || 'this month'

  // Revenue key mapping
  const revKey = period === 'daily' ? 'dailyRevenue' : period === 'weekly' ? 'weeklyRevenue' : 'monthlyRevenue'
  const ordKey = period === 'daily' ? 'dailyOrders' : period === 'weekly' ? 'weeklyOrders' : 'monthlyOrders'

  // Build revenue chart data from salesChart + expenses
  const revenueChartData = (() => {
    const map = {}
    salesChart.forEach(s => {
      const key = s.period || ''
      map[key] = { period: key, revenue: s.sales || 0, orders: s.orders || 0, expenses: 0 }
    })
    monthlyExpenses.forEach(e => {
      if (map[e.period]) map[e.period].expenses = e.total
    })
    return Object.values(map).map(d => ({
      ...d,
      profit: Math.max(0, d.revenue - d.expenses),
    }))
  })()

  // Build customer growth chart from API data
  const growthChartData = (() => {
    if (!customerGrowth?.newCustomers) return []
    const growthMap = {}
    ;(customerGrowth.newCustomers || []).forEach(n => { growthMap[n.period] = { new: parseInt(n.count) } })
    ;(customerGrowth.activeCustomers || []).forEach(a => {
      growthMap[a.period] = { ...growthMap[a.period], returning: parseInt(a.count) }
    })
    return Object.entries(growthMap).map(([period, v]) => ({
      period,
      new: v.new || 0,
      returning: Math.max(0, (v.returning || 0) - (v.new || 0)),
    }))
  })()

  const branchChartData = branches.map(b => ({ name: (b.name || '').split(' - ')[1] || b.name, revenue: b.revenue || 0 }))

  const displayProducts = topProducts.map(p => ({
    product: p.name, sales: p.totalSold || 0, revenue: p.revenue || 0,
    profit: Math.round((p.revenue || 0) * 0.35),
  }))

  const chartDateKey = period === 'yearly' ? 'period' : period === 'monthly' ? 'period' : 'period'

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="section-title">Analytics Center</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Advanced business intelligence & performance analytics</p>
        </div>
        <div className="flex gap-2">
          {['daily', 'weekly', 'monthly', 'yearly'].map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className={clsx('px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors',
                period === p ? 'bg-primary-600 text-white' : 'bg-white dark:bg-dark-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-dark-700')}>
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5">
          <p className="text-sm text-slate-500 dark:text-slate-400">Total Revenue</p>
          <p className="text-2xl font-bold text-dark dark:text-slate-100 mt-1">৳{(stats?.[revKey] || 0).toLocaleString()}</p>
          <p className="text-xs mt-1 font-medium text-slate-400">{periodLabel}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-slate-500 dark:text-slate-400">Total Orders</p>
          <p className="text-2xl font-bold text-dark dark:text-slate-100 mt-1">{(stats?.[ordKey] || 0).toLocaleString()}</p>
          <p className="text-xs mt-1 font-medium text-slate-400">{stats?.dailyOrders || 0} today</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-slate-500 dark:text-slate-400">Total Products</p>
          <p className="text-2xl font-bold text-dark dark:text-slate-100 mt-1">{stats?.totalProducts || 0}</p>
          <p className="text-xs mt-1 font-medium text-slate-400">{stats?.lowStockCount || 0} low stock</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-slate-500 dark:text-slate-400">Total Customers</p>
          <p className="text-2xl font-bold text-dark dark:text-slate-100 mt-1">{stats?.totalCustomers || 0}</p>
          <p className="text-xs mt-1 font-medium text-slate-400">{stats?.totalCustomers ? `${Math.round(stats.totalCustomers * 0.6)} active` : 'active'}</p>
        </Card>
      </div>

      {/* Revenue & Profit Trend */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-dark dark:text-slate-100">Revenue & Profit Trend</h3>
          <span className="text-xs text-slate-400 capitalize">{period} breakdown</span>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={revenueChartData.length ? revenueChartData : [{ period: 'No data', revenue: 0, profit: 0, expenses: 0 }]}
            onClick={(e) => { if (e?.activeLabel) toast.success(`${e.activeLabel} — Revenue: ৳${e.activePayload?.[0]?.value?.toLocaleString() || 'N/A'}`, { duration: 2000 }) }}>
            <defs>
              <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563EB" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="prof" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="exp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#EF4444" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:opacity-10" />
            <XAxis dataKey="period" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `৳${v >= 1000 ? `${(v / 1000).toFixed(1)}K` : v}`} />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#94a3b8', strokeDasharray: '4 4' }} />
            <Legend wrapperStyle={{ fontSize: 12, cursor: 'pointer' }}
              onClick={(e) => setHiddenSeries(p => ({ ...p, [e.dataKey]: !p[e.dataKey] }))} />
            {revenueChartData.length > 3 && (
              <Brush dataKey="period" height={24} stroke="#2563EB" fill="#f8fafc" className="dark:fill-dark-800" travellerWidth={8}
                style={{ fontSize: 10 }} startIndex={Math.max(0, revenueChartData.length - 6)} />
            )}
            <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#2563EB" strokeWidth={2} fill="url(#rev)"
              dot={false} activeDot={{ r: 5, stroke: '#2563EB', strokeWidth: 2, fill: '#fff', style: { cursor: 'pointer' } }}
              hide={hiddenSeries.revenue} isAnimationActive={true} animationDuration={600} />
            <Area type="monotone" dataKey="profit" name="Profit" stroke="#10B981" strokeWidth={2} fill="url(#prof)"
              dot={false} activeDot={{ r: 5, stroke: '#10B981', strokeWidth: 2, fill: '#fff', style: { cursor: 'pointer' } }}
              hide={hiddenSeries.profit} isAnimationActive={true} animationDuration={600} />
            <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#EF4444" strokeWidth={2} fill="url(#exp)"
              dot={false} activeDot={{ r: 5, stroke: '#EF4444', strokeWidth: 2, fill: '#fff', style: { cursor: 'pointer' } }}
              hide={hiddenSeries.expenses} isAnimationActive={true} animationDuration={600} />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      {/* Customer Growth & Branch Revenue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-5">
          <h3 className="font-semibold text-dark dark:text-slate-100 mb-5">Customer Growth</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={growthChartData.length ? growthChartData : [{ period: 'No data', new: 0, returning: 0 }]} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:opacity-10" />
              <XAxis dataKey="period" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="new" name="New Customers" fill="#2563EB" radius={[4, 4, 0, 0]} />
              <Bar dataKey="returning" name="Returning" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5">
          <h3 className="font-semibold text-dark dark:text-slate-100 mb-5">Branch Revenue</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={branchChartData} barGap={4} onClick={(e) => { if (e?.activeLabel) toast.success(`${e.activeLabel}: ৳${e.activePayload?.[0]?.value?.toLocaleString() || 'N/A'}`, { duration: 2000 }) }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:opacity-10" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `৳${v >= 1000 ? `${(v / 1000).toFixed(1)}K` : v}`} />
              <Tooltip formatter={v => [`৳${Number(v).toLocaleString()}`, 'Revenue']} cursor={{ fill: '#f1f5f9' }} />
              <Bar dataKey="revenue" radius={[4, 4, 0, 0]} maxBarSize={60}>
                {branchChartData.map((_, i) => <Cell key={i} fill={['#2563EB', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'][i % 5]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Top Product Performance Table */}
      <Card className="p-5">
        <h3 className="font-semibold text-dark dark:text-slate-100 mb-5">Top Product Performance</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-dark-700">
                {['Product', 'Units Sold', 'Revenue', 'Profit', 'Performance'].map(h => (
                  <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-dark-700">
              {displayProducts.map((p, i) => {
                const pct = p.revenue ? Math.round((p.profit / p.revenue) * 100) : 0
                return (
                  <tr key={i} className="hover:bg-slate-50 dark:hover:bg-dark-700/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-lg bg-primary-100 dark:bg-primary-500/20 text-primary-600 dark:text-primary-400 text-xs font-bold flex items-center justify-center">{i + 1}</span>
                        <span className="font-medium text-dark dark:text-slate-200">{p.product}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{p.sales}</td>
                    <td className="py-3 px-4 font-medium text-dark dark:text-slate-100">৳{(p.revenue || 0).toLocaleString()}</td>
                    <td className="py-3 px-4 font-medium text-success-600 dark:text-success-400">৳{(p.profit || 0).toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-1.5 rounded-full bg-slate-100 dark:bg-dark-700 overflow-hidden">
                          <div className="h-full rounded-full bg-success-500" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs font-medium text-slate-500">{pct}%</span>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}