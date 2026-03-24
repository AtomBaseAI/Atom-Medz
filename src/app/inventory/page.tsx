'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Edit, Trash2, Package } from 'lucide-react';

interface Medicine {
  id: string;
  name: string;
  brand: string;
  composition: string;
  hsnCode: string;
  gstPercentage: number;
  minQuantity: number;
  batches: Array<{
    id: string;
    batchNumber: string;
    expiryDate: Date;
    mrp: number;
    purchasePrice: number;
    sellingPrice: number;
    quantity: number;
  }>;
}

export default function InventoryPage() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredMedicines, setFilteredMedicines] = useState<Medicine[]>([]);

  const fetchMedicines = async () => {
    try {
      const response = await fetch('/api/medicines');
      if (response.ok) {
        const data = await response.json();
        setMedicines(data.medicines);
        setFilteredMedicines(data.medicines);
      }
    } catch (error) {
      console.error('Error fetching medicines:', error);
    }
  };

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    fetchMedicines();
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (searchQuery) {
      const filtered = medicines.filter((m) =>
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.composition?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredMedicines(filtered);
    } else {
      setFilteredMedicines(medicines);
    }
  }, [searchQuery, medicines]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const getTotalStock = (medicine: Medicine) => {
    return medicine.batches.reduce((sum, batch) => sum + batch.quantity, 0);
  };

  const getLatestExpiry = (medicine: Medicine) => {
    if (medicine.batches.length === 0) return null;
    const sorted = [...medicine.batches].sort((a, b) =>
      new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()
    );
    return sorted[0].expiryDate;
  };

  const isLowStock = (medicine: Medicine) => {
    return getTotalStock(medicine) < medicine.minQuantity;
  };

  const getStockStatus = (medicine: Medicine) => {
    const total = getTotalStock(medicine);
    if (total === 0) return <Badge variant="destructive">Out of Stock</Badge>;
    if (isLowStock(medicine)) return <Badge variant="outline" className="text-yellow-600 border-yellow-600">Low Stock</Badge>;
    return <Badge variant="secondary">In Stock</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Inventory</h1>
          <p className="text-muted-foreground mt-1">
            Manage your medicine stock and inventory
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="w-5 h-5" />
          Add Medicine
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Medicines
            </CardTitle>
            <Package className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{medicines.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Stock Value
            </CardTitle>
            <Package className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{medicines.reduce((sum, m) => 
                sum + m.batches.reduce((s, b) => s + (b.quantity * b.purchasePrice), 0), 0
              ).toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Low Stock Items
            </CardTitle>
            <Package className="w-4 h-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {medicines.filter(m => isLowStock(m)).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Out of Stock
            </CardTitle>
            <Package className="w-4 h-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {medicines.filter(m => getTotalStock(m) === 0).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search medicines by name, brand, or composition..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12"
            />
          </div>
        </CardContent>
      </Card>

      {/* Medicines List */}
      <Card>
        <CardHeader>
          <CardTitle>Medicine List</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredMedicines.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No medicines found</p>
            </div>
          ) : (
            <ScrollArea className="max-h-[600px]">
              <div className="space-y-2">
                {filteredMedicines.map((medicine) => (
                  <Card
                    key={medicine.id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start gap-3">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-lg">{medicine.name}</h3>
                              <p className="text-sm text-muted-foreground">
                                {medicine.brand} | {medicine.composition}
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                {getStockStatus(medicine)}
                                <Badge variant="outline">GST: {medicine.gstPercentage}%</Badge>
                                <Badge variant="outline">HSN: {medicine.hsnCode}</Badge>
                              </div>
                            </div>
                          </div>

                          {/* Batches */}
                          {medicine.batches.length > 0 && (
                            <div className="mt-3 space-y-2">
                              {medicine.batches.map((batch) => (
                                <div
                                  key={batch.id}
                                  className="flex items-center justify-between p-2 bg-muted/50 rounded text-sm"
                                >
                                  <div className="flex items-center gap-4">
                                    <span className="font-medium">Batch: {batch.batchNumber}</span>
                                    <span className="text-muted-foreground">
                                      Exp: {new Date(batch.expiryDate).toLocaleDateString()}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-4">
                                    <span className="text-muted-foreground">
                                      Qty: {batch.quantity}
                                    </span>
                                    <span className="font-medium">MRP: ₹{batch.mrp}</span>
                                    <span className="font-medium text-primary">
                                      Selling: ₹{batch.sellingPrice}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          <Button variant="outline" size="icon">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="icon" className="text-destructive">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
