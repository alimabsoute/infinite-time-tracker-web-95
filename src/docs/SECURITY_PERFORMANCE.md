# Security & Performance

## Security Architecture

### Authentication & Authorization

#### Supabase Auth Integration
```typescript
// Secure authentication flow
const { data: { user }, error } = await supabase.auth.signInWithPassword({
  email,
  password
});

// OAuth integration
await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: `${window.location.origin}/auth/callback`
  }
});
```

#### Row Level Security (RLS)
All database tables implement comprehensive RLS policies:

```sql
-- Timer access control
CREATE POLICY "Users can only access their own timers" 
ON timers FOR ALL 
USING (auth.uid() = user_id);

-- Session isolation
CREATE POLICY "Users can manage their own timer sessions" 
ON timer_sessions FOR ALL 
USING (auth.uid() = user_id);

-- Goal privacy
CREATE POLICY "Users can view their own goals" 
ON goals FOR SELECT 
USING (auth.uid() = user_id);
```

### Data Protection

#### Input Validation
```typescript
// Timer name sanitization
const sanitizeTimerName = (name: string): string => {
  return name.trim().slice(0, 100); // Max length limit
};

// Priority validation
const validatePriority = (priority: number): boolean => {
  return priority >= 1 && priority <= 5;
};

// Deadline validation
const validateDeadline = (deadline: Date): boolean => {
  return deadline > new Date(); // Future dates only
};
```

#### SQL Injection Prevention
- **Parameterized Queries**: All database operations use Supabase SDK
- **Type Safety**: TypeScript prevents type-related vulnerabilities
- **Query Builder**: No raw SQL in client code

#### XSS Protection
```typescript
// Content sanitization
const sanitizeContent = (content: string): string => {
  return content
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
};

// Safe HTML rendering
const SafeContent = ({ content }: { content: string }) => (
  <div dangerouslySetInnerHTML={{ 
    __html: DOMPurify.sanitize(content) 
  }} />
);
```

### API Security

#### Edge Function Security
```typescript
// Authentication verification
const authHeader = req.headers.get("Authorization");
if (!authHeader) {
  throw new Error("No authorization header provided");
}

const token = authHeader.replace("Bearer ", "");
const { data: userData, error } = await supabase.auth.getUser(token);
if (error || !userData.user) {
  throw new Error("Invalid authentication");
}
```

#### Rate Limiting
- **Supabase Rate Limits**: Built-in API rate limiting
- **Client-side Debouncing**: Prevent excessive requests
- **Edge Function Limits**: Serverless function execution limits

### Secret Management
```typescript
// Environment variables (Edge Functions)
const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

// Never expose secrets in client code
// All sensitive operations in Edge Functions
```

## Performance Optimization

### Frontend Performance

#### Component Optimization
```typescript
// Memoized components
const TimerCard = React.memo(({ timer, onToggle, onDelete }) => {
  return (
    <div className="timer-card">
      {/* Timer UI */}
    </div>
  );
});

// Expensive calculations cached
const timerAnalytics = useMemo(() => {
  return calculateAnalytics(timers, sessions);
}, [timers, sessions]);

// Callback optimization
const handleTimerToggle = useCallback((id: string) => {
  toggleTimer(id);
}, [toggleTimer]);
```

#### Virtual Scrolling
```typescript
// Large timer lists optimization
const VirtualizedTimerList = ({ timers }) => {
  const { virtualItems, totalSize } = useVirtualizer({
    count: timers.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 120, // Timer card height
  });
  
  return (
    <div style={{ height: totalSize }}>
      {virtualItems.map(virtualItem => (
        <TimerCard 
          key={virtualItem.key}
          timer={timers[virtualItem.index]}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: virtualItem.size,
            transform: `translateY(${virtualItem.start}px)`
          }}
        />
      ))}
    </div>
  );
};
```

### 3D Visualization Performance

#### WebGL Optimization
```typescript
// Efficient 3D rendering
const BubbleChart3D = () => {
  // Geometry instancing for multiple bubbles
  const { nodes, materials } = useMemo(() => {
    const geometry = new THREE.SphereGeometry(1, 16, 12);
    const material = new THREE.MeshPhongMaterial();
    return { geometry, material };
  }, []);
  
  // LOD (Level of Detail) system
  const LODComponent = ({ distance, children }) => {
    const shouldRender = distance < LOD_DISTANCE;
    return shouldRender ? children : null;
  };
  
  // Frustum culling
  const visibleBubbles = bubbles.filter(bubble => 
    isInViewFrustum(bubble.position, camera)
  );
  
  return (
    <Canvas>
      {visibleBubbles.map(bubble => (
        <BubbleMesh key={bubble.id} {...bubble} />
      ))}
    </Canvas>
  );
};
```

#### Fallback Strategies
```typescript
// WebGL feature detection
const WebGLSupport = () => {
  const [hasWebGL, setHasWebGL] = useState(true);
  
  useEffect(() => {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    setHasWebGL(!!gl);
  }, []);
  
  return hasWebGL ? <Chart3D /> : <Chart2D />;
};
```

### Database Performance

#### Query Optimization
```sql
-- Efficient user-scoped queries with indexes
CREATE INDEX idx_timers_user_id_created ON timers(user_id, created_at);
CREATE INDEX idx_sessions_timer_start ON timer_sessions(timer_id, start_time);

-- Composite indexes for common query patterns
CREATE INDEX idx_timers_user_running ON timers(user_id, is_running) 
WHERE deleted_at IS NULL;
```

#### Connection Management
```typescript
// Supabase connection pooling
const supabase = createClient(url, key, {
  db: {
    schema: 'public',
  },
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10, // Rate limiting
    },
  },
});
```

### Real-time Performance

#### Efficient Updates
```typescript
// Debounced database updates
const debouncedSaveTimer = useDebouncedCallback(
  async (timer: Timer) => {
    await supabase
      .from('timers')
      .update({ elapsed_time: timer.elapsed_time })
      .eq('id', timer.id);
  },
  1000 // Save every second max
);

// Batched updates
const batchUpdateTimers = async (updates: TimerUpdate[]) => {
  const { error } = await supabase.rpc('batch_update_timers', {
    timer_updates: updates
  });
  if (error) throw error;
};
```

#### Memory Management
```typescript
// Cleanup intervals and listeners
useEffect(() => {
  const interval = setInterval(updateRunningTimers, 1000);
  const subscription = supabase
    .channel('timer-changes')
    .on('postgres_changes', handleTimerChange)
    .subscribe();
    
  return () => {
    clearInterval(interval);
    subscription.unsubscribe();
  };
}, []);

// Image and resource cleanup
useEffect(() => {
  return () => {
    // Cleanup canvas contexts
    canvasRef.current?.getContext('2d')?.clearRect(0, 0, width, height);
    
    // Cleanup WebGL resources
    renderer?.dispose();
    geometry?.dispose();
    material?.dispose();
  };
}, []);
```

## Monitoring & Analytics

### Error Tracking
```typescript
// Error boundary with reporting
class ErrorBoundary extends React.Component {
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log to monitoring service
    console.error('Timer Error:', error, errorInfo);
    
    // Track error metrics
    analytics.track('error_occurred', {
      error: error.message,
      component: errorInfo.componentStack,
      timestamp: Date.now()
    });
  }
}
```

### Performance Metrics
```typescript
// Timer accuracy monitoring
const validateTimerAccuracy = (timer: Timer) => {
  const expectedTime = calculateExpectedElapsed(timer);
  const actualTime = timer.elapsed_time;
  const accuracy = Math.abs(expectedTime - actualTime) / expectedTime;
  
  if (accuracy > 0.05) { // 5% tolerance
    console.warn('Timer accuracy issue:', {
      timerId: timer.id,
      expected: expectedTime,
      actual: actualTime,
      accuracy: accuracy
    });
  }
};

// Performance timing
const measureOperation = async (operation: () => Promise<any>, name: string) => {
  const start = performance.now();
  try {
    const result = await operation();
    const duration = performance.now() - start;
    
    analytics.track('operation_performance', {
      operation: name,
      duration: duration,
      success: true
    });
    
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    
    analytics.track('operation_performance', {
      operation: name,
      duration: duration,
      success: false,
      error: error.message
    });
    
    throw error;
  }
};
```

### Resource Monitoring
```typescript
// Memory usage tracking
const monitorMemoryUsage = () => {
  if ('memory' in performance) {
    const memory = (performance as any).memory;
    
    if (memory.usedJSHeapSize / memory.jsHeapSizeLimit > 0.9) {
      console.warn('High memory usage detected');
      
      // Trigger cleanup
      cleanupUnusedResources();
    }
  }
};

// Network performance
const monitorNetworkPerformance = () => {
  const connection = (navigator as any).connection;
  if (connection) {
    const slowConnection = connection.effectiveType === '2g' || 
                          connection.effectiveType === 'slow-2g';
    
    if (slowConnection) {
      // Reduce update frequency
      setUpdateInterval(5000); // 5 seconds instead of 1
    }
  }
};
```