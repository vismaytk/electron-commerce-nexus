import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { ShippingAddress } from '@/types';
import { supabase } from '@/integrations/supabase/client';

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
  
  // Calculate summary values
  const subtotal = cartTotal;
  const shipping = subtotal > 50 ? 0 : 10;
  const tax = subtotal * 0.08; // 8% tax rate
  const total = subtotal + shipping + tax;
  
  // Shipping address state
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    name: '',
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
    
    try {
      // Load Razorpay script
      if (!window.Razorpay) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.onload = resolve;
          script.onerror = () => reject(new Error('Failed to load Razorpay SDK'));
          document.body.appendChild(script);
        });
      }
      
      // Create order on server
      const { data, error } = await supabase.functions.invoke('create-razorpay-order', {
        body: {
          amount: total,
          currency: 'INR',
          user_id: user.id,
          order_details: {
            shipping_address: shippingAddress,
            items: cartItems.map(item => ({
              product: {
                id: item.product.id,
                name: item.product.name,
                price: item.product.price
              },
              quantity: item.quantity
            }))
          }
        }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (!data || data.error) {
        throw new Error(data?.error || 'Failed to create order');
      }
      
      // Initialize Razorpay
      const razorpay = new window.Razorpay({
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        order_id: data.order_id,
        name: 'ElectroNexus',
        description: 'Purchase from ElectroNexus',
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
            toast.loading('Verifying payment...');
            
            // Verify payment
            const verifyResponse = await supabase.functions.invoke('verify-razorpay-payment', {
              body: {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                db_order_id: data.db_order_id
              }
            });
            
            if (verifyResponse.error || (verifyResponse.data && verifyResponse.data.error)) {
              throw new Error(verifyResponse.error?.message || verifyResponse.data?.error || 'Payment verification failed');
            }
            
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
            console.error('Payment verification error:', error);
            toast.error('Payment verification failed', {
              description: error.message,
              action: {
                label: 'View Order',
                onClick: () => navigate(`/orders/${data.db_order_id}`)
              }
            });
            setIsProcessing(false);
          }
        },
        modal: {
          ondismiss: function() {
            toast.info('Payment cancelled', {
              description: 'You can try the payment again or modify your cart',
              action: {
                label: 'Try Again',
                onClick: () => handlePayment()
              }
            });
            setIsProcessing(false);
          },
          escape: true,
          backdropClose: false
        }
      });
      
      razorpay.on('payment.failed', function(response: any) {
        console.error('Payment failed:', response.error);
        toast.error('Payment failed', {
          description: response.error.description,
          action: {
            label: 'Try Again',
            onClick: () => handlePayment()
          }
        });
        setIsProcessing(false);
      });
      
      razorpay.open();
    } catch (error: any) {
      console.error('Payment initialization error:', error);
      toast.error('Payment failed', {
        description: error.message,
        action: {
          label: 'Try Again',
          onClick: () => handlePayment()
        }
      });
      setIsProcessing(false);
    }
  };
  
  // Redirect if not authenticated
  React.useEffect(() => {
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
  }, [isAuthenticated, navigate, isProcessing]);
  
  if (!isAuthenticated) {
    return null;
  }
  
  return (
    <div className="container-custom py-12">
      <h1 className="text-3xl font-display font-bold mb-6">Checkout</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Shipping Information */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
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
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 sticky top-24">
            <h2 className="text-lg font-medium mb-4">Order Summary</h2>
            
            <div className="space-y-4 mb-4">
              {cartItems.map(({ product, quantity }) => (
                <div key={product.id} className="flex justify-between">
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded overflow-hidden mr-2">
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
                <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Shipping</span>
                <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Estimated Tax</span>
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
              className="w-full bg-tech-blue hover:bg-tech-blue-dark dark:bg-tech-blue dark:hover:bg-tech-blue-dark"
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
