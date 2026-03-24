'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Printer, Save, FileText, Settings, Download } from 'lucide-react';

interface StoreSettings {
  id: string;
  storeName: string;
  address: string;
  phone: string;
  gstin: string;
  drugLicenseNumber: string;
  footerMessage: string;
  thermalPrinter: boolean;
}

export default function PrintSettingsPage() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<StoreSettings>({
    id: 'default',
    storeName: '',
    address: '',
    phone: '',
    gstin: '',
    drugLicenseNumber: '',
    footerMessage: '',
    thermalPrinter: true,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(data.settings);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const handleSave = async () => {
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        toast({
          title: 'Settings Saved',
          description: 'Print settings have been updated successfully.',
        });
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save settings',
        variant: 'destructive',
      });
    }
  };

  const handlePrintTest = () => {
    window.print();
    toast({
      title: 'Print Test',
      description: 'Test print sent to default printer.',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Print Settings</h1>
        <p className="text-muted-foreground mt-1">
          Configure invoice and receipt printing options
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Settings Form */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Store Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="storeName">Store Name *</Label>
                <Input
                  id="storeName"
                  value={settings.storeName}
                  onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                  placeholder="Atom Medz"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={settings.address}
                  onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                  placeholder="123 Medical Street, Health City"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={settings.phone}
                  onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                  placeholder="9876543210"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gstin">GSTIN</Label>
                <Input
                  id="gstin"
                  value={settings.gstin}
                  onChange={(e) => setSettings({ ...settings, gstin: e.target.value })}
                  placeholder="29ABCDE1234F1Z5"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="drugLicenseNumber">Drug License Number</Label>
                <Input
                  id="drugLicenseNumber"
                  value={settings.drugLicenseNumber}
                  onChange={(e) => setSettings({ ...settings, drugLicenseNumber: e.target.value })}
                  placeholder="DL/123/2024"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Invoice Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="thermalPrinter">Thermal Printer Mode</Label>
                  <p className="text-xs text-muted-foreground">
                    Use 3-inch thermal format (recommended for POS)
                  </p>
                </div>
                <Switch
                  id="thermalPrinter"
                  checked={settings.thermalPrinter}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, thermalPrinter: checked })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="footerMessage">Footer Message</Label>
                <Textarea
                  id="footerMessage"
                  value={settings.footerMessage}
                  onChange={(e) => setSettings({ ...settings, footerMessage: e.target.value })}
                  placeholder="Thank you! Visit Again!"
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-2">
            <Button className="flex-1 gap-2" onClick={handleSave}>
              <Save className="w-5 h-5" />
              Save Settings
            </Button>
            <Button variant="outline" className="gap-2" onClick={handlePrintTest}>
              <Printer className="w-5 h-5" />
              Test Print
            </Button>
          </div>
        </div>

        {/* Preview */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="w-5 h-5" />
                Preview ({settings.thermalPrinter ? 'Thermal (3 inch)' : 'A4'})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={`border p-4 bg-white text-black ${
                  settings.thermalPrinter ? 'max-w-sm' : 'max-w-lg'
                }`}
              >
                {/* Header */}
                <div className="text-center border-b pb-3 mb-3">
                  <h2 className="text-lg font-bold">{settings.storeName || 'Store Name'}</h2>
                  <p className="text-xs">{settings.address || 'Address'}</p>
                  <p className="text-xs">Phone: {settings.phone || 'N/A'}</p>
                  {settings.gstin && (
                    <p className="text-xs">GSTIN: {settings.gstin}</p>
                  )}
                  {settings.drugLicenseNumber && (
                    <p className="text-xs">DL No: {settings.drugLicenseNumber}</p>
                  )}
                </div>

                {/* Invoice Details */}
                <div className="text-xs mb-3 space-y-1">
                  <div className="flex justify-between">
                    <span>Invoice: INV-001</span>
                    <span>Date: {new Date().toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Customer: Walk-in</span>
                    <span>Time: {new Date().toLocaleTimeString()}</span>
                  </div>
                </div>

                {/* Items */}
                <div className="border-t border-b py-2 mb-2">
                  <div className="text-xs font-medium mb-1">Item | Qty | Rate | Amount</div>
                  <div className="text-xs space-y-1">
                    <div className="flex justify-between">
                      <span>Paracetamol 500mg</span>
                      <span>2 x ₹45 = ₹90</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Amoxicillin 500mg</span>
                      <span>1 x ₹120 = ₹120</span>
                    </div>
                  </div>
                </div>

                {/* Totals */}
                <div className="text-xs space-y-1">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>₹210.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>CGST (9%):</span>
                    <span>₹18.90</span>
                  </div>
                  <div className="flex justify-between">
                    <span>SGST (9%):</span>
                    <span>₹18.90</span>
                  </div>
                  <div className="flex justify-between font-bold border-t pt-1">
                    <span>Total:</span>
                    <span>₹247.80</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Rounded:</span>
                    <span>₹248.00</span>
                  </div>
                </div>

                {/* Footer */}
                {settings.footerMessage && (
                  <div className="text-center text-xs mt-3 pt-3 border-t">
                    {settings.footerMessage}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-muted/50">
            <CardHeader>
              <CardTitle className="text-sm">Print Format Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>• Thermal format: Best for 3-inch thermal printers</p>
              <p>• A4 format: Standard A4 paper for detailed invoices</p>
              <p>• Footer message appears at bottom of every print</p>
              <p>• GSTIN and Drug License are mandatory for tax compliance</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
