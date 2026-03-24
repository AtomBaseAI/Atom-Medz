'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Search, RotateCcw, Trash2, Save, DollarSign } from 'lucide-react';

interface Bill {
  id: string;
  invoiceNumber: string;
  customerName?: string;
  totalAmount: number;
  createdAt: Date;
  items: Array<{
    id: string;
    medicineName: string;
    batchNumber: string;
    quantity: number;
    rate: number;
    amount: number;
  }>;
}

interface ReturnItem {
  billItemId: string;
  medicineName: string;
  batchNumber: string;
  quantity: number;
  rate: number;
  refundAmount: number;
}

export default function ReturnsPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [searchResults, setSearchResults] = useState<Bill[]>([]);
  const [returnItems, setReturnItems] = useState<ReturnItem[]>([]);
  const [refundMode, setRefundMode] = useState<'CASH' | 'CREDIT'>('CASH');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const debounce = setTimeout(() => {
      if (searchQuery.length >= 2) {
        searchBills(searchQuery);
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(debounce);
  }, [searchQuery]);

  const searchBills = async (query: string) => {
    try {
      const response = await fetch(`/api/bills/search?q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.bills);
      }
    } catch (error) {
      console.error('Error searching bills:', error);
    }
  };

  const selectBill = (bill: Bill) => {
    setSelectedBill(bill);
    setSearchResults([]);
    setSearchQuery('');
    setReturnItems([]);
  };

  const toggleItemReturn = (billItem: BillItem) => {
    const existingIndex = returnItems.findIndex(
      (item) => item.billItemId === billItem.id
    );

    if (existingIndex >= 0) {
      setReturnItems(returnItems.filter((item) => item.billItemId !== billItem.id));
    } else {
      setReturnItems([
        ...returnItems,
        {
          billItemId: billItem.id,
          medicineName: billItem.medicineName,
          batchNumber: billItem.batchNumber,
          quantity: billItem.quantity,
          rate: billItem.rate,
          refundAmount: billItem.amount,
        },
      ]);
    }
  };

  const updateReturnQuantity = (billItemId: string, quantity: number) => {
    setReturnItems(
      returnItems.map((item) =>
        item.billItemId === billItemId
          ? {
              ...item,
              quantity,
              refundAmount: quantity * item.rate,
            }
          : item
      )
    );
  };

  const removeReturnItem = (billItemId: string) => {
    setReturnItems(returnItems.filter((item) => item.billItemId !== billItemId));
  };

  const getTotalRefund = () => {
    return returnItems.reduce((sum, item) => sum + item.refundAmount, 0);
  };

  const handleProcessReturn = async () => {
    if (!selectedBill || returnItems.length === 0) {
      toast({
        title: 'Error',
        description: 'Please select items to return',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await fetch('/api/returns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalBillId: selectedBill.id,
          items: returnItems,
          refundAmount: getTotalRefund(),
          refundMode,
          notes,
        }),
      });

      if (response.ok) {
        toast({
          title: 'Return Processed',
          description: `₹${getTotalRefund().toFixed(2)} refunded via ${refundMode}`,
        });
        setSelectedBill(null);
        setReturnItems([]);
        setNotes('');
      } else {
        throw new Error('Failed to process return');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to process return',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Returns & Refunds</h1>
        <p className="text-muted-foreground mt-1">
          Process sales returns and issue refunds
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Panel - Search and Bill Details */}
        <div className="space-y-4">
          {/* Search Bill */}
          <Card>
            <CardHeader>
              <CardTitle>Search Bill</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search by invoice number or customer name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12"
                />
              </div>

              {searchResults.length > 0 && (
                <ScrollArea className="max-h-64 border">
                  <div className="p-2 space-y-2">
                    {searchResults.map((bill) => (
                      <div
                        key={bill.id}
                        className="p-3 border hover:bg-muted cursor-pointer transition-colors"
                        onClick={() => selectBill(bill)}
                      >
                        <div className="font-semibold">{bill.invoiceNumber}</div>
                        <div className="text-sm text-muted-foreground">
                          {bill.customerName || 'Walk-in Customer'}
                        </div>
                        <div className="text-sm text-primary font-medium mt-1">
                          ₹{bill.totalAmount.toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>

          {/* Selected Bill Details */}
          {selectedBill && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Bill: {selectedBill.invoiceNumber}</span>
                  <Badge variant="secondary">
                    {new Date(selectedBill.createdAt).toLocaleDateString()}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Customer:</span>
                    <span className="font-medium">
                      {selectedBill.customerName || 'Walk-in Customer'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Amount:</span>
                    <span className="font-semibold">
                      ₹{selectedBill.totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">Select items to return:</p>
                  {selectedBill.items.map((item) => {
                    const isReturning = returnItems.some(
                      (ri) => ri.billItemId === item.id
                    );
                    return (
                      <div
                        key={item.id}
                        className={`p-3 border cursor-pointer transition-colors ${
                          isReturning ? 'bg-primary/10 border-primary' : 'hover:bg-muted'
                        }`}
                        onClick={() => toggleItemReturn(item)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="font-medium">{item.medicineName}</div>
                            <div className="text-xs text-muted-foreground">
                              Batch: {item.batchNumber} | Qty: {item.quantity}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">₹{item.amount.toFixed(2)}</div>
                            <Badge variant={isReturning ? 'default' : 'outline'} className="mt-1">
                              {isReturning ? 'Selected' : 'Click to Return'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Panel - Return Items and Refund */}
        <div className="space-y-4">
          {/* Return Items Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Return Items ({returnItems.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {returnItems.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <RotateCcw className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No items selected</p>
                  <p className="text-sm">Select items from the bill to return</p>
                </div>
              ) : (
                <ScrollArea className="max-h-64">
                  <div className="space-y-2">
                    {returnItems.map((item) => (
                      <Card key={item.billItemId} className="p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="font-medium">{item.medicineName}</div>
                            <div className="text-xs text-muted-foreground">
                              Batch: {item.batchNumber}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeReturnItem(item.billItemId)}
                            className="text-destructive h-8 w-8"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">Qty:</span>
                            <Input
                              type="number"
                              min="1"
                              max={item.quantity}
                              value={item.quantity}
                              onChange={(e) =>
                                updateReturnQuantity(
                                  item.billItemId,
                                  parseInt(e.target.value) || 1
                                )
                              }
                              className="w-20 h-8"
                            />
                          </div>
                          <div className="text-right">
                            <span className="text-sm text-muted-foreground">Refund:</span>
                            <span className="font-semibold ml-2 text-primary">
                              ₹{item.refundAmount.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>

          {/* Refund Details */}
          {returnItems.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Refund Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Refund</span>
                    <span className="text-2xl font-bold text-primary">
                      ₹{getTotalRefund().toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Refund Mode</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['CASH', 'CREDIT'].map((mode) => (
                      <Button
                        key={mode}
                        variant={refundMode === mode ? 'default' : 'outline'}
                        onClick={() => setRefundMode(mode as any)}
                        className="h-10"
                      >
                        <DollarSign className="w-4 h-4 mr-2" />
                        {mode}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Notes</label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Reason for return (optional)"
                    rows={2}
                  />
                </div>

                <Button
                  className="w-full h-12 gap-2"
                  onClick={handleProcessReturn}
                >
                  <Save className="w-5 h-5" />
                  Process Return
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
