'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useAuthStore } from '@/lib/store/auth-store';
import { useUIStore } from '@/lib/store/ui-store';

// Dynamically import pages to avoid circular dependencies
const DashboardHome = dynamic(() => import('./dashboard-home'), { ssr: false });
const BillingPage = dynamic(() => import('../billing/page'), { ssr: false });
const InventoryPage = dynamic(() => import('../inventory/page'), { ssr: false });
const StockEntryPage = dynamic(() => import('../stock-entry/page'), { ssr: false });
const ExpiryPage = dynamic(() => import('../expiry/page'), { ssr: false });
const ReportsPage = dynamic(() => import('../reports/page'), { ssr: false });
const ReturnsPage = dynamic(() => import('../returns/page'), { ssr: false });
const AccountsPage = dynamic(() => import('../accounts/page'), { ssr: false });
const CustomersPage = dynamic(() => import('../customers/page'), { ssr: false });
const SuppliersPage = dynamic(() => import('../suppliers/page'), { ssr: false });
const PrintSettingsPage = dynamic(() => import('../print-settings/page'), { ssr: false });
const AdminSettingsPage = dynamic(() => import('../admin-settings/page'), { ssr: false });

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { currentPage } = useUIStore();

  if (!user) return null;

  switch (currentPage) {
    case 'dashboard':
      return <DashboardHome />;
    case 'billing':
      return <BillingPage />;
    case 'returns':
      return <ReturnsPage />;
    case 'inventory':
      return <InventoryPage />;
    case 'stock-entry':
      return <StockEntryPage />;
    case 'expiry':
      return <ExpiryPage />;
    case 'accounts':
      return <AccountsPage />;
    case 'reports':
      return <ReportsPage />;
    case 'customers':
      return <CustomersPage />;
    case 'suppliers':
      return <SuppliersPage />;
    case 'print-settings':
      return <PrintSettingsPage />;
    case 'admin-settings':
      return <AdminSettingsPage />;
    default:
      return (
        <div className="flex items-center justify-center h-96">
          <p className="text-muted-foreground">Page under development: {currentPage}</p>
        </div>
      );
  }
}
