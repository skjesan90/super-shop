import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchCustomers, addCustomer, updateCustomer, deleteCustomer } from '../../store/slices/customerSlice'
import { FiPlus, FiEdit2, FiTrash2, FiUsers, FiPhone, FiMail, FiMapPin, FiAward } from 'react-icons/fi'
import { Card, Button, Modal, Input, Table, Td, Pagination, SearchBar, ConfirmDialog, EmptyState, Avatar } from '../../components/ui/index.jsx'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import clsx from 'clsx'

export default function CustomersPage() {
  const dispatch = useDispatch()
  const customers = useSelector(s => s.customers.items)
  useEffect(() => { dispatch(fetchCustomers()) }, [dispatch])
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [view, setView] = useState('table')
  const PER_PAGE = 8

  const { register, handleSubmit, reset } = useForm({ defaultValues: { name: '', phone: '', email: '', address: '' } })

  useEffect(() => {
    if (modalOpen) reset(editItem ? { name: editItem.name, phone: editItem.phone, email: editItem.email || '', address: editItem.address || '' } : { name: '', phone: '', email: '', address: '' })
  }, [modalOpen])

  const filtered = (customers || []).filter(c =>
    c && c.name && c.name.toLowerCase().includes(search.toLowerCase()) ||
    c && c.phone && c.phone.includes(search) ||
    c && c.email && c.email.toLowerCase().includes(search.toLowerCase())
  )
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  const openAdd = () => { setEditItem(null); setModalOpen(true) }
  const openEdit = (c) => { setEditItem(c); setModalOpen(true) }

  const onSubmit = async (data) => {
    try {
      console.log('Customer form data:', JSON.stringify(data))
      if (editItem) {
        await dispatch(updateCustomer({ ...editItem, ...data })).unwrap()
        toast.success('Customer updated!')
      } else {
        await dispatch(addCustomer(data)).unwrap()
        toast.success('Customer added!')
      }
      setModalOpen(false)
    } catch (err) {
      console.error('Customer submit error:', err)
      toast.error(typeof err === 'string' ? err : JSON.stringify(err))
    }
  }

  const totalRevenue = customers.reduce((s, c) => s + (c.totalPurchases || 0), 0)

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="section-title">Customers</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Manage customer relationships & loyalty</p>
        </div>
        <Button variant="primary" onClick={openAdd}><FiPlus size={16} /> Add Customer</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Customers', value: customers.length, color: 'text-primary-600', icon: '👥' },
          { label: 'Active', value: customers.filter(c => c.status === 'Active').length, color: 'text-success-500', icon: '✅' },
          { label: 'Total Revenue', value: `৳${totalRevenue.toLocaleString()}`, color: 'text-warning-500', icon: '💰' },
          { label: 'Total Loyalty Pts', value: customers.reduce((s, c) => s + (c.loyaltyPoints || 0), 0), color: 'text-purple-500', icon: '⭐' },
        ].map((s, i) => (
          <Card key={i} className="p-4 flex items-center gap-3">
            <span className="text-2xl">{s.icon}</span>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">{s.label}</p>
              <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Toolbar */}
      <Card className="p-4 flex flex-wrap gap-3 items-center justify-between">
        <SearchBar value={search} onChange={v => { setSearch(v); setPage(1) }} placeholder="Search customers..." />
        <div className="flex gap-2">
          {['table', 'grid'].map(v => (
            <button key={v} onClick={() => setView(v)}
              className={clsx('px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                view === v ? 'bg-primary-600 text-white' : 'bg-slate-100 dark:bg-dark-700 text-slate-600 dark:text-slate-400')}>
              {v === 'table' ? '☰ Table' : '⊞ Grid'}
            </button>
          ))}
        </div>
      </Card>

      {/* Grid View */}
      {view === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {paginated.map(c => (
            <Card key={c.id} className="p-5 hover:shadow-card-hover transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <Avatar name={c.name} size="lg" />
                <span className={clsx('text-xs font-medium px-2 py-0.5 rounded-full', c.status === 'Active' ? 'badge-success' : 'badge-warning')}>{c.status}</span>
              </div>
              <h3 className="font-semibold text-dark dark:text-slate-100 mb-1">{c.name}</h3>
              <div className="space-y-1.5 text-sm text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-2"><FiPhone size={13} /><span>{c.phone}</span></div>
                <div className="flex items-center gap-2"><FiMail size={13} /><span className="truncate">{c.email}</span></div>
                <div className="flex items-center gap-2"><FiMapPin size={13} /><span className="truncate">{c.address}</span></div>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-dark-700 grid grid-cols-2 gap-2 text-center">
                <div>
                  <p className="text-xs text-slate-400">Total Spent</p>
                  <p className="font-bold text-dark dark:text-slate-100 text-sm">৳{(c.totalPurchases || 0).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Loyalty Pts</p>
                  <p className="font-bold text-warning-500 text-sm flex items-center justify-center gap-1"><FiAward size={12} />{c.loyaltyPoints || 0}</p>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={() => openEdit(c)} className="flex-1 text-xs py-1.5 rounded-lg bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 font-medium hover:bg-primary-100 transition-colors">Edit</button>
                <button onClick={() => setDeleteId(c.id)} className="flex-1 text-xs py-1.5 rounded-lg bg-danger-50 dark:bg-danger-500/10 text-danger-500 font-medium hover:bg-danger-100 transition-colors">Delete</button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <Table headers={['Customer', 'Phone', 'Email', 'Address', 'Total Spent', 'Loyalty Pts', 'Status', 'Actions']}>
            {paginated.length === 0 ? (
              <tr><td colSpan={8}><EmptyState icon={FiUsers} title="No customers found" description="Add your first customer" action={<Button variant="primary" onClick={openAdd}><FiPlus size={16} />Add Customer</Button>} /></td></tr>
            ) : paginated.map(c => (
              <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-dark-700/50 transition-colors">
                <Td>
                  <div className="flex items-center gap-3">
                    <Avatar name={c.name} />
                    <div>
                      <p className="font-medium text-dark dark:text-slate-200">{c.name}</p>
                      <p className="text-xs text-slate-400">Since {c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }) : 'N/A'}</p>
                    </div>
                  </div>
                </Td>
                <Td>{c.phone}</Td>
                <Td>{c.email}</Td>
                <Td>{c.address}</Td>
                <Td className="font-semibold text-primary-600 dark:text-primary-400">৳{(c.totalPurchases || 0).toLocaleString()}</Td>
                <Td>
                  <span className="flex items-center gap-1 text-warning-500 font-medium"><FiAward size={13} />{c.loyaltyPoints || 0}</span>
                </Td>
                <Td><span className={c.status === 'Active' ? 'badge-success' : 'badge-warning'}>{c.status}</span></Td>
                <Td>
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(c)} className="p-1.5 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-500/10 text-primary-600 dark:text-primary-400"><FiEdit2 size={15} /></button>
                    <button onClick={() => setDeleteId(c.id)} className="p-1.5 rounded-lg hover:bg-danger-50 dark:hover:bg-danger-500/10 text-danger-500"><FiTrash2 size={15} /></button>
                  </div>
                </Td>
              </tr>
            ))}
          </Table>
          <div className="px-4 pb-4"><Pagination page={page} total={filtered.length} perPage={PER_PAGE} onChange={setPage} /></div>
        </Card>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Edit Customer' : 'Add Customer'} size="md">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Full Name *" {...register('name')} placeholder="John Doe" />
          <Input label="Phone Number *" {...register('phone')} placeholder="01700-000000" />
          <Input label="Email Address" type="email" {...register('email')} placeholder="john@email.com" />
          <Input label="Address" {...register('address')} placeholder="City, Country" />
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">{editItem ? 'Update' : 'Add Customer'}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)}
        onConfirm={() => { dispatch(deleteCustomer(deleteId)); toast.success('Customer deleted!') }}
        title="Delete Customer" message="This will permanently remove the customer record." />
    </div>
  )
}
