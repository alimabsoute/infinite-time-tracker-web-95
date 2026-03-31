
interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  sessionId?: string;
  timestamp?: string;
  userAgent?: string;
  url?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  additionalData?: Record<string, any>;
}

interface ErrorLog {
  id: string;
  error: Error;
  context: ErrorContext;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'rendering' | '3d' | 'data' | 'network' | 'unknown';
  resolved: boolean;
  timestamp: string;
}

class ErrorMonitoringService {
  private errors: ErrorLog[] = [];
  private maxErrors = 100;
  private sessionId: string;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.setupGlobalErrorHandlers();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private setupGlobalErrorHandlers(): void {
    // Global error handler
    window.addEventListener('error', (event) => {
      this.captureError(event.error || new Error(event.message), {
        component: 'global',
        action: 'runtime_error',
        additionalData: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno
        }
      });
    });

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      this.captureError(
        event.reason instanceof Error ? event.reason : new Error(String(event.reason)),
        {
          component: 'global',
          action: 'unhandled_promise_rejection'
        }
      );
    });

    // WebGL context lost handler
    document.addEventListener('webglcontextlost', (_event) => {
      this.captureError(new Error('WebGL context lost'), {
        component: 'webgl',
        action: 'context_lost',
        severity: 'high'
      });
    });
  }

  captureError(error: Error, context: ErrorContext = {}): string {
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const errorLog: ErrorLog = {
      id: errorId,
      error,
      context: {
        ...context,
        sessionId: this.sessionId,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      },
      severity: context.severity || this.categorizeErrorSeverity(error, context),
      category: this.categorizeError(error),
      resolved: false,
      timestamp: new Date().toISOString()
    };

    this.errors.push(errorLog);
    
    // Keep only the most recent errors
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(-this.maxErrors);
    }

    // Log to console with enhanced details
    const logLevel = this.getConsoleLogLevel(errorLog.severity);
    console[logLevel]('ErrorMonitoring - Captured error:', {
      id: errorId,
      message: error.message,
      category: errorLog.category,
      severity: errorLog.severity,
      context: errorLog.context
    });

    // Send to analytics if available
    this.sendToAnalytics(errorLog);

    return errorId;
  }

  private categorizeError(error: Error): ErrorLog['category'] {
    const message = error.message?.toLowerCase() || '';
    const stack = error.stack?.toLowerCase() || '';

    if (message.includes('webgl') || message.includes('three') || stack.includes('three')) {
      return '3d';
    } else if (message.includes('query') || message.includes('fetch') || message.includes('network')) {
      return 'data';
    } else if (message.includes('network') || message.includes('fetch')) {
      return 'network';
    } else if (message.includes('render') || stack.includes('react')) {
      return 'rendering';
    }
    
    return 'unknown';
  }

  private categorizeErrorSeverity(error: Error, _context: ErrorContext): ErrorLog['severity'] {
    const category = this.categorizeError(error);
    
    // High severity for 3D and rendering errors
    if (category === '3d' || category === 'rendering') {
      return 'high';
    }
    
    // Medium for data and network issues
    if (category === 'data' || category === 'network') {
      return 'medium';
    }
    
    // Critical if it affects core functionality
    if (error.message?.includes('Cannot read properties of undefined')) {
      return 'critical';
    }
    
    return 'low';
  }

  private getConsoleLogLevel(severity: ErrorLog['severity']): 'log' | 'warn' | 'error' {
    switch (severity) {
      case 'critical':
      case 'high':
        return 'error';
      case 'medium':
        return 'warn';
      default:
        return 'log';
    }
  }

  private sendToAnalytics(errorLog: ErrorLog): void {
    try {
      if (typeof window !== 'undefined' && (window as any).analytics) {
        (window as any).analytics.track('error_captured', {
          errorId: errorLog.id,
          category: errorLog.category,
          severity: errorLog.severity,
          message: errorLog.error.message,
          component: errorLog.context.component,
          action: errorLog.context.action,
          sessionId: this.sessionId
        });
      }
    } catch (analyticsError) {
      console.warn('ErrorMonitoring - Failed to send to analytics:', analyticsError);
    }
  }

  getRecentErrors(limit = 10): ErrorLog[] {
    return this.errors
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  getErrorsByCategory(category: ErrorLog['category']): ErrorLog[] {
    return this.errors.filter(error => error.category === category);
  }

  getErrorStats(): Record<string, number> {
    const stats: Record<string, number> = {
      total: this.errors.length,
      critical: 0,
      high: 0,
      medium: 0,
      low: 0
    };

    this.errors.forEach(error => {
      stats[error.severity]++;
    });

    return stats;
  }

  markErrorResolved(errorId: string): boolean {
    const error = this.errors.find(e => e.id === errorId);
    if (error) {
      error.resolved = true;
      return true;
    }
    return false;
  }

  clearErrors(): void {
    this.errors = [];
  }
}

// Create and export singleton instance
export const errorMonitoring = new ErrorMonitoringService();

// Convenience function for components
export const captureError = (error: Error, context?: ErrorContext): string => {
  return errorMonitoring.captureError(error, context);
};

export default errorMonitoring;
