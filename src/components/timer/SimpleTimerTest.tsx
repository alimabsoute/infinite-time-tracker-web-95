import React from 'react';
import { useSimpleTimers } from '../../hooks/useSimpleTimers';
import { formatTime } from '../../utils/timerUtils';

// Test component to validate the simple timer approach
const SimpleTimerTest = () => {
  const { timers, loading, addTimer, toggleTimer, resetTimer, getDisplayTime } = useSimpleTimers();

  if (loading) {
    return <div>Loading simple timers...</div>;
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Simple Timer Test</h2>
      
      <button 
        onClick={() => addTimer("Test Timer")}
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Add Test Timer
      </button>

      <div className="space-y-4">
        {timers.map(timer => {
          const displayTime = getDisplayTime(timer);
          return (
            <div key={timer.id} className="p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{timer.name}</h3>
                  <p className="text-sm text-gray-600">ID: {timer.id}</p>
                  <p className="text-lg font-mono">
                    Display: {formatTime(displayTime)}
                  </p>
                  <p className="text-sm text-gray-500">
                    Stored: {formatTime(timer.elapsedTime)} | 
                    Running: {timer.isRunning ? 'YES' : 'NO'}
                  </p>
                </div>
                <div className="space-x-2">
                  <button
                    onClick={() => toggleTimer(timer.id)}
                    className={`px-3 py-1 rounded text-white ${
                      timer.isRunning 
                        ? 'bg-red-500 hover:bg-red-600' 
                        : 'bg-green-500 hover:bg-green-600'
                    }`}
                  >
                    {timer.isRunning ? 'Stop' : 'Start'}
                  </button>
                  <button
                    onClick={() => resetTimer(timer.id)}
                    className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {timers.length === 0 && (
        <p className="text-gray-500">No timers yet. Add one to test!</p>
      )}
    </div>
  );
};

export default SimpleTimerTest;