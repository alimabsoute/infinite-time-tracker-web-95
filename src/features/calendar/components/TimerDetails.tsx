
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@shared/components/ui/card';
import { Badge } from '@shared/components/ui/badge';

interface TimerDetailsProps {
  timer: any | null;
}

const TimerDetails: React.FC<TimerDetailsProps> = ({ timer }) => {
  if (!timer) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Timer Details</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-8">
            Click on a bubble to view timer details
          </p>
        </CardContent>
      </Card>
    );
  }

  const totalHours = (timer.totalTime / (1000 * 60 * 60)).toFixed(1);
  const avgMinutes = (timer.avgSessionTime / (1000 * 60)).toFixed(1);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {timer.name}
          <Badge variant="secondary">{timer.category}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-semibold text-gray-700 mb-2">Performance Metrics</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm">Total Time:</span>
              <span className="text-sm font-medium">{totalHours} hours</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Average Session:</span>
              <span className="text-sm font-medium">{avgMinutes} minutes</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Total Sessions:</span>
              <span className="text-sm font-medium">{timer.sessionCount}</span>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-gray-700 mb-2">Performance Level</h4>
          <div className="grid grid-cols-1 gap-2 text-xs">
            <div className={`p-2 rounded ${
              parseFloat(totalHours) > 10 ? 'bg-green-100 text-green-800' :
              parseFloat(totalHours) > 5 ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              Time Investment: {parseFloat(totalHours) > 10 ? 'High' : parseFloat(totalHours) > 5 ? 'Medium' : 'Low'}
            </div>
            <div className={`p-2 rounded ${
              timer.sessionCount > 10 ? 'bg-blue-100 text-blue-800' :
              timer.sessionCount > 5 ? 'bg-indigo-100 text-indigo-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              Activity Level: {timer.sessionCount > 10 ? 'Very Active' : timer.sessionCount > 5 ? 'Active' : 'Light Use'}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TimerDetails;
