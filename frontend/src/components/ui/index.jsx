// ============================================
// Reusable UI Components - Smart Shop ERP
// ============================================
import { useState, forwardRef } from 'react'
import { FiX, FiAlertTriangle, FiChevronLeft, FiChevronRight, FiSearch, FiChevronDown } from 'react-icons/fi'
import clsx from 'clsx'

// ─── Button ───────────────────────────────────
export function Button({ children, variant = 'primary', size = 'md', className = '', disabled, onClick, type = 'button', ...props }) {
  const base = 'inline-flex items-center gap-2 font-medium rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
  const variants = {
    primary: 'bg-primary-600 hover:bg-primary-700 text-white shadow-sm hover:shadow',
    secondary: 'bg-slate-100 hover:bg-slate-200 dark:bg-dark-700 dark:hover:bg-dark-600 text-dark dark:text-slate-100',
    danger: 'bg-danger-500 hover:bg-danger-600 text-white',
    success: 'bg-success-500 hover:bg-success-600 text-white',
    warning: 'bg-warning-500 hover:bg-warning-600 text-white',
    ghost: 'hover:bg-slate-100 dark:hover:bg-dark-700 text-slate-600 dark:text-slate-400',
    outline: 'border border-slate-200 dark:border-dark-700 hover:bg-slate-50 dark:hover:bg-dark-800 text-dark dark:text-slate-100',
  }
  const sizes = { sm: 'px-3 py-1.5 text-sm', md: 'px-4 py-2.5 text-sm', lg: 'px-6 py-3 text-base' }
  return (
    <button type={type} disabled={disabled} onClick={onClick} className={clsx(base, variants[variant], sizes[size], className)} {...props}>
      {children}
    </button>
  )
}

// ─── Card ─────────────────────────────────────
export function Card({ children, className = '', hover = false, ...props }) {
  return (
    <div className={clsx('card', hover && 'hover:shadow-card-hover transition-shadow duration-300', className)} {...props}>
      {children}
    </div>
  )
}

// ─── Input ────────────────────────────────────
export const Input = forwardRef(({ label, error, icon: Icon, className = '', ...props }, ref) => {
  return (
    <div className="space-y-1.5">
      {label && <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>}
      <div className="relative">
        {Icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><Icon size={16} /></div>}
        <input ref={ref} className={clsx('input-field', Icon && 'pl-10', error && 'border-danger-500 focus:ring-danger-500/20', className)} {...props} />
      </div>
      {error && <p className="text-xs text-danger-500">{error}</p>}
    </div>
  )
})

// ─── Select ───────────────────────────────────
export function Select({ label, error, children, className = '', ...props }) {
  return (
    <div className="space-y-1.5">
      {label && <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>}
      <select className={clsx('input-field', error && 'border-danger-500', className)} {...props}>
        {children}
      </select>
      {error && <p className="text-xs text-danger-500">{error}</p>}
    </div>
  )
}

// ─── Modal ────────────────────────────────────
export function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  if (!isOpen) return null
  const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl', full: 'max-w-6xl' }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className={clsx('relative bg-white dark:bg-dark-800 rounded-2xl shadow-2xl w-full', sizes[size], 'max-h-[90vh] overflow-y-auto')}>
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-dark-700">
          <h3 className="text-lg font-semibold text-dark dark:text-slate-100">{title}</h3>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-dark-700 text-slate-500 transition-colors">
            <FiX size={20} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

// ─── Confirm Dialog ───────────────────────────
export function ConfirmDialog({ isOpen, onClose, onConfirm, title, message }) {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-dark-800 rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
        <div className="w-14 h-14 rounded-full bg-danger-100 dark:bg-danger-500/20 flex items-center justify-center mx-auto mb-4">
          <FiAlertTriangle size={24} className="text-danger-500" />
        </div>
        <h3 className="text-lg font-bold text-dark dark:text-slate-100 mb-2">{title}</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">{message}</p>
        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button variant="danger" className="flex-1" onClick={() => { onConfirm(); onClose() }}>Confirm</Button>
        </div>
      </div>
    </div>
  )
}

// ─── Badge ────────────────────────────────────
export function Badge({ children, variant = 'primary' }) {
  const v = { primary: 'badge-primary', success: 'badge-success', danger: 'badge-danger', warning: 'badge-warning' }
  return <span className={v[variant] || 'badge-primary'}>{children}</span>
}

export function StatusBadge({ status }) {
  const map = {
    'Completed': 'success', 'Active': 'success', 'Received': 'success', 'Paid': 'success',
    'Pending': 'warning', 'Inactive': 'warning',
    'Cancelled': 'danger', 'Out of Stock': 'danger', 'Overdue': 'danger',
  }
  return <Badge variant={map[status] || 'primary'}>{status}</Badge>
}

// ─── Table ────────────────────────────────────
export function Table({ headers, children, loading }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100 dark:border-dark-700">
            {headers.map((h, i) => (
              <th key={i} className="text-left py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50 dark:divide-dark-700">
          {loading ? (
            <tr><td colSpan={headers.length} className="text-center py-10 text-slate-400">Loading...</td></tr>
          ) : children}
        </tbody>
      </table>
    </div>
  )
}

export function Td({ children, className = '' }) {
  return <td className={clsx('py-3.5 px-4 text-dark dark:text-slate-300', className)}>{children}</td>
}

// ─── Pagination ───────────────────────────────
export function Pagination({ page, total, perPage, onChange }) {
  const totalPages = Math.ceil(total / perPage)
  if (totalPages <= 1) return null
  return (
    <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100 dark:border-dark-700">
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Showing {(page - 1) * perPage + 1}–{Math.min(page * perPage, total)} of {total} results
      </p>
      <div className="flex items-center gap-1">
        <button onClick={() => onChange(page - 1)} disabled={page === 1}
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-dark-700 disabled:opacity-30 transition-colors">
          <FiChevronLeft size={16} />
        </button>
        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          const p = i + 1
          return (
            <button key={p} onClick={() => onChange(p)}
              className={clsx('w-8 h-8 rounded-lg text-sm font-medium transition-colors',
                page === p ? 'bg-primary-600 text-white' : 'hover:bg-slate-100 dark:hover:bg-dark-700 text-slate-600 dark:text-slate-400')}>
              {p}
            </button>
          )
        })}
        <button onClick={() => onChange(page + 1)} disabled={page === totalPages}
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-dark-700 disabled:opacity-30 transition-colors">
          <FiChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}

// ─── SearchBar ────────────────────────────────
export function SearchBar({ value, onChange, onSearch, placeholder = 'Search...', className = '' }) {
  const handleSearch = () => {
    if (onSearch) onSearch(value)
    else onChange(value)
  }
  return (
    <div className={clsx('flex gap-2', className)}>
      <div className="relative flex-1">
        <FiSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input value={value} onChange={e => onChange(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleSearch() }}
          placeholder={placeholder} className="input-field pl-9 w-64" />
      </div>
      <Button variant="primary" size="sm" onClick={handleSearch}>
        <FiSearch size={14} /> Search
      </Button>
    </div>
  )
}

// ─── Stat Card ────────────────────────────────
export function StatCard({ title, value, icon: Icon, iconBg, trend, trendValue, prefix = '' }) {
  return (
    <div className="stat-card">
      <div>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">{title}</p>
        <p className="text-2xl font-bold text-dark dark:text-slate-100">{prefix}{typeof value === 'number' ? value.toLocaleString() : value}</p>
        {trendValue !== undefined && (
          <p className={clsx('text-xs mt-1 font-medium', trend === 'up' ? 'text-success-500' : 'text-danger-500')}>
            {trend === 'up' ? '↑' : '↓'} {trendValue}% from last week
          </p>
        )}
      </div>
      <div className={clsx('w-12 h-12 rounded-2xl flex items-center justify-center', iconBg)}>
        <Icon size={22} className="text-white" />
      </div>
    </div>
  )
}

// ─── Empty State ──────────────────────────────
export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-dark-700 flex items-center justify-center mb-4">
        <Icon size={28} className="text-slate-400" />
      </div>
      <h3 className="text-base font-semibold text-dark dark:text-slate-100 mb-1">{title}</h3>
      <p className="text-sm text-slate-400 mb-4">{description}</p>
      {action}
    </div>
  )
}

// ─── Avatar ───────────────────────────────────
export function Avatar({ name, size = 'md' }) {
  const initials = name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  const sizes = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-12 h-12 text-base' }
  const colors = ['bg-primary-500', 'bg-success-500', 'bg-warning-500', 'bg-purple-500', 'bg-pink-500']
  const color = colors[name?.charCodeAt(0) % colors.length] || 'bg-primary-500'
  return (
    <div className={clsx('rounded-full flex items-center justify-center text-white font-semibold', sizes[size], color)}>
      {initials}
    </div>
  )
}

// ─── Dropdown ─────────────────────────────────
export function Dropdown({ label, options, value, onChange }) {
  const [open, setOpen] = useState(false)
  const selected = options.find(o => o.value === value)
  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 dark:border-dark-700 bg-white dark:bg-dark-800 text-sm font-medium text-slate-700 dark:text-slate-300 hover:border-primary-500 transition-colors">
        {selected?.label || label}
        <FiChevronDown size={14} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute top-full mt-1 right-0 z-20 bg-white dark:bg-dark-800 border border-slate-100 dark:border-dark-700 rounded-xl shadow-lg overflow-hidden min-w-[140px]">
            {options.map(o => (
              <button key={o.value} onClick={() => { onChange(o.value); setOpen(false) }}
                className={clsx('w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 dark:hover:bg-dark-700 transition-colors',
                  value === o.value && 'text-primary-600 font-medium')}>
                {o.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
