// ============================================
// Custom React Hooks - Smart Super Shop ERP
// ============================================
import { useState, useEffect, useCallback } from 'react'
import { useSelector } from 'react-redux'

// ─── useDebounce ──────────────────────────────
export function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}

// ─── useLocalStorage ──────────────────────────
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try { return JSON.parse(localStorage.getItem(key)) ?? initialValue }
    catch { return initialValue }
  })
  const set = useCallback(v => {
    setValue(v)
    localStorage.setItem(key, JSON.stringify(v))
  }, [key])
  return [value, set]
}

// ─── usePagination ────────────────────────────
export function usePagination(items, perPage = 10) {
  const [page, setPage] = useState(1)
  const totalPages = Math.ceil(items.length / perPage)
  const paginated = items.slice((page - 1) * perPage, page * perPage)
  const reset = () => setPage(1)
  return { page, setPage, paginated, totalPages, total: items.length, reset }
}

// ─── useSearch ────────────────────────────────
export function useSearch(items, fields = ['name']) {
  const [query, setQuery] = useState('')
  const filtered = query
    ? items.filter(item => fields.some(f => String(item[f] || '').toLowerCase().includes(query.toLowerCase())))
    : items
  return { query, setQuery, filtered }
}

// ─── useAuth ──────────────────────────────────
export function useAuth() {
  const { user, isAuthenticated } = useSelector(s => s.auth)
  const can = (...roles) => roles.includes(user?.role)
  return { user, isAuthenticated, can, isAdmin: user?.role === 'admin', isManager: user?.role === 'manager', isCashier: user?.role === 'cashier' }
}

// ─── useWindowSize ────────────────────────────
export function useWindowSize() {
  const [size, setSize] = useState({ width: window.innerWidth, height: window.innerHeight })
  useEffect(() => {
    const handler = () => setSize({ width: window.innerWidth, height: window.innerHeight })
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  return size
}

// ─── useClickOutside ──────────────────────────
export function useClickOutside(ref, handler) {
  useEffect(() => {
    const listener = e => { if (!ref.current || ref.current.contains(e.target)) return; handler(e) }
    document.addEventListener('mousedown', listener)
    return () => document.removeEventListener('mousedown', listener)
  }, [ref, handler])
}
