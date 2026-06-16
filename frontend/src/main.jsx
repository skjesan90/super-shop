import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { store } from './store'
import App from './App'
import ErrorBoundary from './components/ErrorBoundary'
import './index.css'

window.onerror = (msg, url, line, col, err) => {
  const div = document.createElement('pre')
  div.style.cssText = 'position:fixed;top:0;left:0;right:0;background:#EF4444;color:white;padding:16px;font-size:13px;z-index:99999;white-space:pre-wrap'
  div.textContent = `ERROR: ${msg}\n${err?.stack || ''}`
  document.body.prepend(div)
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </Provider>
  </React.StrictMode>
)
