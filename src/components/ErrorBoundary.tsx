import React, { Component, ReactNode, ErrorInfo } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Home, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('🔴 ErrorBoundary caught an error:', error, errorInfo);
    console.error('🔴 Error name:', error.name);
    console.error('🔴 Error message:', error.message);
    console.error('🔴 Error stack:', error.stack);
    console.error('🔴 Component stack:', errorInfo.componentStack);
    
    this.setState({
      error,
      errorInfo
    });

    // Track error in analytics if available
    if (typeof window !== 'undefined' && (window as any).analytics) {
      (window as any).analytics.track('error_boundary_triggered', {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack
      });
    }
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  handleGoHome = (): void => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-destructive" />
              </div>
            </div>
            
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-2">
                Something went wrong
              </h1>
              <p className="text-muted-foreground mb-4">
                We encountered an unexpected error. This has been logged and our team will investigate.
              </p>
              
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="text-left bg-muted p-4 rounded-lg mb-4">
                  <summary className="cursor-pointer font-semibold text-sm mb-2">
                    Error Details (Development)
                  </summary>
                  <pre className="text-xs text-destructive whitespace-pre-wrap overflow-auto">
                    {this.state.error.message}
                    {'\n\n'}
                    {this.state.error.stack}
                    {this.state.errorInfo?.componentStack && (
                      '\n\nComponent Stack:' + this.state.errorInfo.componentStack
                    )}
                  </pre>
                </details>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={this.handleRetry}
                variant="default"
                className="flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Try Again
              </Button>
              
              <Button
                onClick={this.handleGoHome}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Home className="w-4 h-4" />
                Go Home
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;