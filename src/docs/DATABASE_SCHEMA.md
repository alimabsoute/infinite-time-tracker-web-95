# Database Schema Documentation

## Overview
PhynxTimer uses a PostgreSQL database hosted on Supabase with comprehensive Row Level Security (RLS) policies ensuring data isolation and security.

## Core Tables

### `timers`
Primary timer entity with metadata and state management.

```sql
CREATE TABLE timers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  elapsed_time BIGINT NOT NULL DEFAULT 0,
  is_running BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  category TEXT,
  tags TEXT[],
  deadline TIMESTAMPTZ,
  priority SMALLINT CHECK (priority BETWEEN 1 AND 5),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID,
  last_accessed_at TIMESTAMPTZ DEFAULT now(),
  start_time TIMESTAMPTZ
);
```

**Key Features:**
- Soft delete pattern with `deleted_at`
- Priority system (1=Low, 2=Medium, 3=High)
- Array-based tagging system
- Automatic timestamp management

### `timer_sessions`
Individual timer run sessions for accurate time tracking.

```sql
CREATE TABLE timer_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timer_id UUID NOT NULL,
  user_id UUID NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  duration_ms BIGINT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Key Features:**
- Session-based tracking for accuracy
- Millisecond precision timing
- Open sessions (end_time NULL) for running timers

### `goals`
Goal management system for productivity tracking.

```sql
CREATE TABLE goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL,
  unit TEXT NOT NULL,
  target_value NUMERIC NOT NULL,
  current_value NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  category TEXT,
  priority INTEGER DEFAULT 3,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  deadline TIMESTAMPTZ,
  timer_ids UUID[],
  is_template BOOLEAN DEFAULT false,
  template_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);
```

**Key Features:**
- Flexible goal types and units
- Progress tracking with current/target values
- Timer integration via array references
- Template system for reusable goals

### `goal_milestones`
Milestone tracking for goal progress.

```sql
CREATE TABLE goal_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID NOT NULL,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  target_percentage NUMERIC NOT NULL,
  achieved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### `goal_progress`
Daily progress tracking for goals.

```sql
CREATE TABLE goal_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID NOT NULL,
  user_id UUID NOT NULL,
  date DATE NOT NULL,
  value NUMERIC NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

## User Management Tables

### `profiles`
Extended user profile information.

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY,
  subscribed BOOLEAN DEFAULT false,
  subscription_tier TEXT,
  subscription_end TIMESTAMPTZ,
  last_login_at TIMESTAMPTZ,
  preferences JSONB DEFAULT '{}'
);
```

### `subscribers`
Subscription and billing management.

```sql
CREATE TABLE subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  email TEXT NOT NULL UNIQUE,
  stripe_customer_id TEXT,
  subscribed BOOLEAN NOT NULL DEFAULT false,
  subscription_tier TEXT,
  subscription_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

## Security Model

### Row Level Security (RLS)
All tables implement comprehensive RLS policies:

```sql
-- Example: Timer access control
CREATE POLICY "Users can only access their own timers" 
ON timers FOR ALL 
USING (auth.uid() = user_id);

-- Service role exceptions for cleanup
CREATE POLICY "Service role can delete old timer data" 
ON timers FOR DELETE 
USING (current_setting('role') = 'service_role');
```

### Security Features
- **User Isolation**: Complete data separation between users
- **Authentication Required**: All operations require valid auth
- **Service Role Access**: Administrative cleanup capabilities
- **Audit Trails**: Comprehensive timestamp tracking

## Database Functions

### `generate_unique_timer_name(user_id UUID)`
Generates unique timer names ("Timer 1", "Timer 2", etc.) per user.

### `get_accurate_timer_time(timer_uuid UUID)`
Calculates precise timer elapsed time including active sessions.

### `recover_missing_timer_time(timer_uuid UUID)`
Recovers time gaps in timer sessions for data integrity.

### `safe_newsletter_signup(email TEXT, user_id UUID)`
Safely handles newsletter subscriptions with duplicate prevention.

### `handle_new_user()`
Trigger function that creates profile and subscriber records on user signup.

## Indexes and Performance

### Key Indexes
```sql
-- User-based queries
CREATE INDEX idx_timers_user_id ON timers(user_id);
CREATE INDEX idx_timer_sessions_user_id ON timer_sessions(user_id);
CREATE INDEX idx_goals_user_id ON goals(user_id);

-- Timer relationship queries
CREATE INDEX idx_timer_sessions_timer_id ON timer_sessions(timer_id);

-- Time-based queries
CREATE INDEX idx_timer_sessions_start_time ON timer_sessions(start_time);
```

### Query Optimization
- **User-scoped queries**: All queries filtered by user_id
- **Efficient joins**: Minimized cross-table operations
- **Timestamp indexes**: Optimized for time-range queries
- **Array operations**: Efficient tag and timer_ids searching

## Data Integrity

### Constraints
- **Foreign key relationships**: Maintain referential integrity
- **Check constraints**: Validate priority ranges and status values
- **Unique constraints**: Prevent duplicate email addresses
- **NOT NULL constraints**: Ensure required data presence

### Triggers
- **Auto-timestamps**: Automatic updated_at maintenance
- **User creation**: Automatic profile/subscriber record creation
- **Data validation**: Complex business rule enforcement

## Backup and Maintenance

### Automated Cleanup
- **Soft delete preservation**: Maintain deleted records for audit
- **Service role cleanup**: Periodic old data removal
- **Session management**: Automatic session closure detection

### Data Export Support
- **Efficient queries**: Optimized for large data exports
- **Date range filtering**: Performance-optimized time-based queries
- **User data isolation**: Secure export boundaries