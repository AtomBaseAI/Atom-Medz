'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart3,
  Download,
  FileText,
  Receipt,
  Package,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  DollarSign,
} from 'lucide-react';

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('sales');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reports</h1>
          <p className="text-muted-foreground mt-1">
            View and export business reports
          </p>
        </div>
        <Button className="gap-2">
          <Download className="w-5 h-5" />
          Export All
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
          <TabsTrigger value="sales">
            <BarChart3 className="w-4 h-4 mr-2" />
            Sales
          </TabsTrigger>
          <TabsTrigger value="gst">
            <FileText className="w-4 h-4 mr-2" />
            GST
          </TabsTrigger>
          <TabsTrigger value="purchase">
            <Receipt className="w-4 h-4 mr-2" />
            Purchase
          </TabsTrigger>
          <TabsTrigger value="stock">
            <Package className="w-4 h-4 mr-2" />
            Stock
          </TabsTrigger>
          <TabsTrigger value="expiry">
            <AlertTriangle className="w-4 h-4 mr-2" />
            Expiry
          </TabsTrigger>
        </TabsList>

        {/* Sales Reports */}
        <TabsContent value="sales" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Today's Sales
                </CardTitle>
                <DollarSign className="w-4 h-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹15,420</div>
                <p className="text-xs text-muted-foreground mt-1">
                  <TrendingUp className="w-3 h-3 inline mr-1" />
                  +12.5% from yesterday
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  This Week
                </CardTitle>
                <DollarSign className="w-4 h-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹98,450</div>
                <p className="text-xs text-muted-foreground mt-1">
                  <TrendingUp className="w-3 h-3 inline mr-1" />
                  +8.2% from last week
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  This Month
                </CardTitle>
                <DollarSign className="w-4 h-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹4,25,680</div>
                <p className="text-xs text-muted-foreground mt-1">
                  <TrendingUp className="w-3 h-3 inline mr-1" />
                  +15.3% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Bills
                </CardTitle>
                <Receipt className="w-4 h-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">156</div>
                <p className="text-xs text-muted-foreground mt-1">
                  This month
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Sales</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { invoice: 'INV-2026030001', customer: 'Rahul Sharma', amount: 450, time: '2 hours ago' },
                  { invoice: 'INV-2026030002', customer: 'Priya Patel', amount: 890, time: '3 hours ago' },
                  { invoice: 'INV-2026030003', customer: 'Walk-in', amount: 320, time: '5 hours ago' },
                  { invoice: 'INV-2026030004', customer: 'Amit Kumar', amount: 1250, time: 'Yesterday' },
                  { invoice: 'INV-2026030005', customer: 'Sneha Reddy', amount: 680, time: 'Yesterday' },
                ].map((sale, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border">
                    <div>
                      <div className="font-medium">{sale.invoice}</div>
                      <div className="text-sm text-muted-foreground">{sale.customer}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">₹{sale.amount}</div>
                      <div className="text-xs text-muted-foreground">{sale.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* GST Reports */}
        <TabsContent value="gst" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total CGST Collected
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹38,282</div>
                <p className="text-xs text-muted-foreground mt-1">This month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total SGST Collected
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹38,282</div>
                <p className="text-xs text-muted-foreground mt-1">This month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total GST
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">₹76,564</div>
                <p className="text-xs text-muted-foreground mt-1">This month</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>HSN-wise GST Summary</span>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export for GSTR-1
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[
                  { hsn: '3004', description: 'Medicaments', taxableValue: 425680, cgst: 38311, sgst: 38311 },
                  { hsn: '3005', description: 'Dressings', taxableValue: 45200, cgst: 4068, sgst: 4068 },
                  { hsn: '3306', description: 'Oral hygiene', taxableValue: 12500, cgst: 1125, sgst: 1125 },
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border">
                    <div>
                      <div className="font-medium">{item.hsn}</div>
                      <div className="text-sm text-muted-foreground">{item.description}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">₹{item.taxableValue.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">
                        CGST: ₹{item.cgst} | SGST: ₹{item.sgst}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Purchase Reports */}
        <TabsContent value="purchase" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Purchases
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹2,85,420</div>
                <p className="text-xs text-muted-foreground mt-1">This month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  GST Paid
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹51,376</div>
                <p className="text-xs text-muted-foreground mt-1">This month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Purchase Orders
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground mt-1">This month</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Purchases</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { invoice: 'PO-001', supplier: 'Pharma Distributors Ltd', amount: 45600, date: '2026-03-20' },
                  { invoice: 'PO-002', supplier: 'MediSupply Co', amount: 32400, date: '2026-03-18' },
                  { invoice: 'PO-003', supplier: 'Pharma Distributors Ltd', amount: 28500, date: '2026-03-15' },
                ].map((purchase, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border">
                    <div>
                      <div className="font-medium">{purchase.invoice}</div>
                      <div className="text-sm text-muted-foreground">{purchase.supplier}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">₹{purchase.amount.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">{purchase.date}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Stock Reports */}
        <TabsContent value="stock" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Stock Value
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹8,45,230</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Items
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">5</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Batches
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">5</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Low Stock Items
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">0</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Stock Value by Medicine</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[
                  { name: 'Paracetamol 500mg', quantity: 100, value: 4500 },
                  { name: 'Amoxicillin 500mg', quantity: 100, value: 4500 },
                  { name: 'Omeprazole 20mg', quantity: 100, value: 4500 },
                  { name: 'Metformin 500mg', quantity: 100, value: 4500 },
                  { name: 'Amlodipine 5mg', quantity: 100, value: 4500 },
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border">
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-muted-foreground">Qty: {item.quantity}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">₹{item.value.toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Expiry Reports */}
        <TabsContent value="expiry" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Expired Items
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">0</div>
                <p className="text-xs text-muted-foreground mt-1">Need removal</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Expiring in 30 Days
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">0</div>
                <p className="text-xs text-muted-foreground mt-1">Action needed</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Value at Risk
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹0</div>
                <p className="text-xs text-muted-foreground mt-1">Potential loss</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Expiry Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">No items expiring soon</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
