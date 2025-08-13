# State Management Architecture

## Primary State Hook: `useDeadSimpleTimers`

### Overview
The core state management is handled by `useDeadSimpleTimers`, which provides a clean interface for timer operations while managing complex synchronization behind the scenes.

```typescript
const {
  timers,           // Current timer array
  loading,          // Loading state
  addTimer,         // Create new timer
  toggleTimer,      // Start/stop timer
  resetTimer,       // Reset timer to 0
  deleteTimer,      // Remove timer
  renameTimer,      // Update timer name
  updateDeadline,   // Set timer deadline
  updatePriority,   // Set timer priority
  reorderTimers     // Drag & drop reordering
} = useDeadSimpleTimers();
```

## State Architecture Layers

### Layer 1: Database State (`useTimerStateRebuild`)
Manages core timer data and database synchronization.

**Responsibilities:**
- Load timers from Supabase on initialization
- Maintain real-time database synchronization
- Handle session restoration on page reload
- Calculate accurate elapsed times including active sessions

**Key Features:**
```typescript
// Accurate time calculation including running sessions
const calculateSessionElapsedTime = (timer: Timer): number => {
  // Combines stored elapsed_time with current session time
  // Handles running timers with precision
};

// Robust timer loading with session restoration
const loadTimers = async () => {
  // 1. Load timers from database
  // 2. Restore persisted state from localStorage
  // 3. Resume active sessions
  // 4. Create missing session records
};
```

### Layer 2: Operations (`useTimerOperationsRebuild`)
Handles timer lifecycle operations with optimistic updates.

**Toggle Timer Logic:**
```typescript
const toggleTimer = async (id: string) => {
  // 1. Optimistic UI update
  const updatedTimer = { ...timer, is_running: !timer.is_running };
  setTimers(optimisticUpdate);
  
  // 2. Database operations
  if (timer.is_running) {
    await stopTimer(id);  // End session, update elapsed_time
  } else {
    await startTimer(id); // Create new session
  }
  
  // 3. Reload for accuracy
  await reloadTimers();
};
```

### Layer 3: Creation (`useTimerCreationRebuild`)
Manages timer creation with intelligent naming.

**Smart Timer Creation:**
```typescript
const addTimer = async (name?: string) => {
  // 1. Generate unique name if not provided
  const timerName = name || await generateUniqueName();
  
  // 2. Create timer with default values
  const newTimer = {
    name: timerName,
    elapsed_time: 0,
    is_running: false,
    category: null,
    priority: null,
    deadline: null
  };
  
  // 3. Optimistic UI update + database insert
  // 4. Reload for server-generated fields
};
```

### Layer 4: CRUD Operations (`useTimerCrud`)
Handles metadata updates without affecting timer state.

**Safe Update Operations:**
```typescript
const renameTimer = async (id: string, newName: string) => {
  // Direct database update without affecting timing
  await supabase.from('timers')
    .update({ name: newName })
    .eq('id', id);
  
  // Optimistic local update
  setTimers(timers.map(t => 
    t.id === id ? { ...t, name: newName } : t
  ));
};
```

## Persistence Strategy

### Multi-Level Persistence
1. **Database (Primary)**: Authoritative source via Supabase
2. **localStorage (Backup)**: Running timer IDs for recovery
3. **Session Storage**: Temporary UI state
4. **Memory (Active)**: Current application state

### Robust Recovery System (`useTimerPersistenceRobust`)
```typescript
// Recovery hierarchy
const recoverTimerState = () => {
  // 1. Load from database (authoritative)
  // 2. Apply localStorage adjustments
  // 3. Resume running timers
  // 4. Validate and correct inconsistencies
};

// Browser event handling
const useTimerBrowserEventsRobust = () => {
  // beforeunload: Save critical state
  // visibilitychange: Pause/resume updates
  // online/offline: Handle connectivity
  // focus/blur: Optimize performance
};
```

## Real-time Synchronization

### Timer Update Intervals
```typescript
// Real-time UI updates for running timers
useEffect(() => {
  const interval = setInterval(() => {
    const hasRunningTimers = timers.some(t => t.is_running);
    if (hasRunningTimers) {
      forceRerender(); // Trigger React re-render
    }
  }, 1000);
  
  return () => clearInterval(interval);
}, [timers]);
```

### Database Synchronization
```typescript
// Automatic periodic saves
const startAutomaticPersistence = () => {
  const interval = setInterval(async () => {
    await syncRunningTimersToDatabase();
  }, 30000); // Every 30 seconds
  
  return () => clearInterval(interval);
};
```

## Animation Integration

### Celebration System (`useTimerAnimations`)
```typescript
const {
  confettiTrigger,      // Timer completion celebrations
  celebrationTrigger,   // Milestone achievements
  clearConfettiTrigger, // Animation cleanup
  clearCelebrationTrigger
} = useTimerAnimations();

// Trigger animations on events
const onTimerComplete = (timerId: string) => {
  setConfettiTrigger({ timerId, timestamp: Date.now() });
};
```

## Error Handling Strategy

### Optimistic Updates with Rollback
```typescript
const optimisticOperation = async (operation, rollback) => {
  try {
    // 1. Apply optimistic update
    setTimers(optimisticState);
    
    // 2. Perform database operation
    await operation();
    
    // 3. Reload for consistency
    await reloadTimers();
  } catch (error) {
    // 4. Rollback on failure
    setTimers(rollback);
    showErrorToast(error.message);
  }
};
```

### Error Boundaries
- **Component Level**: Individual timer component protection
- **Page Level**: Route-level error isolation
- **Global Level**: Application-wide error handling

## Performance Optimizations

### Memoization Strategy
```typescript
// Expensive calculations cached
const timerMetrics = useMemo(() => {
  return calculateTimerAnalytics(timers);
}, [timers]);

// Component-level memoization
const TimerCard = React.memo(({ timer }) => {
  // Only re-render when timer data changes
});
```

### Debounced Operations
```typescript
// Prevent excessive API calls
const debouncedSave = useDebouncedCallback(
  (timerData) => saveToDatabase(timerData),
  500
);
```

### Lazy Loading
- **Route-based**: Code splitting by page
- **Component-based**: Lazy load heavy components
- **Data-based**: Paginated timer loading

## Testing Strategy

### State Testing
```typescript
// Hook testing with act()
const { result } = renderHook(() => useDeadSimpleTimers());

await act(async () => {
  await result.current.addTimer('Test Timer');
});

expect(result.current.timers).toHaveLength(1);
```

### Integration Testing
- **Database Operations**: Test CRUD operations
- **State Persistence**: Verify localStorage behavior
- **Error Recovery**: Test failure scenarios
- **Browser Events**: Simulate page lifecycle events

## Development Tools

### Debug Utilities
```typescript
// Development-only state inspection
if (process.env.NODE_ENV === 'development') {
  window.debugTimers = {
    getState: () => timers,
    getPersistence: () => loadSimpleState(),
    forceReload: () => reloadTimers()
  };
}
```

### Performance Monitoring
- **Timer Accuracy**: Validate elapsed time calculations
- **Persistence Reliability**: Monitor save/restore success rates
- **Error Tracking**: Log and analyze failure patterns
- **Performance Metrics**: Track render times and API response times