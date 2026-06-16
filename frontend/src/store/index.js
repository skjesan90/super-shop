import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import themeReducer from './slices/themeSlice'
import productReducer from './slices/productSlice'
import customerReducer from './slices/customerSlice'
import posReducer from './slices/posSlice'
import notificationReducer from './slices/notificationSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    theme: themeReducer,
    products: productReducer,
    customers: customerReducer,
    pos: posReducer,
    notifications: notificationReducer,
  },
})
