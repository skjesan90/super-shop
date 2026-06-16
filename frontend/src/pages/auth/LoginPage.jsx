import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { loginUser, clearError } from '../../store/slices/authSlice'
import { FiShoppingCart, FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight } from 'react-icons/fi'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { isAuthenticated, loading, error } = useSelector(s => s.auth)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)

  useEffect(() => { if (isAuthenticated) navigate('/dashboard') }, [isAuthenticated, navigate])
  useEffect(() => {
    if (error) { toast.error(error); dispatch(clearError()) }
  }, [error, dispatch])

  const handleSubmit = (e) => {
    e.preventDefault()
    dispatch(loginUser({ email, password }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark via-dark-800 to-primary-900 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-primary-500/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-success-500/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-500/30">
            <FiShoppingCart size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Smart Super Shop</h1>
          <p className="text-slate-400 text-sm mt-1">ERP & POS Management System</p>
        </div>

        {/* Card */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-xl font-semibold text-white mb-6">Welcome back</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300">Email Address</label>
              <div className="relative">
                <FiMail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all"
                  placeholder="Enter your email" />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300">Password</label>
              <div className="relative">
                <FiLock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required
                  className="w-full pl-10 pr-10 py-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all"
                  placeholder="Enter your password" />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200">
                  {showPass ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary-500/20 disabled:opacity-50">
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <><span>Sign In</span><FiArrowRight size={18} /></>
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 pt-5 border-t border-white/10">
            <p className="text-xs text-center mb-3 font-semibold">
              <span className="text-purple-400">D</span><span className="text-blue-400">e</span><span className="text-green-400">m</span><span className="text-yellow-400">o</span>{' '}
              <span className="text-purple-400">C</span><span className="text-pink-400">r</span><span className="text-blue-400">e</span><span className="text-green-400">d</span><span className="text-yellow-400">e</span><span className="text-purple-400">n</span><span className="text-pink-400">t</span><span className="text-blue-400">i</span><span className="text-green-400">a</span><span className="text-yellow-400">l</span><span className="text-purple-400">s</span>
            </p>
            <div className="space-y-1.5">
              {[
                { role: 'Admin', email: 'admin@shop.com', pass: 'admin123', sub: 'Gulshan', color: 'text-purple-400', bg: 'hover:bg-purple-500/20', border: 'border-purple-500/30' },
                { role: 'Manager', email: 'manager@shop.com', pass: 'manager123', sub: 'Gulshan', color: 'text-blue-400', bg: 'hover:bg-blue-500/20', border: 'border-blue-500/30' },
                { role: 'Cashier', email: 'cashier@shop.com', pass: 'cashier123', sub: 'Gulshan', color: 'text-emerald-400', bg: 'hover:bg-emerald-500/20', border: 'border-emerald-500/30' },
                { role: 'Cashier', email: 'cashier2@shop.com', pass: 'cashier123', sub: 'Dhanmondi', color: 'text-teal-400', bg: 'hover:bg-teal-500/20', border: 'border-teal-500/30' },
                { role: 'Cashier', email: 'cashier3@shop.com', pass: 'cashier123', sub: 'Uttara', color: 'text-cyan-400', bg: 'hover:bg-cyan-500/20', border: 'border-cyan-500/30' },
              ].map(c => (
                <button key={c.email} type="button" onClick={() => { setEmail(c.email); setPassword(c.pass) }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg bg-white/5 ${c.bg} border border-transparent ${c.border} transition-all text-left`}>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold uppercase ${c.color}`}>{c.role}</span>
                    <span className="text-xs text-slate-300">{c.email}</span>
                    {c.sub && <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-slate-400">{c.sub}</span>}
                  </div>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white/10 text-slate-300">{c.pass}</span>
                </button>
              ))}
            </div>
          </div>

        </div>

        <p className="text-center text-xs mt-6">
          <span className="text-purple-400">©</span>{' '}
          <span className="text-blue-300">2024</span>{' '}
          <span className="text-green-300">Smart</span>{' '}
          <span className="text-yellow-300">Super</span>{' '}
          <span className="text-pink-300">Shop</span>{' '}
          <span className="text-purple-300">ERP</span>
          <span className="text-slate-500">. All rights reserved.</span>
        </p>
      </div>
    </div>
  )
}
