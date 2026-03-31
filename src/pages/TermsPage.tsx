import TermsOfService from '@/pages/TermsOfService';

/**
 * TermsPage — thin shell
 * Delegates to the existing TermsOfService component (static legal page
 * with acceptance, service description, accounts, billing, and liability).
 */
export default function TermsPage() {
  return <TermsOfService />;
}
