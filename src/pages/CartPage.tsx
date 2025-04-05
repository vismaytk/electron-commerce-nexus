
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingCart, ArrowRight } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

const CartPage = () => {
  const { cartItems, removeFromCart, updateQuantity, clearCart, cartTotal } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // Calculate summary values
  const subtotal = cartTotal;
  const shipping = subtotal > 50 ? 0 : 10;
  const tax = subtotal * 0.08; // 8% tax rate
  const total = subtotal + shipping + tax;
  
  const handleCheckout = () => {
    if (!isAuthenticated) {
      toast.error("Please login to checkout", {
        description: "You need to be logged in to continue to checkout",
        action: {
          label: "Login",
          onClick: () => navigate('/login', { state: { from: '/checkout' } })
        }
      });
      return;
    }
    
    navigate('/checkout');
  };
  
  if (cartItems.length === 0) {
    return (
      <div className="container-custom py-12">
        <h1 className="text-3xl font-display font-bold mb-6">Your Cart</h1>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 text-center flex flex-col items-center">
          <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-4">
            <ShoppingCart className="h-10 w-10 text-gray-400 dark:text-gray-500" />
          </div>
          <h2 className="text-2xl font-medium mb-2">Your cart is empty</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Looks like you haven't added anything to your cart yet.</p>
          <Button asChild>
            <Link to="/products">Start Shopping</Link>
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container-custom py-12">
      <h1 className="text-3xl font-display font-bold mb-6">Your Cart</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items Section */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium">Cart Items ({cartItems.length})</h2>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearCart}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear Cart
                </Button>
              </div>
              
              {/* Cart item headers - Desktop */}
              <div className="hidden md:grid grid-cols-12 gap-4 text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">
                <div className="col-span-6">Product</div>
                <div className="col-span-2">Price</div>
                <div className="col-span-2">Quantity</div>
                <div className="col-span-2 text-right">Subtotal</div>
              </div>
              
              <Separator className="mb-6" />
              
              {/* Cart Items */}
              <div className="space-y-6">
                {cartItems.map(({ product, quantity }) => (
                  <div key={product.id} className="flex flex-col md:grid md:grid-cols-12 gap-4 pb-6 border-b dark:border-gray-700">
                    {/* Product Image and Name */}
                    <div className="md:col-span-6 flex">
                      <div className="w-20 h-20 rounded overflow-hidden flex-shrink-0">
                        <img 
                          src={product.images[0]} 
                          alt={product.name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="ml-4 flex flex-col">
                        <Link 
                          to={`/products/${product.id}`} 
                          className="text-navy hover:text-tech-blue dark:text-blue-400 dark:hover:text-blue-300 transition-colors font-medium"
                        >
                          {product.name}
                        </Link>
                        <span className="text-sm text-gray-500 dark:text-gray-400 capitalize">{product.category.replace('-', ' ')}</span>
                        
                        {/* Mobile price */}
                        <div className="md:hidden mt-2 flex justify-between">
                          <span className="text-sm font-medium">Price:</span>
                          <span>${product.price.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Price - Desktop */}
                    <div className="hidden md:flex md:col-span-2 items-center">
                      ${product.price.toFixed(2)}
                    </div>
                    
                    {/* Quantity */}
                    <div className="md:col-span-2 flex items-center">
                      <div className="flex md:flex-col items-center">
                        <div className="flex border dark:border-gray-600 rounded overflow-hidden">
                          <button 
                            onClick={() => updateQuantity(product.id, quantity - 1)}
                            className="px-2 py-1 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                            disabled={quantity <= 1}
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <input
                            type="number"
                            value={quantity}
                            onChange={(e) => {
                              const value = parseInt(e.target.value);
                              if (!isNaN(value) && value >= 1) {
                                updateQuantity(product.id, value);
                              }
                            }}
                            className="w-12 text-center border-x dark:border-gray-600 py-1 bg-white dark:bg-gray-800"
                            min="1"
                          />
                          <button 
                            onClick={() => updateQuantity(product.id, quantity + 1)}
                            className="px-2 py-1 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                            disabled={quantity >= product.stock}
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                        
                        {/* Remove button - Mobile */}
                        <button 
                          onClick={() => removeFromCart(product.id)}
                          className="ml-4 md:ml-0 md:mt-2 text-sm text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    
                    {/* Subtotal */}
                    <div className="md:col-span-2 flex items-center justify-between md:justify-end">
                      <span className="md:hidden font-medium">Subtotal:</span>
                      <span className="font-medium">${(product.price * quantity).toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex justify-between">
            <Button 
              asChild
              variant="outline" 
              className="flex items-center"
            >
              <Link to="/products">
                <ArrowRight className="h-4 w-4 mr-2 rotate-180" />
                Continue Shopping
              </Link>
            </Button>
          </div>
        </div>
        
        {/* Order Summary Section */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 sticky top-24">
            <h2 className="text-lg font-medium mb-4">Order Summary</h2>
            
            <div className="space-y-3 mb-6">
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
              onClick={handleCheckout}
              className="w-full bg-tech-blue hover:bg-tech-blue-dark dark:bg-tech-blue dark:hover:bg-tech-blue-dark"
            >
              Proceed to Checkout
            </Button>
            
            <div className="mt-4 text-sm text-gray-500 dark:text-gray-400 text-center">
              Shipping & taxes calculated at checkout
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
