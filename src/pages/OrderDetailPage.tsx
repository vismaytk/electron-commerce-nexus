
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Order } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

type OrderItem = {
  id: string;
  product_id: string;
  quantity: number;
  price_at_purchase: number;
  product_name?: string;
  product_image?: string;
};

const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!user || !id) return;

      try {
        // Fetch order
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .select('*')
          .eq('id', id)
          .eq('user_id', user.id)
          .single();

        if (orderError) {
          throw orderError;
        }

        if (!orderData) {
          toast.error('Order not found');
          navigate('/orders');
          return;
        }

        const formattedOrder: Order = {
          id: orderData.id,
          userId: orderData.user_id,
          status: orderData.status as 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled',
          total: orderData.total,
          shippingAddress: orderData.shipping_address as any,
          paymentDetails: orderData.payment_details as any,
          razorpayOrderId: orderData.razorpay_order_id || undefined,
          razorpayPaymentId: orderData.razorpay_payment_id || undefined,
          createdAt: orderData.created_at,
          updatedAt: orderData.updated_at
        };

        setOrder(formattedOrder);

        // Fetch order items
        const { data: orderItemsData, error: itemsError } = await supabase
          .from('order_items')
          .select('*')
          .eq('order_id', id);

        if (itemsError) {
          throw itemsError;
        }

        // Fetch product details for each order item
        const enhancedOrderItems = await Promise.all(
          orderItemsData.map(async (item) => {
            const { data: productData } = await supabase
              .from('products')
              .select('name, images')
              .eq('id', item.product_id)
              .single();

            return {
              ...item,
              product_name: productData?.name || 'Product not available',
              product_image: productData?.images?.[0] || '/placeholder.svg'
            };
          })
        );

        setOrderItems(enhancedOrderItems);
      } catch (error: any) {
        console.error('Error fetching order details:', error);
        toast.error(`Failed to load order details: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [user, id, navigate]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'secondary';
      case 'processing':
        return 'secondary';
      case 'failed':
        return 'destructive';
      case 'cancelled':
        return 'destructive';
      default:
        return 'default';
    }
  };

  const formatAddress = (address: any) => {
    if (!address) return 'Not available';
    
    const parts = [
      address.name,
      address.addressLine1,
      address.addressLine2,
      `${address.city}, ${address.state} ${address.postalCode}`,
      address.country,
      `Phone: ${address.phone}`
    ].filter(Boolean);
    
    return parts.join(', ');
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 flex items-center justify-center h-full">
        <Loader2 className="h-10 w-10 animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle>Order Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p>The order you're looking for does not exist or you don't have permission to view it.</p>
            <Button onClick={() => navigate('/orders')} className="mt-4">
              Back to Orders
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate('/orders')} className="px-0">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Orders
        </Button>
        <h1 className="text-2xl font-bold mt-2">Order #{order.id}</h1>
        <p className="text-gray-500">
          Placed on {format(new Date(order.createdAt), 'MMMM d, yyyy')}
        </p>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-xl">Order Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Badge variant={getStatusColor(order.status)}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </Badge>
                {order.razorpayPaymentId && (
                  <span className="ml-4 text-sm text-gray-500">
                    Payment ID: {order.razorpayPaymentId}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-xl">Items</CardTitle>
            </CardHeader>
            <CardContent>
              {orderItems.length === 0 ? (
                <p>No items found for this order.</p>
              ) : (
                <div className="space-y-4">
                  {orderItems.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4">
                      <div className="h-16 w-16 rounded-md overflow-hidden bg-gray-100">
                        <img
                          src={item.product_image}
                          alt={item.product_name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{item.product_name}</p>
                        <p className="text-sm text-gray-500">
                          Quantity: {item.quantity} × ${item.price_at_purchase.toFixed(2)}
                        </p>
                      </div>
                      <div className="font-medium">
                        ${(item.quantity * item.price_at_purchase).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-xl">Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Subtotal</span>
                  <span>${order.total.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span>${order.total.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Shipping Address</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-line">
                {formatAddress(order.shippingAddress)}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
