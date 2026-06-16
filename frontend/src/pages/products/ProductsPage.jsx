import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchProducts, addProduct, updateProduct, deleteProduct } from '../../store/slices/productSlice'
import { FiPlus, FiEdit2, FiTrash2, FiPackage, FiSearch } from 'react-icons/fi'
import { Card, Button, Modal, Input, Select, Table, Td, Pagination, SearchBar, StatusBadge, ConfirmDialog, EmptyState } from '../../components/ui/index.jsx'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const CATEGORIES = ['Dairy', 'Grocery', 'Beverages', 'Bakery', 'Snacks', 'Frozen', 'Personal Care', 'Cleaning']
const BRANDS = ['FreshFarm', 'RoyalGrain', 'PureCane', 'GoldenDrop', 'FarmFresh', 'BakeMaster', 'FreshSqueeze', 'ClearFlow', 'CreamyBest', 'QuickBite']

export default function ProductsPage() {
  const dispatch = useDispatch()
  const products = useSelector(s => s.products.items)
  useEffect(() => { dispatch(fetchProducts()) }, [dispatch])
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('All')
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const PER_PAGE = 8

  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  const categories = ['All', ...CATEGORIES]

  const filtered = products.filter(p =>
    (catFilter === 'All' || p.category === catFilter) &&
    (p.name.toLowerCase().includes(search.toLowerCase()) ||
     p.sku.toLowerCase().includes(search.toLowerCase()))
  )

  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  const openAdd = () => { setEditItem(null); reset({}); setModalOpen(true) }
  const openEdit = (p) => { setEditItem(p); reset(p); setModalOpen(true) }

  const onSubmit = (data) => {
    const payload = {
      ...data,
      buyingPrice: parseFloat(data.buyingPrice),
      sellingPrice: parseFloat(data.sellingPrice),
      quantity: parseInt(data.quantity),
    }
    if (editItem) {
      dispatch(updateProduct({ ...editItem, ...payload }))
      toast.success('Product updated successfully!')
    } else {
      dispatch(addProduct(payload))
      toast.success('Product added successfully!')
    }
    setModalOpen(false)
    reset({})
  }

  const getStockStatus = (qty) => {
    if (qty === 0) return { label: 'Out of Stock', variant: 'danger' }
    if (qty <= 10) return { label: 'Low Stock', variant: 'warning' }
    return { label: 'In Stock', variant: 'success' }
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="section-title">Products</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Manage your product inventory</p>
        </div>
        <Button variant="primary" onClick={openAdd}>
          <FiPlus size={16} /> Add Product
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Products', value: products.length, color: 'text-primary-600' },
          { label: 'In Stock', value: products.filter(p => p.quantity > 10).length, color: 'text-success-500' },
          { label: 'Low Stock', value: products.filter(p => p.quantity > 0 && p.quantity <= 10).length, color: 'text-warning-500' },
          { label: 'Out of Stock', value: products.filter(p => p.quantity === 0).length, color: 'text-danger-500' },
        ].map((s, i) => (
          <Card key={i} className="p-4">
            <p className="text-sm text-slate-500 dark:text-slate-400">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-3 items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {categories.map(c => (
              <button key={c} onClick={() => { setCatFilter(c); setPage(1) }}
                className={clsx('px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                  catFilter === c ? 'bg-primary-600 text-white' : 'bg-slate-100 dark:bg-dark-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200')}>
                {c}
              </button>
            ))}
          </div>
          <SearchBar value={search} onChange={v => { setSearch(v); setPage(1) }} placeholder="Search products..." />
        </div>
      </Card>

      {/* Table */}
      <Card>
        <Table headers={['Product', 'SKU', 'Category', 'Buy Price', 'Sell Price', 'Stock', 'Status', 'Actions']}>
          {paginated.length === 0 ? (
            <tr><td colSpan={8}><EmptyState icon={FiPackage} title="No products found" description="Add your first product to get started" action={<Button variant="primary" onClick={openAdd}><FiPlus size={16} />Add Product</Button>} /></td></tr>
          ) : paginated.map(p => {
            const stock = getStockStatus(p.quantity)
            return (
              <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-dark-700/50 transition-colors">
                <Td>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-dark-700 flex items-center justify-center text-lg">
                      {p.category === 'Dairy' ? '🥛' : p.category === 'Grocery' ? '🛒' : p.category === 'Beverages' ? '🧃' : '📦'}
                    </div>
                    <div>
                      <p className="font-medium text-dark dark:text-slate-200">{p.name}</p>
                      <p className="text-xs text-slate-400">{p.brand}</p>
                    </div>
                  </div>
                </Td>
                <Td><span className="font-mono text-xs text-slate-500">{p.sku}</span></Td>
                <Td><span className="badge-primary">{p.category}</span></Td>
                <Td className="font-medium">৳{p.buyingPrice}</Td>
                <Td className="font-semibold text-primary-600 dark:text-primary-400">৳{p.sellingPrice}</Td>
                <Td>
                  <span className={clsx('font-semibold', p.quantity === 0 ? 'text-danger-500' : p.quantity <= 10 ? 'text-warning-500' : 'text-success-500')}>
                    {p.quantity} {p.unit}
                  </span>
                </Td>
                <Td><span className={`badge-${stock.variant}`}>{stock.label}</span></Td>
                <Td>
                  <div className="flex items-center gap-2">
                    <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-500/10 text-primary-600 dark:text-primary-400 transition-colors">
                      <FiEdit2 size={15} />
                    </button>
                    <button onClick={() => setDeleteId(p.id)} className="p-1.5 rounded-lg hover:bg-danger-50 dark:hover:bg-danger-500/10 text-danger-500 transition-colors">
                      <FiTrash2 size={15} />
                    </button>
                  </div>
                </Td>
              </tr>
            )
          })}
        </Table>
        <div className="px-4 pb-4">
          <Pagination page={page} total={filtered.length} perPage={PER_PAGE} onChange={setPage} />
        </div>
      </Card>

      {/* Add/Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Edit Product' : 'Add New Product'} size="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Input label="Product Name" error={errors.name?.message} {...register('name', { required: 'Required' })} placeholder="e.g. Fresh Milk 1L" />
          </div>
          <Input label="SKU" {...register('sku', { required: 'Required' })} placeholder="e.g. MLK-001" error={errors.sku?.message} />
          <Input label="Barcode" {...register('barcode')} placeholder="e.g. 8901234567890" />
          <Select label="Category" {...register('category', { required: 'Required' })} error={errors.category?.message}>
            <option value="">Select Category</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </Select>
          <Select label="Brand" {...register('brand')}>
            <option value="">Select Brand</option>
            {BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
          </Select>
          <Input label="Buying Price (৳)" type="number" {...register('buyingPrice', { required: 'Required', min: 0 })} placeholder="0" error={errors.buyingPrice?.message} />
          <Input label="Selling Price (৳)" type="number" {...register('sellingPrice', { required: 'Required', min: 0 })} placeholder="0" error={errors.sellingPrice?.message} />
          <Input label="Quantity" type="number" {...register('quantity', { required: 'Required', min: 0 })} placeholder="0" error={errors.quantity?.message} />
          <Select label="Unit" {...register('unit')}>
            <option value="Pcs">Pcs</option>
            <option value="Kg">Kg</option>
            <option value="Pack">Pack</option>
            <option value="Liter">Liter</option>
          </Select>
          <Input label="Expiry Date" type="date" {...register('expiryDate')} />
          <div className="col-span-2 flex gap-3 justify-end pt-2">
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">{editItem ? 'Update Product' : 'Add Product'}</Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)}
        onConfirm={() => { dispatch(deleteProduct(deleteId)); toast.success('Product deleted!') }}
        title="Delete Product" message="Are you sure you want to delete this product? This action cannot be undone." />
    </div>
  )
}
