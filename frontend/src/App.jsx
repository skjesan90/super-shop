import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Layout from './components/layout/Layout'
import LoginPage from './pages/auth/LoginPage'
import Dashboard from './pages/dashboard/Dashboard'
import POSPage from './pages/pos/POSPage'
import ProductsPage from './pages/products/ProductsPage'
import InventoryPage from './pages/inventory/InventoryPage'
import CustomersPage from './pages/customers/CustomersPage'
import SuppliersPage from './pages/suppliers/SuppliersPage'
import EmployeesPage from './pages/employees/EmployeesPage'
import SalesPage from './pages/sales/SalesPage'
import PurchasesPage from './pages/purchases/PurchasesPage'
import ExpensesPage from './pages/expenses/ExpensesPage'
import NotificationsPage from './pages/notifications/NotificationsPage'
import SettingsPage from './pages/settings/SettingsPage'
import BranchesPage from './pages/branches/BranchesPage'
import AnalyticsPage from './pages/analytics/AnalyticsPage'

function PrivateRoute({ children }) {
  const { isAuthenticated } = useSelector(s => s.auth)
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

function RoleRoute({ children, roles }) {
  const { user } = useSelector(s => s.auth)
  if (!roles.includes(user?.role)) return <Navigate to="/dashboard" replace />
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="pos" element={<POSPage />} />
          <Route path="products" element={<RoleRoute roles={['admin','manager']}><ProductsPage /></RoleRoute>} />
          <Route path="products/categories" element={<RoleRoute roles={['admin','manager']}><ProductsPage /></RoleRoute>} />
          <Route path="inventory" element={<RoleRoute roles={['admin','manager']}><InventoryPage /></RoleRoute>} />
          <Route path="inventory/alerts" element={<RoleRoute roles={['admin','manager']}><InventoryPage /></RoleRoute>} />
          <Route path="customers" element={<RoleRoute roles={['admin','manager']}><CustomersPage /></RoleRoute>} />
          <Route path="suppliers" element={<RoleRoute roles={['admin','manager']}><SuppliersPage /></RoleRoute>} />
          <Route path="employees" element={<RoleRoute roles={['admin']}><EmployeesPage /></RoleRoute>} />
          <Route path="sales" element={<RoleRoute roles={['admin','manager']}><SalesPage /></RoleRoute>} />
          <Route path="sales/reports" element={<RoleRoute roles={['admin','manager']}><SalesPage /></RoleRoute>} />
          <Route path="purchases" element={<RoleRoute roles={['admin','manager']}><PurchasesPage /></RoleRoute>} />
          <Route path="expenses" element={<RoleRoute roles={['admin','manager']}><ExpensesPage /></RoleRoute>} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="settings" element={<RoleRoute roles={['admin']}><SettingsPage /></RoleRoute>} />
          <Route path="branches" element={<RoleRoute roles={['admin','cashier']}><BranchesPage /></RoleRoute>} />
          <Route path="analytics" element={<RoleRoute roles={['admin']}><AnalyticsPage /></RoleRoute>} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
