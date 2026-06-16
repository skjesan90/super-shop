import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { orderService } from '../../services/api'

export const submitOrder = createAsyncThunk('pos/submitOrder', async (orderData, { rejectWithValue }) => {
  try {
    const { data } = await orderService.create(orderData)
    return data.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to create order')
  }
})

const posSlice = createSlice({
  name: 'pos',
  initialState: {
    cartItems: [],
    selectedCustomer: null,
    discount: 0,
    vatRate: 5,
    paymentMethod: 'Cash',
    invoiceHistory: [],
    loading: false,
    error: null,
  },
  reducers: {
    addToCart(state, action) {
      const existing = state.cartItems.find(i => i.id === action.payload.id)
      if (existing) existing.qty += 1
      else state.cartItems.push({ ...action.payload, qty: 1 })
    },
    removeFromCart(state, action) {
      state.cartItems = state.cartItems.filter(i => i.id !== action.payload)
    },
    updateQty(state, action) {
      const item = state.cartItems.find(i => i.id === action.payload.id)
      if (item) item.qty = Math.max(1, action.payload.qty)
    },
    setCustomer(state, action) { state.selectedCustomer = action.payload },
    setDiscount(state, action) { state.discount = action.payload },
    setVatRate(state, action) { state.vatRate = action.payload },
    setPaymentMethod(state, action) { state.paymentMethod = action.payload },
    clearCart(state) {
      state.cartItems = []
      state.selectedCustomer = null
      state.discount = 0
    },
    saveInvoice(state, action) {
      state.invoiceHistory.unshift(action.payload)
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitOrder.pending, (state) => { state.loading = true; state.error = null })
      .addCase(submitOrder.fulfilled, (state, action) => {
        state.loading = false
        state.invoiceHistory.unshift(action.payload)
        state.cartItems = []
        state.selectedCustomer = null
        state.discount = 0
      })
      .addCase(submitOrder.rejected, (state, action) => {
        state.loading = false; state.error = action.payload
      })
  },
})

export const { addToCart, removeFromCart, updateQty, setCustomer, setDiscount, setVatRate, setPaymentMethod, clearCart, saveInvoice } = posSlice.actions
export default posSlice.reducer
