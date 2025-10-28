import { configureStore } from '@reduxjs/toolkit'
import userReducer from './slices/userSlice.ts'
import navbarReducer from './slices/navbarSlice.ts'
import { isDev } from '../constants/environment.ts'
import collaborationReducer from './slices/collaborationSlice.ts'
import notificationSnackbarReducer from './slices/notificationSnackbarSlice.ts'

export const store = configureStore({
  reducer: {
    user: userReducer,
    navbar: navbarReducer,
    collaboration: collaborationReducer,
    notificationSnackbar: notificationSnackbarReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
  devTools: isDev(),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
