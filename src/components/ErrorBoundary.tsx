
import { Component, ReactNode, ErrorInfo } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Home, RotateCcw, Bug } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  errorType?: string;
  retryCount: number;
}

class ErrorBoundary extends Component<Props, State> {
  private maxRetries = 3;

  constructor(props: Props) {
    super(props);
    this.state = { 
      hasError: false,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Categorize error types for better handling
    let errorType = 'unknown';
    const message = error.message?.toLowerCase() || '';
    const stack = error.stack?.toLowerCase() || '';

    if (message.includes('webgl') || message.includes('three') || stack.includes('three')) {
      errorType = '3d_rendering';
    } else if (message.includes('query') || message.includes('tanstack')) {
      errorType = 'data_fetching';
    } else if (message.includes('react') || message.includes('fiber')) {
      errorType = 'react_rendering';
    } else if (message.includes('network') || message.includes('fetch')) {
      errorType = 'network';
    }

    console.error('ErrorBoundary - Error categorized as:', errorType, error);

    return {
      hasError: true,
      error,
      errorType
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const errorDetails = {
      name: error.name,
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorType: this.state.errorType,
      retryCount: this.state.retryCount,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    console.error('ErrorBoundary caught:', errorDetails);
    
    this.setState({
      error,
      errorInfo
    });

    // Call user's error handler
    this.props.onError?.(error, errorInfo);

    // Track error in analytics if available
    if (typeof window !== 'undefined' && (window as any).analytics) {
      (window as any).analytics.track('error_boundary_triggered', {
        ...errorDetails,
        stack: error.stack?.substring(0, 1000) // Limit stack trace length
      });
    }
  }

  handleRetry = (): void => {
    const newRetryCount = this.state.retryCount + 1;
    
    
    this.setState({ 
      hasError: false, 
      error: undefined, 
      errorInfo: undefined,
      retryCount: newRetryCount
    });
  };

  handleGoHome = (): void => {
    window.location.href = '/';
  };

  handleReload = (): void => {
    window.location.reload();
  };

  getErrorTypeMessage = (): { title: string; description: string; suggestions: string[] } => {
    switch (this.state.errorType) {
      case '3d_rendering':
        return {
          title: '3D Visualization Error',
          description: 'There was an issue with 3D rendering. This might be due to WebGL compatibility or graphics driver issues.',
          suggestions: [
            'Try switching to 2D visualization mode',
            'Update your browser to the latest version',
            'Check if hardware acceleration is enabled'
          ]
        };
      case 'data_fetching':
        return {
          title: 'Data Loading Error',
          description: 'There was an issue loading your timer data. This might be a temporary connectivity issue.',
          suggestions: [
            'Check your internet connection',
            'Try refreshing the page',
            'Clear your browser cache'
          ]
        };
      case 'react_rendering':
        return {
          title: 'Component Rendering Error',
          description: 'A component failed to render properly. This is usually a temporary issue.',
          suggestions: [
            'Try refreshing the page',
            'Clear your browser data',
            'Try a different browser'
          ]
        };
      case 'network':
        return {
          title: 'Network Connection Error',
          description: 'Unable to connect to the server. Please check your internet connection.',
          suggestions: [
            'Check your internet connection',
            'Try again in a few moments',
            'Contact support if the issue persists'
          ]
        };
      default:
        return {
          title: 'Something went wrong',
          description: 'We encountered an unexpected error. This has been logged and our team will investigate.',
          suggestions: [
            'Try refreshing the page',
            'Clear your browser cache',
            'Try again in a few moments'
          ]
        };
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const errorInfo = this.getErrorTypeMessage();
      const canRetry = this.state.retryCount < this.maxRetries;

      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="max-w-lg w-full text-center space-y-6">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-destructive" />
              </div>
            </div>
            
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-2">
                {errorInfo.title}
              </h1>
              <p className="text-muted-foreground mb-4">
                {errorInfo.description}
              </p>
              
              {/* Suggestions */}
              <div className="text-left bg-muted/50 p-4 rounded-lg mb-4">
                <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                  <Bug className="w-4 h-4" />
                  Troubleshooting Steps
                </h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {errorInfo.suggestions.map((suggestion, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-xs mt-1">•</span>
                      <span>{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Development error details */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="text-left bg-destructive/5 p-4 rounded-lg mb-4 border border-destructive/20">
                  <summary className="cursor-pointer font-semibold text-sm mb-2 text-destructive">
                    Error Details (Development)
                  </summary>
                  <div className="space-y-2">
                    <div>
                      <strong className="text-xs">Error Type:</strong>
                      <pre className="text-xs text-muted-foreground">{this.state.errorType}</pre>
                    </div>
                    <div>
                      <strong className="text-xs">Message:</strong>
                      <pre className="text-xs text-destructive whitespace-pre-wrap">
                        {this.state.error.message}
                      </pre>
                    </div>
                    <div>
                      <strong className="text-xs">Stack Trace:</strong>
                      <pre className="text-xs text-muted-foreground whitespace-pre-wrap overflow-auto max-h-32">
                        {this.state.error.stack}
                      </pre>
                    </div>
                    {this.state.errorInfo?.componentStack && (
                      <div>
                        <strong className="text-xs">Component Stack:</strong>
                        <pre className="text-xs text-muted-foreground whitespace-pre-wrap overflow-auto max-h-32">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {canRetry && (
                <Button
                  onClick={this.handleRetry}
                  variant="default"
                  className="flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Try Again ({this.maxRetries - this.state.retryCount} left)
                </Button>
              )}
              
              <Button
                onClick={this.handleReload}
                variant="outline"
                className="flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Reload Page
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

            {this.state.retryCount >= this.maxRetries && (
              <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded">
                Maximum retry attempts reached. Please try reloading the page or contact support if the issue persists.
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
