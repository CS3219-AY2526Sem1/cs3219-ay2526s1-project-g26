import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { Provider } from 'react-redux'
import { store } from './store'
import CssBaseline from '@mui/material/CssBaseline'

const rootElement = document.getElementById('root') as HTMLElement

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <React.StrictMode>
      <Provider store={store}>
        <CssBaseline />
        <App />
      </Provider>
    </React.StrictMode>
  )
}
