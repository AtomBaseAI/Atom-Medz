'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Settings, Save, Plus, Edit, Trash2, Shield, User, Key } from 'lucide-react';
import { useAuthStore } from '@/lib/store/auth-store';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'CLIENT';
  phone?: string;
  isActive: boolean;
}

interface SystemConfig {
  defaultGst: number;
  roundOff: boolean;
  lowStockThreshold: number;
  expiryAlertDays: number;
}

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const { fetchWithAuth, user } = useAuthStore();
  const [users, setUsers] = useState<User[]>([]);
  const [config, setConfig] = useState<SystemConfig>({
    defaultGst: 18,
    roundOff: true,
    lowStockThreshold: 10,
    expiryAlertDays: 30,
  });

  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userFormData, setUserFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'CLIENT' as 'ADMIN' | 'CLIENT',
  });

  useEffect(() => {
    fetchUsers();
    fetchConfig();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetchWithAuth('/api/admin/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
      } else {
        const errorData = await response.json();
        toast({
          title: 'Error',
          description: errorData.error || 'Failed to fetch users',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch users',
        variant: 'destructive',
      });
    }
  };

  const fetchConfig = async () => {
    try {
      const response = await fetchWithAuth('/api/settings');
      if (response.ok) {
        const data = await response.json();
        setConfig((prev) => ({
          ...prev,
          defaultGst: data.settings.defaultGst || 18,
        }));
      }
    } catch (error) {
      console.error('Error fetching config:', error);
    }
  };

  const handleSaveConfig = async () => {
    try {
      const response = await fetchWithAuth('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: 'default',
          defaultGst: config.defaultGst,
          thermalPrinter: true,
        }),
      });

      if (response.ok) {
        toast({
          title: 'Configuration Saved',
          description: 'System configuration has been updated.',
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save configuration');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save configuration',
        variant: 'destructive',
      });
    }
  };

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingUser
        ? `/api/admin/users/${editingUser.id}`
        : '/api/admin/users';
      const method = editingUser ? 'PUT' : 'POST';

      const response = await fetchWithAuth(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userFormData),
      });

      if (response.ok) {
        toast({
          title: editingUser ? 'User Updated' : 'User Added',
          description: `User ${userFormData.name} has been ${editingUser ? 'updated' : 'added'}.`,
        });
        setIsUserDialogOpen(false);
        setEditingUser(null);
        setUserFormData({ name: '', email: '', password: '', phone: '', role: 'CLIENT' });
        fetchUsers();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save user');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save user',
        variant: 'destructive',
      });
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setUserFormData({
      name: user.name,
      email: user.email,
      password: '',
      phone: user.phone || '',
      role: user.role,
    });
    setIsUserDialogOpen(true);
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      const response = await fetchWithAuth(`/api/admin/users/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: 'User Deleted',
          description: 'User has been removed.',
        });
        fetchUsers();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete user');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete user',
        variant: 'destructive',
      });
    }
  };

  const openAddUserDialog = () => {
    setEditingUser(null);
    setUserFormData({ name: '', email: '', password: '', phone: '', role: 'CLIENT' });
    setIsUserDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Admin Settings</h1>
        <p className="text-muted-foreground mt-1">
          System configuration and user management
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* System Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              System Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="defaultGst">Default GST Rate (%)</Label>
              <Input
                id="defaultGst"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={config.defaultGst}
                onChange={(e) =>
                  setConfig({ ...config, defaultGst: parseFloat(e.target.value) || 0 })
                }
              />
              <p className="text-xs text-muted-foreground">
                Applied to new medicines by default
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="lowStockThreshold">Low Stock Threshold</Label>
              <Input
                id="lowStockThreshold"
                type="number"
                min="1"
                value={config.lowStockThreshold}
                onChange={(e) =>
                  setConfig({ ...config, lowStockThreshold: parseInt(e.target.value) || 10 })
                }
              />
              <p className="text-xs text-muted-foreground">
                Alert when quantity falls below this
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiryAlertDays">Expiry Alert Days</Label>
              <Input
                id="expiryAlertDays"
                type="number"
                min="1"
                value={config.expiryAlertDays}
                onChange={(e) =>
                  setConfig({ ...config, expiryAlertDays: parseInt(e.target.value) || 30 })
                }
              />
              <p className="text-xs text-muted-foreground">
                Alert before medicines expire
              </p>
            </div>

            <Button className="w-full gap-2" onClick={handleSaveConfig}>
              <Save className="w-5 h-5" />
              Save Configuration
            </Button>
          </CardContent>
        </Card>

        {/* User Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5" />
                User Management
              </div>
              <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-2" onClick={openAddUserDialog}>
                    <Plus className="w-4 h-4" />
                    Add User
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingUser ? 'Edit User' : 'Add New User'}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleUserSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="userName">Name *</Label>
                      <Input
                        id="userName"
                        value={userFormData.name}
                        onChange={(e) =>
                          setUserFormData({ ...userFormData, name: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="userEmail">Email *</Label>
                      <Input
                        id="userEmail"
                        type="email"
                        value={userFormData.email}
                        onChange={(e) =>
                          setUserFormData({ ...userFormData, email: e.target.value })
                        }
                        required
                      />
                    </div>

                    {!editingUser && (
                      <div className="space-y-2">
                        <Label htmlFor="userPassword">Password *</Label>
                        <div className="relative">
                          <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="userPassword"
                            type="password"
                            value={userFormData.password}
                            onChange={(e) =>
                              setUserFormData({ ...userFormData, password: e.target.value })
                            }
                            className="pl-10"
                            required={!editingUser}
                          />
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="userPhone">Phone</Label>
                      <Input
                        id="userPhone"
                        type="tel"
                        value={userFormData.phone}
                        onChange={(e) =>
                          setUserFormData({ ...userFormData, phone: e.target.value })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="userRole">Role *</Label>
                      <Select
                        value={userFormData.role}
                        onValueChange={(value: any) =>
                          setUserFormData({ ...userFormData, role: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CLIENT">
                            <div className="flex items-center gap-2">
                              <Shield className="w-4 h-4" />
                              Staff (Billing & Inventory)
                            </div>
                          </SelectItem>
                          <SelectItem value="ADMIN">
                            <div className="flex items-center gap-2">
                              <Shield className="w-4 h-4" />
                              Admin (Full Access)
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button type="submit" className="w-full">
                      {editingUser ? 'Update User' : 'Add User'}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="max-h-96">
              <div className="space-y-2">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-3 border"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{user.name}</span>
                        <Badge
                          variant={user.role === 'ADMIN' ? 'default' : 'secondary'}
                        >
                          {user.role}
                        </Badge>
                        {!user.isActive && (
                          <Badge variant="destructive">Inactive</Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {user.email} {user.phone && `• ${user.phone}`}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleEditUser(user)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Information Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle className="text-sm">Role Permissions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div>
              <p className="font-semibold">Admin:</p>
              <p className="text-muted-foreground">
                Full access to all modules including reports, settings, and user management
              </p>
            </div>
            <div>
              <p className="font-semibold">Staff:</p>
              <p className="text-muted-foreground">
                Billing, inventory, stock entry, and basic reports
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle className="text-sm">GST Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>• Default GST rate is applied to new medicines</p>
            <p>• Individual medicine GST can be overridden</p>
            <p>• GST is split equally between CGST and SGST</p>
            <p>• HSN codes are required for GST compliance</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
