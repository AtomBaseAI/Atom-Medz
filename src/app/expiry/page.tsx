'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertTriangle, Calendar, Package, TrendingDown } from 'lucide-react';

interface ExpiryItem {
  id: string;
  medicineName: string;
  brand: string;
  batchNumber: string;
  expiryDate: Date;
  quantity: number;
  mrp: number;
  sellingPrice: number;
  daysToExpiry: number;
}

export default function ExpiryPage() {
  const [expiringItems, setExpiringItems] = useState<ExpiryItem[]>([]);
  const [filter, setFilter] = useState<'30' | '60' | '90' | 'expired'>('30');

  const fetchExpiryData = useCallback(async () => {
    try {
      const response = await fetch(`/api/expiry?days=${filter}`);
      if (response.ok) {
        const data = await response.json();
        setExpiringItems(data.items);
      }
    } catch (error) {
      console.error('Error fetching expiry data:', error);
    }
  }, [filter]);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    fetchExpiryData();
  }, [fetchExpiryData]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const getExpiryStatus = (days: number) => {
    if (days < 0) return <Badge variant="destructive">Expired</Badge>;
    if (days <= 30) return <Badge variant="destructive">Critical</Badge>;
    if (days <= 60) return <Badge variant="outline" className="text-yellow-600 border-yellow-600">Warning</Badge>;
    return <Badge variant="secondary">Upcoming</Badge>;
  };

  const getExpiryColor = (days: number) => {
    if (days < 0) return 'bg-red-600';
    if (days <= 30) return 'bg-red-600';
    if (days <= 60) return 'bg-yellow-600';
    return 'bg-orange-600';
  };

  const totalValue = expiringItems.reduce(
    (sum, item) => sum + (item.quantity * item.purchasePrice || 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Expiry Alerts</h1>
        <p className="text-muted-foreground mt-1">
          Monitor medicines approaching or past expiry
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Items at Risk
            </CardTitle>
            <AlertTriangle className="w-4 h-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{expiringItems.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Quantity
            </CardTitle>
            <Package className="w-4 h-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {expiringItems.reduce((sum, item) => sum + item.quantity, 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Value at Risk
            </CardTitle>
            <TrendingDown className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalValue.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2">
            {[
              { value: '30' as const, label: 'Next 30 Days' },
              { value: '60' as const, label: 'Next 60 Days' },
              { value: '90' as const, label: 'Next 90 Days' },
              { value: 'expired' as const, label: 'Already Expired' },
            ].map((f) => (
              <Button
                key={f.value}
                variant={filter === f.value ? 'default' : 'outline'}
                onClick={() => setFilter(f.value)}
              >
                <Calendar className="w-4 h-4 mr-2" />
                {f.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Expiry Items List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Expiring Items</span>
            {expiringItems.length > 0 && (
              <Button variant="outline" size="sm">
                Export Report
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {expiringItems.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No items found for selected period</p>
            </div>
          ) : (
            <ScrollArea className="max-h-[600px]">
              <div className="space-y-2">
                {expiringItems.map((item) => (
                  <Card key={item.id} className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 ${getExpiryColor(item.daysToExpiry)} rounded`}>
                            <AlertTriangle className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-lg">{item.medicineName}</h3>
                            <p className="text-sm text-muted-foreground">
                              {item.brand} | Batch: {item.batchNumber}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              {getExpiryStatus(item.daysToExpiry)}
                              <span className="text-sm text-muted-foreground">
                                {item.daysToExpiry < 0
                                  ? `Expired ${Math.abs(item.daysToExpiry)} days ago`
                                  : `${item.daysToExpiry} days remaining`}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-3 grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Expiry Date</p>
                            <p className="font-medium">
                              {new Date(item.expiryDate).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Quantity</p>
                            <p className="font-medium">{item.quantity}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Value</p>
                            <p className="font-medium">
                              ₹{(item.quantity * (item.purchasePrice || 0)).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="text-right space-y-2">
                        <div>
                          <p className="text-xs text-muted-foreground">MRP</p>
                          <p className="font-semibold">₹{item.mrp}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Selling</p>
                          <p className="font-semibold text-primary">₹{item.sellingPrice}</p>
                        </div>
                        <Button variant="outline" size="sm" className="w-full mt-2">
                          Apply Discount
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Recommendations */}
      {expiringItems.length > 0 && (
        <Card className="border-yellow-600/50 bg-yellow-50 dark:bg-yellow-950/20">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-600" />
              Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>• Offer discounts on items expiring within 30 days to clear stock</p>
            <p>• Return near-expiry items to suppliers if possible</p>
            <p>• Monitor expired items and remove from inventory</p>
            <p>• Adjust purchasing quantities to minimise future expiry</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
