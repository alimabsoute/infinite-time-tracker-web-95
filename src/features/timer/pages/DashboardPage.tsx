
import { useState } from 'react';
import { Clock, Activity, Timer as TimerIcon, DollarSign } from 'lucide-react';
import PageLayout from '@shared/components/layout/PageLayout';
import { useDeadSimpleTimers } from '@features/timer/hooks/useDeadSimpleTimers';
import TimerList from '@features/timer/components/TimerList';
import CreateTimerForm from '@features/timer/components/CreateTimerForm';
import EnhancedAnimationManager from '@shared/components/animations/EnhancedAnimationManager';
import TimerLimitIndicator from '@features/billing/components/TimerLimitIndicator';
import RunningTimerLimitIndicator from '@features/billing/components/RunningTimerLimitIndicator';

const formatTotalMinutes = (ms: number) => {
  const totalMin = Math.floor(ms / 1000 / 60);
  if (totalMin < 60) return `${totalMin}m`;
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
};

const StatCard = ({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  accent: string;
}) => (
  <div className="bg-card border border-border rounded-xl p-5 flex items-start gap-4">
    <div className={`rounded-lg p-2.5 ${accent}`}>
      <Icon className="h-4 w-4" />
    </div>
    <div>
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">{label}</p>
      <p className="text-2xl font-semibold text-foreground leading-none">{value}</p>
    </div>
  </div>
);

const Dashboard = () => {
  const {
    timers,
    toggleTimer,
    resetTimer,
    addTimer,
    deleteTimer,
    renameTimer,
    updateDeadline,
    updatePriority,
    reorderTimers,
    updateBillable,
    getDisplayTime,
    confettiTrigger,
    celebrationTrigger,
    clearConfettiTrigger,
    clearCelebrationTrigger,
  } = useDeadSimpleTimers();
  const [newTimerId] = useState<string | null>(null);

  const handleCreateTimer = async (name: string, position?: { x: number; y: number }) => {
    await addTimer(name, position);
  };

  const totalMs = timers.reduce((sum, t) => sum + getDisplayTime(t), 0);
  const activeCount = timers.filter(t => t.isRunning).length;
  const billableEarnings = timers
    .filter(t => t.billable && t.hourlyRate)
    .reduce((sum, t) => sum + (getDisplayTime(t) / 3_600_000) * (t.hourlyRate ?? 0), 0);
  const formatEarnings = (usd: number) =>
    usd === 0 ? '$0' : `$${usd.toFixed(usd < 10 ? 2 : 0)}`;

  return (
    <PageLayout title="Dashboard">
      <div id="dashboard-content">
        {/* Billing indicators */}
        <div className="space-y-3">
          <TimerLimitIndicator currentCount={timers.length} />
          <RunningTimerLimitIndicator currentRunningCount={activeCount} />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Timers"
            value={timers.length}
            icon={TimerIcon}
            accent="bg-primary/10 text-primary"
          />
          <StatCard
            label="Total Time"
            value={formatTotalMinutes(totalMs)}
            icon={Clock}
            accent="bg-emerald-500/10 text-emerald-600"
          />
          <StatCard
            label="Active Now"
            value={activeCount}
            icon={Activity}
            accent="bg-amber-500/10 text-amber-600"
          />
          <StatCard
            label="Billable Earned"
            value={formatEarnings(billableEarnings)}
            icon={DollarSign}
            accent="bg-violet-500/10 text-violet-600"
          />
        </div>

        {/* Timer list */}
        <div>
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-4">
            Your Timers
          </h2>
          <TimerList
            timers={timers}
            onToggle={toggleTimer}
            onReset={resetTimer}
            onDelete={deleteTimer}
            onRename={renameTimer}
            onUpdateDeadline={updateDeadline}
            onUpdatePriority={updatePriority}
            onUpdateBillable={updateBillable}
            onReorder={reorderTimers}
            calculateSessionElapsedTime={getDisplayTime}
            newTimerId={newTimerId}
            onCreateTimer={() => handleCreateTimer('New Timer')}
          />
        </div>

        <CreateTimerForm
          onAddTimer={handleCreateTimer}
          currentTimerCount={timers.length}
        />

        <EnhancedAnimationManager
          confettiTrigger={confettiTrigger}
          celebrationTrigger={celebrationTrigger}
          onConfettiComplete={clearConfettiTrigger}
          onCelebrationComplete={clearCelebrationTrigger}
        />
      </div>
    </PageLayout>
  );
};

export default Dashboard;
