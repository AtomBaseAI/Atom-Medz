'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store/auth-store';
import { useUIStore } from '@/lib/store/ui-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Receipt,
  Package,
  AlertTriangle,
  DollarSign,
  PlusCircle,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';

export default function DashboardHome() {
  const { user } = useAuthStore();
  const { setCurrentPage } = useUIStore();
  const [stats, setStats] = useState({
    todaySales: 0,
    todayProfit: 0,
    lowStockItems: 0,
    expiringItems: 0,
  });

  useEffect(() => {
    // Fetch dashboard stats
    const fetchStats = async () => {
      try {
        // In a real app, fetch from API
        setStats({
          todaySales: 15420,
          todayProfit: 3240,
          lowStockItems: 3,
          expiringItems: 2,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, []);

  const quickActions = user?.role === 'ADMIN'
    ? [
        { id: 'billing', label: 'New Bill', icon: Receipt, color: 'bg-primary' },
        { id: 'stock-entry', label: 'Add Stock', icon: PlusCircle, color: 'bg-blue-600' },
        { id: 'inventory', label: 'View Inventory', icon: Package, color: 'bg-purple-600' },
        { id: 'reports', label: 'View Reports', icon: TrendingUp, color: 'bg-orange-600' },
      ]
    : [
        { id: 'billing', label: 'New Bill', icon: Receipt, color: 'bg-primary' },
        { id: 'stock-entry', label: 'Add Stock', icon: PlusCircle, color: 'bg-blue-600' },
        { id: 'inventory', label: 'View Inventory', icon: Package, color: 'bg-purple-600' },
        { id: 'returns', label: 'Process Return', icon: TrendingDown, color: 'bg-red-600' },
      ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back, {user?.name}! Here's what's happening today.
        </p>
      </div>

      {/* Stats Grid */}
      {user?.role === 'ADMIN' && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Today's Sales
              </CardTitle>
              <DollarSign className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{stats.todaySales.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">
                +12.5% from yesterday
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Today's Profit
              </CardTitle>
              <TrendingUp className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{stats.todayProfit.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">
                +8.2% from yesterday
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Low Stock Alerts
              </CardTitle>
              <Package className="w-4 h-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.lowStockItems}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Items need restocking
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Expiring Soon
              </CardTitle>
              <AlertTriangle className="w-4 h-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.expiringItems}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Items expiring in 30 days
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Card
                key={action.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setCurrentPage(action.id as any)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 ${action.color}`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold">{action.label}</p>
                      <p className="text-sm text-muted-foreground">
                        Click to proceed
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Alerts Section */}
      {(stats.lowStockItems > 0 || stats.expiringItems > 0) && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Alerts</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {stats.lowStockItems > 0 && (
              <Card className="border-yellow-600/50">
                <CardHeader>
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Package className="w-4 h-4 text-yellow-600" />
                    Low Stock Warning
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {stats.lowStockItems} items are running low on stock
                  </p>
                  <Button
                    variant="link"
                    className="p-0 h-auto mt-2"
                    onClick={() => setCurrentPage('inventory')}
                  >
                    View Inventory →
                  </Button>
                </CardContent>
              </Card>
            )}

            {stats.expiringItems > 0 && (
              <Card className="border-red-600/50">
                <CardHeader>
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    Expiry Alert
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {stats.expiringItems} items will expire soon
                  </p>
                  <Button
                    variant="link"
                    className="p-0 h-auto mt-2"
                    onClick={() => setCurrentPage('expiry')}
                  >
                    View Expiry Report →
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { action: 'New Bill', detail: 'INV-001 - ₹450', time: '2 mins ago' },
              { action: 'Stock Added', detail: 'Paracetamol 500mg - 100 units', time: '15 mins ago' },
              { action: 'Return Processed', detail: 'INV-099 - ₹120', time: '1 hour ago' },
              { action: 'New Customer', detail: 'Rahul Sharma added', time: '2 hours ago' },
            ].map((activity, index) => (
              <div key={index} className="flex items-start gap-4 p-3 hover:bg-muted/50 transition-colors">
                <div className="w-2 h-2 mt-2 bg-primary" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{activity.action}</p>
                  <p className="text-xs text-muted-foreground">{activity.detail}</p>
                </div>
                <p className="text-xs text-muted-foreground whitespace-nowrap">{activity.time}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
