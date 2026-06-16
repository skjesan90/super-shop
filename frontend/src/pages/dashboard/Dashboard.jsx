import { useState, useEffect } from 'react'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts'
import {
  FiDollarSign, FiShoppingCart, FiPackage, FiUsers, FiTruck, FiUserCheck,
  FiTrendingUp, FiAlertTriangle
} from 'react-icons/fi'
import { Card, StatCard, StatusBadge } from '../../components/ui/index.jsx'
import { dashboardService } from '../../services/api'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

const COLORS = ['#2563EB', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899']

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [salesChart, setSalesChart] = useState([])
  const [topProducts, setTopProducts] = useState([])
  const [recentOrders, setRecentOrders] = useState([])
  const [customerGrowth, setCustomerGrowth] = useState([])
  const [monthlyExpenses, setMonthlyExpenses] = useState([])
  const [timeRange, setTimeRange] = useState('weekly')

  useEffect(() => {
    dashboardService.getStats().then(({ data }) => setStats(data.data)).catch(() => {})
  }, [])

  useEffect(() => {
    dashboardService.getSalesChart(timeRange).then(({ data }) => setSalesChart(data.data || [])).catch(() => {})
  }, [timeRange])

  useEffect(() => {
    dashboardService.getTopProducts().then(({ data }) => setTopProducts(data.data || [])).catch(() => {})
    dashboardService.getRecentTransactions().then(({ data }) => setRecentOrders(data.data || [])).catch(() => {})
    dashboardService.getCustomerGrowth().then(({ data }) => setCustomerGrowth(data.data || [])).catch(() => {})
    dashboardService.getMonthlyExpenses().then(({ data }) => setMonthlyExpenses(data.data || [])).catch(() => {})
  }, [])

  const lowStockCount = stats?.lowStockCount || 0
  const outOfStockCount = stats?.outOfStockCount || 0
  const inStockCount = stats ? (stats.totalProducts - lowStockCount - outOfStockCount) : 0

  const rangeLabel = timeRange === 'daily' ? 'Daily' : timeRange === 'weekly' ? 'Weekly' : 'Monthly'
  const revenueKey = timeRange === 'daily' ? 'dailyRevenue' : timeRange === 'weekly' ? 'weeklyRevenue' : 'monthlyRevenue'
  const ordersKey = timeRange === 'daily' ? 'dailyOrders' : timeRange === 'weekly' ? 'weeklyOrders' : 'monthlyOrders'

  const kpiCards = [
    { title: `${rangeLabel} Revenue`, value: stats?.[revenueKey] || 0, prefix: '৳', icon: FiDollarSign, iconBg: 'bg-primary-600' },
    { title: `${rangeLabel} Orders`, value: stats?.[ordersKey] || 0, icon: FiShoppingCart, iconBg: 'bg-success-500' },
    { title: 'Total Products', value: stats?.totalProducts || 0, icon: FiPackage, iconBg: 'bg-warning-500' },
    { title: 'Total Customers', value: stats?.totalCustomers || 0, icon: FiUsers, iconBg: 'bg-purple-500' },
    { title: 'Total Suppliers', value: stats?.totalSuppliers || 0, icon: FiTruck, iconBg: 'bg-pink-500' },
    { title: 'Total Employees', value: stats?.totalEmployees || 0, icon: FiUserCheck, iconBg: 'bg-cyan-500' },
  ]

  const BAR_COLORS = ['#2563EB', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4']

  const growthData = (customerGrowth?.newCustomers || []).map((m, i) => ({
    month: m.month,
    new: m.count,
    active: customerGrowth.activeCustomers?.[i]?.count || 0
  }))

  const perfData = salesChart.map(s => ({
    period: s.period,
    sales: s.sales,
    orders: s.orders
  }))

  const expenseData = (monthlyExpenses || []).map(e => ({
    month: e.month,
    expenses: e.total
  }))

  // Merge sales & expenses for bar chart
  const barData = perfData.length > 1 ? perfData.map(p => {
    const exp = expenseData.find(e => {
      if (p.period.length === 7) return e.month === p.period
      if (p.period.length > 7) return e.month === p.period.slice(0, 7)
      return false
    })
    return { ...p, expenses: exp ? exp.expenses : 0 }
  }) : growthData.map(g => ({ ...g, expenses: 0 }))

  const handleChartClick = (entry) => {
    if (entry?.activeLabel) toast.success(`Period: ${entry.activeLabel}`, { duration: 2000 })
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    return (
      <div className="bg-white dark:bg-dark-800 border border-slate-100 dark:border-dark-700 rounded-xl p-3 shadow-lg text-sm">
        <p className="font-medium text-dark dark:text-slate-100 mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }}>
            {p.name}: {typeof p.value === 'number' && (p.name.toLowerCase().includes('revenue') || p.name.toLowerCase().includes('sales') || p.name.toLowerCase().includes('profit')) ? `৳${p.value.toLocaleString()}` : p.value}
          </p>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title">Dashboard</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Store overview & performance metrics</p>
        </div>
        <div className="flex gap-2 bg-slate-100 dark:bg-dark-700 p-1 rounded-lg">
          {['daily', 'weekly', 'monthly'].map(r => (
            <button key={r} onClick={() => setTimeRange(r)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium capitalize transition-all ${timeRange === r ? 'bg-white dark:bg-dark-800 text-dark dark:text-slate-100 shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}>
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpiCards.map((k, i) => (
          <StatCard key={i} {...k} value={k.value} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-dark dark:text-slate-100">Sales Analytics</h3>
            <span className="text-xs text-slate-400 capitalize">{timeRange === 'daily' ? 'Last 7 days' : timeRange === 'weekly' ? 'Last 6 weeks' : 'Last 6 months'}</span>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={salesChart.length ? salesChart : [{ period: 'No data', sales: 0, orders: 0 }]} onClick={handleChartClick}>
              <defs>
                <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="ordersGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:opacity-10" />
              <XAxis dataKey="period" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `৳${v >= 1000 ? `${(v / 1000).toFixed(1)}K` : v}`} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#94a3b8', strokeDasharray: '4 4' }} />
              <Area yAxisId="left" type="monotone" dataKey="sales" name="Sales Revenue" stroke="#2563EB" strokeWidth={2} fill="url(#salesGrad)" dot={{ r: 4, fill: '#2563EB', cursor: 'pointer' }} activeDot={{ r: 6, fill: '#2563EB', stroke: '#fff', strokeWidth: 2 }} />
              <Area yAxisId="right" type="monotone" dataKey="orders" name="Orders" stroke="#10B981" strokeWidth={2} fill="url(#ordersGrad)" dot={{ r: 4, fill: '#10B981', cursor: 'pointer' }} activeDot={{ r: 6, fill: '#10B981', stroke: '#fff', strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-dark dark:text-slate-100">Stock Alerts</h3>
            <FiAlertTriangle size={16} className="text-warning-500" />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-warning-50 dark:bg-warning-500/10">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-warning-500" />
                <span className="text-sm text-dark dark:text-slate-200">Low Stock</span>
              </div>
              <span className="font-bold text-warning-600 dark:text-warning-400">{lowStockCount}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-danger-50 dark:bg-danger-500/10">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-danger-500" />
                <span className="text-sm text-dark dark:text-slate-200">Out of Stock</span>
              </div>
              <span className="font-bold text-danger-600 dark:text-danger-400">{outOfStockCount}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-success-50 dark:bg-success-500/10">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-success-500" />
                <span className="text-sm text-dark dark:text-slate-200">In Stock</span>
              </div>
              <span className="font-bold text-success-600 dark:text-success-400">{inStockCount}</span>
            </div>
          </div>
          <div className="mt-5">
            <h4 className="text-sm font-semibold text-dark dark:text-slate-100 mb-3 capitalize">{timeRange} Stats</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-dark-700">
                <p className="text-xs text-slate-400">Revenue</p>
                <p className="font-bold text-primary-600 dark:text-primary-400">৳{(stats?.[revenueKey] || 0).toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-dark-700">
                <p className="text-xs text-slate-400">Orders</p>
                <p className="font-bold text-dark dark:text-slate-100">{stats?.[ordersKey] || 0}</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Sales Performance Bar Chart */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-dark dark:text-slate-100">Sales Performance</h3>
          <span className="text-xs text-slate-400 capitalize">{timeRange === 'daily' ? 'Daily breakdown' : timeRange === 'weekly' ? 'Weekly breakdown' : 'Monthly breakdown'}</span>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={barData.length ? barData : [{ period: 'No data', sales: 0, orders: 0, expenses: 0 }]} onClick={handleChartClick}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:opacity-10" />
            <XAxis dataKey="period" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `৳${v >= 1000 ? `${(v / 1000).toFixed(1)}K` : v}`} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f1f5f9', className: 'dark:opacity-10' }} />
            <Bar dataKey="sales" name="Revenue" radius={[4, 4, 0, 0]} maxBarSize={40}>
              {barData.map((_, i) => <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />)}
            </Bar>
            <Bar dataKey="expenses" name="Expenses" radius={[4, 4, 0, 0]} maxBarSize={40} fill="#EF4444" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-5">
          <h3 className="font-semibold text-dark dark:text-slate-100 mb-4">Top Selling Products</h3>
          <div className="space-y-3">
            {(topProducts.length ? topProducts : []).map((p, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-dark-700">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-lg bg-primary-600 text-white text-xs flex items-center justify-center font-bold">{i + 1}</span>
                  <div>
                    <p className="text-sm font-medium text-dark dark:text-slate-200">{p.name}</p>
                    <p className="text-xs text-slate-400">{p.totalSold} units sold</p>
                  </div>
                </div>
                <span className="font-semibold text-primary-600 dark:text-primary-400">৳{(p.revenue || 0).toLocaleString()}</span>
              </div>
            ))}
            {!topProducts.length && <p className="text-sm text-slate-400 text-center py-4">No sales data yet</p>}
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="font-semibold text-dark dark:text-slate-100 mb-4">Recent Transactions</h3>
          <div className="space-y-2">
            {(recentOrders.length ? recentOrders : []).slice(0, 5).map((o) => (
              <div key={o.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-dark-700/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-500/20 flex items-center justify-center">
                    <FiShoppingCart size={14} className="text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-dark dark:text-slate-200">{o.customerName || 'Walk-in Customer'}</p>
                    <p className="text-xs text-slate-400">{o.orderNo || `#${o.id}`} · {o.createdAt ? format(new Date(o.createdAt), 'MMM dd, h:mm a') : ''}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-dark dark:text-slate-100">৳{(o.total || 0).toLocaleString()}</p>
                  <StatusBadge status={o.status} />
                </div>
              </div>
            ))}
            {!recentOrders.length && <p className="text-sm text-slate-400 text-center py-4">No transactions yet</p>}
          </div>
        </Card>
      </div>
    </div>
  )
}
