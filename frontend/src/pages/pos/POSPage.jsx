import { useState, useRef, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { addToCart, removeFromCart, updateQty, setCustomer, setDiscount, setPaymentMethod, clearCart, submitOrder } from '../../store/slices/posSlice'
import { fetchProducts } from '../../store/slices/productSlice'
import { FiSearch, FiPlus, FiMinus, FiTrash2, FiPrinter, FiShoppingCart, FiUser, FiCheck } from 'react-icons/fi'
import { Card, Button, Modal, Badge } from '../../components/ui/index.jsx'
import { customerService } from '../../services/api'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

const VAT_RATE = 5

export default function POSPage() {
  const dispatch = useDispatch()
  const products = useSelector(s => s.products.items)
  const [customers, setCustomers] = useState([])
  const { cartItems, selectedCustomer, discount, paymentMethod } = useSelector(s => s.pos)

  const loadCustomers = () => {
    customerService.getAll().then(({ data }) => {
      const list = data?.data || data || []
      if (Array.isArray(list)) setCustomers(list)
    }).catch(() => {})
  }

  useEffect(() => {
    dispatch(fetchProducts())
    loadCustomers()
    window.addEventListener('focus', loadCustomers)
    return () => window.removeEventListener('focus', loadCustomers)
  }, [dispatch])

  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('All')
  const [showInvoice, setShowInvoice] = useState(false)
  const [lastInvoice, setLastInvoice] = useState(null)
  const [cashReceived, setCashReceived] = useState('')
  const invoiceRef = useRef()

  const categories = ['All', ...new Set((products || []).map(p => p.category))]

  const filtered = (products || []).filter(p =>
    (catFilter === 'All' || p.category === catFilter) &&
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  const subtotal = cartItems.reduce((sum, i) => sum + i.sellingPrice * i.qty, 0)
  const discountAmt = (subtotal * discount) / 100
  const vatAmt = ((subtotal - discountAmt) * VAT_RATE) / 100
  const total = subtotal - discountAmt + vatAmt
  const change = cashReceived ? parseFloat(cashReceived) - total : 0

  const handleCheckout = async () => {
    if (!cartItems.length) { toast.error('Cart is empty!'); return }
    const orderData = {
      items: cartItems.map(i => ({ productId: i.id, qty: i.qty })),
      customerId: selectedCustomer?.id || null,
      discount,
      vatRate: VAT_RATE,
      paymentMethod,
    }
    try {
      const result = await dispatch(submitOrder(orderData)).unwrap()
      const invoice = {
        id: result.orderNo || `INV-${String(Math.floor(Math.random() * 90000) + 10000)}`,
        date: format(new Date(), 'yyyy-MM-dd HH:mm'),
        customer: selectedCustomer?.name || 'Walk-in Customer',
        items: cartItems,
        subtotal, discountAmt, vatAmt, total,
        paymentMethod,
        cashReceived: parseFloat(cashReceived) || total,
        change: Math.max(0, change),
      }
      setLastInvoice(invoice)
      setShowInvoice(true)
      toast.success('Payment processed successfully!')
    } catch (err) {
      toast.error(err || 'Failed to process order')
    }
  }

  const handlePrint = () => window.print()

  return (
    <div className="flex gap-4 h-[calc(100vh-5rem)]">
      {/* Left - Products */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center gap-3 mb-4">
          <h1 className="text-xl font-bold text-dark dark:text-slate-100">POS Billing</h1>
        </div>

        {/* Search & Filter */}
        <div className="flex gap-3 mb-4">
          <div className="relative flex-1">
            <FiSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search products..." className="input-field pl-9" />
          </div>
        </div>

        {/* Category tabs */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          {categories.map(c => (
            <button key={c} onClick={() => setCatFilter(c)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                catFilter === c ? 'bg-primary-600 text-white' : 'bg-white dark:bg-dark-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-dark-700'
              }`}>
              {c}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
            {filtered.map(product => (
              <button key={product.id} onClick={() => { if (product.quantity === 0) { toast.error('Out of stock!'); return } dispatch(addToCart(product)) }}
                className="card p-3 text-left hover:shadow-card-hover hover:border-primary-200 dark:hover:border-primary-500/30 transition-all group">
                <div className="w-full aspect-square rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-dark-700 dark:to-dark-600 flex items-center justify-center mb-3 text-2xl">
                  {product.category === 'Dairy' ? '🥛' : product.category === 'Grocery' ? '🛒' : product.category === 'Beverages' ? '🧃' : product.category === 'Bakery' ? '🍞' : '📦'}
                </div>
                <p className="text-sm font-semibold text-dark dark:text-slate-200 leading-tight mb-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{product.name}</p>
                <div className="flex items-center justify-between">
                  <p className="text-primary-600 dark:text-primary-400 font-bold text-sm">৳{product.sellingPrice}</p>
                  {product.quantity === 0 ? (
                    <span className="text-xs text-danger-500 font-medium">Out</span>
                  ) : (
                    <span className="text-xs text-slate-400">{product.quantity} left</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right - Cart */}
      <div className="w-80 xl:w-96 flex flex-col">
        <Card className="flex-1 flex flex-col overflow-hidden">
          {/* Cart Header */}
          <div className="p-4 border-b border-slate-100 dark:border-dark-700">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-dark dark:text-slate-100 flex items-center gap-2">
                <FiShoppingCart size={18} /> Cart ({cartItems.length})
              </h2>
              {cartItems.length > 0 && (
                <button onClick={() => dispatch(clearCart())} className="text-xs text-danger-500 hover:underline">Clear</button>
              )}
            </div>
            {/* Customer Select */}
            <select className="input-field text-sm" value={selectedCustomer?.id || ''}
              onChange={e => dispatch(setCustomer(customers.find(c => String(c.id) === e.target.value) || null))}>
              <option value="">Walk-in Customer</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>)}
            </select>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {cartItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-center">
                <FiShoppingCart size={32} className="text-slate-200 dark:text-slate-600 mb-2" />
                <p className="text-sm text-slate-400">Add products to cart</p>
              </div>
            ) : (
              cartItems.map(item => (
                <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-dark-700">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-dark dark:text-slate-200 truncate">{item.name}</p>
                    <p className="text-xs text-primary-600 dark:text-primary-400 font-semibold">৳{item.sellingPrice}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => item.qty === 1 ? dispatch(removeFromCart(item.id)) : dispatch(updateQty({ id: item.id, qty: item.qty - 1 }))}
                      className="w-7 h-7 rounded-lg bg-white dark:bg-dark-800 border border-slate-200 dark:border-dark-600 flex items-center justify-center hover:border-primary-500 transition-colors">
                      <FiMinus size={12} />
                    </button>
                    <span className="w-7 text-center text-sm font-semibold text-dark dark:text-slate-200">{item.qty}</span>
                    <button onClick={() => dispatch(updateQty({ id: item.id, qty: item.qty + 1 }))}
                      className="w-7 h-7 rounded-lg bg-white dark:bg-dark-800 border border-slate-200 dark:border-dark-600 flex items-center justify-center hover:border-primary-500 transition-colors">
                      <FiPlus size={12} />
                    </button>
                  </div>
                  <div className="text-right w-14">
                    <p className="text-sm font-bold text-dark dark:text-slate-100">৳{(item.sellingPrice * item.qty).toLocaleString()}</p>
                  </div>
                  <button onClick={() => dispatch(removeFromCart(item.id))} className="text-danger-400 hover:text-danger-600 transition-colors">
                    <FiTrash2 size={15} />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Summary */}
          <div className="p-4 border-t border-slate-100 dark:border-dark-700 space-y-3">
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-xs text-slate-500 mb-1 block">Discount %</label>
                <input type="number" min="0" max="100" value={discount}
                  onChange={e => dispatch(setDiscount(parseFloat(e.target.value) || 0))}
                  className="input-field py-2 text-sm" />
              </div>
              <div className="flex-1">
                <label className="text-xs text-slate-500 mb-1 block">Payment</label>
                <select className="input-field py-2 text-sm" value={paymentMethod}
                  onChange={e => dispatch(setPaymentMethod(e.target.value))}>
                  <option>Cash</option>
                  <option>Card</option>
                  <option>Mobile Banking</option>
                </select>
              </div>
            </div>

            {paymentMethod === 'Cash' && (
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Cash Received ৳</label>
                <input type="number" value={cashReceived} onChange={e => setCashReceived(e.target.value)}
                  className="input-field py-2 text-sm" placeholder="Enter cash amount" />
              </div>
            )}

            {/* Totals */}
            <div className="space-y-1.5 text-sm pt-1">
              <div className="flex justify-between text-slate-500"><span>Subtotal</span><span>৳{subtotal.toLocaleString()}</span></div>
              {discount > 0 && <div className="flex justify-between text-danger-500"><span>Discount ({discount}%)</span><span>-৳{discountAmt.toFixed(0)}</span></div>}
              <div className="flex justify-between text-slate-500"><span>VAT ({VAT_RATE}%)</span><span>৳{vatAmt.toFixed(0)}</span></div>
              <div className="flex justify-between font-bold text-dark dark:text-slate-100 text-base pt-2 border-t border-slate-100 dark:border-dark-700">
                <span>Total</span><span>৳{total.toFixed(0)}</span>
              </div>
              {paymentMethod === 'Cash' && cashReceived && change >= 0 && (
                <div className="flex justify-between text-success-600 font-medium"><span>Change</span><span>৳{change.toFixed(0)}</span></div>
              )}
            </div>

            <Button variant="success" className="w-full justify-center py-3 text-base" onClick={handleCheckout}>
              <FiCheck size={18} /> Process Payment
            </Button>
          </div>
        </Card>
      </div>

      {/* Invoice Modal */}
      <Modal isOpen={showInvoice} onClose={() => setShowInvoice(false)} title="Invoice" size="md">
        {lastInvoice && (
          <div ref={invoiceRef} className="space-y-4">
            <div className="text-center border-b border-slate-100 dark:border-dark-700 pb-4">
              <h2 className="text-xl font-bold text-dark dark:text-slate-100">Smart Super Shop</h2>
              <p className="text-sm text-slate-400">Gulshan, Dhaka | 01711-100200</p>
              <p className="text-xs text-slate-400 mt-1">{lastInvoice.id} • {lastInvoice.date}</p>
            </div>
            <div className="text-sm text-slate-500"><strong>Customer:</strong> {lastInvoice.customer}</div>
            <table className="w-full text-sm">
              <thead><tr className="border-b border-slate-100 dark:border-dark-700">
                <th className="text-left py-2 font-semibold">Item</th>
                <th className="text-center py-2 font-semibold">Qty</th>
                <th className="text-right py-2 font-semibold">Price</th>
                <th className="text-right py-2 font-semibold">Total</th>
              </tr></thead>
              <tbody>{lastInvoice.items.map((item, i) => (
                <tr key={i} className="border-b border-slate-50 dark:border-dark-700">
                  <td className="py-2">{item.name}</td>
                  <td className="py-2 text-center">{item.qty}</td>
                  <td className="py-2 text-right">৳{item.sellingPrice}</td>
                  <td className="py-2 text-right font-medium">৳{(item.sellingPrice * item.qty).toLocaleString()}</td>
                </tr>
              ))}</tbody>
            </table>
            <div className="space-y-1 text-sm pt-2 border-t border-slate-100 dark:border-dark-700">
              <div className="flex justify-between"><span>Subtotal</span><span>৳{lastInvoice.subtotal.toLocaleString()}</span></div>
              {lastInvoice.discountAmt > 0 && <div className="flex justify-between text-danger-500"><span>Discount</span><span>-৳{lastInvoice.discountAmt.toFixed(0)}</span></div>}
              <div className="flex justify-between"><span>VAT (5%)</span><span>৳{lastInvoice.vatAmt.toFixed(0)}</span></div>
              <div className="flex justify-between font-bold text-base pt-2 border-t border-slate-100 dark:border-dark-700">
                <span>Total</span><span>৳{lastInvoice.total.toFixed(0)}</span>
              </div>
              <div className="flex justify-between text-slate-500"><span>Payment</span><span>{lastInvoice.paymentMethod}</span></div>
              {lastInvoice.change > 0 && <div className="flex justify-between text-success-600"><span>Change</span><span>৳{lastInvoice.change.toFixed(0)}</span></div>}
            </div>
            <p className="text-center text-xs text-slate-400 pt-2">Thank you for shopping with us!</p>
            <Button variant="primary" className="w-full justify-center" onClick={handlePrint}>
              <FiPrinter size={16} /> Print Invoice
            </Button>
          </div>
        )}
      </Modal>
    </div>
  )
}
