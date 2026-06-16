import { useState, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { toggleTheme } from '../../store/slices/themeSlice'
import { markRead, markAllRead } from '../../store/slices/notificationSlice'
import { FiMenu, FiSun, FiMoon, FiBell, FiSearch, FiMaximize2, FiMinimize2, FiCheck, FiExternalLink } from 'react-icons/fi'
import clsx from 'clsx'

const NOTIF_ICONS = {
  warning: 'text-warning-500 bg-warning-50 dark:bg-warning-500/10',
  danger: 'text-danger-500 bg-danger-50 dark:bg-danger-500/10',
  success: 'text-success-500 bg-success-50 dark:bg-success-500/10',
  info: 'text-primary-500 bg-primary-50 dark:bg-primary-500/10',
}

export default function Header({ onMenuToggle }) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const notifRef = useRef(null)
  const { mode } = useSelector(s => s.theme)
  const notifications = useSelector(s => s.notifications.items)
  const unread = notifications.filter(n => !n.read).length
  const { user } = useSelector(s => s.auth)
  const [fullscreen, setFullscreen] = useState(false)
  const [searchVal, setSearchVal] = useState('')
  const [showNotif, setShowNotif] = useState(false)

  useEffect(() => {
    const handleClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleSearch = (value) => {
    const q = value.trim().toLowerCase()
    if (!q) return
    const routes = [
      { label: 'products', path: '/products' },
      { label: 'customers', path: '/customers' },
      { label: 'suppliers', path: '/suppliers' },
      { label: 'employees', path: '/employees' },
      { label: 'sales', path: '/sales' },
      { label: 'purchases', path: '/purchases' },
      { label: 'expenses', path: '/expenses' },
      { label: 'inventory', path: '/inventory' },
    ]
    const match = routes.find(r => r.label.includes(q) || q.includes(r.label))
    if (match) navigate(match.path)
    else navigate('/products')
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setFullscreen(true)
    } else {
      document.exitFullscreen()
      setFullscreen(false)
    }
  }

  return (
    <header className="bg-white dark:bg-dark-800 border-b border-slate-100 dark:border-dark-700 h-16 flex items-center px-4 lg:px-6 gap-4 sticky top-0 z-10">
      {/* Menu toggle */}
      <button onClick={onMenuToggle}
        className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-dark-700 text-slate-500 lg:hidden">
        <FiMenu size={20} />
      </button>

      {/* Search */}
      <div className="flex-1 max-w-md hidden sm:block">
        <div className="relative">
          <FiSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={searchVal} onChange={e => setSearchVal(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleSearch(searchVal) }}
            placeholder="Search for products, customers, orders..."
            className="input-field pl-9 py-2 text-sm w-full bg-slate-50 dark:bg-dark-700"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hidden md:block">Ctrl+K</span>
        </div>
      </div>

      <div className="flex-1" />

      {/* Actions */}
      <div className="flex items-center gap-1">
        {/* Theme toggle */}
        <button onClick={() => dispatch(toggleTheme())}
          className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-dark-700 text-slate-500 dark:text-slate-400 transition-colors">
          {mode === 'dark' ? <FiSun size={18} /> : <FiMoon size={18} />}
        </button>

        {/* Fullscreen */}
        <button onClick={toggleFullscreen}
          className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-dark-700 text-slate-500 dark:text-slate-400 transition-colors hidden md:flex">
          {fullscreen ? <FiMinimize2 size={18} /> : <FiMaximize2 size={18} />}
        </button>

        {/* Notifications dropdown */}
        <div ref={notifRef} className="relative">
          <button onClick={() => setShowNotif(!showNotif)}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-dark-700 text-slate-500 dark:text-slate-400 transition-colors relative">
            <FiBell size={18} />
            {unread > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-danger-500 text-white text-[10px] flex items-center justify-center">
                {unread}
              </span>
            )}
          </button>
          {showNotif && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-dark-800 border border-slate-100 dark:border-dark-700 rounded-2xl shadow-2xl overflow-hidden z-50">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-dark-700">
                <h3 className="font-semibold text-sm text-dark dark:text-slate-100">Notifications</h3>
                {unread > 0 && (
                  <button onClick={() => dispatch(markAllRead())}
                    className="text-xs text-primary-600 dark:text-primary-400 hover:underline font-medium">
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto">
                {notifications.slice(0, 5).map(n => (
                  <div key={n.id} className={clsx('flex items-start gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-dark-700/50 transition-colors cursor-pointer',
                    !n.read && 'bg-primary-50/50 dark:bg-primary-500/5')}
                    onClick={() => { dispatch(markRead(n.id)); setShowNotif(false); navigate('/notifications') }}>
                    <div className={clsx('w-8 h-8 rounded-xl flex items-center justify-center shrink-0', NOTIF_ICONS[n.type] || NOTIF_ICONS.info)}>
                      <FiBell size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-dark dark:text-slate-200 truncate">{n.title}</p>
                      <p className="text-xs text-slate-400 truncate">{n.message}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{n.time}</p>
                    </div>
                    {!n.read && <span className="w-2 h-2 rounded-full bg-primary-500 shrink-0 mt-1.5" />}
                  </div>
                ))}
                {notifications.length === 0 && (
                  <p className="text-sm text-slate-400 text-center py-8">No notifications</p>
                )}
              </div>
              <div className="border-t border-slate-100 dark:border-dark-700 px-4 py-2.5">
                <button onClick={() => { setShowNotif(false); navigate('/notifications') }}
                  className="text-sm text-primary-600 dark:text-primary-400 hover:underline font-medium flex items-center justify-center gap-1 w-full">
                  <FiExternalLink size={14} /> View all notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User */}
        <button className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-dark-700 transition-colors ml-1">
          <div className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-500/20 flex items-center justify-center">
            <span className="text-xs font-bold text-primary-600 dark:text-primary-400">
              {user?.name?.charAt(0) || 'A'}
            </span>
          </div>
          <div className="text-left hidden md:block">
            <p className="text-sm font-semibold text-dark dark:text-slate-100 leading-tight">{user?.name}</p>
            <p className="text-xs text-slate-400 capitalize">{user?.role}</p>
          </div>
        </button>
      </div>
    </header>
  )
}
