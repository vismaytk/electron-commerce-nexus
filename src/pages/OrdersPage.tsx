
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Order } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { ShoppingCart, Package } from 'lucide-react';

const OrdersPage = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch user orders
  useEffect(() => {
    const fetchOrders = async () => {
      if (!isAuthenticated || !user) return;
      
      try {
        const { data, error } = await supabase
          .from('orders')
          .select(`
            *,
            order_items (
              *,
              product:product_id (name, images)
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (error) {
          throw error;
        }
        
        // Transform to match our types
        const transformedOrders: Order[] = data.map((order: any) => ({
          id: order.id,
          userId: order.user_id,
          status: order.status,
          total: order.total,
          shippingAddress: order.shipping_address,
          paymentDetails: order.payment_details,
          razorpayOrderId: order.razorpay_order_id,
          razorpayPaymentId: order.razorpay_payment_id,
          createdAt: order.created_at,
          updatedAt: order.updated_at,
          items: order.order_items.map((item: any) => ({
            id: item.id,
            orderId: item.order_id,
            productId: item.product_id,
            quantity: item.quantity,
            priceAtPurchase: item.price_at_purchase,
            product: {
              id: item.product_id,
              name: item.product.name,
              images: item.product.images,
              // Default values for required fields
              category: '',
              price: item.price_at_purchase,
              description: '',
              rating: 0,
              reviewCount: 0,
              stock: 0
            }
          }))
        }));
        
        setOrders(transformedOrders);
      } catch (error: any) {
        toast.error(`Error fetching orders: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchOrders();
  }, [user, isAuthenticated]);
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      toast.error('Please login to view your orders', {
        action: {
          label: "Login",
          onClick: () => navigate('/login', { state: { from: '/orders' } })
        }
      });
      navigate('/login', { state: { from: '/orders' } });
    }
  }, [isAuthenticated, navigate, isLoading]);
  
  if (!isAuthenticated) {
    return null;
  }
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100';
    }
  };
  
  return (
    <div className="container-custom py-12">
      <h1 className="text-3xl font-display font-bold mb-6">My Orders</h1>
      
      {isLoading ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 text-center">
          <p>Loading your orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 text-center flex flex-col items-center">
          <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-4">
            <ShoppingCart className="h-10 w-10 text-gray-400 dark:text-gray-500" />
          </div>
          <h2 className="text-2xl font-medium mb-2">No orders yet</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">You haven't placed any orders yet.</p>
          <Button asChild>
            <Link to="/products">Start Shopping</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map(order => (
            <div 
              key={order.id} 
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden"
            >
              <div className="p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-medium">Order #{order.id.substring(0, 8)}</h2>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Placed on {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Order Total</p>
                    <p className="text-lg font-medium">${order.total.toFixed(2)}</p>
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <div className="space-y-4">
                  {order.items?.map(item => (
                    <div key={item.id} className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded overflow-hidden flex-shrink-0">
                        {item.product?.images?.[0] ? (
                          <img 
                            src={item.product.images[0]} 
                            alt={item.product?.name} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                            <Package className="h-6 w-6 text-gray-400 dark:text-gray-500" />
                          </div>
                        )}
                      </div>
                      <div className="flex-grow">
                        <h3 className="font-medium">{item.product?.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Quantity: {item.quantity} × ${item.priceAtPurchase.toFixed(2)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${(item.quantity * item.priceAtPurchase).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
