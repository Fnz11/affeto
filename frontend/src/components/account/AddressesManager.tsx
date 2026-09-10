import React, { useState, useEffect } from 'react';
import { useAddresses, useCreateAddress } from '@/lib/useCommerce';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { MapPin, Plus, CheckCircle2 } from 'lucide-react';
import { withQueryClient } from '@/lib/queryClient';

function AddressesManagerComponent() {
  const { data: addressData, isLoading } = useAddresses();
  const createAddress = useCreateAddress();
  const { initAuth, jwt } = useAuthStore();

  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'United States',
    phone: '',
    isDefault: false,
  });

  useEffect(() => {
    initAuth();
  }, []);

  if (!jwt && typeof window !== 'undefined') {
    return (
      <div className="py-20 text-center space-y-4 max-w-md mx-auto">
        <h2 className="font-editorial text-2xl font-bold">Sign In Required</h2>
        <p className="text-xs text-muted-foreground">Please sign in to manage your addresses.</p>
        <Button onClick={() => (window.location.href = '/account/login')}>Go to Sign In</Button>
      </div>
    );
  }

  const addresses = addressData?.data || [];

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await createAddress.mutateAsync(formData);
    setShowAddForm(false);
    setFormData({
      name: '',
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'United States',
      phone: '',
      isDefault: false,
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="font-editorial text-3xl font-bold tracking-tight">Saved Addresses</h1>
          <p className="text-xs text-muted-foreground">Manage your shipping destinations for faster checkout</p>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)} size="sm" className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          <span>{showAddForm ? 'Cancel' : 'Add New Address'}</span>
        </Button>
      </div>

      {showAddForm && (
        <form onSubmit={handleCreate} className="bg-card p-6 rounded-xl border border-border shadow-xs space-y-4 max-w-xl">
          <h3 className="font-editorial text-lg font-bold">New Shipping Address</h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">Full Name</label>
              <Input
                type="text"
                placeholder="Alex Vance"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">Street Address</label>
              <Input
                type="text"
                placeholder="123 Orchard Lane"
                value={formData.street}
                onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">City</label>
                <Input
                  type="text"
                  placeholder="San Francisco"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">State / Region</label>
                <Input
                  type="text"
                  placeholder="CA"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">Postal Code</label>
                <Input
                  type="text"
                  placeholder="94103"
                  value={formData.postalCode}
                  onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">Country</label>
                <select
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="w-full h-10 px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="United States">United States</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Germany">Germany</option>
                  <option value="France">France</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="isDefault"
                checked={formData.isDefault}
                onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                className="rounded border-border"
              />
              <label htmlFor="isDefault" className="text-xs text-foreground cursor-pointer font-medium">
                Set as default shipping address
              </label>
            </div>
          </div>
          <Button type="submit" isLoading={createAddress.isPending} size="sm">
            Save Address
          </Button>
        </form>
      )}

      {isLoading ? (
        <p className="text-xs text-muted-foreground animate-pulse py-8 text-center">Loading addresses...</p>
      ) : addresses.length === 0 ? (
        <div className="bg-card p-12 rounded-xl border border-border text-center space-y-3 max-w-md mx-auto">
          <MapPin className="w-10 h-10 text-muted-foreground mx-auto stroke-1" />
          <p className="text-sm font-semibold text-foreground">No saved addresses</p>
          <p className="text-xs text-muted-foreground">Add your shipping details for rapid 1-click checkout.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={`bg-card p-5 rounded-xl border relative shadow-xs ${
                addr.isDefault ? 'border-primary ring-1 ring-primary/30' : 'border-border'
              }`}
            >
              {addr.isDefault && (
                <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 mb-2">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Default Address</span>
                </div>
              )}
              <h4 className="font-semibold text-sm text-foreground">{addr.name}</h4>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                {addr.street}
                <br />
                {addr.city}, {addr.state} {addr.postalCode}
                <br />
                {addr.country}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export const AddressesManager = withQueryClient(AddressesManagerComponent);
