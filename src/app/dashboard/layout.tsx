'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';
import { useUIStore } from '@/lib/store/ui-store';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import {
  LayoutDashboard,
  Receipt,
  RotateCcw,
  Package,
  PlusCircle,
  AlertTriangle,
  DollarSign,
  BarChart3,
  Users,
  Truck,
  Printer,
  Settings,
  LogOut,
  Menu,
  X,
  Moon,
  Sun,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

interface NavItem {
  id: string;
  label: string;
  icon: any;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'billing', label: 'Billing / POS', icon: Receipt },
  { id: 'returns', label: 'Returns & Refunds', icon: RotateCcw },
  { id: 'inventory', label: 'Inventory', icon: Package },
  { id: 'stock-entry', label: 'Stock Entry', icon: PlusCircle },
  { id: 'expiry', label: 'Expiry Alerts', icon: AlertTriangle },
  { id: 'accounts', label: 'Accounts', icon: DollarSign },
  { id: 'reports', label: 'Reports', icon: BarChart3, adminOnly: true },
  { id: 'customers', label: 'Customers', icon: Users },
  { id: 'suppliers', label: 'Suppliers', icon: Truck },
  { id: 'print-settings', label: 'Print Settings', icon: Printer },
  { id: 'admin-settings', label: 'Admin Settings', icon: Settings, adminOnly: true },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { currentPage, setCurrentPage, sidebarOpen, toggleSidebar, setSidebarOpen } = useUIStore();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setMounted(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (mounted && !isLoading && !isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router, isLoading, mounted]);

  const handleLogout = () => {
    logout();
    toast({
      title: 'Logged Out',
      description: 'You have been successfully logged out.',
    });
    router.push('/');
  };

  const handleNavClick = (itemId: string) => {
    setCurrentPage(itemId as any);
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  const filteredNavItems = navItems.filter(
    (item) => !item.adminOnly || user?.role === 'ADMIN'
  );

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen flex bg-background">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed md:sticky top-0 left-0 h-screen w-64 bg-card border-r z-50 transition-transform duration-300',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary">
                  <Receipt className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="font-bold text-lg">Atom Medz</h1>
                  <p className="text-xs text-muted-foreground">{user.role}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-1">
              {filteredNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.id}
                    variant={currentPage === item.id ? 'default' : 'ghost'}
                    className={cn(
                      'w-full justify-start gap-3',
                      currentPage === item.id && 'bg-primary text-primary-foreground'
                    )}
                    onClick={() => handleNavClick(item.id)}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </Button>
                );
              })}
            </div>
          </ScrollArea>

          {/* Footer */}
          <div className="p-4 border-t space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {mounted && theme === 'dark' ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
              {mounted && theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-destructive hover:text-destructive"
              onClick={handleLogout}
            >
              <LogOut className="w-5 h-5" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-h-0 overflow-auto">
        {/* Top Bar */}
        <div className="sticky top-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b px-4 md:px-6 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={toggleSidebar}
            >
              <Menu className="w-5 h-5" />
            </Button>
            <div className="flex-1 md:hidden" />
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
                <span>Logged in as:</span>
                <span className="font-medium text-foreground">{user.name}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-4 md:p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
