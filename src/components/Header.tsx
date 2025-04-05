
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, Search, X, ShoppingCart, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useIsMobile } from '@/hooks/use-mobile';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import ThemeToggle from '@/components/ThemeToggle';

const Header = () => {
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { cartCount } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  
  // Set search query from URL parameters when the page loads or URL changes
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchParam = params.get('search');
    if (searchParam) {
      setSearchQuery(searchParam);
    }
  }, [location.search]);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setShowResults(false);
    }
  };
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    // Show/hide search results based on query length
    if (query.length >= 2) {
      // This would ideally connect to your backend/API
      // For now, we'll simulate with a timeout
      setTimeout(() => {
        // Simulate search results (in a real app, this would be an API call)
        const simulatedResults = [
          { id: '1', name: 'Ultra HD Smart TV 55"', category: 'tvs' },
          { id: '2', name: 'Pro Wireless Earbuds', category: 'audio' },
          { id: '3', name: 'Smart Home Hub', category: 'smart-home' },
        ].filter(item => 
          item.name.toLowerCase().includes(query.toLowerCase()) || 
          item.category.toLowerCase().includes(query.toLowerCase())
        );
        
        setSearchResults(simulatedResults);
        setShowResults(true);
      }, 300);
    } else {
      setShowResults(false);
    }
  };
  
  const handleResultClick = (productId: string) => {
    navigate(`/products/${productId}`);
    setShowResults(false);
  };
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="font-display font-bold text-2xl text-navy dark:text-white">
          GADA ELECTRONICS
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link to="/" className="text-gray-700 dark:text-gray-200 hover:text-tech-blue dark:hover:text-tech-blue-light transition-colors">
            Home
          </Link>
          <Link to="/products" className="text-gray-700 dark:text-gray-200 hover:text-tech-blue dark:hover:text-tech-blue-light transition-colors">
            Products
          </Link>
          {isAuthenticated && (
            <Link to="/orders" className="text-gray-700 dark:text-gray-200 hover:text-tech-blue dark:hover:text-tech-blue-light transition-colors">
              Orders
            </Link>
          )}
        </nav>
        
        {/* Desktop Search */}
        <div className="hidden md:flex items-center space-x-4">
          <div className="relative w-64">
            <form onSubmit={handleSearch}>
              <Input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="pr-8"
                onBlur={() => {
                  // Delay hiding results to allow for clicks
                  setTimeout(() => setShowResults(false), 200);
                }}
                onFocus={() => {
                  if (searchQuery.length >= 2) {
                    setShowResults(true);
                  }
                }}
              />
              <button 
                type="submit" 
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <Search className="h-4 w-4" />
              </button>
            </form>
            
            {/* Search Results Dropdown */}
            {showResults && searchResults.length > 0 && (
              <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700">
                {searchResults.map(result => (
                  <div
                    key={result.id}
                    className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                    onClick={() => handleResultClick(result.id)}
                  >
                    <p className="font-medium">{result.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      in {result.category.replace('-', ' ')}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <ThemeToggle />
          
          {/* User Account */}
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <User className="h-5 w-5" />
                  <span className="sr-only">Account menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-4 py-2">
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/orders">My Orders</Link>
                </DropdownMenuItem>
                {user?.isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link to="/admin">Admin Dashboard</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild variant="outline" size="sm">
              <Link to="/login">Login</Link>
            </Button>
          )}
          
          {/* Cart */}
          <Button asChild variant="ghost" size="icon" className="relative">
            <Link to="/cart">
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-tech-blue text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
              <span className="sr-only">Cart</span>
            </Link>
          </Button>
        </div>
        
        {/* Mobile Menu */}
        {isMobile && (
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            
            <Button asChild variant="ghost" size="icon" className="relative">
              <Link to="/cart">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-tech-blue text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
                <span className="sr-only">Cart</span>
              </Link>
            </Button>
            
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between border-b pb-4">
                    <Link to="/" className="font-display font-bold text-xl">
                      GADA ELECTRONICS
                    </Link>
                    <SheetClose asChild>
                      <Button variant="ghost" size="icon">
                        <X className="h-4 w-4" />
                        <span className="sr-only">Close menu</span>
                      </Button>
                    </SheetClose>
                  </div>
                  
                  <div className="py-4">
                    <div className="relative mb-6">
                      <form onSubmit={handleSearch}>
                        <Input
                          type="text"
                          placeholder="Search products..."
                          value={searchQuery}
                          onChange={handleSearchChange}
                          className="pr-8"
                        />
                        <button 
                          type="submit" 
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          <Search className="h-4 w-4" />
                        </button>
                      </form>
                      
                      {/* Mobile Search Results */}
                      {showResults && searchResults.length > 0 && (
                        <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700">
                          {searchResults.map(result => (
                            <SheetClose asChild key={result.id}>
                              <div
                                className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                                onClick={() => handleResultClick(result.id)}
                              >
                                <p className="font-medium">{result.name}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  in {result.category.replace('-', ' ')}
                                </p>
                              </div>
                            </SheetClose>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <nav className="space-y-4">
                      <SheetClose asChild>
                        <Link 
                          to="/" 
                          className="block py-1 text-gray-700 dark:text-gray-200 hover:text-tech-blue dark:hover:text-tech-blue-light transition-colors"
                        >
                          Home
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link 
                          to="/products" 
                          className="block py-1 text-gray-700 dark:text-gray-200 hover:text-tech-blue dark:hover:text-tech-blue-light transition-colors"
                        >
                          Products
                        </Link>
                      </SheetClose>
                      {isAuthenticated && (
                        <SheetClose asChild>
                          <Link 
                            to="/orders" 
                            className="block py-1 text-gray-700 dark:text-gray-200 hover:text-tech-blue dark:hover:text-tech-blue-light transition-colors"
                          >
                            Orders
                          </Link>
                        </SheetClose>
                      )}
                    </nav>
                  </div>
                  
                  <div className="mt-auto border-t pt-4">
                    {isAuthenticated ? (
                      <div className="space-y-2">
                        <div className="px-1 py-2">
                          <p className="font-medium">{user?.name}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
                        </div>
                        {user?.isAdmin && (
                          <SheetClose asChild>
                            <Link 
                              to="/admin" 
                              className="block py-1 text-gray-700 dark:text-gray-200 hover:text-tech-blue dark:hover:text-tech-blue-light transition-colors"
                            >
                              Admin Dashboard
                            </Link>
                          </SheetClose>
                        )}
                        <Button 
                          variant="outline" 
                          onClick={handleLogout} 
                          className="w-full"
                        >
                          Logout
                        </Button>
                      </div>
                    ) : (
                      <SheetClose asChild>
                        <Button asChild className="w-full">
                          <Link to="/login">Login / Register</Link>
                        </Button>
                      </SheetClose>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
