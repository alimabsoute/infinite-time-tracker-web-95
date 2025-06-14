
import { Timer } from "../types";
import { supabase } from '@/integrations/supabase/client';
import { subDays, startOfDay, addHours, addMinutes } from "date-fns";

const CATEGORIES = [
  "Work", 
  "Study", 
  "Personal", 
  "Health", 
  "Leisure", 
  "Project", 
  "Meeting",
  "Research",
  "Development",
  "Design",
  "Writing",
  "Planning"
];

const TIMER_NAMES = {
  Work: [
    "Daily Standup", "Code Review", "Feature Development", "Bug Fixing", 
    "Client Call", "Project Planning", "Documentation", "Team Meeting"
  ],
  Study: [
    "JavaScript Tutorial", "React Learning", "Database Design", "Algorithm Practice",
    "Reading Technical Books", "Online Course", "Programming Exercises", "Code Challenges"
  ],
  Personal: [
    "Meal Prep", "House Cleaning", "Email Management", "Finance Review",
    "Personal Planning", "Shopping", "Phone Calls", "Organizing"
  ],
  Health: [
    "Morning Workout", "Yoga Session", "Meditation", "Running",
    "Gym Training", "Stretching", "Mental Health Break", "Walk"
  ],
  Leisure: [
    "Reading", "Gaming", "Watching Movies", "Listening to Music",
    "Social Media", "Browsing", "Hobby Time", "Relaxation"
  ],
  Project: [
    "Side Project", "Open Source Contribution", "Portfolio Update", "App Development",
    "Website Design", "Content Creation", "Research Phase", "Testing"
  ],
  Meeting: [
    "Team Sync", "Client Meeting", "1-on-1", "All Hands",
    "Project Review", "Strategy Session", "Brainstorming", "Retrospective"
  ],
  Research: [
    "Market Analysis", "Technical Research", "Competitive Analysis", "User Research",
    "Literature Review", "Data Collection", "Investigation", "Exploration"
  ],
  Development: [
    "Frontend Development", "Backend Development", "API Integration", "Database Work",
    "Testing Implementation", "Deployment", "Code Refactoring", "Performance Optimization"
  ],
  Design: [
    "UI Design", "UX Research", "Prototyping", "Wireframing",
    "Visual Design", "User Flow", "Design System", "Mockups"
  ],
  Writing: [
    "Blog Post", "Documentation", "Technical Writing", "Content Creation",
    "Email Writing", "Proposal Writing", "Report Writing", "Creative Writing"
  ],
  Planning: [
    "Sprint Planning", "Goal Setting", "Strategy Planning", "Resource Planning",
    "Timeline Creation", "Task Organization", "Priority Setting", "Schedule Review"
  ]
};

// Generate random duration based on category and time of day
const generateDuration = (category: string, hour: number): number => {
  const baseMinutes = {
    Work: 45,
    Study: 60,
    Personal: 30,
    Health: 30,
    Leisure: 45,
    Project: 90,
    Meeting: 30,
    Research: 75,
    Development: 120,
    Design: 90,
    Writing: 60,
    Planning: 45
  }[category] || 45;

  // Longer sessions during work hours (9-17)
  const isWorkHours = hour >= 9 && hour <= 17;
  const multiplier = isWorkHours ? 1.5 : 0.8;
  
  // Add randomness (-50% to +100%)
  const randomFactor = 0.5 + Math.random() * 1.5;
  
  return Math.floor(baseMinutes * multiplier * randomFactor * 60 * 1000); // Convert to milliseconds
};

// Generate realistic daily patterns
const generateDailyPattern = (date: Date): { category: string; hour: number; probability: number }[] => {
  const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  
  const patterns = [];
  
  for (let hour = 6; hour < 24; hour++) {
    if (isWeekend) {
      // Weekend patterns
      if (hour >= 8 && hour <= 12) {
        patterns.push({ category: "Personal", hour, probability: 0.6 });
        patterns.push({ category: "Health", hour, probability: 0.4 });
        patterns.push({ category: "Leisure", hour, probability: 0.3 });
      } else if (hour >= 13 && hour <= 18) {
        patterns.push({ category: "Project", hour, probability: 0.5 });
        patterns.push({ category: "Study", hour, probability: 0.4 });
        patterns.push({ category: "Leisure", hour, probability: 0.6 });
      } else if (hour >= 19 && hour <= 22) {
        patterns.push({ category: "Leisure", hour, probability: 0.8 });
        patterns.push({ category: "Personal", hour, probability: 0.3 });
      }
    } else {
      // Weekday patterns
      if (hour >= 6 && hour <= 8) {
        patterns.push({ category: "Health", hour, probability: 0.3 });
        patterns.push({ category: "Personal", hour, probability: 0.4 });
      } else if (hour >= 9 && hour <= 12) {
        patterns.push({ category: "Work", hour, probability: 0.8 });
        patterns.push({ category: "Meeting", hour, probability: 0.4 });
        patterns.push({ category: "Development", hour, probability: 0.6 });
      } else if (hour >= 13 && hour <= 17) {
        patterns.push({ category: "Work", hour, probability: 0.9 });
        patterns.push({ category: "Development", hour, probability: 0.7 });
        patterns.push({ category: "Design", hour, probability: 0.5 });
        patterns.push({ category: "Research", hour, probability: 0.4 });
      } else if (hour >= 18 && hour <= 20) {
        patterns.push({ category: "Study", hour, probability: 0.5 });
        patterns.push({ category: "Project", hour, probability: 0.6 });
        patterns.push({ category: "Personal", hour, probability: 0.4 });
      } else if (hour >= 21 && hour <= 23) {
        patterns.push({ category: "Leisure", hour, probability: 0.5 });
        patterns.push({ category: "Planning", hour, probability: 0.3 });
      }
    }
  }
  
  return patterns;
};

export const generateMockData = async (userId: string, daysBack: number = 30): Promise<void> => {
  const mockTimers: any[] = [];
  const today = new Date();
  
  console.log(`Generating mock data for ${daysBack} days...`);
  
  for (let dayOffset = 0; dayOffset < daysBack; dayOffset++) {
    const date = subDays(today, dayOffset);
    const patterns = generateDailyPattern(date);
    
    // Generate 3-8 timers per day with realistic distribution
    const timersPerDay = Math.floor(Math.random() * 6) + 3;
    
    for (let i = 0; i < timersPerDay; i++) {
      // Select pattern based on probability
      const availablePatterns = patterns.filter(p => Math.random() < p.probability);
      if (availablePatterns.length === 0) continue;
      
      const selectedPattern = availablePatterns[Math.floor(Math.random() * availablePatterns.length)];
      const { category, hour } = selectedPattern;
      
      // Generate timer details
      const timerNames = TIMER_NAMES[category as keyof typeof TIMER_NAMES] || ["Generic Task"];
      const name = timerNames[Math.floor(Math.random() * timerNames.length)];
      const duration = generateDuration(category, hour);
      
      // Create timer date with realistic hour and minute
      const timerDate = startOfDay(date);
      timerDate.setHours(hour, Math.floor(Math.random() * 60), 0, 0);
      
      // Add some deadline timers (20% chance)
      let deadline = undefined;
      if (Math.random() < 0.2) {
        const deadlineDate = new Date(timerDate);
        deadlineDate.setDate(deadlineDate.getDate() + Math.floor(Math.random() * 14) + 1); // 1-14 days from timer date
        deadline = deadlineDate.toISOString();
      }
      
      // Add priority (30% chance)
      let priority = undefined;
      if (Math.random() < 0.3) {
        priority = Math.floor(Math.random() * 5) + 1; // 1-5
      }
      
      const mockTimer = {
        id: crypto.randomUUID(),
        name,
        elapsed_time: duration,
        is_running: false, // Historical data shouldn't be running
        created_at: timerDate.toISOString(),
        category,
        deadline,
        priority,
        user_id: userId
      };
      
      mockTimers.push(mockTimer);
    }
  }
  
  // Add a few running timers for current day
  const runningTimerCategories = ["Work", "Development", "Study"];
  for (let i = 0; i < 2; i++) {
    const category = runningTimerCategories[Math.floor(Math.random() * runningTimerCategories.length)];
    const timerNames = TIMER_NAMES[category as keyof typeof TIMER_NAMES];
    const name = timerNames[Math.floor(Math.random() * timerNames.length)] + " (Current)";
    
    const runningTimer = {
      id: crypto.randomUUID(),
      name,
      elapsed_time: Math.floor(Math.random() * 7200000), // 0-2 hours
      is_running: i === 0, // Only first one running
      created_at: new Date().toISOString(),
      category,
      deadline: undefined,
      priority: undefined,
      user_id: userId
    };
    
    mockTimers.push(runningTimer);
  }
  
  console.log(`Generated ${mockTimers.length} mock timers`);
  
  // Insert in batches to avoid overwhelming the database
  const batchSize = 50;
  for (let i = 0; i < mockTimers.length; i += batchSize) {
    const batch = mockTimers.slice(i, i + batchSize);
    
    const { error } = await supabase
      .from('timers')
      .insert(batch);
    
    if (error) {
      console.error(`Error inserting batch ${i / batchSize + 1}:`, error);
      throw error;
    }
    
    console.log(`Inserted batch ${i / batchSize + 1}/${Math.ceil(mockTimers.length / batchSize)}`);
  }
  
  console.log('Mock data generation completed successfully!');
};

export const clearExistingData = async (userId: string): Promise<void> => {
  console.log('Clearing existing timer data...');
  
  const { error } = await supabase
    .from('timers')
    .delete()
    .eq('user_id', userId);
  
  if (error) {
    console.error('Error clearing existing data:', error);
    throw error;
  }
  
  console.log('Existing data cleared successfully!');
};
