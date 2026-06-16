import { useState, useEffect } from 'react'
import { FiPlus, FiEdit2, FiTrash2, FiUserCheck, FiPhone, FiBriefcase, FiDollarSign } from 'react-icons/fi'
import { Card, Button, Modal, Input, Select, Table, Td, SearchBar, ConfirmDialog, EmptyState, Avatar } from '../../components/ui/index.jsx'
import { useForm } from 'react-hook-form'
import { employeeService } from '../../services/api'
import toast from 'react-hot-toast'
import clsx from 'clsx'

export default function EmployeesPage() {
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [deleteId, setDeleteId] = useState(null)

  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  useEffect(() => {
    employeeService.getAll().then(({ data }) => setEmployees(data.data)).catch(() => toast.error('Failed to load employees')).finally(() => setLoading(false))
  }, [])

  const filtered = employees.filter(e => {
    const matchSearch = e.name.toLowerCase().includes(search.toLowerCase()) || (e.position || '').toLowerCase().includes(search.toLowerCase())
    const matchRole = roleFilter === 'all' || e.role === roleFilter
    return matchSearch && matchRole
  })

  const openAdd = () => { setEditItem(null); reset({ role: 'cashier' }); setModalOpen(true) }
  const openEdit = (e) => { setEditItem(e); reset(e); setModalOpen(true) }

  const onSubmit = async (formData) => {
    try {
      const payload = { ...formData, salary: parseFloat(formData.salary) }
      if (editItem) {
        const { data } = await employeeService.update(editItem.id, payload)
        setEmployees(prev => prev.map(e => e.id === editItem.id ? data.data : e))
        toast.success('Employee updated!')
      } else {
        const { data } = await employeeService.create(payload)
        setEmployees(prev => [data.data, ...prev])
        toast.success('Employee added!')
      }
      setModalOpen(false)
    } catch { toast.error('Operation failed') }
  }

  const handleDelete = async () => {
    try { await employeeService.delete(deleteId); setEmployees(prev => prev.filter(e => e.id !== deleteId)); toast.success('Employee removed!') } catch { toast.error('Delete failed') }
    setDeleteId(null)
  }

  const roleColor = { admin: 'badge-danger', manager: 'badge-primary', cashier: 'badge-success' }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" /></div>

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="section-title">Employees</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Manage staff, roles & salaries</p>
        </div>
        <Button variant="primary" onClick={openAdd}><FiPlus size={16} /> Add Employee</Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Staff', value: employees.length, color: 'text-primary-600' },
          { label: 'Managers', value: employees.filter(e => e.role === 'manager').length, color: 'text-warning-500' },
          { label: 'Cashiers', value: employees.filter(e => e.role === 'cashier').length, color: 'text-success-500' },
          { label: 'Monthly Payroll', value: `৳${employees.reduce((s, e) => s + (e.salary || 0), 0).toLocaleString()}`, color: 'text-danger-500' },
        ].map((s, i) => (
          <Card key={i} className="p-4 flex items-center gap-3">
            <span className="text-2xl">👥</span>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">{s.label}</p>
              <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-4 flex flex-wrap gap-3 items-center justify-between">
        <div className="flex gap-2">
          {['all', 'admin', 'manager', 'cashier'].map(r => (
            <button key={r} onClick={() => setRoleFilter(r)}
              className={clsx('px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors',
                roleFilter === r ? 'bg-primary-600 text-white' : 'bg-slate-100 dark:bg-dark-700 text-slate-600 dark:text-slate-400')}>
              {r === 'all' ? 'All Roles' : r}
            </button>
          ))}
        </div>
        <SearchBar value={search} onChange={setSearch} placeholder="Search employees..." />
      </Card>

      <Card>
        <Table headers={['Employee', 'Position', 'Role', 'Phone', 'Salary', 'Attendance', 'Branch', 'Status', 'Actions']}>
          {filtered.length === 0 ? (
            <tr><td colSpan={9}><EmptyState icon={FiUserCheck} title="No employees found" description="Add your first employee" action={<Button variant="primary" onClick={openAdd}><FiPlus size={16} />Add Employee</Button>} /></td></tr>
          ) : filtered.map(e => (
            <tr key={e.id} className="hover:bg-slate-50 dark:hover:bg-dark-700/50 transition-colors">
              <Td>
                <div className="flex items-center gap-3">
                  <Avatar name={e.name} />
                  <div>
                    <p className="font-medium text-dark dark:text-slate-200">{e.name}</p>
                    <p className="text-xs text-slate-400">{e.email}</p>
                  </div>
                </div>
              </Td>
              <Td>{e.position}</Td>
              <Td><span className={roleColor[e.role] || 'badge-primary'}>{e.role}</span></Td>
              <Td>{e.phone}</Td>
              <Td className="font-semibold text-success-600 dark:text-success-400">৳{(e.salary || 0).toLocaleString()}</Td>
              <Td>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 rounded-full bg-slate-100 dark:bg-dark-700 overflow-hidden w-16">
                    <div className="h-full rounded-full bg-success-500" style={{ width: `${e.attendance || 100}%` }} />
                  </div>
                  <span className="text-sm font-medium text-dark dark:text-slate-200">{e.attendance || 100}%</span>
                </div>
              </Td>
              <Td>{e.branchName || '-'}</Td>
              <Td><span className={e.status === 'Active' ? 'badge-success' : 'badge-warning'}>{e.status}</span></Td>
              <Td>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(e)} className="p-1.5 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-500/10 text-primary-600 dark:text-primary-400"><FiEdit2 size={15} /></button>
                  <button onClick={() => setDeleteId(e.id)} className="p-1.5 rounded-lg hover:bg-danger-50 dark:hover:bg-danger-500/10 text-danger-500"><FiTrash2 size={15} /></button>
                </div>
              </Td>
            </tr>
          ))}
        </Table>
      </Card>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Edit Employee' : 'Add Employee'} size="md">
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-2 gap-4">
          <div className="col-span-2"><Input label="Full Name" error={errors.name?.message} {...register('name', { required: 'Required' })} placeholder="Rahman Ahmed" /></div>
          <Input label="Position" {...register('position')} placeholder="Store Manager" />
          <Select label="Role" {...register('role', { required: 'Required' })} error={errors.role?.message}>
            <option value="">Select Role</option>
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="cashier">Cashier</option>
          </Select>
          <Input label="Phone" {...register('phone')} placeholder="01700-000000" />
          <Input label="Email" type="email" {...register('email')} placeholder="employee@shop.com" />
          <Input label="Monthly Salary (৳)" type="number" {...register('salary', { required: 'Required' })} error={errors.salary?.message} placeholder="20000" />
          <div className="col-span-2 flex gap-3 justify-end pt-2">
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">{editItem ? 'Update' : 'Add Employee'}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete}
        title="Remove Employee" message="This will permanently remove the employee record." />
    </div>
  )
}
