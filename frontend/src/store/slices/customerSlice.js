import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { customerService } from '../../services/api'

export const fetchCustomers = createAsyncThunk('customers/fetchAll', async (params, { rejectWithValue }) => {
  try {
    const { data } = await customerService.getAll(params)
    return data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch customers')
  }
})

export const addCustomer = createAsyncThunk('customers/add', async (customerData, { rejectWithValue }) => {
  try {
    const { data } = await customerService.create(customerData)
    return data.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to add customer')
  }
})

export const updateCustomer = createAsyncThunk('customers/update', async ({ id, ...customerData }, { rejectWithValue }) => {
  try {
    const { data } = await customerService.update(id, customerData)
    return data.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update customer')
  }
})

export const deleteCustomer = createAsyncThunk('customers/delete', async (id, { rejectWithValue }) => {
  try {
    await customerService.delete(id)
    return id
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to delete customer')
  }
})

const customerSlice = createSlice({
  name: 'customers',
  initialState: { items: [], loading: false, error: null, total: 0 },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCustomers.pending, (state) => { state.loading = true; state.error = null })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload?.data || []
        state.total = action.payload?.total
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.loading = false; state.error = action.payload
      })
      .addCase(addCustomer.fulfilled, (state, action) => {
        if (action.payload) state.items.unshift(action.payload)
      })
      .addCase(updateCustomer.fulfilled, (state, action) => {
        if (!action.payload) return
        const idx = state.items.findIndex(c => c.id === action.payload.id)
        if (idx !== -1) state.items[idx] = action.payload
      })
      .addCase(deleteCustomer.fulfilled, (state, action) => {
        state.items = state.items.filter(c => c.id !== action.payload)
      })
  },
})

export default customerSlice.reducer
