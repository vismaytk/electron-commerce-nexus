
import { supabase, invokeFunction } from '@/integrations/supabase/client';
import { CartItem, ShippingAddress, User } from '@/types';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface RazorpayOrderResponse {
  order_id: string;
  db_order_id: string;
  amount: number;
  currency: string;
  key: string;
}

export const PaymentService = {
  loadRazorpayScript: (): Promise<void> => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        console.log('Razorpay script already loaded');
        resolve();
        return;
      }
      
      console.log('Loading Razorpay script...');
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => {
        console.log('Razorpay script loaded successfully');
        resolve();
      };
      document.body.appendChild(script);
    });
  },
  
  createRazorpayOrder: async (
    user: User,
    total: number,
    shippingAddress: ShippingAddress,
    cartItems: CartItem[]
  ): Promise<RazorpayOrderResponse> => {
    console.log('Creating Razorpay order...');
    console.log('User:', user);
    console.log('Total:', total);
    console.log('Shipping address:', shippingAddress);
    console.log('Cart items count:', cartItems.length);
    
    const simplifiedCartItems = cartItems.map(item => ({
      product: {
        id: item.product.id,
        name: item.product.name,
        price: item.product.price,
      },
      quantity: item.quantity
    }));
    
    try {
      const { data, error } = await invokeFunction('create-razorpay-order', {
        amount: total,
        currency: 'INR',
        user_id: user.id,
        order_details: {
          shipping_address: shippingAddress,
          items: simplifiedCartItems
        }
      });
      
      console.log('Response from create-razorpay-order:', data, error);
      
      if (error) {
        console.error('Error invoking create-razorpay-order:', error);
        throw new Error(`Failed to create order: ${error.message || 'Unknown error'}`);
      }
      
      if (!data) {
        console.error('No data returned from create-razorpay-order');
        throw new Error('Failed to create order: No data returned');
      }
      
      if (data.error) {
        console.error('Error in create-razorpay-order response:', data.error);
        throw new Error(`Failed to create order: ${data.error}`);
      }
      
      console.log('Razorpay order created successfully:', data);
      return data as RazorpayOrderResponse;
    } catch (error) {
      console.error('Error creating Razorpay order:', error);
      throw error;
    }
  },
  
  verifyRazorpayPayment: async (
    paymentResponse: any,
    dbOrderId: string
  ): Promise<void> => {
    console.log('Verifying Razorpay payment...', paymentResponse, dbOrderId);
    
    try {
      const { data, error } = await invokeFunction('verify-razorpay-payment', {
        razorpay_order_id: paymentResponse.razorpay_order_id,
        razorpay_payment_id: paymentResponse.razorpay_payment_id,
        razorpay_signature: paymentResponse.razorpay_signature,
        db_order_id: dbOrderId
      });
      
      console.log('Response from verify-razorpay-payment:', data, error);
      
      if (error) {
        console.error('Error invoking verify-razorpay-payment:', error);
        throw new Error(`Payment verification failed: ${error.message || 'Unknown error'}`);
      }
      
      if (data && data.error) {
        console.error('Error in verify-razorpay-payment response:', data.error);
        throw new Error(`Payment verification failed: ${data.error}`);
      }
      
      console.log('Razorpay payment verified successfully');
      return data;
    } catch (error) {
      console.error('Error verifying Razorpay payment:', error);
      throw error;
    }
  },
  
  initializeRazorpayCheckout: (
    options: any,
    onSuccess: (response: any) => void,
    onError: (error: any) => void
  ): void => {
    console.log('Initializing Razorpay checkout with options:', options);
    
    try {
      const razorpay = new window.Razorpay(options);
      
      razorpay.on('payment.failed', (response: any) => {
        console.error('Razorpay payment failed:', response.error);
        onError(response.error);
      });
      
      razorpay.open();
      console.log('Razorpay checkout opened');
    } catch (error) {
      console.error('Error initializing Razorpay checkout:', error);
      onError(error);
    }
  }
};
