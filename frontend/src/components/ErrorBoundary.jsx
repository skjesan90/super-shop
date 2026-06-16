import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: '40px', fontFamily: 'monospace' }}>
          <h2 style={{ color: '#EF4444' }}>Something went wrong</h2>
          <pre style={{ background: '#f1f5f9', padding: '16px', borderRadius: '8px', marginTop: '12px', whiteSpace: 'pre-wrap', fontSize: '13px' }}>
            {this.state.error.message}<br/>{this.state.error.stack}
          </pre>
          <button onClick={() => { localStorage.clear(); window.location.reload() }}
            style={{ marginTop: '16px', padding: '8px 24px', background: '#2563EB', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
            Clear localStorage & Reload
          </button>
        </div>
      )
    }
    return this.props.children
  }
}