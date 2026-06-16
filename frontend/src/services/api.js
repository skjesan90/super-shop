import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

const api = axios.create({ baseURL: API_BASE, timeout: 10000 })

function toCamel(str) {
  return str.replace(/_([a-z])/g, (_, c) => c.toUpperCase())
}

function transformKeys(obj) {
  if (Array.isArray(obj)) return obj.map(transformKeys)
  if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((acc, key) => {
      acc[toCamel(key)] = transformKeys(obj[key])
      return acc
    }, {})
  }
  if (typeof obj === 'string' && /^(0|[1-9]\d*)(\.\d+)?$/.test(obj)) {
    const n = Number(obj)
    if (!isNaN(n)) return n % 1 === 0 ? Math.round(n) : n
  }
  return obj
}

// Request interceptor - attach JWT
api.interceptors.request.use(config => {
  const token = localStorage.getItem('shopToken')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Response interceptor - convert snake_case to camelCase
api.interceptors.response.use(
  res => {
    if (res.data) res.data = transformKeys(res.data)
    return res
  },
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('shopUser')
      localStorage.removeItem('shopToken')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// -- Auth --
export const authService = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  changePassword: (data) => api.put('/auth/change-password', data),
}

// -- Products --
export const productService = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
  adjustStock: (id, data) => api.put(`/products/${id}/adjust-stock`, data),
}

// -- Customers --
export const customerService = {
  getAll: (params) => api.get('/customers', { params }),
  getById: (id) => api.get(`/customers/${id}`),
  create: (data) => api.post('/customers', data),
  update: (id, data) => api.put(`/customers/${id}`, data),
  delete: (id) => api.delete(`/customers/${id}`),
}

// -- Suppliers --
export const supplierService = {
  getAll: () => api.get('/suppliers'),
  create: (data) => api.post('/suppliers', data),
  update: (id, data) => api.put(`/suppliers/${id}`, data),
  delete: (id) => api.delete(`/suppliers/${id}`),
}

// -- Employees --
export const employeeService = {
  getAll: () => api.get('/employees'),
  create: (data) => api.post('/employees', data),
  update: (id, data) => api.put(`/employees/${id}`, data),
  delete: (id) => api.delete(`/employees/${id}`),
}

// -- Orders --
export const orderService = {
  getAll: (params) => api.get('/orders', { params }),
  getById: (id) => api.get(`/orders/${id}`),
  create: (data) => api.post('/orders', data),
  updateStatus: (id, status) => api.put(`/orders/${id}/status`, { status }),
}

// -- Branches --
export const branchService = {
  getAll: () => api.get('/branches'),
  create: (data) => api.post('/branches', data),
  update: (id, data) => api.put(`/branches/${id}`, data),
}

// -- Purchases --
export const purchaseService = {
  getAll: () => api.get('/purchases'),
  create: (data) => api.post('/purchases', data),
  receive: (id) => api.put(`/purchases/${id}/receive`),
  update: (id, data) => api.put(`/purchases/${id}`, data),
}

// -- Expenses --
export const expenseService = {
  getAll: (params) => api.get('/expenses', { params }),
  create: (data) => api.post('/expenses', data),
  update: (id, data) => api.put(`/expenses/${id}`, data),
  delete: (id) => api.delete(`/expenses/${id}`),
}

// -- Dashboard --
export const dashboardService = {
  getStats: (period) => api.get('/dashboard/stats', { params: { period } }),
  getSalesChart: (period) => api.get('/dashboard/sales-chart', { params: { period } }),
  getTopProducts: () => api.get('/dashboard/top-products'),
  getRecentTransactions: () => api.get('/dashboard/recent-transactions'),
  getCustomerGrowth: (period) => api.get('/dashboard/customer-growth', { params: { period } }),
  getMonthlyExpenses: (period) => api.get('/dashboard/monthly-expenses', { params: { period } }),
}

export default api
