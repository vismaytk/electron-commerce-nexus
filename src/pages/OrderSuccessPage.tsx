
import React from 'react';
import { Link, useLocation, Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

const OrderSuccessPage = () => {
  const location = useLocation();
  const { orderId, paymentId } = location.state || {};
  
  // Redirect if no order information is present
  if (!orderId) {
    return <Navigate to="/" />;
  }
  
  return (
    <div className="container-custom py-16">
      <div className="max-w-lg mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 text-center">
        <div className="flex justify-center mb-4">
          <CheckCircle className="h-16 w-16 text-green-500" />
        </div>
        
        <h1 className="text-2xl font-bold mb-4">Order Successful!</h1>
        
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Thank you for your purchase. Your order has been confirmed and will be shipped soon.
        </p>
        
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
          <div className="mb-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">Order ID:</span>
            <p className="font-medium">{orderId}</p>
          </div>
          
          {paymentId && (
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400">Payment ID:</span>
              <p className="font-medium">{paymentId}</p>
            </div>
          )}
        </div>
        
        <div className="flex flex-col space-y-3">
          <Button asChild>
            <Link to="/products">Continue Shopping</Link>
          </Button>
          
          <Button asChild variant="outline">
            <Link to="/orders">View My Orders</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
