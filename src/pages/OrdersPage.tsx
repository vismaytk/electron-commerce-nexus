import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import supabase from '@/integrations/supabase/client';
import { Order } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        const formattedOrders: Order[] = data.map(order => ({
          id: order.id,
          userId: order.user_id,
          status: order.status as 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled',
          total: order.total,
          shippingAddress: order.shipping_address as any,
          paymentDetails: order.payment_details as any,
          razorpayOrderId: order.razorpay_order_id || undefined,
          razorpayPaymentId: order.razorpay_payment_id || undefined,
          createdAt: order.created_at,
          updatedAt: order.updated_at
        }));

        setOrders(formattedOrders);
      } catch (error: any) {
        console.error('Error fetching orders:', error);
        toast.error(`Failed to load orders: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  if (loading) {
    return (
      <div className="container mx-auto p-4 flex items-center justify-center h-full">
        <Loader2 className="h-10 w-10 animate-spin" />
      </div>
    );
  }

  if (!orders.length) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle>No Orders Found</CardTitle>
            <CardDescription>You haven't placed any orders yet.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Browse our products and start shopping!</p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => navigate('/products')}>Go to Products</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">My Orders</h1>
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {orders.map((order) => (
          <Card key={order.id}>
            <CardHeader>
              <CardTitle>Order #{order.id}</CardTitle>
              <CardDescription>
                Placed on {format(new Date(order.createdAt), 'MMMM d, yyyy')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Total: ${order.total.toFixed(2)}</p>
              <Badge
                variant={
                  order.status === 'completed'
                    ? 'secondary'
                    : order.status === 'processing'
                    ? 'secondary'
                    : order.status === 'failed'
                    ? 'destructive'
                    : 'default'
                }
              >
                {order.status}
              </Badge>
            </CardContent>
            <CardFooter>
              <Button onClick={() => navigate(`/orders/${order.id}`)}>
                View Details
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default OrdersPage;
