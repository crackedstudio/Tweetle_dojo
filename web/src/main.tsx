import { StrictMode, Component, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App';
import { WalletProvider } from './providers/WalletProvider';
import { DojoProvider } from './providers/DojoProvider';

class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 40, color: '#EF4444', fontFamily: 'monospace', background: '#0E1A20', minHeight: '100vh' }}>
          <h1>App crashed</h1>
          <pre style={{ whiteSpace: 'pre-wrap', color: '#8BA8B8' }}>{this.state.error.message}</pre>
          <pre style={{ whiteSpace: 'pre-wrap', color: '#4A6A7A', fontSize: 12 }}>{this.state.error.stack}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <WalletProvider>
          <DojoProvider>
            <App />
          </DojoProvider>
        </WalletProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
);
