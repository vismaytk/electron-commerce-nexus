
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShippingAddress } from '@/types';

interface ShippingFormProps {
  shippingAddress: ShippingAddress;
  handleShippingChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const ShippingForm = ({ shippingAddress, handleShippingChange }: ShippingFormProps) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
      <h2 className="text-xl font-medium mb-4">Shipping Information</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <Label htmlFor="name">Full Name</Label>
          <Input 
            id="name" 
            name="name" 
            placeholder="Enter your full name"
            value={shippingAddress.name}
            onChange={handleShippingChange}
            required
          />
        </div>
        
        <div className="md:col-span-2">
          <Label htmlFor="addressLine1">Address Line 1</Label>
          <Input 
            id="addressLine1" 
            name="addressLine1" 
            placeholder="Street address, P.O. box"
            value={shippingAddress.addressLine1}
            onChange={handleShippingChange}
            required
          />
        </div>
        
        <div className="md:col-span-2">
          <Label htmlFor="addressLine2">Address Line 2 (Optional)</Label>
          <Input 
            id="addressLine2" 
            name="addressLine2" 
            placeholder="Apartment, suite, unit, building, floor, etc."
            value={shippingAddress.addressLine2}
            onChange={handleShippingChange}
          />
        </div>
        
        <div>
          <Label htmlFor="city">City</Label>
          <Input 
            id="city" 
            name="city" 
            placeholder="Enter your city"
            value={shippingAddress.city}
            onChange={handleShippingChange}
            required
          />
        </div>
        
        <div>
          <Label htmlFor="state">State</Label>
          <Input 
            id="state" 
            name="state" 
            placeholder="Enter your state"
            value={shippingAddress.state}
            onChange={handleShippingChange}
            required
          />
        </div>
        
        <div>
          <Label htmlFor="postalCode">Postal Code</Label>
          <Input 
            id="postalCode" 
            name="postalCode" 
            placeholder="Enter your postal code"
            value={shippingAddress.postalCode}
            onChange={handleShippingChange}
            required
          />
        </div>
        
        <div>
          <Label htmlFor="country">Country</Label>
          <Input 
            id="country" 
            name="country" 
            value={shippingAddress.country}
            onChange={handleShippingChange}
            disabled
          />
        </div>
        
        <div className="md:col-span-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input 
            id="phone" 
            name="phone" 
            placeholder="10-digit phone number"
            value={shippingAddress.phone}
            onChange={handleShippingChange}
            required
          />
        </div>
      </div>
    </div>
  );
};

export default ShippingForm;
