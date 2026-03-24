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
import { Search, Plus, Edit, Trash2, Phone, Mail, DollarSign, History, Users } from 'lucide-react';

interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  gstin?: string;
  totalPurchases: number;
  totalCredit: number;
  lastPurchase?: Date;
}

export default function CustomersPage() {
  const { toast } = useToast();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    gstin: '',
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = customers.filter((c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.phone.includes(searchQuery) ||
        c.email?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredCustomers(filtered);
    } else {
      setFilteredCustomers(customers);
    }
  }, [searchQuery, customers]);

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/customers');
      if (response.ok) {
        const data = await response.json();
        setCustomers(data.customers);
        setFilteredCustomers(data.customers);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingCustomer
        ? `/api/customers/${editingCustomer.id}`
        : '/api/customers';
      const method = editingCustomer ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast({
          title: editingCustomer ? 'Customer Updated' : 'Customer Added',
          description: `Customer ${formData.name} has been ${editingCustomer ? 'updated' : 'added'}.`,
        });
        setIsAddDialogOpen(false);
        setEditingCustomer(null);
        setFormData({ name: '', phone: '', email: '', address: '', gstin: '' });
        fetchCustomers();
      } else {
        throw new Error('Failed to save customer');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save customer',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      phone: customer.phone,
      email: customer.email || '',
      address: customer.address || '',
      gstin: customer.gstin || '',
    });
    setIsAddDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this customer?')) return;

    try {
      const response = await fetch(`/api/customers/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: 'Customer Deleted',
          description: 'Customer has been removed.',
        });
        fetchCustomers();
      } else {
        throw new Error('Failed to delete customer');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete customer',
        variant: 'destructive',
      });
    }
  };

  const openAddDialog = () => {
    setEditingCustomer(null);
    setFormData({ name: '', phone: '', email: '', address: '', gstin: '' });
    setIsAddDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Customers</h1>
          <p className="text-muted-foreground mt-1">
            Manage customer information and credit
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" onClick={openAddDialog}>
              <Plus className="w-5 h-5" />
              Add Customer
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
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
                <Label htmlFor="gstin">GSTIN (for business customers)</Label>
                <Input
                  id="gstin"
                  value={formData.gstin}
                  onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                  placeholder="29ABCDE1234F1Z5"
                />
              </div>

              <Button type="submit" className="w-full">
                {editingCustomer ? 'Update Customer' : 'Add Customer'}
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
              placeholder="Search customers by name, phone, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12"
            />
          </div>
        </CardContent>
      </Card>

      {/* Customers List */}
      <Card>
        <CardHeader>
          <CardTitle>Customers ({filteredCustomers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredCustomers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No customers found</p>
            </div>
          ) : (
            <ScrollArea className="max-h-[600px]">
              <div className="space-y-2">
                {filteredCustomers.map((customer) => (
                  <Card key={customer.id} className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-lg">{customer.name}</h3>
                            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Phone className="w-4 h-4" />
                                {customer.phone}
                              </span>
                              {customer.email && (
                                <span className="flex items-center gap-1">
                                  <Mail className="w-4 h-4" />
                                  {customer.email}
                                </span>
                              )}
                            </div>
                            {customer.address && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {customer.address}
                              </p>
                            )}
                            {customer.gstin && (
                              <Badge variant="outline" className="mt-2">
                                GSTIN: {customer.gstin}
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Total Purchases</p>
                            <p className="font-medium">
                              ₹{customer.totalPurchases?.toLocaleString() || 0}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Outstanding Credit</p>
                            <p className={`font-medium ${customer.totalCredit > 0 ? 'text-yellow-600' : ''}`}>
                              ₹{customer.totalCredit?.toLocaleString() || 0}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Last Purchase</p>
                            <p className="font-medium">
                              {customer.lastPurchase
                                ? new Date(customer.lastPurchase).toLocaleDateString()
                                : 'N/A'}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleEdit(customer)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleDelete(customer.id)}
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
