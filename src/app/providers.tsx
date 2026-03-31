import { ThemeProvider } from "next-themes";
import { BrowserRouter } from "react-router-dom";
import { QueryClient } from "@/components/QueryClient";
import { AuthProvider } from "@/features/auth/context/AuthContext";
import { SubscriptionProvider } from "@/features/billing/context/SubscriptionContext";
import { Toaster } from "@shared/components/ui/sonner";
import ErrorBoundary from "@/components/ErrorBoundary";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <BrowserRouter>
          <QueryClient>
            <AuthProvider>
              <SubscriptionProvider>
                <Toaster />
                {children}
              </SubscriptionProvider>
            </AuthProvider>
          </QueryClient>
        </BrowserRouter>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
