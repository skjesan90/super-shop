import { useState, useEffect } from 'react'
import { FiPlus, FiEdit2, FiTrash2, FiTruck, FiPhone, FiMail, FiMapPin } from 'react-icons/fi'
import { Card, Button, Modal, Input, Table, Td, Pagination, SearchBar, ConfirmDialog, EmptyState, Avatar } from '../../components/ui/index.jsx'
import { useForm } from 'react-hook-form'
import { supplierService } from '../../services/api'
import toast from 'react-hot-toast'
import clsx from 'clsx'

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [view, setView] = useState('table')
  const PER_PAGE = 8

  const { register, handleSubmit, reset } = useForm({ defaultValues: { name: '', phone: '', email: '', address: '' } })

  useEffect(() => {
    if (modalOpen) {
      if (editItem) {
        reset({ name: editItem.name, phone: editItem.phone, email: editItem.email || '', address: editItem.address || '' })
      } else {
        reset({ name: '', phone: '', email: '', address: '' })
      }
    }
  }, [modalOpen, editItem, reset])

  useEffect(() => {
    supplierService.getAll().then(({ data }) => setSuppliers(Array.isArray(data?.data) ? data.data : [])).catch(() => toast.error('Failed to load suppliers')).finally(() => setLoading(false))
  }, [])

  const filtered = (suppliers || []).filter(s => s && (
    s.name && s.name.toLowerCase().includes(search.toLowerCase()) || s.phone && s.phone.includes(search)
  ))
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  const openAdd = () => { setEditItem(null); setModalOpen(true) }
  const openEdit = (s) => { setEditItem(s); setModalOpen(true) }

  const onSubmit = async (data) => {
    try {
      if (editItem) {
        const { data: res } = await supplierService.update(editItem.id, data)
        if (res?.data) setSuppliers(prev => prev.map(s => s.id === editItem.id ? res.data : s))
        toast.success('Supplier updated!')
      } else {
        const { data: res } = await supplierService.create(data)
        if (res?.data) setSuppliers(prev => [res.data, ...prev])
        toast.success('Supplier added!')
      }
      setModalOpen(false)
    } catch { toast.error('Operation failed') }
  }

  const handleDelete = async () => {
    try { await supplierService.delete(deleteId); setSuppliers(prev => prev.filter(s => s.id !== deleteId)); toast.success('Supplier deleted!') } catch { toast.error('Delete failed') }
    setDeleteId(null)
  }

  const totalPurchases = suppliers.reduce((s, sup) => s + (sup.totalPurchases || 0), 0)

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" /></div>

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="section-title">Suppliers</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Manage supplier relationships & purchase orders</p>
        </div>
        <Button variant="primary" onClick={openAdd}><FiPlus size={16} /> Add Supplier</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Suppliers', value: suppliers.length, color: 'text-primary-600', icon: '🚛' },
          { label: 'Active', value: suppliers.filter(s => s.status === 'Active').length, color: 'text-success-500', icon: '✅' },
          { label: 'Total Purchases', value: `৳${totalPurchases.toLocaleString()}`, color: 'text-warning-500', icon: '💰' },
          { label: 'Avg per Supplier', value: `৳${suppliers.length ? Math.round(totalPurchases / suppliers.length).toLocaleString() : 0}`, color: 'text-purple-500', icon: '📊' },
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
        <SearchBar value={search} onChange={v => { setSearch(v); setPage(1) }} placeholder="Search suppliers..." />
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
          {paginated.length === 0 ? (
            <div className="col-span-full"><EmptyState icon={FiTruck} title="No suppliers found" description="Add your first supplier" action={<Button variant="primary" onClick={openAdd}><FiPlus size={16} />Add Supplier</Button>} /></div>
          ) : paginated.map(s => (
            <Card key={s.id} className="p-5 hover:shadow-card-hover transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <Avatar name={s.name} size="lg" />
                <span className={clsx('text-xs font-medium px-2 py-0.5 rounded-full', s.status === 'Active' ? 'badge-success' : 'badge-warning')}>{s.status}</span>
              </div>
              <h3 className="font-semibold text-dark dark:text-slate-100 mb-1">{s.name}</h3>
              <div className="space-y-1.5 text-sm text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-2"><FiPhone size={13} /><span>{s.phone}</span></div>
                <div className="flex items-center gap-2"><FiMail size={13} /><span className="truncate">{s.email}</span></div>
                <div className="flex items-center gap-2"><FiMapPin size={13} /><span className="truncate">{s.address}</span></div>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-dark-700 grid grid-cols-2 gap-2 text-center">
                <div>
                  <p className="text-xs text-slate-400">Total Purchases</p>
                  <p className="font-bold text-dark dark:text-slate-100 text-sm">৳{(s.totalPurchases || 0).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Products</p>
                  <p className="font-bold text-primary-600 text-sm">{(s.products ? (Array.isArray(s.products) ? s.products.length : 1) : 0)}</p>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={() => openEdit(s)} className="flex-1 text-xs py-1.5 rounded-lg bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 font-medium hover:bg-primary-100 transition-colors">Edit</button>
                <button onClick={() => setDeleteId(s.id)} className="flex-1 text-xs py-1.5 rounded-lg bg-danger-50 dark:bg-danger-500/10 text-danger-500 font-medium hover:bg-danger-100 transition-colors">Delete</button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <Table headers={['Supplier', 'Phone', 'Email', 'Address', 'Total Purchases', 'Products', 'Status', 'Actions']}>
            {paginated.length === 0 ? (
              <tr><td colSpan={8}><EmptyState icon={FiTruck} title="No suppliers found" description="Add your first supplier" action={<Button variant="primary" onClick={openAdd}><FiPlus size={16} />Add Supplier</Button>} /></td></tr>
            ) : paginated.map(s => (
              <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-dark-700/50 transition-colors">
                <Td>
                  <div className="flex items-center gap-3">
                    <Avatar name={s.name} />
                    <div>
                      <p className="font-medium text-dark dark:text-slate-200">{s.name}</p>
                      <p className="text-xs text-slate-400">Since {s.createdAt ? new Date(s.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }) : 'N/A'}</p>
                    </div>
                  </div>
                </Td>
                <Td>{s.phone}</Td>
                <Td>{s.email}</Td>
                <Td>{s.address}</Td>
                <Td className="font-semibold text-primary-600 dark:text-primary-400">৳{(s.totalPurchases || 0).toLocaleString()}</Td>
                <Td>{s.products ? (Array.isArray(s.products) ? s.products.length : 1) : 0}</Td>
                <Td><span className={s.status === 'Active' ? 'badge-success' : 'badge-warning'}>{s.status || 'Active'}</span></Td>
                <Td>
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(s)} className="p-1.5 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-500/10 text-primary-600 dark:text-primary-400"><FiEdit2 size={15} /></button>
                    <button onClick={() => setDeleteId(s.id)} className="p-1.5 rounded-lg hover:bg-danger-50 dark:hover:bg-danger-500/10 text-danger-500"><FiTrash2 size={15} /></button>
                  </div>
                </Td>
              </tr>
            ))}
          </Table>
          <div className="px-4 pb-4"><Pagination page={page} total={filtered.length} perPage={PER_PAGE} onChange={setPage} /></div>
        </Card>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Edit Supplier' : 'Add Supplier'} size="md">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Supplier Name *" {...register('name')} placeholder="FreshFarm Suppliers" />
          <Input label="Phone *" {...register('phone')} placeholder="01700-000000" />
          <Input label="Email" type="email" {...register('email')} placeholder="supplier@email.com" />
          <Input label="Address" {...register('address')} placeholder="City, Bangladesh" />
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">{editItem ? 'Update' : 'Add Supplier'}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Supplier" message="This will permanently remove the supplier." />
    </div>
  )
}
