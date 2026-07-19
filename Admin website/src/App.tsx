import { Route, Switch, Router as WouterRouter, useLocation } from 'wouter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';

import DashboardPage from '@/pages/Dashboard';
import EventsPage from '@/pages/Events';
import SubmissionsPage from '@/pages/Submissions';
import VotingPage from '@/pages/Voting';
import ResultsPage from '@/pages/Results';
import UsersPage from '@/pages/Users';
import AnalyticsPage from '@/pages/Analytics';
import SettingsPage from '@/pages/Settings';
import LoginPage from '@/pages/Login';

import { AdminAuthProvider } from '@/contexts/AdminAuthContext';
import { AdminLayout } from '@/components/layout/AdminLayout';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function ProtectedRoute({ component: Component }: { component: React.ElementType }) {
  const [location] = useLocation();
  if (location === '/login') return <Component />;
  
  return (
    <AdminLayout>
      <Component />
    </AdminLayout>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={LoginPage} />
      <Route path="/" component={() => <ProtectedRoute component={DashboardPage} />} />
      <Route path="/events" component={() => <ProtectedRoute component={EventsPage} />} />
      <Route path="/submissions" component={() => <ProtectedRoute component={SubmissionsPage} />} />
      <Route path="/voting" component={() => <ProtectedRoute component={VotingPage} />} />
      <Route path="/results" component={() => <ProtectedRoute component={ResultsPage} />} />
      <Route path="/users" component={() => <ProtectedRoute component={UsersPage} />} />
      <Route path="/analytics" component={() => <ProtectedRoute component={AnalyticsPage} />} />
      <Route path="/settings" component={() => <ProtectedRoute component={SettingsPage} />} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <AdminAuthProvider>
            <Router />
          </AdminAuthProvider>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
