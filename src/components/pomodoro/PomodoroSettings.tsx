
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Clock, Settings, Volume2 } from 'lucide-react';
import { PomodoroSettings, DEFAULT_POMODORO_SETTINGS } from '@/types/pomodoro';

interface PomodoroSettingsProps {
  settings: PomodoroSettings;
  onSettingsChange: (settings: PomodoroSettings) => void;
}

const PomodoroSettingsComponent: React.FC<PomodoroSettingsProps> = ({
  settings,
  onSettingsChange
}) => {
  const [localSettings, setLocalSettings] = useState<PomodoroSettings>(settings);

  const handleInputChange = (field: keyof PomodoroSettings, value: number | boolean) => {
    const newSettings = { ...localSettings, [field]: value };
    setLocalSettings(newSettings);
  };

  const handleSave = () => {
    onSettingsChange(localSettings);
  };

  const handleReset = () => {
    setLocalSettings(DEFAULT_POMODORO_SETTINGS);
    onSettingsChange(DEFAULT_POMODORO_SETTINGS);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Pomodoro Settings
        </CardTitle>
        <CardDescription>
          Customize your Pomodoro timer preferences
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <Label className="text-sm font-medium">Timer Durations</Label>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="work-duration">Work Duration (minutes)</Label>
              <Input
                id="work-duration"
                type="number"
                min="1"
                max="60"
                value={localSettings.workDuration}
                onChange={(e) => handleInputChange('workDuration', parseInt(e.target.value) || 25)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="short-break">Short Break (minutes)</Label>
              <Input
                id="short-break"
                type="number"
                min="1"
                max="30"
                value={localSettings.shortBreakDuration}
                onChange={(e) => handleInputChange('shortBreakDuration', parseInt(e.target.value) || 5)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="long-break">Long Break (minutes)</Label>
              <Input
                id="long-break"
                type="number"
                min="1"
                max="60"
                value={localSettings.longBreakDuration}
                onChange={(e) => handleInputChange('longBreakDuration', parseInt(e.target.value) || 15)}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="sessions-until-long">Sessions until Long Break</Label>
            <Input
              id="sessions-until-long"
              type="number"
              min="2"
              max="10"
              value={localSettings.sessionsUntilLongBreak}
              onChange={(e) => handleInputChange('sessionsUntilLongBreak', parseInt(e.target.value) || 4)}
              className="w-32"
            />
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Volume2 className="h-4 w-4 text-muted-foreground" />
            <Label className="text-sm font-medium">Automation & Notifications</Label>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto-start breaks</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically start break timers after work sessions
                </p>
              </div>
              <Switch
                checked={localSettings.autoStartBreaks}
                onCheckedChange={(checked) => handleInputChange('autoStartBreaks', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto-start work</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically start work timers after breaks
                </p>
              </div>
              <Switch
                checked={localSettings.autoStartWork}
                onCheckedChange={(checked) => handleInputChange('autoStartWork', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Sound notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Play notification sounds when sessions complete
                </p>
              </div>
              <Switch
                checked={localSettings.soundEnabled}
                onCheckedChange={(checked) => handleInputChange('soundEnabled', checked)}
              />
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <Button onClick={handleSave} className="flex-1">
            Save Settings
          </Button>
          <Button variant="outline" onClick={handleReset}>
            Reset to Default
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PomodoroSettingsComponent;
