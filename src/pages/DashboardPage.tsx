import Dashboard from '@/pages/Dashboard';

/**
 * DashboardPage — thin shell
 * Delegates to the existing Dashboard component which renders the timer
 * dashboard with PageLayout, stats cards, TimerList, CreateTimerForm,
 * and EnhancedAnimationManager.
 */
export default function DashboardPage() {
  return <Dashboard />;
}
