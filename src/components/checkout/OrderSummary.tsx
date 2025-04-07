
import React from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CartItem } from '@/types';

interface OrderSummaryProps {
  cartItems: CartItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  isProcessing: boolean;
  handlePayment: () => void;
}

const OrderSummary = ({
  cartItems,
  subtotal,
  shipping,
  tax,
  total,
  isProcessing,
  handlePayment
}: OrderSummaryProps) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 sticky top-24 border border-gray-200 dark:border-gray-700">
      <h2 className="text-lg font-medium mb-4">Order Summary</h2>
      
      <div className="space-y-4 mb-4 max-h-64 overflow-y-auto">
        {cartItems.map(({ product, quantity }) => (
          <div key={product.id} className="flex justify-between">
            <div className="flex items-center">
              <div className="w-12 h-12 rounded overflow-hidden mr-2 bg-gray-100 dark:bg-gray-700">
                <img 
                  src={product.images[0]} 
                  alt={product.name} 
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="text-sm font-medium">{product.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Qty: {quantity}</p>
              </div>
            </div>
            <p className="font-medium">${(product.price * quantity).toFixed(2)}</p>
          </div>
        ))}
      </div>
      
      <Separator className="my-4" />
      
      <div className="space-y-2 mb-4">
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-300">Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-300">Shipping</span>
          <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-300">Estimated Tax</span>
          <span>${tax.toFixed(2)}</span>
        </div>
      </div>
      
      <Separator className="my-4" />
      
      <div className="flex justify-between font-medium text-lg mb-6">
        <span>Total</span>
        <span>${total.toFixed(2)}</span>
      </div>
      
      <Button 
        onClick={handlePayment}
        disabled={isProcessing}
        className="w-full bg-tech-blue hover:bg-tech-blue-dark dark:bg-tech-blue dark:hover:bg-tech-blue-dark text-white"
      >
        {isProcessing ? 'Processing...' : 'Pay Now'}
      </Button>
    </div>
  );
};

export default OrderSummary;
