
import React from 'react';
import PageLayout from '../components/layout/PageLayout';
import { useTimers } from '../hooks/useTimers';
import { useTimerSessions } from '../hooks/useTimerSessions';

const Dashboard = () => {
  const { timers } = useTimers();
  const { sessions, loading: sessionsLoading } = useTimerSessions();

  if (sessionsLoading) {
    return (
      <PageLayout 
        title="Dashboard"
        description="Overview of your timers and recent activity"
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout 
      title="Dashboard"
      description="Overview of your timers and recent activity"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Quick Stats */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-2">Total Timers</h3>
          <p className="text-3xl font-bold text-blue-600">{timers.length}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-2">Total Sessions</h3>
          <p className="text-3xl font-bold text-green-600">{sessions.length}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-2">Active Timers</h3>
          <p className="text-3xl font-bold text-orange-600">
            {timers.filter(timer => timer.is_running).length}
          </p>
        </div>
      </div>
      
      {/* Recent Activity */}
      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4">Recent Timers</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {timers.slice(0, 6).map((timer) => (
            <div key={timer.id} className="bg-white rounded-lg shadow p-4">
              <h4 className="font-medium">{timer.name}</h4>
              {timer.category && (
                <p className="text-sm text-gray-600">{timer.category}</p>
              )}
              <div className="mt-2">
                <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                  timer.is_running 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {timer.is_running ? 'Running' : 'Stopped'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageLayout>
  );
};

export default Dashboard;
