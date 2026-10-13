import React, { Component, ErrorInfo, ReactNode } from 'react';
import oxygoldLogo from '../assets/oxygoldlogo-wk.png';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // If dynamic chunk loading failed (e.g. new deployment or stale tab), auto-reload once
    const isChunkError =
      error?.message?.includes('Failed to fetch dynamically imported module') ||
      error?.message?.includes('dynamically imported module') ||
      error?.name === 'ChunkLoadError';

    if (isChunkError) {
      const hasRetried = sessionStorage.getItem('chunk_reload_attempt');
      if (!hasRetried) {
        sessionStorage.setItem('chunk_reload_attempt', 'true');
        window.location.reload();
      }
    }
  }

  private handleReload = () => {
    sessionStorage.removeItem('chunk_reload_attempt');
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#07061A',
            padding: 24,
            color: '#ffffff',
            textAlign: 'center',
            boxSizing: 'border-box',
          }}
        >
          <img
            src={oxygoldLogo}
            alt="OxyGold"
            style={{ width: 80, height: 80, objectFit: 'contain', marginBottom: 20 }}
          />
          <h2 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 10px', color: '#E2BF55' }}>
            Something went wrong
          </h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', maxWidth: 400, margin: '0 0 24px', lineHeight: 1.5 }}>
            We encountered an unexpected issue while loading this page. Please refresh to continue.
          </p>
          <button
            onClick={this.handleReload}
            style={{
              padding: '10px 24px',
              fontSize: 14,
              fontWeight: 600,
              borderRadius: 10,
              border: 'none',
              background: 'linear-gradient(135deg, #C29B27 0%, #8B6914 100%)',
              color: '#ffffff',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(194, 155, 39, 0.4)',
              transition: 'transform 0.15s ease',
            }}
          >
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
