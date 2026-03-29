import { supabase } from '@/integrations/supabase/client';
import { Timer, TimerSession } from '../types';

interface MockTimerData {
  name: string;
  category: string;
  elapsedTime: number;
  tags?: string[];
  priority?: number;
  createdDaysAgo: number;
  sessionCount: number;
}

interface MockSessionData {
  timerId: string;
  daysAgo: number;
  duration: number; // in milliseconds
  startHour: number; // 0-23
}

export class MockDataGenerator {
  private readonly mockTimers: MockTimerData[] = [
    {
      name: "Morning Standup",
      category: "Work",
      elapsedTime: 45 * 60 * 1000, // 45 minutes
      tags: ["meetings", "daily"],
      priority: 2,
      createdDaysAgo: 15,
      sessionCount: 12
    },
    {
      name: "Deep Work Session",
      category: "Work", 
      elapsedTime: 3.5 * 60 * 60 * 1000, // 3.5 hours
      tags: ["focus", "coding"],
      priority: 1,
      createdDaysAgo: 10,
      sessionCount: 8
    },
    {
      name: "React Learning",
      category: "Study",
      elapsedTime: 2.2 * 60 * 60 * 1000, // 2.2 hours
      tags: ["learning", "frontend"],
      priority: 2,
      createdDaysAgo: 7,
      sessionCount: 6
    },
    {
      name: "Gym Workout",
      category: "Exercise",
      elapsedTime: 1.5 * 60 * 60 * 1000, // 1.5 hours
      tags: ["health", "fitness"],
      priority: 3,
      createdDaysAgo: 20,
      sessionCount: 15
    },
    {
      name: "Reading Time",
      category: "Personal",
      elapsedTime: 80 * 60 * 1000, // 80 minutes
      tags: ["books", "learning"],
      priority: 3,
      createdDaysAgo: 12,
      sessionCount: 10
    },
    {
      name: "UI Design Review",
      category: "Work",
      elapsedTime: 90 * 60 * 1000, // 90 minutes
      tags: ["design", "review"],
      priority: 2,
      createdDaysAgo: 5,
      sessionCount: 4
    },
    {
      name: "Database Optimization",
      category: "Work",
      elapsedTime: 4.2 * 60 * 60 * 1000, // 4.2 hours
      tags: ["backend", "performance"],
      priority: 1,
      createdDaysAgo: 3,
      sessionCount: 3
    },
    {
      name: "Spanish Practice",
      category: "Study",
      elapsedTime: 40 * 60 * 1000, // 40 minutes
      tags: ["language", "practice"],
      priority: 3,
      createdDaysAgo: 8,
      sessionCount: 5
    },
    {
      name: "API Documentation",
      category: "Work",
      elapsedTime: 2.8 * 60 * 60 * 1000, // 2.8 hours
      tags: ["documentation", "backend"],
      priority: 2,
      createdDaysAgo: 6,
      sessionCount: 4
    },
    {
      name: "Meditation",
      category: "Personal",
      elapsedTime: 25 * 60 * 1000, // 25 minutes
      tags: ["mindfulness", "health"],
      priority: 3,
      createdDaysAgo: 14,
      sessionCount: 12
    }
  ];

  private generateTimerId(): string {
    return crypto.randomUUID();
  }

  private generateSessionId(): string {
    return crypto.randomUUID();
  }

  private calculateSessionsForTimer(mockTimer: MockTimerData): MockSessionData[] {
    const sessions: MockSessionData[] = [];
    const timerId = this.generateTimerId();
    
    // Generate sessions distributed over the creation period
    const totalDuration = mockTimer.elapsedTime;
    const sessionCount = mockTimer.sessionCount;
    const averageDuration = totalDuration / sessionCount;
    
    for (let i = 0; i < sessionCount; i++) {
      // Distribute sessions over the creation period
      const daysAgo = Math.floor(Math.random() * mockTimer.createdDaysAgo);
      
      // Vary session duration around the average (±30%)
      const variationFactor = 0.7 + (Math.random() * 0.6); // 0.7 to 1.3
      const duration = Math.floor(averageDuration * variationFactor);
      
      // Generate realistic start hours based on category
      let startHour: number;
      switch (mockTimer.category) {
        case 'Work':
          startHour = 8 + Math.floor(Math.random() * 10); // 8 AM to 6 PM
          break;
        case 'Exercise':
          startHour = Math.random() < 0.5 ? 6 + Math.floor(Math.random() * 3) : 17 + Math.floor(Math.random() * 4); // 6-9 AM or 5-9 PM
          break;
        case 'Study':
          startHour = 9 + Math.floor(Math.random() * 12); // 9 AM to 9 PM
          break;
        case 'Personal':
          startHour = 7 + Math.floor(Math.random() * 15); // 7 AM to 10 PM
          break;
        default:
          startHour = 8 + Math.floor(Math.random() * 12); // 8 AM to 8 PM
      }
      
      sessions.push({
        timerId,
        daysAgo,
        duration,
        startHour
      });
    }
    
    return sessions;
  }

  async generateMockData(userId: string): Promise<{ success: boolean; message: string; timersCreated: number; sessionsCreated: number }> {
    
    try {
      let timersCreated = 0;
      let sessionsCreated = 0;
      
      // Check if mock data already exists
      const { data: existingTimers, error: checkError } = await supabase
        .from('timers')
        .select('name')
        .eq('user_id', userId)
        .ilike('name', '%Mock%');
      
      if (checkError) {
        console.error('Error checking existing timers:', checkError);
        return { success: false, message: 'Failed to check existing data', timersCreated: 0, sessionsCreated: 0 };
      }
      
      if (existingTimers && existingTimers.length > 0) {
        return { success: true, message: 'Mock data already exists', timersCreated: 0, sessionsCreated: 0 };
      }
      
      // Generate and insert timers with sessions
      for (const mockTimer of this.mockTimers) {
        const timerId = this.generateTimerId();
        const now = new Date();
        const createdAt = new Date(now.getTime() - (mockTimer.createdDaysAgo * 24 * 60 * 60 * 1000));
        
        // Insert timer
        const { error: timerError } = await supabase
          .from('timers')
          .insert({
            id: timerId,
            user_id: userId,
            name: `Mock ${mockTimer.name}`,
            elapsed_time: mockTimer.elapsedTime,
            is_running: false,
            created_at: createdAt.toISOString(),
            category: mockTimer.category,
            tags: mockTimer.tags,
            priority: mockTimer.priority
          });
        
        if (timerError) {
          console.error('Error inserting timer:', mockTimer.name, timerError);
          continue;
        }
        
        timersCreated++;
        
        // Generate and insert sessions for this timer
        const sessions = this.calculateSessionsForTimer(mockTimer);
        
        for (const sessionData of sessions) {
          const sessionId = this.generateSessionId();
          const sessionDate = new Date(now.getTime() - (sessionData.daysAgo * 24 * 60 * 60 * 1000));
          
          // Set specific start time
          const startTime = new Date(sessionDate);
          startTime.setHours(sessionData.startHour, Math.floor(Math.random() * 60), 0, 0);
          
          // Calculate end time
          const endTime = new Date(startTime.getTime() + sessionData.duration);
          
          const { error: sessionError } = await supabase
            .from('timer_sessions')
            .insert({
              id: sessionId,
              timer_id: timerId,
              user_id: userId,
              start_time: startTime.toISOString(),
              end_time: endTime.toISOString(),
              duration_ms: sessionData.duration
            });
          
          if (sessionError) {
            console.error('Error inserting session for timer:', mockTimer.name, sessionError);
            continue;
          }
          
          sessionsCreated++;
        }
        
        
        // Small delay to avoid overwhelming the database
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      
      return {
        success: true,
        message: `Generated ${timersCreated} timers and ${sessionsCreated} sessions`,
        timersCreated,
        sessionsCreated
      };
      
    } catch (error) {
      console.error('Error generating mock data:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
        timersCreated: 0,
        sessionsCreated: 0
      };
    }
  }

  async clearMockData(userId: string): Promise<{ success: boolean; message: string }> {
    
    try {
      // Get all mock timers
      const { data: mockTimers, error: fetchError } = await supabase
        .from('timers')
        .select('id')
        .eq('user_id', userId)
        .ilike('name', 'Mock %');
      
      if (fetchError) {
        console.error('Error fetching mock timers:', fetchError);
        return { success: false, message: 'Failed to fetch mock timers' };
      }
      
      if (!mockTimers || mockTimers.length === 0) {
        return { success: true, message: 'No mock data found to clear' };
      }
      
      const timerIds = mockTimers.map(t => t.id);
      
      // Delete sessions first (due to foreign key constraints)
      const { error: sessionsError } = await supabase
        .from('timer_sessions')
        .delete()
        .in('timer_id', timerIds);
      
      if (sessionsError) {
        console.error('Error deleting sessions:', sessionsError);
        return { success: false, message: 'Failed to delete sessions' };
      }
      
      // Delete timers
      const { error: timersError } = await supabase
        .from('timers')
        .delete()
        .in('id', timerIds);
      
      if (timersError) {
        console.error('Error deleting timers:', timersError);
        return { success: false, message: 'Failed to delete timers' };
      }
      
      
      return {
        success: true,
        message: `Cleared ${mockTimers.length} mock timers and their sessions`
      };
      
    } catch (error) {
      console.error('Error clearing mock data:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

export const mockDataGenerator = new MockDataGenerator();