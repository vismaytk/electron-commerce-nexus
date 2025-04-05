
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, ShoppingCart, Heart, Share2, Check, Truck, ArrowLeft, ChevronRight } from 'lucide-react';
import { PRODUCTS } from '@/data/products';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import ProductImageGallery from '@/components/ProductImageGallery';
import ProductCard from '@/components/ProductCard';
import { Badge } from '@/components/ui/badge';

const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  
  // Find the product by ID
  const product = PRODUCTS.find(p => p.id === id);
  
  // Get related products
  const relatedProducts = product 
    ? PRODUCTS.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4)
    : [];
  
  if (!product) {
    return (
      <div className="container-custom py-12 text-center">
        <h2 className="text-2xl font-medium mb-4">Product Not Found</h2>
        <p className="mb-6">The product you are looking for does not exist or has been removed.</p>
        <Button asChild>
          <Link to="/products">Back to Products</Link>
        </Button>
      </div>
    );
  }
  
  const {
    name,
    category,
    price,
    originalPrice,
    description,
    features,
    images,
    rating,
    reviewCount,
    stock,
    specifications,
    isNew
  } = product;
  
  // Calculate discount percentage if there's an original price
  const discountPercentage = originalPrice 
    ? Math.round(((originalPrice - price) / originalPrice) * 100) 
    : null;
  
  const incrementQuantity = () => {
    if (quantity < stock) {
      setQuantity(quantity + 1);
    }
  };
  
  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };
  
  const handleAddToCart = () => {
    addToCart(product, quantity);
  };
  
  return (
    <main className="container-custom py-8">
      {/* Breadcrumbs */}
      <div className="flex items-center text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-tech-blue">Home</Link>
        <ChevronRight className="h-4 w-4 mx-1" />
        <Link to="/products" className="hover:text-tech-blue">Products</Link>
        <ChevronRight className="h-4 w-4 mx-1" />
        <Link to={`/categories/${category}`} className="hover:text-tech-blue capitalize">
          {category.replace('-', ' ')}
        </Link>
        <ChevronRight className="h-4 w-4 mx-1" />
        <span className="text-gray-700 truncate max-w-[160px]">{name}</span>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Product Images */}
        <div className="w-full lg:w-1/2">
          <ProductImageGallery images={images} name={name} />
        </div>
        
        {/* Product Details */}
        <div className="w-full lg:w-1/2">
          <div className="flex flex-col h-full">
            <div className="mb-4 flex items-center gap-2">
              {isNew && <Badge className="bg-tech-blue">New</Badge>}
              {discountPercentage && <Badge variant="destructive">{discountPercentage}% OFF</Badge>}
            </div>
            
            <h1 className="text-3xl font-display font-bold text-navy mb-2">{name}</h1>
            
            <div className="flex items-center mb-4">
              <div className="flex items-center text-yellow-500">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`h-5 w-5 ${i < Math.floor(rating) ? 'fill-current' : 'fill-none'}`} 
                  />
                ))}
                <span className="ml-2 text-navy font-medium">{rating.toFixed(1)}</span>
              </div>
              <span className="mx-2 text-gray-300">|</span>
              <span className="text-gray-500">{reviewCount} reviews</span>
            </div>
            
            <div className="mb-6 flex items-baseline">
              <span className="text-3xl font-bold text-navy">${price.toFixed(2)}</span>
              {originalPrice && (
                <span className="ml-3 text-lg text-gray-500 line-through">
                  ${originalPrice.toFixed(2)}
                </span>
              )}
            </div>
            
            <div className="mb-6">
              <p className="text-gray-700">{description}</p>
            </div>
            
            {/* Stock Status */}
            <div className="mb-6">
              <div className="flex items-center text-green-600">
                <Check className="h-5 w-5 mr-2" />
                <span>
                  {stock > 10 
                    ? 'In Stock' 
                    : stock > 0 
                      ? `Only ${stock} left in stock` 
                      : 'Out of Stock'}
                </span>
              </div>
              {stock > 0 && (
                <div className="flex items-center text-gray-600 mt-2">
                  <Truck className="h-5 w-5 mr-2" />
                  <span>Free shipping on orders over $50</span>
                </div>
              )}
            </div>
            
            {stock > 0 && (
              <>
                {/* Quantity Selector */}
                <div className="mb-6">
                  <label htmlFor="quantity" className="block text-gray-700 mb-2">Quantity</label>
                  <div className="flex items-center">
                    <button 
                      onClick={decrementQuantity}
                      className="border rounded-l px-3 py-1 hover:bg-gray-100"
                      disabled={quantity <= 1}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      id="quantity"
                      value={quantity}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        if (value >= 1 && value <= stock) {
                          setQuantity(value);
                        }
                      }}
                      min="1"
                      max={stock}
                      className="border-y w-16 py-1 px-2 text-center"
                    />
                    <button 
                      onClick={incrementQuantity}
                      className="border rounded-r px-3 py-1 hover:bg-gray-100"
                      disabled={quantity >= stock}
                    >
                      +
                    </button>
                  </div>
                </div>
                
                {/* Add to Cart and Buy Now buttons */}
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                  <Button 
                    onClick={handleAddToCart}
                    className="flex-1 bg-navy hover:bg-tech-blue transition-colors"
                  >
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    Add to Cart
                  </Button>
                  <Button className="flex-1 bg-tech-blue hover:bg-tech-blue-dark transition-colors">
                    Buy Now
                  </Button>
                </div>
              </>
            )}
            
            {/* Additional actions */}
            <div className="flex gap-4 mb-6">
              <Button variant="outline" size="sm" className="flex items-center">
                <Heart className="mr-2 h-4 w-4" />
                Add to Wishlist
              </Button>
              <Button variant="outline" size="sm" className="flex items-center">
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
            </div>
            
            {/* Features list */}
            {features && features.length > 0 && (
              <div className="mb-6 mt-auto">
                <h3 className="font-medium mb-2">Key Features:</h3>
                <ul className="list-disc pl-5 space-y-1">
                  {features.map((feature, index) => (
                    <li key={index} className="text-gray-700">{feature}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Product Details Tabs */}
      <div className="mt-12">
        <Tabs defaultValue="description">
          <TabsList className="w-full justify-start border-b rounded-none bg-transparent h-auto p-0">
            <TabsTrigger 
              value="description" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-tech-blue"
            >
              Description
            </TabsTrigger>
            <TabsTrigger 
              value="specifications" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-tech-blue"
            >
              Specifications
            </TabsTrigger>
            <TabsTrigger 
              value="reviews" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-tech-blue"
            >
              Reviews ({reviewCount})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="description" className="pt-6">
            <div className="prose max-w-none">
              <p>{description}</p>
              {features && features.length > 0 && (
                <>
                  <h3 className="text-xl font-medium mt-6 mb-4">Features</h3>
                  <ul>
                    {features.map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </TabsContent>
          <TabsContent value="specifications" className="pt-6">
            {specifications ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(specifications).map(([key, value]) => (
                  <div key={key} className="border-b pb-2">
                    <span className="font-medium text-navy">{key}:</span> {value}
                  </div>
                ))}
              </div>
            ) : (
              <p>No specifications available for this product.</p>
            )}
          </TabsContent>
          <TabsContent value="reviews" className="pt-6">
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <div className="mr-4">
                  <span className="text-5xl font-bold text-navy">{rating.toFixed(1)}</span>
                  <div className="flex mt-2">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`h-5 w-5 text-yellow-500 ${i < Math.floor(rating) ? 'fill-current' : 'fill-none'}`} 
                      />
                    ))}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{reviewCount} reviews</p>
                </div>
                <div className="flex-1">
                  {/* Placeholder for rating distribution bars */}
                  {[5, 4, 3, 2, 1].map(star => (
                    <div key={star} className="flex items-center mb-1">
                      <span className="text-sm text-gray-600 w-6">{star}</span>
                      <div className="h-2 bg-gray-200 flex-1 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-yellow-500 rounded-full" 
                          style={{ width: `${(star / 5) * 75 + Math.random() * 25}%` }} 
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <Button>Write a Review</Button>
            </div>
            
            {/* Sample reviews */}
            <div className="space-y-6">
              <div className="border-b pb-6">
                <div className="flex justify-between mb-2">
                  <div className="font-medium">John D.</div>
                  <div className="text-sm text-gray-500">2 weeks ago</div>
                </div>
                <div className="flex mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`h-4 w-4 text-yellow-500 ${i < 5 ? 'fill-current' : 'fill-none'}`} 
                    />
                  ))}
                </div>
                <p className="text-gray-700">
                  Excellent product! Exactly as described and arrived quickly. The quality is outstanding.
                </p>
              </div>
              
              <div className="border-b pb-6">
                <div className="flex justify-between mb-2">
                  <div className="font-medium">Sarah M.</div>
                  <div className="text-sm text-gray-500">1 month ago</div>
                </div>
                <div className="flex mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`h-4 w-4 text-yellow-500 ${i < 4 ? 'fill-current' : 'fill-none'}`} 
                    />
                  ))}
                </div>
                <p className="text-gray-700">
                  Very happy with my purchase. The build quality is great and it performs well. Would recommend!
                </p>
              </div>
              
              <div>
                <div className="flex justify-between mb-2">
                  <div className="font-medium">Michael T.</div>
                  <div className="text-sm text-gray-500">2 months ago</div>
                </div>
                <div className="flex mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`h-4 w-4 text-yellow-500 ${i < 5 ? 'fill-current' : 'fill-none'}`} 
                    />
                  ))}
                </div>
                <p className="text-gray-700">
                  This exceeded my expectations. Customer service was also excellent when I had questions.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* FAQ Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-display font-medium mb-6">Frequently Asked Questions</h2>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger>What is the warranty period?</AccordionTrigger>
            <AccordionContent>
              This product comes with a standard 1-year manufacturer warranty that covers defects in materials and workmanship.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>Can I return this product if I'm not satisfied?</AccordionTrigger>
            <AccordionContent>
              Yes, we offer a 30-day return policy. If you're not completely satisfied, you can return the product in its original packaging for a full refund.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionTrigger>How long does shipping take?</AccordionTrigger>
            <AccordionContent>
              Standard shipping typically takes 3-5 business days. Express shipping options are available at checkout for faster delivery.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-4">
            <AccordionTrigger>Does this product include accessories?</AccordionTrigger>
            <AccordionContent>
              The package includes the main product and essential accessories as specified in the product description. Additional accessories can be purchased separately.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
      
      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-display font-medium mb-6">You May Also Like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {relatedProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}
      
      {/* Back to Products */}
      <div className="mt-12 text-center">
        <Button asChild variant="outline">
          <Link to="/products" className="flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Products
          </Link>
        </Button>
      </div>
    </main>
  );
};

export default ProductDetailPage;
