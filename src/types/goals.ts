
export interface Goal {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  type: 'time_based' | 'session_count' | 'streak' | 'deadline';
  status: 'active' | 'completed' | 'paused' | 'archived';
  target_value: number;
  current_value: number;
  unit: string; // 'hours', 'minutes', 'sessions', 'days'
  category?: string;
  timer_ids?: string[];
  start_date: string;
  end_date?: string;
  deadline?: string;
  priority?: number;
  is_template?: boolean;
  template_name?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export interface GoalProgress {
  id: string;
  goal_id: string;
  user_id: string;
  date: string;
  value: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface GoalMilestone {
  id: string;
  goal_id: string;
  user_id: string;
  title: string;
  description?: string;
  target_percentage: number;
  achieved_at?: string;
  created_at: string;
}

export interface CreateGoalInput {
  title: string;
  description?: string;
  type: Goal['type'];
  target_value: number;
  unit: string;
  category?: string;
  timer_ids?: string[];
  start_date?: string;
  end_date?: string;
  deadline?: string;
  priority?: number;
}

export interface GoalTemplate {
  name: string;
  type: Goal['type'];
  target_value: number;
  unit: string;
  description: string;
  category: string;
  milestones?: Array<{
    title: string;
    target_percentage: number;
    description?: string;
  }>;
}
