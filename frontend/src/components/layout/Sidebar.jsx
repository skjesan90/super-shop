import { NavLink, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../../store/slices/authSlice'
import {
  FiGrid, FiShoppingCart, FiPackage, FiArchive, FiUsers, FiTruck, FiUserCheck,
  FiTrendingUp, FiShoppingBag, FiDollarSign, FiBell, FiSettings, FiMapPin,
  FiBarChart2, FiLogOut, FiX
} from 'react-icons/fi'
import { useAuth } from '../../hooks'
import clsx from 'clsx'

const NAV_ITEMS = [
  { label: 'Dashboard', icon: FiGrid, path: '/dashboard', roles: ['admin','manager','cashier'] },
  { label: 'POS Billing', icon: FiShoppingCart, path: '/pos', roles: ['admin','manager','cashier'] },
  {
    label: 'Products', icon: FiPackage, path: '/products', roles: ['admin','manager'],
    children: [
      { label: 'All Products', path: '/products' },
      { label: 'Categories', path: '/products/categories' },
    ]
  },
  {
    label: 'Inventory', icon: FiArchive, path: '/inventory', roles: ['admin','manager'],
    children: [
      { label: 'Stock Overview', path: '/inventory' },
      { label: 'Stock Alerts', path: '/inventory/alerts' },
    ]
  },
  { label: 'Customers', icon: FiUsers, path: '/customers', roles: ['admin','manager'] },
  { label: 'Suppliers', icon: FiTruck, path: '/suppliers', roles: ['admin','manager'] },
  { label: 'Employees', icon: FiUserCheck, path: '/employees', roles: ['admin'] },
  {
    label: 'Sales', icon: FiTrendingUp, path: '/sales', roles: ['admin','manager'],
    children: [
      { label: 'Orders', path: '/sales' },
      { label: 'Reports', path: '/sales/reports' },
    ]
  },
  { label: 'Purchases', icon: FiShoppingBag, path: '/purchases', roles: ['admin','manager'] },
  {
    label: 'Expenses', icon: FiDollarSign, path: '/expenses', roles: ['admin','manager'],
    children: [
      { label: 'All Expenses', path: '/expenses' },
    ]
  },
  { label: 'Notifications', icon: FiBell, path: '/notifications', badge: true, roles: ['admin','manager','cashier'] },
  { label: 'Settings', icon: FiSettings, path: '/settings', roles: ['admin'] },
  { label: 'Branches', icon: FiMapPin, path: '/branches', roles: ['admin','cashier'] },
  { label: 'Analytics', icon: FiBarChart2, path: '/analytics', roles: ['admin'] },
]

export default function Sidebar({ open, onClose }) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const unread = useSelector(s => s.notifications.items.filter(n => !n.read).length)
  const { user, can } = useAuth()
  const visibleItems = NAV_ITEMS.filter(item => can(...(item.roles || ['admin','manager','cashier'])))

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  return (
    <>
      {/* Overlay */}
      {open && (
        <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={onClose} />
      )}

      {/* Sidebar */}
      <aside className={clsx(
        'fixed top-0 left-0 h-full w-64 bg-dark z-30 flex flex-col transition-transform duration-300',
        'lg:translate-x-0 lg:static lg:z-auto',
        open ? 'translate-x-0' : '-translate-x-full'
      )}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-dark-700">
          <div className="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center">
            <FiShoppingCart size={18} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-tight">Super Shop</p>
            <p className="text-xs text-slate-400">Management System</p>
          </div>
          <button onClick={onClose} className="ml-auto p-1 rounded-lg hover:bg-dark-700 text-slate-400 lg:hidden">
            <FiX size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
          {visibleItems.map(item => (
            <NavLink key={item.path} to={item.path} onClick={onClose}
              className={({ isActive }) => clsx('sidebar-link', isActive && 'active')}>
              <item.icon size={18} />
              <span className="flex-1">{item.label}</span>
              {item.badge && unread > 0 && (
                <span className="w-5 h-5 rounded-full bg-danger-500 text-white text-xs flex items-center justify-center">
                  {unread}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User & Logout */}
        <div className="p-3 border-t border-dark-700">
          <div className="flex items-center gap-3 px-2 py-2 mb-2">
            <div className="w-9 h-9 rounded-xl bg-primary-500/20 flex items-center justify-center">
              <span className="text-sm font-bold text-primary-400">
                {user?.name?.charAt(0) || 'A'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
              <p className="text-xs text-slate-400 capitalize">{user?.role}</p>
            </div>
          </div>
          <button onClick={handleLogout}
            className="sidebar-link w-full text-danger-400 hover:text-danger-300 hover:bg-danger-500/10">
            <FiLogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  )
}
