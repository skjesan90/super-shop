import { useState, useEffect } from 'react'
import { FiMapPin, FiPlus, FiEdit2, FiUsers, FiTrendingUp } from 'react-icons/fi'
import { Card, Button, Modal, Input, Avatar } from '../../components/ui/index.jsx'
import { branchService } from '../../services/api'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

export default function BranchesPage() {
  const [branches, setBranches] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const { register, handleSubmit, reset } = useForm()

  useEffect(() => {
    branchService.getAll().then(({ data }) => setBranches(data.data)).catch(() => toast.error('Failed to load branches')).finally(() => setLoading(false))
  }, [])

  const onSubmit = async (formData) => {
    try {
      const { data } = await branchService.create(formData)
      setBranches(prev => [data.data, ...prev])
      toast.success('Branch added!')
      setModalOpen(false)
      reset()
    } catch { toast.error('Failed to add branch') }
  }

  const totalRevenue = branches.reduce((s, b) => s + (b.revenue || 0), 0)
  const chartData = branches.map(b => ({ name: (b.name || '').split(' - ')[1] || b.name || '', revenue: b.revenue || 0 }))

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" /></div>

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="section-title">Branch Management</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Manage all store locations and branches</p>
        </div>
        <Button variant="primary" onClick={() => setModalOpen(true)}><FiPlus size={16} /> Add Branch</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Branches', value: branches.length, color: 'text-primary-600' },
          { label: 'Active Branches', value: branches.filter(b => b.status === 'Active').length, color: 'text-success-500' },
          { label: 'Total Revenue', value: `৳${totalRevenue.toLocaleString()}`, color: 'text-warning-500' },
        ].map((s, i) => (
          <Card key={i} className="p-5">
            <p className="text-sm text-slate-500 dark:text-slate-400">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </Card>
        ))}
      </div>

      <Card className="p-5">
        <h3 className="font-semibold text-dark dark:text-slate-100 mb-4">Branch Revenue Comparison</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData.length ? chartData : [{ name: 'No data', revenue: 0 }]}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:opacity-10" />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `৳${v / 1000}K`} />
            <Tooltip formatter={v => [`৳${Number(v).toLocaleString()}`, 'Revenue']} />
            <Bar dataKey="revenue" fill="#2563EB" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {branches.map(b => (
          <Card key={b.id} className="p-5 hover:shadow-card-hover transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-500/20 flex items-center justify-center">
                <FiMapPin size={22} className="text-primary-600 dark:text-primary-400" />
              </div>
              <div className="flex items-center gap-2">
                <span className={b.status === 'Active' ? 'badge-success' : 'badge-warning'}>{b.status}</span>
              </div>
            </div>
            <h3 className="font-semibold text-dark dark:text-slate-100 mb-1">{b.name}</h3>
            <p className="text-sm text-slate-400 mb-4">{b.location}</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-dark-700">
                <div className="flex items-center gap-1.5 mb-1">
                  <FiUsers size={13} className="text-slate-400" />
                  <p className="text-xs text-slate-400">Employees</p>
                </div>
                <p className="font-bold text-dark dark:text-slate-100">{b.employees || 0}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-dark-700">
                <div className="flex items-center gap-1.5 mb-1">
                  <FiTrendingUp size={13} className="text-slate-400" />
                  <p className="text-xs text-slate-400">Revenue</p>
                </div>
                <p className="font-bold text-primary-600 dark:text-primary-400">৳{((b.revenue || 0) / 1000).toFixed(0)}K</p>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-dark-700 flex items-center gap-2">
              <Avatar name={b.manager} size="sm" />
              <div>
                <p className="text-xs text-slate-400">Manager</p>
                <p className="text-sm font-medium text-dark dark:text-slate-200">{b.manager}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add Branch" size="md">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Branch Name" {...register('name', { required: true })} placeholder="Branch 4 - Mirpur" />
          <Input label="Location" {...register('location')} placeholder="Mirpur, Dhaka" />
          <Input label="Manager Name" {...register('manager')} placeholder="Manager Name" />
          <Input label="Phone" {...register('phone')} placeholder="01700-000000" />
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Add Branch</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
