import Reports from '@/pages/Reports';

/**
 * ReportsPage — thin shell
 * Delegates to the existing Reports component which renders PageLayout
 * with TimerReportsTable (premium-gated) and export capabilities.
 */
export default function ReportsPage() {
  return <Reports />;
}
