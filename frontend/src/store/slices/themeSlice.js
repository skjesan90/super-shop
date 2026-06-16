import { createSlice } from '@reduxjs/toolkit'

const savedTheme = localStorage.getItem('shopTheme') || 'light'
if (savedTheme === 'dark') document.documentElement.classList.add('dark')

const themeSlice = createSlice({
  name: 'theme',
  initialState: { mode: savedTheme },
  reducers: {
    toggleTheme(state) {
      state.mode = state.mode === 'light' ? 'dark' : 'light'
      localStorage.setItem('shopTheme', state.mode)
      if (state.mode === 'dark') document.documentElement.classList.add('dark')
      else document.documentElement.classList.remove('dark')
    },
    setTheme(state, action) {
      state.mode = action.payload
      localStorage.setItem('shopTheme', action.payload)
      if (action.payload === 'dark') document.documentElement.classList.add('dark')
      else document.documentElement.classList.remove('dark')
    },
  },
})

export const { toggleTheme, setTheme } = themeSlice.actions
export default themeSlice.reducer
