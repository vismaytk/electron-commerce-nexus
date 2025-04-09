
import React from 'react';
import { Link } from 'react-router-dom';
import { Star, ShoppingCart } from 'lucide-react';
import { Product } from '@/types';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();

  const {
    id,
    name,
    price,
    originalPrice,
    images,
    rating,
    reviewCount,
    isNew,
  } = product;

  // Calculate discount percentage if there's an original price
  const discountPercentage = originalPrice 
    ? Math.round(((originalPrice - price) / originalPrice) * 100) 
    : null;

  return (
    <div className="product-card flex flex-col h-full">
      <div className="relative">
        <Link to={`/products/${id}`}>
          <div className="w-full h-48 overflow-hidden">
            <img 
              src={images[0]} 
              alt={name} 
              className="w-full h-full object-cover transition-all duration-300 hover:scale-105"
              loading="lazy"
            />
          </div>
          {(isNew || discountPercentage) && (
            <div className="absolute top-2 left-2 flex flex-col gap-1">
              {isNew && (
                <Badge className="bg-tech-blue">New</Badge>
              )}
              {discountPercentage && (
                <Badge variant="destructive">{discountPercentage}% OFF</Badge>
              )}
            </div>
          )}
        </Link>
      </div>
      
      <div className="p-4 flex flex-col flex-grow">
        <Link to={`/products/${id}`} className="group">
          <h3 className="text-navy font-medium group-hover:text-tech-blue transition-colors line-clamp-2">
            {name}
          </h3>
        </Link>
        
        <div className="flex items-center mt-2">
          <div className="flex items-center text-yellow-500">
            <Star className="h-4 w-4 fill-current" />
            <span className="ml-1 text-sm font-medium text-navy">{rating.toFixed(1)}</span>
          </div>
          <span className="mx-1 text-gray-400">|</span>
          <span className="text-sm text-gray-500">{reviewCount} reviews</span>
        </div>
        
        <div className="mt-2 mb-4 flex items-baseline">
          <span className="text-lg font-semibold text-navy">${price.toFixed(2)}</span>
          {originalPrice && (
            <span className="ml-2 text-sm text-gray-500 line-through">
              ${originalPrice.toFixed(2)}
            </span>
          )}
        </div>
        
        <div className="mt-auto">
          <Button 
            onClick={() => addToCart(product, 1)} 
            className="w-full bg-navy hover:bg-tech-blue transition-colors"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Add to Cart
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
