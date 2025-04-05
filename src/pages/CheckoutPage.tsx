
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { ShippingAddress } from '@/types';
import { supabase, invokeFunction } from '@/integrations/supabase/client';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { ExclamationTriangleIcon } from '@radix-ui/react-icons';

declare global {
  interface Window {
    Razorpay: any;
  }
}

const CheckoutPage = () => {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Calculate summary values
  const subtotal = cartTotal;
  const shipping = subtotal > 50 ? 0 : 10;
  const tax = subtotal * 0.08; // 8% tax rate
  const total = subtotal + shipping + tax;
  
  // Shipping address state
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    name: user?.name || '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    phone: '',
  });
  
  // Handle shipping form changes
  const handleShippingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setShippingAddress(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Validate form
  const validateForm = () => {
    const requiredFields = [
      'name', 'addressLine1', 'city', 'state', 'postalCode', 'phone'
    ];
    
    for (const field of requiredFields) {
      if (!shippingAddress[field as keyof ShippingAddress]) {
        toast.error(`Please enter your ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return false;
      }
    }
    
    // Validate phone number (basic validation)
    if (!/^\d{10}$/.test(shippingAddress.phone)) {
      toast.error('Please enter a valid 10-digit phone number');
      return false;
    }
    
    return true;
  };
  
  // Load Razorpay script
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = resolve;
      document.body.appendChild(script);
    });
  };
  
  const handlePayment = async () => {
    if (!isAuthenticated || !user) {
      toast.error('Please login to continue');
      navigate('/login');
      return;
    }
    
    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    
    if (!validateForm()) {
      return;
    }
    
    setIsProcessing(true);
    setError(null);
    
    try {
      console.log("Initiating payment process");
      
      // Load Razorpay script if not already loaded
      if (!window.Razorpay) {
        console.log("Loading Razorpay script");
        await loadRazorpayScript();
        console.log("Razorpay script loaded");
      }
      
      // Prepare simplified product data to avoid circular reference issues
      const simplifiedCartItems = cartItems.map(item => ({
        product: {
          id: item.product.id,
          name: item.product.name,
          price: item.product.price,
        },
        quantity: item.quantity
      }));
      
      // Create order on server
      console.log("Creating order with total:", total);
      const { data, error } = await invokeFunction('create-razorpay-order', {
        amount: total,
        currency: 'INR',
        user_id: user.id,
        order_details: {
          shipping_address: shippingAddress,
          items: simplifiedCartItems
        }
      });
      
      if (error) {
        console.error("Error creating order:", error);
        setError(`Failed to create order: ${error.message || JSON.stringify(error)}`);
        throw new Error(error.message || "Failed to create order");
      }
      
      if (!data) {
        console.error("No data returned from create order function");
        setError("No response from payment server");
        throw new Error("No response from payment server");
      }
      
      if (data.error) {
        console.error("Error in response:", data.error);
        setError(`Payment server error: ${data.error}`);
        throw new Error(data.error);
      }
      
      console.log("Order created successfully:", data);
      
      // Initialize Razorpay
      const options = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: 'GADA ELECTRONICS',
        description: 'Purchase from GADA ELECTRONICS',
        order_id: data.order_id,
        image: '/favicon.ico',
        prefill: {
          name: shippingAddress.name,
          contact: shippingAddress.phone,
          email: user.email
        },
        theme: {
          color: '#3B82F6'
        },
        handler: async function(response: any) {
          try {
            console.log("Payment successful, verifying payment");
            // Verify payment
            const verifyResponse = await invokeFunction('verify-razorpay-payment', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              db_order_id: data.db_order_id
            });
            
            if (verifyResponse.error) {
              console.error("Verification error:", verifyResponse.error);
              throw new Error(verifyResponse.error.message || 'Payment verification failed');
            }
            
            if (verifyResponse.data && verifyResponse.data.error) {
              console.error("Verification data error:", verifyResponse.data.error);
              throw new Error(verifyResponse.data.error || 'Payment verification failed');
            }
            
            console.log("Payment verified successfully");
            
            // Clear cart and redirect to success page
            clearCart();
            navigate('/order-success', { 
              state: { 
                orderId: data.db_order_id,
                paymentId: response.razorpay_payment_id
              } 
            });
            
            toast.success('Payment successful! Your order has been placed.');
          } catch (error: any) {
            console.error("Payment verification failed:", error);
            toast.error(`Payment verification failed: ${error.message}`);
            setError(`Payment verification failed: ${error.message}`);
            setIsProcessing(false);
          }
        },
      };
      
      const razorpay = new window.Razorpay(options);
      
      razorpay.on('payment.failed', function(response: any) {
        console.error("Payment failed:", response.error);
        toast.error(`Payment failed: ${response.error.description}`);
        setError(`Payment failed: ${response.error.description}`);
        setIsProcessing(false);
      });
      
      console.log("Opening Razorpay payment modal");
      razorpay.open();
    } catch (error: any) {
      console.error("Payment process error:", error);
      toast.error(`Payment failed: ${error.message}`);
      setError(`Payment failed: ${error.message}`);
      setIsProcessing(false);
    }
  };
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated && !isProcessing) {
      toast.error('Please login to checkout', {
        description: "You need to be logged in to checkout",
        action: {
          label: "Login",
          onClick: () => navigate('/login', { state: { from: '/checkout' } })
        }
      });
      navigate('/login', { state: { from: '/checkout' } });
    }
  }, [isAuthenticated, navigate]);
  
  if (!isAuthenticated) {
    return null;
  }
  
  return (
    <div className="container-custom py-12">
      <h1 className="text-3xl font-display font-bold mb-6">Checkout</h1>
      
      {error && (
        <Alert variant="destructive" className="mb-6">
          <ExclamationTriangleIcon className="h-4 w-4" />
          <AlertTitle>Payment Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Shipping Information */}
        <div className="lg:col-span-2">
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
        </div>
        
        {/* Order Summary */}
        <div className="lg:col-span-1">
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
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
