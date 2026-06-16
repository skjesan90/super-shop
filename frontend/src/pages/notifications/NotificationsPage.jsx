import { useDispatch, useSelector } from 'react-redux'
import { markRead, markAllRead, deleteNotification } from '../../store/slices/notificationSlice'
import { FiBell, FiAlertTriangle, FiInfo, FiCheckCircle, FiXCircle, FiTrash2, FiCheck } from 'react-icons/fi'
import { Card, Button } from '../../components/ui/index.jsx'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const TYPE_CONFIG = {
  warning: { icon: FiAlertTriangle, bg: 'bg-warning-100 dark:bg-warning-500/20', color: 'text-warning-500', border: 'border-warning-200 dark:border-warning-500/30' },
  danger: { icon: FiXCircle, bg: 'bg-danger-100 dark:bg-danger-500/20', color: 'text-danger-500', border: 'border-danger-200 dark:border-danger-500/30' },
  info: { icon: FiInfo, bg: 'bg-primary-100 dark:bg-primary-500/20', color: 'text-primary-500', border: 'border-primary-200 dark:border-primary-500/30' },
  success: { icon: FiCheckCircle, bg: 'bg-success-100 dark:bg-success-500/20', color: 'text-success-500', border: 'border-success-200 dark:border-success-500/30' },
}

export default function NotificationsPage() {
  const dispatch = useDispatch()
  const notifications = useSelector(s => s.notifications.items)
  const unread = notifications.filter(n => !n.read).length

  const handleMarkAllRead = () => {
    dispatch(markAllRead())
    toast.success('All notifications marked as read')
  }

  return (
    <div className="space-y-5 max-w-3xl mx-auto">
      <div className="page-header">
        <div>
          <h1 className="section-title">Notifications</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {unread > 0 ? `${unread} unread notification${unread > 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>
        {unread > 0 && (
          <Button variant="secondary" onClick={handleMarkAllRead}>
            <FiCheck size={16} /> Mark all as read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <Card className="p-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-dark-700 flex items-center justify-center mx-auto mb-4">
            <FiBell size={28} className="text-slate-300 dark:text-slate-600" />
          </div>
          <h3 className="font-semibold text-dark dark:text-slate-100 mb-1">No Notifications</h3>
          <p className="text-sm text-slate-400">You're all caught up! No new notifications.</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {/* Unread */}
          {unread > 0 && (
            <div className="mb-4">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 px-1">Unread</p>
              <div className="space-y-2">
                {notifications.filter(n => !n.read).map(n => {
                  const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.info
                  return (
                    <div key={n.id}
                      className={clsx('flex items-start gap-4 p-4 rounded-xl border bg-white dark:bg-dark-800 hover:shadow-sm transition-all', cfg.border)}>
                      <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', cfg.bg)}>
                        <cfg.icon size={18} className={cfg.color} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-dark dark:text-slate-100 text-sm">{n.title}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{n.message}</p>
                        <p className="text-xs text-slate-400 mt-1">{n.time}</p>
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <button onClick={() => dispatch(markRead(n.id))}
                          className="p-1.5 rounded-lg hover:bg-success-50 dark:hover:bg-success-500/10 text-slate-400 hover:text-success-500 transition-colors" title="Mark as read">
                          <FiCheck size={15} />
                        </button>
                        <button onClick={() => dispatch(deleteNotification(n.id))}
                          className="p-1.5 rounded-lg hover:bg-danger-50 dark:hover:bg-danger-500/10 text-slate-400 hover:text-danger-500 transition-colors">
                          <FiTrash2 size={15} />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Read */}
          {notifications.filter(n => n.read).length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 px-1">Earlier</p>
              <div className="space-y-2">
                {notifications.filter(n => n.read).map(n => {
                  const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.info
                  return (
                    <div key={n.id}
                      className="flex items-start gap-4 p-4 rounded-xl border border-slate-100 dark:border-dark-700 bg-white dark:bg-dark-800 opacity-60 hover:opacity-100 transition-opacity">
                      <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', cfg.bg)}>
                        <cfg.icon size={18} className={cfg.color} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-dark dark:text-slate-200 text-sm">{n.title}</p>
                        <p className="text-sm text-slate-400 mt-0.5">{n.message}</p>
                        <p className="text-xs text-slate-400 mt-1">{n.time}</p>
                      </div>
                      <button onClick={() => dispatch(deleteNotification(n.id))}
                        className="p-1.5 rounded-lg hover:bg-danger-50 dark:hover:bg-danger-500/10 text-slate-400 hover:text-danger-500 transition-colors flex-shrink-0">
                        <FiTrash2 size={15} />
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
