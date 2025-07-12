import React from 'react';
import { format } from 'date-fns';
import { TimerSessionWithTimer } from "../../types";

interface BubbleChartDebuggerProps {
  sessions: TimerSessionWithTimer[];
  currentWeekStart: Date;
}

const BubbleChartDebugger: React.FC<BubbleChartDebuggerProps> = ({ sessions, currentWeekStart }) => {
  console.log('🔬 BubbleChartDebugger - Starting analysis');
  
  // Analyze session structure
  const sampleSession = sessions[0];
  const sessionStructure = sampleSession ? Object.keys(sampleSession) : [];
  
  // Check timer name sources
  const timerNameSources = sessions.slice(0, 5).map(session => ({
    id: session.id,
    fromTimers: session.timers?.name,
    fromDirect: (session as any).timer_name,
    hasTimers: !!session.timers,
    timerKeys: session.timers ? Object.keys(session.timers) : []
  }));
  
  // Process timer groups like BubbleChart3D does
  const timerGroups = sessions.reduce((acc, session) => {
    let timerName: string;
    if (session.timers && session.timers.name) {
      timerName = session.timers.name;
    } else if ((session as any).timer_name) {
      timerName = (session as any).timer_name;
    } else {
      return acc;
    }
    
    if (!acc[timerName]) {
      acc[timerName] = {
        sessions: [],
        totalTime: 0,
        category: session.timers?.category || 'Uncategorized'
      };
    }
    
    acc[timerName].sessions.push(session);
    acc[timerName].totalTime += session.duration_ms || 0;
    
    return acc;
  }, {} as Record<string, any>);
  
  const timerGroupSummary = Object.entries(timerGroups).map(([name, data]) => ({
    name,
    sessionCount: data.sessions.length,
    totalTimeHours: (data.totalTime / 3600000).toFixed(2),
    category: data.category
  }));
  
  console.log('🔬 Debug Analysis Complete:', {
    totalSessions: sessions.length,
    sessionStructure,
    timerNameSources,
    timerGroups: timerGroupSummary,
    currentWeekStart: format(currentWeekStart, 'yyyy-MM-dd')
  });
  
  return (
    <div className="p-4 bg-slate-100 rounded-lg text-sm space-y-3">
      <h3 className="font-bold text-slate-800">Bubble Chart Debug Analysis</h3>
      
      <div>
        <strong>Total Sessions:</strong> {sessions.length}
      </div>
      
      <div>
        <strong>Week Start:</strong> {format(currentWeekStart, 'MMM d, yyyy')}
      </div>
      
      <div>
        <strong>Session Structure:</strong> {sessionStructure.join(', ')}
      </div>
      
      <div>
        <strong>Timer Groups Found:</strong> {Object.keys(timerGroups).length}
        <ul className="ml-4 mt-1">
          {timerGroupSummary.map(group => (
            <li key={group.name} className="text-xs">
              • {group.name}: {group.sessionCount} sessions, {group.totalTimeHours}h ({group.category})
            </li>
          ))}
        </ul>
      </div>
      
      <div>
        <strong>Sample Timer Name Sources:</strong>
        <pre className="text-xs bg-white p-2 rounded mt-1 overflow-auto">
          {JSON.stringify(timerNameSources, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default BubbleChartDebugger;