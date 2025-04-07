
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
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve();
      document.body.appendChild(script);
    });
  },
  
  createRazorpayOrder: async (
    user: User,
    total: number,
    shippingAddress: ShippingAddress,
    cartItems: CartItem[]
  ): Promise<RazorpayOrderResponse> => {
    const simplifiedCartItems = cartItems.map(item => ({
      product: {
        id: item.product.id,
        name: item.product.name,
        price: item.product.price,
      },
      quantity: item.quantity
    }));
    
    const { data, error } = await invokeFunction('create-razorpay-order', {
      amount: total,
      currency: 'INR',
      user_id: user.id,
      order_details: {
        shipping_address: shippingAddress,
        items: simplifiedCartItems
      }
    });
    
    if (error || !data) {
      throw new Error(error?.message || 'Failed to create order');
    }
    
    if (data.error) {
      throw new Error(data.error);
    }
    
    return data as RazorpayOrderResponse;
  },
  
  verifyRazorpayPayment: async (
    paymentResponse: any,
    dbOrderId: string
  ): Promise<void> => {
    const { data, error } = await invokeFunction('verify-razorpay-payment', {
      razorpay_order_id: paymentResponse.razorpay_order_id,
      razorpay_payment_id: paymentResponse.razorpay_payment_id,
      razorpay_signature: paymentResponse.razorpay_signature,
      db_order_id: dbOrderId
    });
    
    if (error || (data && data.error)) {
      throw new Error(error?.message || data?.error || 'Payment verification failed');
    }
    
    return data;
  },
  
  initializeRazorpayCheckout: (
    options: any,
    onSuccess: (response: any) => void,
    onError: (error: any) => void
  ): void => {
    const razorpay = new window.Razorpay(options);
    
    razorpay.on('payment.failed', (response: any) => {
      onError(response.error);
    });
    
    razorpay.open();
  }
};
