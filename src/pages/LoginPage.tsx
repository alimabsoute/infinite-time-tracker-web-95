import Login from '@/features/auth/components/Login';

/**
 * LoginPage — thin shell
 * Delegates to the auth feature's Login component with email/password
 * form, forgot password dialog, and signup link.
 */
export default function LoginPage() {
  return <Login />;
}
