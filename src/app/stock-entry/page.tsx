'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Save, Search } from 'lucide-react';

interface Supplier {
  id: string;
  name: string;
  phone: string;
}

interface Medicine {
  id: string;
  name: string;
  brand: string;
  composition: string;
  hsnCode: string;
  gstPercentage: number;
}

interface StockItem {
  id: string;
  medicineId: string;
  medicineName: string;
  batchNumber: string;
  expiryDate: string;
  quantity: number;
  purchasePrice: number;
  sellingPrice: number;
  gstPercentage: number;
  amount: number;
  cgst: number;
  sgst: number;
}

export default function StockEntryPage() {
  const { toast } = useToast();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<StockItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Medicine[]>([]);
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const response = await fetch('/api/suppliers');
      if (response.ok) {
        const data = await response.json();
        setSuppliers(data.suppliers);
      }
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    }
  };

  const searchMedicines = async (query: string) => {
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
  };

  useEffect(() => {
    const debounce = setTimeout(() => {
      searchMedicines(searchQuery);
    }, 300);

    return () => clearTimeout(debounce);
  }, [searchQuery]);

  const addItem = (medicine: Medicine) => {
    const newItem: StockItem = {
      id: `${medicine.id}-${Date.now()}`,
      medicineId: medicine.id,
      medicineName: medicine.name,
      batchNumber: '',
      expiryDate: '',
      quantity: 0,
      purchasePrice: 0,
      sellingPrice: 0,
      gstPercentage: medicine.gstPercentage,
      amount: 0,
      cgst: 0,
      sgst: 0,
    };
    setItems([...items, newItem]);
    setSelectedMedicine(null);
    setSearchQuery('');
    setSearchResults([]);
  };

  const updateItem = (id: string, field: keyof StockItem, value: any) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        
        // Recalculate amounts when price, quantity, or GST changes
        if (['quantity', 'purchasePrice', 'gstPercentage'].includes(field)) {
          const baseAmount = updated.quantity * updated.purchasePrice;
          const gstAmount = baseAmount * (updated.gstPercentage / 100);
          updated.amount = baseAmount + gstAmount;
          updated.cgst = gstAmount / 2;
          updated.sgst = gstAmount / 2;
        }
        
        return updated;
      }
      return item;
    }));
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const getTotals = () => {
    return items.reduce((acc, item) => ({
      subtotal: acc.subtotal + (item.quantity * item.purchasePrice),
      cgst: acc.cgst + item.cgst,
      sgst: acc.sgst + item.sgst,
      total: acc.total + item.amount,
    }), { subtotal: 0, cgst: 0, sgst: 0, total: 0 });
  };

  const handleSave = async () => {
    if (!selectedSupplier) {
      toast({
        title: 'Error',
        description: 'Please select a supplier',
        variant: 'destructive',
      });
      return;
    }

    if (items.length === 0) {
      toast({
        title: 'Error',
        description: 'Please add at least one item',
        variant: 'destructive',
      });
      return;
    }

    const totals = getTotals();

    try {
      const response = await fetch('/api/stock-entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplierId: selectedSupplier,
          invoiceNumber,
          items,
          notes,
          ...totals,
        }),
      });

      if (response.ok) {
        toast({
          title: 'Stock Entry Saved',
          description: 'Stock has been added successfully',
        });
        // Reset form
        setSelectedSupplier('');
        setInvoiceNumber('');
        setNotes('');
        setItems([]);
      } else {
        throw new Error('Failed to save stock entry');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save stock entry',
        variant: 'destructive',
      });
    }
  };

  const totals = getTotals();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Stock Entry</h1>
        <p className="text-muted-foreground mt-1">
          Add new stock from suppliers
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Panel - Stock Details */}
        <div className="space-y-4">
          {/* Supplier & Invoice */}
          <Card>
            <CardHeader>
              <CardTitle>Entry Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Supplier *</Label>
                <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.id}>
                        {supplier.name} - {supplier.phone}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Invoice Number</Label>
                <Input
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  placeholder="Enter invoice number"
                />
              </div>

              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes (optional)"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Add Item */}
          <Card>
            <CardHeader>
              <CardTitle>Add Medicine</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search medicine by name or composition"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {searchResults.length > 0 && (
                <ScrollArea className="max-h-48 border">
                  <div className="p-2 space-y-1">
                    {searchResults.map((medicine) => (
                      <div
                        key={medicine.id}
                        className="p-2 hover:bg-muted cursor-pointer transition-colors"
                        onClick={() => addItem(medicine)}
                      >
                        <div className="font-medium text-sm">{medicine.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {medicine.brand} | GST: {medicine.gstPercentage}%
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>

          {/* Items Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>₹{totals.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">CGST</span>
                <span>₹{totals.cgst.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">SGST</span>
                <span>₹{totals.sgst.toFixed(2)}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-semibold">
                <span>Total</span>
                <span className="text-primary">₹{totals.total.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          <Button
            className="w-full h-12 gap-2"
            onClick={handleSave}
            disabled={items.length === 0}
          >
            <Save className="w-5 h-5" />
            Save Stock Entry
          </Button>
        </div>

        {/* Right Panel - Items List */}
        <Card>
          <CardHeader>
            <CardTitle>Items ({items.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {items.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Plus className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No items added</p>
                <p className="text-sm">Search and add medicines above</p>
              </div>
            ) : (
              <ScrollArea className="max-h-[600px]">
                <div className="space-y-3">
                  {items.map((item) => (
                    <Card key={item.id} className="p-4">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="font-semibold">{item.medicineName}</div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(item.id)}
                          className="text-destructive h-8 w-8"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs">Batch Number</Label>
                          <Input
                            value={item.batchNumber}
                            onChange={(e) => updateItem(item.id, 'batchNumber', e.target.value)}
                            placeholder="BATCH001"
                          />
                        </div>

                        <div className="space-y-1">
                          <Label className="text-xs">Expiry Date</Label>
                          <Input
                            type="date"
                            value={item.expiryDate}
                            onChange={(e) => updateItem(item.id, 'expiryDate', e.target.value)}
                          />
                        </div>

                        <div className="space-y-1">
                          <Label className="text-xs">Quantity</Label>
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity || ''}
                            onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                          />
                        </div>

                        <div className="space-y-1">
                          <Label className="text-xs">Purchase Price</Label>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.purchasePrice || ''}
                            onChange={(e) => updateItem(item.id, 'purchasePrice', parseFloat(e.target.value) || 0)}
                          />
                        </div>

                        <div className="space-y-1">
                          <Label className="text-xs">Selling Price</Label>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.sellingPrice || ''}
                            onChange={(e) => updateItem(item.id, 'sellingPrice', parseFloat(e.target.value) || 0)}
                          />
                        </div>

                        <div className="space-y-1">
                          <Label className="text-xs">GST %</Label>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            value={item.gstPercentage}
                            onChange={(e) => updateItem(item.id, 'gstPercentage', parseFloat(e.target.value) || 0)}
                          />
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t text-right">
                        <span className="text-sm text-muted-foreground">Amount: </span>
                        <span className="font-semibold text-primary">₹{item.amount.toFixed(2)}</span>
                      </div>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
