import { createSlice } from '@reduxjs/toolkit'
import { NOTIFICATIONS_DATA } from '../../utils/dummyData'

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: { items: NOTIFICATIONS_DATA },
  reducers: {
    markRead(state, action) {
      const n = state.items.find(i => i.id === action.payload)
      if (n) n.read = true
    },
    markAllRead(state) { state.items.forEach(n => n.read = true) },
    deleteNotification(state, action) {
      state.items = state.items.filter(i => i.id !== action.payload)
    },
  },
})

export const { markRead, markAllRead, deleteNotification } = notificationSlice.actions
export default notificationSlice.reducer
