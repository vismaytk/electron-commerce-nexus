
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { ShippingAddress } from '@/types';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import ShippingForm from '@/components/checkout/ShippingForm';
import OrderSummary from '@/components/checkout/OrderSummary';
import { PaymentService } from '@/services/PaymentService';

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
  
  const subtotal = cartTotal;
  const shipping = subtotal > 50 ? 0 : 10;
  const tax = subtotal * 0.08; // 8% tax rate
  const total = subtotal + shipping + tax;
  
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
  
  const handleShippingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setShippingAddress(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
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
    setError(null);
    
    try {
      console.log("Initiating payment process");
      
      if (!window.Razorpay) {
        console.log("Loading Razorpay script");
        await PaymentService.loadRazorpayScript();
        console.log("Razorpay script loaded");
      }
      
      const orderData = await PaymentService.createRazorpayOrder(
        user,
        total,
        shippingAddress,
        cartItems
      );
      
      console.log("Order created successfully:", orderData);
      
      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'GADA ELECTRONICS',
        description: 'Purchase from GADA ELECTRONICS',
        order_id: orderData.order_id,
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
            await PaymentService.verifyRazorpayPayment(response, orderData.db_order_id);
            
            console.log("Payment verified successfully");
            
            clearCart();
            navigate('/order-success', { 
              state: { 
                orderId: orderData.db_order_id,
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
      
      PaymentService.initializeRazorpayCheckout(
        options,
        () => {}, // Success is handled in the handler option
        (error) => {
          console.error("Payment failed:", error);
          toast.error(`Payment failed: ${error.description}`);
          setError(`Payment failed: ${error.description}`);
          setIsProcessing(false);
        }
      );
    } catch (error: any) {
      console.error("Payment process error:", error);
      toast.error(`Payment failed: ${error.message}`);
      setError(`Payment failed: ${error.message}`);
      setIsProcessing(false);
    }
  };
  
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
    
    // Update shipping address name when user changes
    if (user && user.name && !shippingAddress.name) {
      setShippingAddress(prev => ({
        ...prev,
        name: user.name || ''
      }));
    }
  }, [isAuthenticated, navigate, user, shippingAddress.name]);
  
  if (!isAuthenticated) {
    return null;
  }
  
  return (
    <div className="container-custom py-12">
      <h1 className="text-3xl font-display font-bold mb-6">Checkout</h1>
      
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Payment Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <ShippingForm 
            shippingAddress={shippingAddress}
            handleShippingChange={handleShippingChange}
          />
        </div>
        
        <div className="lg:col-span-1">
          <OrderSummary 
            cartItems={cartItems}
            subtotal={subtotal}
            shipping={shipping}
            tax={tax}
            total={total}
            isProcessing={isProcessing}
            handlePayment={handlePayment}
          />
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
