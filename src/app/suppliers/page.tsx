'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Search, Plus, Edit, Trash2, Phone, Mail, Package, DollarSign, Truck } from 'lucide-react';

interface Supplier {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  gstin?: string;
  totalPurchases: number;
  pendingPayments: number;
  lastPurchase?: Date;
}

export default function SuppliersPage() {
  const { toast } = useToast();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredSuppliers, setFilteredSuppliers] = useState<Supplier[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    gstin: '',
  });

  useEffect(() => {
    fetchSuppliers();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = suppliers.filter((s) =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.phone.includes(searchQuery) ||
        s.email?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredSuppliers(filtered);
    } else {
      setFilteredSuppliers(suppliers);
    }
  }, [searchQuery, suppliers]);

  const fetchSuppliers = async () => {
    try {
      const response = await fetch('/api/suppliers');
      if (response.ok) {
        const data = await response.json();
        setSuppliers(data.suppliers);
        setFilteredSuppliers(data.suppliers);
      }
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingSupplier
        ? `/api/suppliers/${editingSupplier.id}`
        : '/api/suppliers';
      const method = editingSupplier ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast({
          title: editingSupplier ? 'Supplier Updated' : 'Supplier Added',
          description: `Supplier ${formData.name} has been ${editingSupplier ? 'updated' : 'added'}.`,
        });
        setIsAddDialogOpen(false);
        setEditingSupplier(null);
        setFormData({ name: '', phone: '', email: '', address: '', gstin: '' });
        fetchSuppliers();
      } else {
        throw new Error('Failed to save supplier');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save supplier',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setFormData({
      name: supplier.name,
      phone: supplier.phone,
      email: supplier.email || '',
      address: supplier.address || '',
      gstin: supplier.gstin || '',
    });
    setIsAddDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this supplier?')) return;

    try {
      const response = await fetch(`/api/suppliers/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: 'Supplier Deleted',
          description: 'Supplier has been removed.',
        });
        fetchSuppliers();
      } else {
        throw new Error('Failed to delete supplier');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete supplier',
        variant: 'destructive',
      });
    }
  };

  const openAddDialog = () => {
    setEditingSupplier(null);
    setFormData({ name: '', phone: '', email: '', address: '', gstin: '' });
    setIsAddDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Suppliers</h1>
          <p className="text-muted-foreground mt-1">
            Manage supplier information and purchase history
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" onClick={openAddDialog}>
              <Plus className="w-5 h-5" />
              Add Supplier
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Company Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gstin">GSTIN</Label>
                <Input
                  id="gstin"
                  value={formData.gstin}
                  onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                  placeholder="29XYZAB5678C1Z9"
                />
              </div>

              <Button type="submit" className="w-full">
                {editingSupplier ? 'Update Supplier' : 'Add Supplier'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search suppliers by name, phone, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12"
            />
          </div>
        </CardContent>
      </Card>

      {/* Suppliers List */}
      <Card>
        <CardHeader>
          <CardTitle>Suppliers ({filteredSuppliers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredSuppliers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Truck className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No suppliers found</p>
            </div>
          ) : (
            <ScrollArea className="max-h-[600px]">
              <div className="space-y-2">
                {filteredSuppliers.map((supplier) => (
                  <Card key={supplier.id} className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-lg">{supplier.name}</h3>
                            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Phone className="w-4 h-4" />
                                {supplier.phone}
                              </span>
                              {supplier.email && (
                                <span className="flex items-center gap-1">
                                  <Mail className="w-4 h-4" />
                                  {supplier.email}
                                </span>
                              )}
                            </div>
                            {supplier.address && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {supplier.address}
                              </p>
                            )}
                            {supplier.gstin && (
                              <Badge variant="outline" className="mt-2">
                                GSTIN: {supplier.gstin}
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Total Purchases</p>
                            <p className="font-medium">
                              ₹{supplier.totalPurchases?.toLocaleString() || 0}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Pending Payments</p>
                            <p className={`font-medium ${supplier.pendingPayments > 0 ? 'text-yellow-600' : ''}`}>
                              ₹{supplier.pendingPayments?.toLocaleString() || 0}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Last Purchase</p>
                            <p className="font-medium">
                              {supplier.lastPurchase
                                ? new Date(supplier.lastPurchase).toLocaleDateString()
                                : 'N/A'}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleEdit(supplier)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleDelete(supplier.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
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
    </div>
  );
}
