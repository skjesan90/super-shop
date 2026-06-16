import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { authService } from '../../services/api'

export const loginUser = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const { data } = await authService.login(credentials)
    localStorage.setItem('shopUser', JSON.stringify(data.user))
    localStorage.setItem('shopToken', data.token)
    return data.user
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Login failed')
  }
})

export const registerUser = createAsyncThunk('auth/register', async (userData, { rejectWithValue }) => {
  try {
    const { data } = await authService.register(userData)
    localStorage.setItem('shopUser', JSON.stringify(data.user))
    localStorage.setItem('shopToken', data.token)
    return data.user
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Registration failed')
  }
})

export const fetchMe = createAsyncThunk('auth/me', async (_, { rejectWithValue }) => {
  try {
    const { data } = await authService.getMe()
    return data.user
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch user')
  }
})

export const changePassword = createAsyncThunk('auth/changePassword', async (passwords, { rejectWithValue }) => {
  try {
    const { data } = await authService.changePassword(passwords)
    return data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to change password')
  }
})

let savedUser = null
try {
  const raw = localStorage.getItem('shopUser')
  if (raw) savedUser = JSON.parse(raw)
} catch (e) {
  localStorage.removeItem('shopUser')
  localStorage.removeItem('shopToken')
}

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: savedUser,
    isAuthenticated: !!savedUser,
    loading: false,
    error: null,
  },
  reducers: {
    logout(state) {
      state.user = null
      state.isAuthenticated = false
      localStorage.removeItem('shopUser')
      localStorage.removeItem('shopToken')
    },
    clearError(state) { state.error = null },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => { state.loading = true; state.error = null })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false; state.user = action.payload; state.isAuthenticated = true
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false; state.error = action.payload
      })
      .addCase(registerUser.pending, (state) => { state.loading = true; state.error = null })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false; state.user = action.payload; state.isAuthenticated = true
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false; state.error = action.payload
      })
  },
})

export const { logout, clearError } = authSlice.actions
export default authSlice.reducer
