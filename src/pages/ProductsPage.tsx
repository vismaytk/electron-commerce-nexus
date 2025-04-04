
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Filter, SlidersHorizontal, X } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import { Product } from '@/types';
import { PRODUCTS, CATEGORIES } from '@/data/products';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const sortOptions = [
  { value: 'featured', label: 'Featured' },
  { value: 'newest', label: 'Newest' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' }
];

const ProductsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  
  // Get filter parameters
  const searchQuery = queryParams.get('search') || '';
  const categoryFilter = queryParams.get('category') || '';
  const sortBy = queryParams.get('sort') || 'featured';
  const minPriceParam = queryParams.get('minPrice') || '';
  const maxPriceParam = queryParams.get('maxPrice') || '';
  const featuredParam = queryParams.get('featured') || '';
  const newParam = queryParams.get('new') || '';

  // State for filters
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    categoryFilter ? [categoryFilter] : []
  );
  const [priceRange, setPriceRange] = useState<[number, number]>([
    minPriceParam ? parseInt(minPriceParam) : 0,
    maxPriceParam ? parseInt(maxPriceParam) : 2000
  ]);
  const [showFeatured, setShowFeatured] = useState<boolean>(featuredParam === 'true');
  const [showNew, setShowNew] = useState<boolean>(newParam === 'true');
  const [searchTerm, setSearchTerm] = useState<string>(searchQuery);
  const [sortOption, setSortOption] = useState<string>(sortBy);
  
  // State for filtered products
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(PRODUCTS);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Price range limits based on products
  const minPrice = 0;
  const maxPrice = 2000; // Could dynamically calculate from products

  // Apply filters
  useEffect(() => {
    let filtered = [...PRODUCTS];
    
    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Category filter
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(product => 
        selectedCategories.includes(product.category)
      );
    }
    
    // Price range filter
    filtered = filtered.filter(product => 
      product.price >= priceRange[0] && product.price <= priceRange[1]
    );
    
    // Featured filter
    if (showFeatured) {
      filtered = filtered.filter(product => product.isFeatured);
    }
    
    // New products filter
    if (showNew) {
      filtered = filtered.filter(product => product.isNew);
    }
    
    // Sort products
    switch (sortOption) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        filtered.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'featured':
      default:
        filtered.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
    }
    
    setFilteredProducts(filtered);
  }, [searchTerm, selectedCategories, priceRange, showFeatured, showNew, sortOption]);
  
  // Update URL with filters
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (searchTerm) params.set('search', searchTerm);
    if (selectedCategories.length === 1) params.set('category', selectedCategories[0]);
    if (sortOption !== 'featured') params.set('sort', sortOption);
    if (priceRange[0] > minPrice) params.set('minPrice', priceRange[0].toString());
    if (priceRange[1] < maxPrice) params.set('maxPrice', priceRange[1].toString());
    if (showFeatured) params.set('featured', 'true');
    if (showNew) params.set('new', 'true');
    
    navigate({
      pathname: location.pathname,
      search: params.toString()
    }, { replace: true });
    
  }, [searchTerm, selectedCategories, priceRange, showFeatured, showNew, sortOption, navigate, location.pathname]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(c => c !== category);
      } else {
        return [...prev, category];
      }
    });
  };

  const handlePriceChange = (value: number[]) => {
    setPriceRange([value[0], value[1]]);
  };

  const handleClearFilters = () => {
    setSelectedCategories([]);
    setPriceRange([minPrice, maxPrice]);
    setShowFeatured(false);
    setShowNew(false);
    setSearchTerm('');
    setSortOption('featured');
    navigate('/products');
  };

  // Filter panel for desktop
  const FilterPanel = () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-medium mb-3">Categories</h3>
        <div className="space-y-2">
          {CATEGORIES.map(category => (
            <div key={category.id} className="flex items-center space-x-2">
              <Checkbox 
                id={`category-${category.id}`}
                checked={selectedCategories.includes(category.slug)}
                onCheckedChange={() => handleCategoryChange(category.slug)}
              />
              <label 
                htmlFor={`category-${category.id}`}
                className="text-sm cursor-pointer"
              >
                {category.name}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-medium mb-3">Price Range</h3>
        <Slider
          value={[priceRange[0], priceRange[1]]}
          min={minPrice}
          max={maxPrice}
          step={10}
          onValueChange={handlePriceChange}
          className="my-6"
        />
        <div className="flex justify-between text-sm">
          <span>${priceRange[0]}</span>
          <span>${priceRange[1]}</span>
        </div>
      </div>

      <div>
        <h3 className="font-medium mb-3">Product Status</h3>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="featured"
              checked={showFeatured}
              onCheckedChange={(checked) => setShowFeatured(checked === true)}
            />
            <label htmlFor="featured" className="text-sm cursor-pointer">
              Featured Products
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="new"
              checked={showNew}
              onCheckedChange={(checked) => setShowNew(checked === true)}
            />
            <label htmlFor="new" className="text-sm cursor-pointer">
              New Arrivals
            </label>
          </div>
        </div>
      </div>

      <Button 
        variant="outline" 
        onClick={handleClearFilters}
        className="w-full"
      >
        Clear Filters
      </Button>
    </div>
  );

  return (
    <main className="container-custom py-8">
      <h1 className="text-3xl font-display font-bold mb-8">Products</h1>
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* Filters - Desktop */}
        <div className="hidden md:block w-64 flex-shrink-0">
          <FilterPanel />
        </div>
        
        {/* Mobile Filter Button */}
        <div className="flex md:hidden justify-between mb-4 w-full">
          <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filters
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              <div className="py-4">
                <FilterPanel />
              </div>
              <SheetClose asChild>
                <Button className="mt-4 w-full">Apply Filters</Button>
              </SheetClose>
            </SheetContent>
          </Sheet>
          
          <Select value={sortOption} onValueChange={setSortOption}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Products Grid */}
        <div className="flex-1">
          {/* Sort - Desktop */}
          <div className="hidden md:flex justify-between items-center mb-6">
            <p className="text-gray-600">
              Showing {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
            </p>
            <Select value={sortOption} onValueChange={setSortOption}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Active Filters Display */}
          {(selectedCategories.length > 0 || priceRange[0] > minPrice || priceRange[1] < maxPrice || showFeatured || showNew || searchTerm) && (
            <div className="flex flex-wrap gap-2 mb-6 items-center">
              <span className="text-sm font-medium">Active Filters:</span>
              {selectedCategories.map(category => {
                const categoryObj = CATEGORIES.find(c => c.slug === category);
                return (
                  <div key={category} className="bg-gray-100 px-3 py-1 rounded-full text-sm flex items-center">
                    {categoryObj?.name}
                    <button 
                      onClick={() => handleCategoryChange(category)}
                      className="ml-1 text-gray-500 hover:text-gray-700"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                );
              })}
              {(priceRange[0] > minPrice || priceRange[1] < maxPrice) && (
                <div className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                  ${priceRange[0]} - ${priceRange[1]}
                </div>
              )}
              {showFeatured && (
                <div className="bg-gray-100 px-3 py-1 rounded-full text-sm flex items-center">
                  Featured
                  <button 
                    onClick={() => setShowFeatured(false)}
                    className="ml-1 text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
              {showNew && (
                <div className="bg-gray-100 px-3 py-1 rounded-full text-sm flex items-center">
                  New Arrivals
                  <button 
                    onClick={() => setShowNew(false)}
                    className="ml-1 text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
              {searchTerm && (
                <div className="bg-gray-100 px-3 py-1 rounded-full text-sm flex items-center">
                  Search: {searchTerm}
                  <button 
                    onClick={() => setSearchTerm('')}
                    className="ml-1 text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
              <button 
                onClick={handleClearFilters}
                className="text-tech-blue hover:text-tech-blue-dark text-sm ml-2"
              >
                Clear All
              </button>
            </div>
          )}

          {filteredProducts.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-xl text-gray-600 mb-4">No products found</p>
              <Button 
                variant="outline" 
                onClick={handleClearFilters}
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default ProductsPage;
