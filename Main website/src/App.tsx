import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import { AuthProvider } from '@/contexts/AuthContext';

// Components
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

// Pages
import Home from '@/pages/Home';
import CurrentEvent from '@/pages/CurrentEvent';
import Gallery from '@/pages/Gallery';
import ArtworkView from '@/pages/ArtworkView';
import HallOfFame from '@/pages/HallOfFame';
import Login from '@/pages/Login';
import Profile from '@/pages/Profile';
import Submit from '@/pages/Submit';
import NotFound from '@/pages/NotFound';

const queryClient = new QueryClient();

function Router() {
  return (
    <div className="flex flex-col min-h-[100dvh]">
      <Navbar />
      <main className="flex-1">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/events/current" component={CurrentEvent} />
          <Route path="/gallery" component={Gallery} />
          <Route path="/artwork/:id" component={ArtworkView} />
          <Route path="/hall-of-fame" component={HallOfFame} />
          <Route path="/login" component={Login} />
          <Route path="/profile" component={Profile} />
          <Route path="/submit" component={Submit} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
