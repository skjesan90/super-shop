import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { productService } from '../../services/api'

export const fetchProducts = createAsyncThunk('products/fetchAll', async (params, { rejectWithValue }) => {
  try {
    const { data } = await productService.getAll(params)
    return data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch products')
  }
})

export const addProduct = createAsyncThunk('products/add', async (productData, { rejectWithValue }) => {
  try {
    const { data } = await productService.create(productData)
    return data.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to add product')
  }
})

export const updateProduct = createAsyncThunk('products/update', async ({ id, ...productData }, { rejectWithValue }) => {
  try {
    const { data } = await productService.update(id, productData)
    return data.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update product')
  }
})

export const deleteProduct = createAsyncThunk('products/delete', async (id, { rejectWithValue }) => {
  try {
    await productService.delete(id)
    return id
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to delete product')
  }
})

export const adjustStock = createAsyncThunk('products/adjustStock', async ({ id, ...stockData }, { rejectWithValue }) => {
  try {
    const { data } = await productService.adjustStock(id, stockData)
    return data.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to adjust stock')
  }
})

const productSlice = createSlice({
  name: 'products',
  initialState: { items: [], loading: false, error: null, total: 0, pages: 0 },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => { state.loading = true; state.error = null })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload?.data || []
        state.total = action.payload?.total
        state.pages = action.payload?.pages
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false; state.error = action.payload
      })
      .addCase(addProduct.fulfilled, (state, action) => {
        if (action.payload) state.items.unshift(action.payload)
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        if (!action.payload) return
        const idx = state.items.findIndex(p => p.id === action.payload.id)
        if (idx !== -1) state.items[idx] = action.payload
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.items = state.items.filter(p => p.id !== action.payload)
      })
      .addCase(adjustStock.fulfilled, (state, action) => {
        const idx = state.items.findIndex(p => p.id === action.payload.id)
        if (idx !== -1) state.items[idx] = action.payload
      })
  },
})

export default productSlice.reducer
