import { useState, useEffect } from 'react'
import { FiPlus, FiEye, FiCheckCircle, FiShoppingBag, FiCalendar, FiTrash2 } from 'react-icons/fi'
import { Card, Button, Modal, Input, Select, Table, Td, SearchBar, StatusBadge, EmptyState, Pagination } from '../../components/ui/index.jsx'
import { purchaseService, supplierService, productService } from '../../services/api'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import clsx from 'clsx'

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState({ from: '', to: '' })
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [detailModal, setDetailModal] = useState(null)
  const [receiving, setReceiving] = useState(null)
  const PER_PAGE = 5
  const { register, handleSubmit, reset, watch, setValue } = useForm()
  const [lineItems, setLineItems] = useState([])

  useEffect(() => {
    Promise.all([purchaseService.getAll(), supplierService.getAll(), productService.getAll()])
      .then(([pRes, sRes, prRes]) => {
        setPurchases(pRes.data.data || [])
        setSuppliers(sRes.data.data || [])
        setProducts(prRes.data.data || [])
      })
      .catch(() => toast.error('Failed to load purchases'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = purchases.filter(p => {
    const matchSearch = (p.poNumber || p.id || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.supplierName || p.supplier || '').toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || (p.status || '').toLowerCase() === statusFilter
    const matchDate = (!dateFilter.from || (p.createdAt || '').startsWith(dateFilter.from)) &&
      (!dateFilter.to || (p.createdAt || '').startsWith(dateFilter.to))
    return matchSearch && matchStatus && matchDate
  })
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  const totalSpend = purchases.filter(p => p.status === 'Received').reduce((s, p) => s + (p.totalAmount || p.amount || 0), 0)

  const onSubmit = async (formData) => {
    try {
      const payload = {
        supplierId: formData.supplierId,
        invoiceNo: formData.invoiceNo,
        amount: Number(formData.amount),
        notes: formData.notes,
        items: lineItems.map(it => ({
          productId: it.productId,
          name: it.name,
          qty: Number(it.qty),
          price: Number(it.price),
        })),
      }
      const { data } = await purchaseService.create(payload)
      setPurchases(prev => [data.data, ...prev])
      toast.success('Purchase order created!')
      setModalOpen(false)
      reset()
      setLineItems([])
    } catch { toast.error('Failed to create purchase order') }
  }

  const handleReceive = async (id) => {
    setReceiving(id)
    try {
      const { data } = await purchaseService.receive(id)
      setPurchases(prev => prev.map(p => p.id === id ? data.data : p))
      toast.success('Purchase marked as received — inventory updated!')
    } catch { toast.error('Failed to receive purchase') }
    setReceiving(null)
  }

  const addLineItem = () => {
    setLineItems(prev => [...prev, { productId: '', name: '', qty: 1, price: 0 }])
  }

  const updateLineItem = (index, field, value) => {
    setLineItems(prev => {
      const next = [...prev]
      next[index] = { ...next[index], [field]: value }
      if (field === 'productId') {
        const product = products.find(p => String(p.id) === String(value))
        if (product) {
          next[index].name = product.name
          next[index].price = product.buyingPrice || 0
        }
      }
      return next
    })
  }

  const removeLineItem = (index) => {
    setLineItems(prev => prev.filter((_, i) => i !== index))
  }

  const getStatusBadgeVariant = (status) => {
    if (status === 'Received') return 'success'
    if (status === 'Pending') return 'warning'
    if (status === 'Cancelled') return 'danger'
    return 'primary'
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" /></div>

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="section-title">Purchase Management</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Track supplier purchases & inventory restocking</p>
        </div>
        <Button variant="primary" onClick={() => setModalOpen(true)}><FiPlus size={16} /> New Purchase Order</Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Orders', value: purchases.length, color: 'text-primary-600' },
          { label: 'Received', value: purchases.filter(p => p.status === 'Received').length, color: 'text-success-500' },
          { label: 'Pending', value: purchases.filter(p => p.status === 'Pending').length, color: 'text-warning-500' },
          { label: 'Total Spend', value: `৳${totalSpend.toLocaleString()}`, color: 'text-danger-500' },
        ].map((s, i) => (
          <Card key={i} className="p-4">
            <p className="text-xs text-slate-500 dark:text-slate-400">{s.label}</p>
            <p className={`text-xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </Card>
        ))}
      </div>

      <Card className="p-4 flex flex-wrap gap-3 items-center justify-between">
        <div className="flex gap-2">
          {['all', 'received', 'pending', 'cancelled'].map(s => (
            <button key={s} onClick={() => { setStatusFilter(s); setPage(1) }}
              className={clsx('px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors',
                statusFilter === s ? 'bg-primary-600 text-white' : 'bg-slate-100 dark:bg-dark-700 text-slate-600 dark:text-slate-400')}>
              {s === 'all' ? 'All' : s}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <FiCalendar size={14} />
            <input type="date" value={dateFilter.from} onChange={e => { setDateFilter(p => ({ ...p, from: e.target.value })); setPage(1) }}
              className="input-field py-1 px-2 w-32 text-xs" />
            <span>—</span>
            <input type="date" value={dateFilter.to} onChange={e => { setDateFilter(p => ({ ...p, to: e.target.value })); setPage(1) }}
              className="input-field py-1 px-2 w-32 text-xs" />
          </div>
          <SearchBar value={search} onChange={v => { setSearch(v); setPage(1) }} placeholder="Search purchases..." />
        </div>
      </Card>

      <Card>
        <Table headers={['PO Number', 'Supplier', 'Invoice No', 'Items', 'Amount', 'Date', 'Status', 'Actions']}>
          {paginated.length === 0 ? (
            <tr><td colSpan={8}><EmptyState icon={FiShoppingBag} title="No purchase orders" description="Create your first purchase order" action={<Button variant="primary" onClick={() => setModalOpen(true)}><FiPlus size={16} />New Order</Button>} /></td></tr>
          ) : paginated.map(p => (
            <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-dark-700/50 transition-colors">
              <Td className="font-mono text-primary-600 dark:text-primary-400 font-semibold">{p.poNumber || p.id}</Td>
              <Td className="font-medium text-dark dark:text-slate-200">{p.supplierName || p.supplier || '-'}</Td>
              <Td className="font-mono text-xs text-slate-500">{p.invoiceNo || '-'}</Td>
              <Td>{(p.items && p.items.length) || '-'} items</Td>
              <Td className="font-bold text-dark dark:text-slate-100">৳{(p.totalAmount || 0).toLocaleString()}</Td>
              <Td className="text-slate-500 dark:text-slate-400">{p.createdAt ? new Date(p.createdAt).toLocaleDateString() : '-'}</Td>
              <Td><StatusBadge status={p.status} /></Td>
              <Td>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => setDetailModal(p)} className="p-1.5 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-500/10 text-primary-600 dark:text-primary-400 transition-colors" title="View Details">
                    <FiEye size={15} />
                  </button>
                  {p.status === 'Pending' && (
                    <button onClick={() => handleReceive(p.id)} disabled={receiving === p.id}
                      className="p-1.5 rounded-lg hover:bg-success-50 dark:hover:bg-success-500/10 text-success-600 dark:text-success-400 transition-colors disabled:opacity-50" title="Mark as Received">
                      <FiCheckCircle size={15} className={receiving === p.id ? 'animate-spin' : ''} />
                    </button>
                  )}
                </div>
              </Td>
            </tr>
          ))}
        </Table>
        <div className="px-4 pb-4"><Pagination page={page} total={filtered.length} perPage={PER_PAGE} onChange={setPage} /></div>
      </Card>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="New Purchase Order" size="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Select label="Supplier" {...register('supplierId', { required: true })}>
              <option value="">Select Supplier</option>
              {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </Select>
            <Input label="Invoice Number" {...register('invoiceNo')} placeholder="INV-2024-001" />
          </div>
          <Input label="Notes" {...register('notes')} placeholder="Optional notes about this order" />

          <div className="border-t border-slate-100 dark:border-dark-700 pt-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-dark dark:text-slate-100">Line Items</h4>
              <Button variant="secondary" size="sm" type="button" onClick={addLineItem}><FiPlus size={14} /> Add Item</Button>
            </div>
            {lineItems.length === 0 && (
              <p className="text-xs text-slate-400 text-center py-4">No items added. Add products to this purchase order.</p>
            )}
            {lineItems.map((item, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 items-end mb-2 p-3 rounded-xl bg-slate-50 dark:bg-dark-700">
                <div className="col-span-4">
                  <label className="block text-xs font-medium text-slate-500 mb-1">Product</label>
                  <select value={item.productId} onChange={e => updateLineItem(i, 'productId', e.target.value)}
                    className="input-field text-sm py-1.5">
                    <option value="">Select</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name} (Stock: {p.quantity})</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-slate-500 mb-1">Qty</label>
                  <input type="number" min="1" value={item.qty} onChange={e => updateLineItem(i, 'qty', e.target.value)}
                    className="input-field text-sm py-1.5" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-slate-500 mb-1">Price (৳)</label>
                  <input type="number" min="0" step="0.01" value={item.price} onChange={e => updateLineItem(i, 'price', e.target.value)}
                    className="input-field text-sm py-1.5" />
                </div>
                <div className="col-span-3">
                  <label className="block text-xs font-medium text-slate-500 mb-1">Subtotal</label>
                  <p className="font-semibold text-sm text-dark dark:text-slate-200 py-1.5">
                    ৳{(Number(item.qty) * Number(item.price)).toLocaleString()}
                  </p>
                </div>
                <div className="col-span-1 flex justify-end">
                  <button type="button" onClick={() => removeLineItem(i)}
                    className="p-1.5 rounded-lg hover:bg-danger-50 dark:hover:bg-danger-500/10 text-danger-500 transition-colors">
                    <FiTrash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3 justify-end pt-2 border-t border-slate-100 dark:border-dark-700">
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Create Purchase Order</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!detailModal} onClose={() => setDetailModal(null)} title={`Purchase Order: ${detailModal?.poNumber || detailModal?.id}`} size="lg">
        {detailModal && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-dark-700">
                <p className="text-xs text-slate-400">Supplier</p>
                <p className="font-semibold text-dark dark:text-slate-200">{detailModal.supplierName || '-'}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-dark-700">
                <p className="text-xs text-slate-400">Invoice</p>
                <p className="font-semibold text-dark dark:text-slate-200">{detailModal.invoiceNo || '-'}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-dark-700">
                <p className="text-xs text-slate-400">Total Amount</p>
                <p className="font-semibold text-primary-600 dark:text-primary-400">৳{(detailModal.totalAmount || 0).toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-dark-700">
                <p className="text-xs text-slate-400">Status</p>
                <StatusBadge status={detailModal.status} />
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-dark dark:text-slate-100 mb-3">Items ({detailModal.items?.length || 0})</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-dark-700">
                      <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase">#</th>
                      <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase">Product</th>
                      <th className="text-right py-2 px-3 text-xs font-semibold text-slate-500 uppercase">Qty</th>
                      <th className="text-right py-2 px-3 text-xs font-semibold text-slate-500 uppercase">Price</th>
                      <th className="text-right py-2 px-3 text-xs font-semibold text-slate-500 uppercase">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-dark-700">
                    {(detailModal.items || []).map((it, i) => (
                      <tr key={i}>
                        <td className="py-2 px-3 text-slate-400">{i + 1}</td>
                        <td className="py-2 px-3 font-medium text-dark dark:text-slate-200">{it.name || `Product #${it.productId}`}</td>
                        <td className="py-2 px-3 text-right">{it.qty}</td>
                        <td className="py-2 px-3 text-right">৳{Number(it.price).toLocaleString()}</td>
                        <td className="py-2 px-3 text-right font-semibold">৳{(Number(it.qty) * Number(it.price)).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-slate-200 dark:border-dark-600">
                      <td colSpan={4} className="py-2 px-3 text-right font-semibold text-dark dark:text-slate-200">Total</td>
                      <td className="py-2 px-3 text-right font-bold text-primary-600 dark:text-primary-400">৳{(detailModal.totalAmount || 0).toLocaleString()}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {detailModal.notes && (
              <div>
                <h4 className="text-sm font-semibold text-dark dark:text-slate-100 mb-1">Notes</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400">{detailModal.notes}</p>
              </div>
            )}

            <div className="text-xs text-slate-400 flex gap-4">
              <span>Created: {detailModal.createdAt ? new Date(detailModal.createdAt).toLocaleString() : '-'}</span>
              {detailModal.receivedAt && <span>Received: {new Date(detailModal.receivedAt).toLocaleString()}</span>}
            </div>

            {detailModal.status === 'Pending' && (
              <div className="pt-2">
                <Button variant="success" onClick={() => { handleReceive(detailModal.id); setDetailModal(null) }}
                  disabled={receiving === detailModal.id}>
                  <FiCheckCircle size={16} /> Mark as Received
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
