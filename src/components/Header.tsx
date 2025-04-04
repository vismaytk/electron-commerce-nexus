
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Search, Menu, X } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const Header = () => {
  const { cartCount } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="container-custom py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="text-2xl font-display font-bold text-navy">
            ElectroNexus
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-navy hover:text-tech-blue transition-colors duration-200">
              Home
            </Link>
            <Link to="/products" className="text-navy hover:text-tech-blue transition-colors duration-200">
              Products
            </Link>
            <Link to="/categories" className="text-navy hover:text-tech-blue transition-colors duration-200">
              Categories
            </Link>
            <Link to="/about" className="text-navy hover:text-tech-blue transition-colors duration-200">
              About
            </Link>
          </nav>

          {/* Search, Cart, User - Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            <form onSubmit={handleSearch} className="relative">
              <Input
                type="search"
                placeholder="Search products..."
                className="w-44 lg:w-64 pr-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="absolute right-2 top-1/2 transform -translate-y-1/2 text-silver">
                <Search size={18} />
              </button>
            </form>

            <Link to="/cart" className="relative">
              <ShoppingCart className="h-6 w-6 text-navy hover:text-tech-blue transition-colors duration-200" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-tech-blue text-white text-xs font-medium rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full bg-navy-light text-white">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer" asChild>
                    <Link to="/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer" asChild>
                    <Link to="/orders">My Orders</Link>
                  </DropdownMenuItem>
                  {user?.isAdmin && (
                    <DropdownMenuItem className="cursor-pointer" asChild>
                      <Link to="/admin">Admin Dashboard</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer" onClick={logout}>
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/login">
                <Button variant="outline" size="sm">
                  Login
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-4">
            <Link to="/cart" className="relative">
              <ShoppingCart className="h-6 w-6 text-navy" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-tech-blue text-white text-xs font-medium rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
            <button onClick={toggleMenu} className="text-navy">
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden pt-4 pb-2 border-t mt-4 animate-fade-in">
            <form onSubmit={handleSearch} className="relative mb-4">
              <Input
                type="search"
                placeholder="Search products..."
                className="w-full pr-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="absolute right-2 top-1/2 transform -translate-y-1/2 text-silver">
                <Search size={18} />
              </button>
            </form>

            <nav className="flex flex-col space-y-3">
              <Link to="/" className="text-navy py-1" onClick={toggleMenu}>
                Home
              </Link>
              <Link to="/products" className="text-navy py-1" onClick={toggleMenu}>
                Products
              </Link>
              <Link to="/categories" className="text-navy py-1" onClick={toggleMenu}>
                Categories
              </Link>
              <Link to="/about" className="text-navy py-1" onClick={toggleMenu}>
                About
              </Link>

              {isAuthenticated ? (
                <>
                  <Link to="/profile" className="text-navy py-1" onClick={toggleMenu}>
                    My Profile
                  </Link>
                  <Link to="/orders" className="text-navy py-1" onClick={toggleMenu}>
                    My Orders
                  </Link>
                  {user?.isAdmin && (
                    <Link to="/admin" className="text-navy py-1" onClick={toggleMenu}>
                      Admin Dashboard
                    </Link>
                  )}
                  <button 
                    onClick={() => {
                      logout();
                      toggleMenu();
                    }} 
                    className="text-left text-navy py-1"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link to="/login" className="text-navy py-1" onClick={toggleMenu}>
                  Login / Register
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
