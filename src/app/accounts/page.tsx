'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Wallet,
  CreditCard,
  Users,
  AlertCircle,
  Plus,
} from 'lucide-react';

export default function AccountsPage() {
  const [activeTab, setActiveTab] = useState('revenue');

  // Mock data - in production, fetch from API
  const stats = {
    totalRevenue: 425680,
    totalExpenses: 85420,
    netProfit: 340260,
    totalCredit: 45600,
    pendingCredits: 12,
  };

  const recentTransactions = [
    { id: 1, type: 'SALE', description: 'INV-2026030015', amount: 1250, date: '2026-03-24' },
    { id: 2, type: 'EXPENSE', description: 'Electricity Bill', amount: -3500, date: '2026-03-23' },
    { id: 3, type: 'SALE', description: 'INV-2026030014', amount: 890, date: '2026-03-23' },
    { id: 4, type: 'CREDIT_PAYMENT', description: 'Rahul Sharma - Credit', amount: 2000, date: '2026-03-22' },
    { id: 5, type: 'EXPENSE', description: 'Rent', amount: -15000, date: '2026-03-21' },
  ];

  const creditCustomers = [
    { id: 1, name: 'Rahul Sharma', phone: '9876543220', amount: 5000, lastPayment: '2026-03-20' },
    { id: 2, name: 'Priya Patel', phone: '9876543221', amount: 3200, lastPayment: '2026-03-18' },
    { id: 3, name: 'Amit Kumar', phone: '9876543222', amount: 8000, lastPayment: '2026-03-15' },
  ];

  const expenses = [
    { id: 1, category: 'RENT', amount: 15000, description: 'Monthly Shop Rent', date: '2026-03-21' },
    { id: 2, category: 'SALARY', amount: 45000, description: 'Staff Salaries', date: '2026-03-21' },
    { id: 3, category: 'ELECTRICITY', amount: 3500, description: 'March Electricity Bill', date: '2026-03-23' },
    { id: 4, category: 'OTHER', amount: 2000, description: 'Stationery', date: '2026-03-24' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Accounts & Profit</h1>
        <p className="text-muted-foreground mt-1">
          Track revenue, expenses, and credit management
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Revenue
            </CardTitle>
            <DollarSign className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <TrendingUp className="w-3 h-3 inline mr-1" />
              This month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Expenses
            </CardTitle>
            <TrendingDown className="w-4 h-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ₹{stats.totalExpenses.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Net Profit
            </CardTitle>
            <TrendingUp className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              ₹{stats.netProfit.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {(stats.netProfit / stats.totalRevenue * 100).toFixed(1)}% margin
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Outstanding Credit
            </CardTitle>
            <Wallet className="w-4 h-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              ₹{stats.totalCredit.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.pendingCredits} customers
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="revenue">Revenue & Profit</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="credit">Credit (Udhaar)</TabsTrigger>
        </TabsList>

        {/* Revenue & Profit Tab */}
        <TabsContent value="revenue" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Profit Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Gross Revenue</span>
                    <span>₹{stats.totalRevenue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Cost of Goods Sold</span>
                    <span>₹{(stats.totalRevenue * 0.6).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Gross Profit</span>
                    <span className="font-medium">
                      ₹{(stats.totalRevenue * 0.4).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Operating Expenses</span>
                    <span className="text-red-600">
                      -₹{stats.totalExpenses.toLocaleString()}
                    </span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-semibold">
                    <span>Net Profit</span>
                    <span className="text-primary">₹{stats.netProfit.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="max-h-64">
                  <div className="space-y-2">
                    {recentTransactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between p-3 border"
                      >
                        <div>
                          <div className="font-medium text-sm">{transaction.description}</div>
                          <div className="text-xs text-muted-foreground">
                            {transaction.date}
                          </div>
                        </div>
                        <Badge
                          variant={transaction.amount > 0 ? 'default' : 'destructive'}
                        >
                          {transaction.amount > 0 ? '+' : ''}
                          ₹{Math.abs(transaction.amount).toLocaleString()}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Expenses Tab */}
        <TabsContent value="expenses" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Expense Tracking</h2>
              <p className="text-sm text-muted-foreground">
                Manage and track shop expenses
              </p>
            </div>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add Expense
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            {['RENT', 'SALARY', 'ELECTRICITY', 'OTHER'].map((category) => {
              const total = expenses
                .filter((e) => e.category === category)
                .reduce((sum, e) => sum + e.amount, 0);
              return (
                <Card key={category}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {category.charAt(0) + category.slice(1).toLowerCase()}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">₹{total.toLocaleString()}</div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Expense History</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="max-h-96">
                <div className="space-y-2">
                  {expenses.map((expense) => (
                    <div
                      key={expense.id}
                      className="flex items-center justify-between p-3 border"
                    >
                      <div className="flex-1">
                        <div className="font-medium">{expense.description}</div>
                        <div className="text-sm text-muted-foreground">
                          <Badge variant="outline">{expense.category}</Badge>
                          <span className="ml-2">{expense.date}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-red-600">
                          -₹{expense.amount.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Credit (Udhaar) Tab */}
        <TabsContent value="credit" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Credit (Udhaar) Management</h2>
              <p className="text-sm text-muted-foreground">
                Track customer credit and payments
              </p>
            </div>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Record Payment
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Outstanding
                </CardTitle>
                <Wallet className="w-4 h-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  ₹{stats.totalCredit.toLocaleString()}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Customers with Credit
                </CardTitle>
                <Users className="w-4 h-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pendingCredits}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Overdue Payments
                </CardTitle>
                <AlertCircle className="w-4 h-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">2</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Send reminders
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Customers with Outstanding Credit</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="max-h-96">
                <div className="space-y-2">
                  {creditCustomers.map((customer) => (
                    <div
                      key={customer.id}
                      className="flex items-center justify-between p-3 border"
                    >
                      <div className="flex-1">
                        <div className="font-medium">{customer.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {customer.phone} | Last Payment: {customer.lastPayment}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-yellow-600">
                          ₹{customer.amount.toLocaleString()}
                        </div>
                        <Button variant="outline" size="sm" className="mt-1">
                          <CreditCard className="w-3 h-3 mr-1" />
                          Collect
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Alerts */}
          <Card className="border-yellow-600/50 bg-yellow-50 dark:bg-yellow-950/20">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-yellow-600" />
                Payment Reminders
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>• Send reminders to customers with outstanding credit</p>
              <p>• Follow up on overdue payments (30+ days)</p>
              <p>• Maintain credit limits for regular customers</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
