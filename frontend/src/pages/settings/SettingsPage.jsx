import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toggleTheme } from '../../store/slices/themeSlice'
import { FiSave, FiMoon, FiSun, FiShield, FiBell, FiHome } from 'react-icons/fi'
import { Card, Button, Input, Select } from '../../components/ui/index.jsx'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

export default function SettingsPage() {
  const dispatch = useDispatch()
  const { mode } = useSelector(s => s.theme)
  const [activeTab, setActiveTab] = useState('store')

  const { register, handleSubmit } = useForm({
    defaultValues: {
      storeName: 'Smart Super Shop', address: 'Gulshan-2, Dhaka-1212', phone: '01711-100200',
      email: 'info@supershop.com', taxPercent: '5', currency: 'BDT',
    }
  })

  const onSave = () => toast.success('Settings saved successfully!')

  const tabs = [
    { key: 'store', label: 'Store Info', icon: FiHome },
    { key: 'appearance', label: 'Appearance', icon: FiSun },
    { key: 'notifications', label: 'Notifications', icon: FiBell },
    { key: 'security', label: 'Security', icon: FiShield },
  ]

  return (
    <div className="space-y-5 max-w-4xl">
      <div>
        <h1 className="section-title">Settings</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Manage your store configuration and preferences</p>
      </div>

      <div className="flex gap-1 p-1 bg-slate-100 dark:bg-dark-700 rounded-xl w-fit">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === t.key ? 'bg-white dark:bg-dark-800 text-dark dark:text-slate-100 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-dark dark:hover:text-slate-200'}`}>
            <t.icon size={15} />{t.label}
          </button>
        ))}
      </div>

      {activeTab === 'store' && (
        <Card className="p-6">
          <h2 className="font-semibold text-dark dark:text-slate-100 mb-6 pb-4 border-b border-slate-100 dark:border-dark-700">Store Information</h2>
          <form onSubmit={handleSubmit(onSave)} className="grid grid-cols-2 gap-5">
            <div className="col-span-2 flex items-center gap-5">
              <div className="w-20 h-20 rounded-2xl bg-primary-600 flex items-center justify-center text-white text-3xl font-bold">S</div>
              <div>
                <p className="font-medium text-dark dark:text-slate-100">Store Logo</p>
                <p className="text-sm text-slate-400 mb-2">PNG, JPG up to 2MB</p>
                <Button variant="secondary" size="sm" type="button">Upload Logo</Button>
              </div>
            </div>
            <div className="col-span-2"><Input label="Store Name" {...register('storeName')} /></div>
            <Input label="Phone Number" {...register('phone')} />
            <Input label="Email Address" type="email" {...register('email')} />
            <div className="col-span-2"><Input label="Address" {...register('address')} /></div>
            <Select label="Currency" {...register('currency')}>
              <option value="BDT">BDT (৳) — Bangladeshi Taka</option>
              <option value="USD">USD ($) — US Dollar</option>
              <option value="EUR">EUR (€) — Euro</option>
              <option value="GBP">GBP (£) — British Pound</option>
            </Select>
            <Input label="Tax / VAT Percentage (%)" type="number" {...register('taxPercent')} />
            <div className="col-span-2 flex justify-end pt-2">
              <Button variant="primary" type="submit"><FiSave size={16} /> Save Changes</Button>
            </div>
          </form>
        </Card>
      )}

      {activeTab === 'appearance' && (
        <Card className="p-6">
          <h2 className="font-semibold text-dark dark:text-slate-100 mb-6 pb-4 border-b border-slate-100 dark:border-dark-700">Appearance Settings</h2>
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-dark-700">
              <div>
                <p className="font-medium text-dark dark:text-slate-100">Theme Mode</p>
                <p className="text-sm text-slate-400 mt-0.5">Switch between light and dark mode</p>
              </div>
              <button onClick={() => dispatch(toggleTheme())}
                className={`relative w-14 h-7 rounded-full transition-colors ${mode === 'dark' ? 'bg-primary-600' : 'bg-slate-200'}`}>
                <span className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform ${mode === 'dark' ? 'translate-x-7' : 'translate-x-0.5'}`} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => mode === 'dark' && dispatch(toggleTheme())}
                className={`p-4 rounded-xl border-2 transition-all ${mode === 'light' ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10' : 'border-slate-200 dark:border-dark-700'}`}>
                <FiSun size={24} className="text-warning-500 mb-2" />
                <p className="font-medium text-dark dark:text-slate-100">Light Mode</p>
                <p className="text-xs text-slate-400">Clean and bright interface</p>
              </button>
              <button onClick={() => mode === 'light' && dispatch(toggleTheme())}
                className={`p-4 rounded-xl border-2 transition-all ${mode === 'dark' ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10' : 'border-slate-200 dark:border-dark-700'}`}>
                <FiMoon size={24} className="text-primary-400 mb-2" />
                <p className="font-medium text-dark dark:text-slate-100">Dark Mode</p>
                <p className="text-xs text-slate-400">Easy on the eyes at night</p>
              </button>
            </div>
          </div>
        </Card>
      )}

      {activeTab === 'notifications' && (
        <Card className="p-6">
          <h2 className="font-semibold text-dark dark:text-slate-100 mb-6 pb-4 border-b border-slate-100 dark:border-dark-700">Notification Preferences</h2>
          <div className="space-y-4">
            {[
              { label: 'Low Stock Alerts', desc: 'Get notified when products are running low', default: true },
              { label: 'New Order Notifications', desc: 'Alert for every new customer order', default: true },
              { label: 'Expired Product Alerts', desc: 'Daily digest of expiring products', default: true },
              { label: 'Employee Check-in', desc: 'Attendance and shift notifications', default: false },
              { label: 'Payment Confirmations', desc: 'Notify on successful payments', default: true },
              { label: 'Daily Sales Summary', desc: 'End-of-day sales report via email', default: false },
            ].map((n, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-dark-700">
                <div>
                  <p className="font-medium text-dark dark:text-slate-100">{n.label}</p>
                  <p className="text-sm text-slate-400 mt-0.5">{n.desc}</p>
                </div>
                <Toggle defaultChecked={n.default} />
              </div>
            ))}
          </div>
        </Card>
      )}

      {activeTab === 'security' && (
        <Card className="p-6">
          <h2 className="font-semibold text-dark dark:text-slate-100 mb-6 pb-4 border-b border-slate-100 dark:border-dark-700">Security Settings</h2>
          <div className="space-y-5">
            <div className="space-y-4">
              <h3 className="font-medium text-dark dark:text-slate-100">Change Password</h3>
              <Input label="Current Password" type="password" placeholder="Enter current password" />
              <Input label="New Password" type="password" placeholder="Enter new password" />
              <Input label="Confirm Password" type="password" placeholder="Confirm new password" />
              <Button variant="primary" onClick={() => toast.success('Password updated!')}><FiSave size={16} /> Update Password</Button>
            </div>
            <div className="pt-4 border-t border-slate-100 dark:border-dark-700">
              <h3 className="font-medium text-dark dark:text-slate-100 mb-2">Two-Factor Authentication</h3>
              <p className="text-sm text-slate-400 mb-3">Add an extra layer of security to your account</p>
              <Button variant="secondary">Enable 2FA</Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}

function Toggle({ defaultChecked }) {
  const [checked, setChecked] = useState(defaultChecked)
  return (
    <button onClick={() => setChecked(!checked)}
      className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 ${checked ? 'bg-primary-600' : 'bg-slate-200 dark:bg-dark-600'}`}>
      <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-6' : 'translate-x-0.5'}`} />
    </button>
  )
}
