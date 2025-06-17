
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  Timer, 
  Calendar, 
  BarChart3, 
  Target,
  User, 
  Menu, 
  X,
  Lightbulb
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const navItems = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: Timer,
  },
  {
    name: 'Insights',
    href: '/insights',
    icon: Lightbulb,
  },
  {
    name: 'Calendar',
    href: '/calendar', 
    icon: Calendar,
  },
  {
    name: 'Reports',
    href: '/reports',
    icon: BarChart3,
  },
  {
    name: 'Goals',
    href: '/goals',
    icon: Target,
  },
  {
    name: 'Profile',
    href: '/profile',
    icon: User,
  },
];

const Navigation = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const NavigationItems = ({ mobile = false, onItemClick = () => {} }) => (
    <>
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.href;
        
        return (
          <Link
            key={item.name}
            to={item.href}
            onClick={onItemClick}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent',
              mobile && 'text-base py-3'
            )}
          >
            <Icon className={cn('h-4 w-4', mobile && 'h-5 w-5')} />
            {item.name}
          </Link>
        );
      })}
    </>
  );

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex flex-col gap-1 p-4">
        <NavigationItems />
      </nav>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="m-4">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64">
            <div className="flex flex-col gap-2 mt-8">
              <NavigationItems 
                mobile 
                onItemClick={() => setMobileMenuOpen(false)} 
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
};

export default Navigation;
