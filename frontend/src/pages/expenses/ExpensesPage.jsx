import { useState, useEffect, useCallback } from 'react'
import { FiPlus, FiTrash2, FiDollarSign } from 'react-icons/fi'
import { Card, Button, Modal, Input, Select, Table, Td, SearchBar, StatusBadge, ConfirmDialog } from '../../components/ui/index.jsx'
import { expenseService } from '../../services/api'
import { useForm } from 'react-hook-form'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const CATEGORIES = ['Shop Rent', 'Utility Bills', 'Salaries', 'Transportation', 'Miscellaneous']
const COLORS = ['#2563EB', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899']

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteId, setDeleteId] = useState(null)
  const [activeIndex, setActiveIndex] = useState(null)
  const { register, handleSubmit, reset } = useForm()

  useEffect(() => {
    expenseService.getAll().then(({ data }) => setExpenses(data.data)).catch(() => toast.error('Failed to load expenses')).finally(() => setLoading(false))
  }, [])

  const filtered = expenses.filter(e => {
    const matchSearch = e.category.toLowerCase().includes(search.toLowerCase()) || (e.description || '').toLowerCase().includes(search.toLowerCase())
    const matchCat = catFilter === 'all' || e.category === catFilter
    return matchSearch && matchCat
  })

  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0)
  const paidExpenses = expenses.filter(e => e.status === 'Paid').reduce((s, e) => s + e.amount, 0)
  const pendingExpenses = expenses.filter(e => e.status === 'Pending').reduce((s, e) => s + e.amount, 0)

  const chartData = CATEGORIES.map((cat, i) => ({
    name: cat,
    value: expenses.filter(e => e.category === cat).reduce((s, e) => s + e.amount, 0),
    color: COLORS[i],
  })).filter(d => d.value > 0)

  const onSubmit = async (formData) => {
    try {
      const { data } = await expenseService.create(formData)
      setExpenses(prev => [data.data, ...prev])
      toast.success('Expense recorded!')
      setModalOpen(false)
      reset()
    } catch { toast.error('Failed to add expense') }
  }

  const handleDelete = async () => {
    try { await expenseService.delete(deleteId); setExpenses(prev => prev.filter(e => e.id !== deleteId)); toast.success('Expense deleted!') } catch { toast.error('Delete failed') }
    setDeleteId(null)
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" /></div>

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="section-title">Expense Management</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Track and manage all business expenses</p>
        </div>
        <Button variant="primary" onClick={() => setModalOpen(true)}><FiPlus size={16} /> Add Expense</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Expenses', value: `৳${totalExpenses.toLocaleString()}`, color: 'text-primary-600', sub: 'All time' },
          { label: 'Paid', value: `৳${paidExpenses.toLocaleString()}`, color: 'text-success-500', sub: `${expenses.filter(e => e.status === 'Paid').length} transactions` },
          { label: 'Pending', value: `৳${pendingExpenses.toLocaleString()}`, color: 'text-warning-500', sub: `${expenses.filter(e => e.status === 'Pending').length} transactions` },
        ].map((s, i) => (
          <Card key={i} className="p-5">
            <p className="text-sm text-slate-500 dark:text-slate-400">{s.label}</p>
            <p className={`text-3xl font-bold mt-1 ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-400 mt-1">{s.sub}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 p-4">
          <div className="flex flex-wrap gap-2 items-center justify-between mb-4">
            <div className="flex gap-2">
              <button onClick={() => setCatFilter('all')} className={clsx('px-3 py-1.5 rounded-lg text-sm font-medium transition-colors', catFilter === 'all' ? 'bg-primary-600 text-white' : 'bg-slate-100 dark:bg-dark-700 text-slate-600 dark:text-slate-400')}>All</button>
              {CATEGORIES.map(c => (
                <button key={c} onClick={() => setCatFilter(c)} className={clsx('px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap', catFilter === c ? 'bg-primary-600 text-white' : 'bg-slate-100 dark:bg-dark-700 text-slate-600 dark:text-slate-400')}>{c}</button>
              ))}
            </div>
            <SearchBar value={search} onChange={setSearch} placeholder="Search..." />
          </div>
          <Table headers={['Category', 'Description', 'Amount', 'Date', 'Status', '']}>
            {filtered.map(e => (
              <tr key={e.id} className="hover:bg-slate-50 dark:hover:bg-dark-700/50 transition-colors">
                <Td>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-500/20 flex items-center justify-center">
                      <FiDollarSign size={14} className="text-primary-600 dark:text-primary-400" />
                    </div>
                    <span className="font-medium text-dark dark:text-slate-200">{e.category}</span>
                  </div>
                </Td>
                <Td className="text-slate-500 dark:text-slate-400 max-w-xs truncate">{e.description}</Td>
                <Td className="font-bold text-dark dark:text-slate-100">৳{e.amount.toLocaleString()}</Td>
                <Td className="text-slate-500 dark:text-slate-400">{e.date}</Td>
                <Td><StatusBadge status={e.status} /></Td>
                <Td>
                  <button onClick={() => setDeleteId(e.id)} className="p-1.5 rounded-lg hover:bg-danger-50 dark:hover:bg-danger-500/10 text-danger-500">
                    <FiTrash2 size={15} />
                  </button>
                </Td>
              </tr>
            ))}
          </Table>
        </Card>

        <Card className="p-5">
          <h3 className="font-semibold text-dark dark:text-slate-100 mb-4">Expense Breakdown</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={chartData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3}
                dataKey="value" isAnimationActive={true} animationBegin={0} animationDuration={800}
                animationEasing="ease-out"
                onMouseEnter={(_, i) => setActiveIndex(i)} onMouseLeave={() => setActiveIndex(null)}>
                {chartData.map((e, i) => (
                  <Cell key={i} fill={e.color}
                    stroke={activeIndex === i ? '#fff' : 'transparent'}
                    strokeWidth={activeIndex === i ? 3 : 0}
                    style={{ filter: activeIndex !== null && activeIndex !== i ? 'opacity(0.5)' : 'none', transition: 'all 0.3s ease', cursor: 'pointer' }}
                  />
                ))}
              </Pie>
              <Tooltip formatter={v => [`৳${v.toLocaleString()}`, '']} />
              <text x="50%" y="47%" textAnchor="middle" className="text-lg font-bold fill-dark dark:fill-slate-100" style={{ fontSize: 20 }}>৳{totalExpenses.toLocaleString()}</text>
              <text x="50%" y="58%" textAnchor="middle" className="fill-slate-400" style={{ fontSize: 10 }}>Total</text>
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {chartData.map((d, i) => (
              <div key={i} className="flex items-center justify-between text-sm px-1 py-1 rounded-lg transition-colors cursor-pointer hover:bg-slate-50 dark:hover:bg-dark-700/50"
                onMouseEnter={() => setActiveIndex(i)} onMouseLeave={() => setActiveIndex(null)}>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full transition-transform" style={{ background: d.color, transform: activeIndex === i ? 'scale(1.4)' : 'scale(1)' }} />
                  <span className="text-slate-500 dark:text-slate-400">{d.name}</span>
                </div>
                <span className="font-medium text-dark dark:text-slate-200">৳{d.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add Expense" size="md">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Select label="Category" {...register('category', { required: true })}>
            <option value="">Select Category</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </Select>
          <Input label="Description" {...register('description')} placeholder="e.g. Monthly electricity bill" />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Amount (৳)" type="number" {...register('amount', { required: true })} placeholder="5000" />
            <Input label="Date" type="date" {...register('date')} />
          </div>
          <Select label="Status" {...register('status')}>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
          </Select>
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Add Expense</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete}
        title="Delete Expense" message="This will permanently remove the expense record." />
    </div>
  )
}
