'use client';

import { useState, useEffect, useCallback } from 'react';
import { useBillingStore, BillItem } from '@/lib/store/billing-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
  Search,
  Plus,
  Trash2,
  Printer,
  Save,
  RotateCcw,
  X,
  Keyboard,
  Users,
} from 'lucide-react';

interface Medicine {
  id: string;
  name: string;
  brand: string;
  composition: string;
  batches: Array<{
    id: string;
    batchNumber: string;
    expiryDate: Date;
    mrp: number;
    sellingPrice: number;
    quantity: number;
  }>;
}

interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
}

export default function BillingPage() {
  const {
    items,
    customerId,
    discount,
    paymentMode,
    notes,
    addItem,
    removeItem,
    updateItemQuantity,
    updateItemDiscount,
    setCustomerId,
    setDiscount,
    setPaymentMode,
    setNotes,
    clearBill,
    getSubtotal,
    getTotalDiscount,
    getTotalCGST,
    getTotalSGST,
    getTotal,
    getRoundedTotal,
  } = useBillingStore();

  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Medicine[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const [showShortcuts, setShowShortcuts] = useState(false);

  // Search medicines
  const searchMedicines = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      const response = await fetch(`/api/medicines/search?q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.medicines);
      }
    } catch (error) {
      console.error('Error searching medicines:', error);
    }
  }, []);

  useEffect(() => {
    const debounce = setTimeout(() => {
      searchMedicines(searchQuery);
    }, 300);

    return () => clearTimeout(debounce);
  }, [searchQuery, searchMedicines]);

  // Fetch customers
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await fetch('/api/customers');
        if (response.ok) {
          const data = await response.json();
          setCustomers(data.customers);
        }
      } catch (error) {
        console.error('Error fetching customers:', error);
      }
    };

    fetchCustomers();
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ignore if input is focused
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      switch (e.key) {
        case 'F1':
          e.preventDefault();
          document.getElementById('search-input')?.focus();
          break;
        case 'F2':
          e.preventDefault();
          setPaymentMode('CASH');
          toast({ title: 'Payment mode set to CASH' });
          break;
        case 'F3':
          e.preventDefault();
          setPaymentMode('UPI');
          toast({ title: 'Payment mode set to UPI' });
          break;
        case 'F4':
          e.preventDefault();
          setPaymentMode('CARD');
          toast({ title: 'Payment mode set to CARD' });
          break;
        case 'F5':
          e.preventDefault();
          setPaymentMode('CREDIT');
          toast({ title: 'Payment mode set to CREDIT' });
          break;
        case 'F9':
          e.preventDefault();
          handleSaveBill();
          break;
        case 'F10':
          e.preventDefault();
          handlePrintBill();
          break;
        case 'Escape':
          e.preventDefault();
          clearBill();
          toast({ title: 'Bill cleared' });
          break;
        case '?':
          if (e.shiftKey) {
            e.preventDefault();
            setShowShortcuts(!showShortcuts);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [setPaymentMode, clearBill, showShortcuts, toast]);

  const handleAddToBill = (medicine: Medicine, batchId: string, quantity: number = 1) => {
    const batch = medicine.batches.find(b => b.id === batchId);
    if (!batch) return;

    const gstPercentage = 18; // Default GST
    const baseAmount = quantity * batch.sellingPrice;
    const item: BillItem = {
      id: `${medicine.id}-${batchId}-${Date.now()}`,
      medicineId: medicine.id,
      medicineName: medicine.name,
      batchId: batch.id,
      batchNumber: batch.batchNumber,
      expiryDate: batch.expiryDate,
      mrp: batch.mrp,
      quantity,
      rate: batch.sellingPrice,
      discount: 0,
      gstPercentage,
      cgst: baseAmount * (gstPercentage / 2 / 100),
      sgst: baseAmount * (gstPercentage / 2 / 100),
      amount: baseAmount + (baseAmount * gstPercentage / 100),
    };

    addItem(item);
    setSearchQuery('');
    setSearchResults([]);
    setSelectedMedicine(null);

    toast({
      title: 'Item Added',
      description: `${medicine.name} added to bill`,
    });
  };

  const handleSaveBill = async () => {
    if (items.length === 0) {
      toast({
        title: 'Error',
        description: 'Please add items to the bill',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await fetch('/api/bills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          customerId,
          discount,
          paymentMode,
          notes,
          subtotal: getSubtotal(),
          cgst: getTotalCGST(),
          sgst: getTotalSGST(),
          totalAmount: getTotal(),
          roundedAmount: getRoundedTotal(),
        }),
      });

      if (response.ok) {
        toast({
          title: 'Bill Saved',
          description: 'Bill has been saved successfully',
        });
        clearBill();
      } else {
        throw new Error('Failed to save bill');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save bill',
        variant: 'destructive',
      });
    }
  };

  const handlePrintBill = () => {
    if (items.length === 0) {
      toast({
        title: 'Error',
        description: 'Please add items to the bill',
        variant: 'destructive',
      });
      return;
    }
    toast({
      title: 'Printing Bill',
      description: 'Bill sent to printer',
    });
    // In a real app, trigger print dialog
    window.print();
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-8rem)]">
      {/* Left Panel - Medicine Search & Bill Items */}
      <div className="flex-1 flex flex-col gap-4 min-w-0">
        {/* Search Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Search Medicine</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowShortcuts(!showShortcuts)}
              >
                <Keyboard className="w-4 h-4 mr-2" />
                Shortcuts
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="search-input"
                placeholder="Search by name, brand, or composition (F1)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12"
                autoFocus
              />
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <Card className="border">
                <ScrollArea className="max-h-64">
                  <div className="p-2 space-y-2">
                    {searchResults.map((medicine) => (
                      <div
                        key={medicine.id}
                        className="p-3 border hover:bg-muted cursor-pointer transition-colors"
                        onClick={() => setSelectedMedicine(medicine)}
                      >
                        <div className="font-semibold">{medicine.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {medicine.brand} | {medicine.composition}
                        </div>
                        <div className="flex gap-2 mt-2">
                          {medicine.batches.slice(0, 2).map((batch) => (
                            <Badge key={batch.id} variant="secondary">
                              Batch: {batch.batchNumber} | ₹{batch.sellingPrice}
                            </Badge>
                          ))}
                          {medicine.batches.length > 2 && (
                            <Badge variant="outline">+{medicine.batches.length - 2} more</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </Card>
            )}

            {/* Selected Medicine - Batch Selection */}
            {selectedMedicine && (
              <Card className="border-primary">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{selectedMedicine.name}</CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSelectedMedicine(null)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label>Select Batch</Label>
                    <Select
                      onValueChange={(batchId) => {
                        const batch = selectedMedicine.batches.find(b => b.id === batchId);
                        if (batch) {
                          handleAddToBill(selectedMedicine, batchId, 1);
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a batch" />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedMedicine.batches.map((batch) => (
                          <SelectItem key={batch.id} value={batch.id}>
                            <div className="flex flex-col">
                              <span>Batch: {batch.batchNumber} | Qty: {batch.quantity}</span>
                              <span className="text-xs text-muted-foreground">
                                Exp: {new Date(batch.expiryDate).toLocaleDateString()} | MRP: ₹{batch.mrp}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>

        {/* Bill Items */}
        <Card className="flex-1 flex flex-col min-h-0">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Bill Items ({items.length})</span>
              <Button
                variant="outline"
                size="sm"
                onClick={clearBill}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Clear (Esc)
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 min-h-0">
            {items.length === 0 ? (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <Plus className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No items in bill</p>
                  <p className="text-sm">Search and add medicines to start billing</p>
                </div>
              </div>
            ) : (
              <ScrollArea className="h-full">
                <div className="space-y-2">
                  {items.map((item, index) => (
                    <Card key={item.id} className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold">{item.medicineName}</div>
                          <div className="text-sm text-muted-foreground">
                            Batch: {item.batchNumber} | ₹{item.rate}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) =>
                              updateItemQuantity(item.id, parseInt(e.target.value) || 1)
                            }
                            className="w-20 h-10 text-center"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeItem(item.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-3 pt-3 border-t">
                        <div className="flex items-center gap-2">
                          <Label className="text-sm">Discount %:</Label>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            value={item.discount}
                            onChange={(e) =>
                              updateItemDiscount(item.id, parseFloat(e.target.value) || 0)
                            }
                            className="w-16 h-8"
                          />
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-lg">₹{item.amount.toFixed(2)}</div>
                          <div className="text-xs text-muted-foreground">
                            CGST: ₹{item.cgst.toFixed(2)} | SGST: ₹{item.sgst.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Right Panel - Summary & Actions */}
      <div className="w-full lg:w-96 space-y-4">
        {/* Customer Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Customer
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select
              value={customerId || ''}
              onValueChange={setCustomerId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Walk-in Customer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Walk-in Customer</SelectItem>
                {customers.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.name} - {customer.phone}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Bill Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Bill Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>₹{getSubtotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">CGST</span>
                <span>₹{getTotalCGST().toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">SGST</span>
                <span>₹{getTotalSGST().toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Discount</span>
                <span className="text-destructive">-₹{discount.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total</span>
                <span className="font-semibold">₹{getTotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Rounded Total</span>
                <span className="text-2xl font-bold text-primary">₹{getRoundedTotal()}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Round-off</span>
                <span>₹{(getRoundedTotal() - getTotal()).toFixed(2)}</span>
              </div>
            </div>

            <Separator />

            {/* Discount Input */}
            <div className="space-y-2">
              <Label>Additional Discount (₹)</Label>
              <Input
                type="number"
                min="0"
                value={discount}
                onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                placeholder="0"
              />
            </div>

            {/* Payment Mode */}
            <div className="space-y-2">
              <Label>Payment Mode</Label>
              <div className="grid grid-cols-2 gap-2">
                {['CASH', 'UPI', 'CARD', 'CREDIT'].map((mode) => (
                  <Button
                    key={mode}
                    variant={paymentMode === mode ? 'default' : 'outline'}
                    onClick={() => setPaymentMode(mode as any)}
                    className="h-10"
                  >
                    {mode}
                  </Button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground text-center">
                F2-F5 for quick selection
              </p>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes (optional)"
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-2">
          <Button
            className="w-full h-12 text-base font-semibold"
            onClick={handleSaveBill}
            disabled={items.length === 0}
          >
            <Save className="w-5 h-5 mr-2" />
            Save Bill (F9)
          </Button>
          <Button
            className="w-full h-12 text-base font-semibold"
            variant="outline"
            onClick={handlePrintBill}
            disabled={items.length === 0}
          >
            <Printer className="w-5 h-5 mr-2" />
            Print (F10)
          </Button>
        </div>

        {/* Keyboard Shortcuts Help */}
        {showShortcuts && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Keyboard Shortcuts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>F1</span>
                <span className="text-muted-foreground">Focus Search</span>
              </div>
              <div className="flex justify-between">
                <span>F2-F5</span>
                <span className="text-muted-foreground">Payment Mode</span>
              </div>
              <div className="flex justify-between">
                <span>F9</span>
                <span className="text-muted-foreground">Save Bill</span>
              </div>
              <div className="flex justify-between">
                <span>F10</span>
                <span className="text-muted-foreground">Print Bill</span>
              </div>
              <div className="flex justify-between">
                <span>Esc</span>
                <span className="text-muted-foreground">Clear Bill</span>
              </div>
              <div className="flex justify-between">
                <span>Shift + ?</span>
                <span className="text-muted-foreground">Toggle Help</span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
