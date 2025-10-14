import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { Provider } from 'react-redux'
import { store } from './store'
import { CssBaseline, GlobalStyles } from '@mui/material'

const rootElement = document.getElementById('root') as HTMLElement

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <React.StrictMode>
      <Provider store={store}>
        <CssBaseline />
        <GlobalStyles
          styles={(_theme) => ({
            body: { overflowY: 'hidden' },
          })}
        />
        <App />
      </Provider>
    </React.StrictMode>
  )
}
