import { useState, useEffect } from 'react'
import { FiDownload, FiEye, FiTrendingUp } from 'react-icons/fi'
import { Card, Table, Td, SearchBar, Pagination, StatusBadge } from '../../components/ui/index.jsx'
import { orderService, dashboardService } from '../../services/api'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import toast from 'react-hot-toast'
import clsx from 'clsx'

export default function SalesPage() {
  const [orders, setOrders] = useState([])
  const [chartData, setChartData] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)
  const PER_PAGE = 7

  useEffect(() => {
    Promise.all([
      orderService.getAll(),
      dashboardService.getSalesChart('weekly'),
    ]).then(([ordersRes, chartRes]) => {
      setOrders(ordersRes.data.data || [])
      setChartData(chartRes.data.data || [])
    }).catch(() => toast.error('Failed to load sales data')).finally(() => setLoading(false))
  }, [])

  const filtered = orders.filter(o => {
    const matchSearch = (o.orderNo || o.id || '').toLowerCase().includes(search.toLowerCase()) || (o.customerName || o.customer || '').toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || (o.status || '').toLowerCase() === statusFilter
    return matchSearch && matchStatus
  })
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  const totalRevenue = orders.filter(o => o.status === 'Completed').reduce((s, o) => s + (o.total || o.amount || 0), 0)
  const totalCompleted = orders.filter(o => o.status === 'Completed').length
  const totalPending = orders.filter(o => o.status === 'Pending').length
  const totalCancelled = orders.filter(o => o.status === 'Cancelled').length

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" /></div>

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="section-title">Sales & Orders</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Track orders, revenue & sales performance</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue', value: `৳${totalRevenue.toLocaleString()}`, color: 'text-primary-600', bg: 'bg-primary-50 dark:bg-primary-500/10' },
          { label: 'Completed', value: totalCompleted, color: 'text-success-600', bg: 'bg-success-50 dark:bg-success-500/10' },
          { label: 'Pending', value: totalPending, color: 'text-warning-600', bg: 'bg-warning-50 dark:bg-warning-500/10' },
          { label: 'Cancelled', value: totalCancelled, color: 'text-danger-600', bg: 'bg-danger-50 dark:bg-danger-500/10' },
        ].map((s, i) => (
          <Card key={i} className={clsx('p-4', s.bg)}>
            <p className="text-xs text-slate-500 dark:text-slate-400">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </Card>
        ))}
      </div>

      <Card className="p-5">
        <h3 className="font-semibold text-dark dark:text-slate-100 mb-4">Sales Performance</h3>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={chartData.length ? chartData : [{ day: 'No data', sales: 0 }]}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:opacity-10" />
            <XAxis dataKey={chartData.length ? (chartData[0].period ? 'period' : 'day') : 'day'} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `৳${v / 1000}K`} />
            <Tooltip formatter={v => [`৳${Number(v).toLocaleString()}`, 'Sales']} />
            <Bar dataKey="sales" fill="#2563EB" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card className="p-4 flex flex-wrap gap-3 items-center justify-between">
        <div className="flex gap-2">
          {['all', 'completed', 'pending', 'cancelled'].map(s => (
            <button key={s} onClick={() => { setStatusFilter(s); setPage(1) }}
              className={clsx('px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors',
                statusFilter === s ? 'bg-primary-600 text-white' : 'bg-slate-100 dark:bg-dark-700 text-slate-600 dark:text-slate-400')}>
              {s === 'all' ? 'All Orders' : s}
            </button>
          ))}
        </div>
        <SearchBar value={search} onChange={v => { setSearch(v); setPage(1) }} placeholder="Search orders..." />
      </Card>

      <Card>
        <Table headers={['Order ID', 'Customer', 'Items', 'Amount', 'Payment', 'Status', 'Date', 'Action']}>
          {paginated.map(o => (
            <tr key={o.id} className="hover:bg-slate-50 dark:hover:bg-dark-700/50 transition-colors">
              <Td className="font-mono text-primary-600 dark:text-primary-400 font-semibold">{o.orderNo || o.id}</Td>
              <Td className="font-medium text-dark dark:text-slate-200">{o.customerName || o.customer}</Td>
              <Td>{o.items ? (o.items.length || o.items) : '-'} items</Td>
              <Td className="font-bold text-dark dark:text-slate-100">৳{(o.total || o.amount || 0).toLocaleString()}</Td>
              <Td><span className="badge-primary">{o.paymentMethod}</span></Td>
              <Td><StatusBadge status={o.status} /></Td>
              <Td className="text-slate-500 dark:text-slate-400">{o.createdAt ? new Date(o.createdAt).toLocaleDateString() : o.date}</Td>
              <Td>
                <button className="p-1.5 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-500/10 text-primary-600 dark:text-primary-400">
                  <FiEye size={15} />
                </button>
              </Td>
            </tr>
          ))}
        </Table>
        <div className="px-4 pb-4"><Pagination page={page} total={filtered.length} perPage={PER_PAGE} onChange={setPage} /></div>
      </Card>
    </div>
  )
}
