import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchProducts, adjustStock } from '../../store/slices/productSlice'
import { FiAlertTriangle, FiPackage, FiCheckCircle, FiXCircle, FiClock, FiEdit2 } from 'react-icons/fi'
import { Card, Button, Modal, Input, Table, Td, SearchBar } from '../../components/ui/index.jsx'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import clsx from 'clsx'
import { format, isBefore, addDays } from 'date-fns'

export default function InventoryPage() {
  const dispatch = useDispatch()
  const products = useSelector(s => s.products.items)
  useEffect(() => { dispatch(fetchProducts()) }, [dispatch])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [adjustModal, setAdjustModal] = useState(null)
  const { register, handleSubmit, reset } = useForm()

  const today = new Date()
  const expiringSoon = products.filter(p => p.expiryDate && isBefore(new Date(p.expiryDate), addDays(today, 30)) && isBefore(today, new Date(p.expiryDate)))
  const expired = products.filter(p => p.expiryDate && isBefore(new Date(p.expiryDate), today))
  const outOfStock = products.filter(p => p.quantity === 0)
  const lowStock = products.filter(p => p.quantity > 0 && p.quantity <= 10)

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase())
    if (filter === 'low') return matchSearch && p.quantity > 0 && p.quantity <= 10
    if (filter === 'out') return matchSearch && p.quantity === 0
    if (filter === 'expiring') return matchSearch && expiringSoon.find(e => e.id === p.id)
    if (filter === 'expired') return matchSearch && expired.find(e => e.id === p.id)
    return matchSearch
  })

  const onAdjust = (data) => {
    dispatch(adjustStock({ id: adjustModal.id, quantity: parseInt(data.quantity) }))
    toast.success(`Stock updated for ${adjustModal.name}`)
    setAdjustModal(null)
    reset()
  }

  const getStockBar = (qty) => {
    const max = 100
    const pct = Math.min((qty / max) * 100, 100)
    const color = qty === 0 ? 'bg-danger-500' : qty <= 10 ? 'bg-warning-500' : 'bg-success-500'
    return { pct, color }
  }

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="section-title">Inventory</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Track stock levels, alerts, and expirations</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Products', value: products.length, icon: FiPackage, color: 'text-primary-600', bg: 'bg-primary-100 dark:bg-primary-500/20', onClick: () => setFilter('all') },
          { label: 'Low Stock', value: lowStock.length, icon: FiAlertTriangle, color: 'text-warning-600', bg: 'bg-warning-100 dark:bg-warning-500/20', onClick: () => setFilter('low') },
          { label: 'Out of Stock', value: outOfStock.length, icon: FiXCircle, color: 'text-danger-600', bg: 'bg-danger-100 dark:bg-danger-500/20', onClick: () => setFilter('out') },
          { label: 'Expiring Soon', value: expiringSoon.length, icon: FiClock, color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-500/20', onClick: () => setFilter('expiring') },
        ].map((s, i) => (
          <Card key={i} className="p-4 flex items-center gap-4 cursor-pointer hover:shadow-card-hover transition-shadow" onClick={s.onClick}>
            <div className={clsx('w-12 h-12 rounded-2xl flex items-center justify-center', s.bg)}>
              <s.icon size={22} className={s.color} />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">{s.label}</p>
              <p className={clsx('text-2xl font-bold', s.color)}>{s.value}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Expired Warning Banner */}
      {expired.length > 0 && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-danger-50 dark:bg-danger-500/10 border border-danger-200 dark:border-danger-500/30">
          <FiAlertTriangle size={20} className="text-danger-500 flex-shrink-0" />
          <div>
            <p className="font-semibold text-danger-700 dark:text-danger-400">⚠ {expired.length} Expired Product{expired.length > 1 ? 's' : ''} Detected!</p>
            <p className="text-sm text-danger-600 dark:text-danger-500">{expired.map(e => e.name).join(', ')} — Please remove from shelf immediately.</p>
          </div>
          <button onClick={() => setFilter('expired')} className="ml-auto text-sm font-medium text-danger-600 dark:text-danger-400 hover:underline whitespace-nowrap">View All</button>
        </div>
      )}

      {/* Filters + Search */}
      <Card className="p-4 flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'all', label: 'All Products' },
            { key: 'low', label: `Low Stock (${lowStock.length})` },
            { key: 'out', label: `Out of Stock (${outOfStock.length})` },
            { key: 'expiring', label: `Expiring Soon (${expiringSoon.length})` },
            { key: 'expired', label: `Expired (${expired.length})` },
          ].map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className={clsx('px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                filter === f.key ? 'bg-primary-600 text-white' : 'bg-slate-100 dark:bg-dark-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200')}>
              {f.label}
            </button>
          ))}
        </div>
        <SearchBar value={search} onChange={setSearch} placeholder="Search products..." />
      </Card>

      {/* Inventory Table */}
      <Card>
        <Table headers={['Product', 'SKU', 'Category', 'Stock', 'Stock Level', 'Expiry Date', 'Status', 'Action']}>
          {filtered.map(p => {
            const { pct, color } = getStockBar(p.quantity)
            const isExpired = p.expiryDate && isBefore(new Date(p.expiryDate), today)
            const isExpiringSoon = expiringSoon.find(e => e.id === p.id)
            return (
              <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-dark-700/50 transition-colors">
                <Td>
                  <div>
                    <p className="font-medium text-dark dark:text-slate-200">{p.name}</p>
                    <p className="text-xs text-slate-400">{p.brand}</p>
                  </div>
                </Td>
                <Td><span className="font-mono text-xs text-slate-500">{p.sku}</span></Td>
                <Td><span className="badge-primary">{p.category}</span></Td>
                <Td>
                  <span className={clsx('font-bold text-base', p.quantity === 0 ? 'text-danger-500' : p.quantity <= 10 ? 'text-warning-500' : 'text-success-500')}>
                    {p.quantity} <span className="text-xs font-normal text-slate-400">{p.unit}</span>
                  </span>
                </Td>
                <Td className="min-w-[120px]">
                  <div className="space-y-1">
                    <div className="h-2 rounded-full bg-slate-100 dark:bg-dark-700 overflow-hidden">
                      <div className={clsx('h-full rounded-full transition-all', color)} style={{ width: `${pct}%` }} />
                    </div>
                    <p className="text-xs text-slate-400">{pct.toFixed(0)}% capacity</p>
                  </div>
                </Td>
                <Td>
                  <span className={clsx('text-sm', isExpired ? 'text-danger-500 font-semibold' : isExpiringSoon ? 'text-warning-500 font-medium' : 'text-slate-500 dark:text-slate-400')}>
                    {p.expiryDate || '—'}
                  </span>
                </Td>
                <Td>
                  {isExpired ? <span className="badge-danger">Expired</span>
                    : isExpiringSoon ? <span className="badge-warning">Expiring Soon</span>
                    : p.quantity === 0 ? <span className="badge-danger">Out of Stock</span>
                    : p.quantity <= 10 ? <span className="badge-warning">Low Stock</span>
                    : <span className="badge-success">In Stock</span>}
                </Td>
                <Td>
                  <button onClick={() => { setAdjustModal(p); reset({ quantity: p.quantity }) }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 text-xs font-medium hover:bg-primary-100 transition-colors">
                    <FiEdit2 size={13} /> Adjust
                  </button>
                </Td>
              </tr>
            )
          })}
        </Table>
      </Card>

      {/* Adjust Modal */}
      <Modal isOpen={!!adjustModal} onClose={() => setAdjustModal(null)} title="Adjust Stock" size="sm">
        {adjustModal && (
          <form onSubmit={handleSubmit(onAdjust)} className="space-y-4">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-dark-700">
              <p className="font-semibold text-dark dark:text-slate-100">{adjustModal.name}</p>
              <p className="text-sm text-slate-400">Current Stock: <strong className="text-dark dark:text-slate-200">{adjustModal.quantity} {adjustModal.unit}</strong></p>
            </div>
            <Input label="New Quantity" type="number" min="0" {...register('quantity', { required: true, min: 0 })} />
            <div className="flex gap-3 justify-end">
              <Button variant="secondary" type="button" onClick={() => setAdjustModal(null)}>Cancel</Button>
              <Button variant="primary" type="submit">Update Stock</Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  )
}
