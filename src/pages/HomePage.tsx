
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, Truck, Shield, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProductCard from '@/components/ProductCard';
import CategoryCard from '@/components/CategoryCard';
import Banner from '@/components/Banner';
import { PRODUCTS, CATEGORIES } from '@/data/products';

const HomePage = () => {
  const featuredProducts = PRODUCTS.filter(product => product.isFeatured);
  const newProducts = PRODUCTS.filter(product => product.isNew);

  return (
    <main>
      {/* Hero Section */}
      <section className="relative bg-navy text-white overflow-hidden">
        <div className="container-custom relative z-10 py-12 md:py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <span className="inline-block px-3 py-1 bg-tech-blue/20 text-tech-blue rounded-full text-sm font-medium">
                New Release
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold leading-tight">
                Discover Next-Gen <span className="text-tech-blue">Electronics</span>
              </h1>
              <p className="text-lg text-gray-300 max-w-lg">
                Experience the future with our premium selection of cutting-edge electronics. From smartphones to smart home devices, we've got it all.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button 
                  asChild 
                  size="lg" 
                  className="bg-tech-blue hover:bg-tech-blue-dark transition-colors"
                >
                  <Link to="/products">Shop Now</Link>
                </Button>
                <Button 
                  asChild
                  variant="outline" 
                  size="lg" 
                  className="border-white text-white hover:bg-white/10"
                >
                  <Link to="/categories">Browse Categories</Link>
                </Button>
              </div>
            </div>
            <div className="hidden md:block">
              <img 
                src="https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?q=80&w=2070&auto=format&fit=crop" 
                alt="Latest electronics" 
                className="max-w-full h-auto rounded-lg shadow-2xl"
              />
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-r from-navy via-navy to-transparent opacity-90"></div>
      </section>

      {/* Categories Section */}
      <section className="py-12 md:py-16 bg-gray-50">
        <div className="container-custom">
          <div className="flex justify-between items-center mb-8">
            <h2 className="section-title">Shop by Category</h2>
            <Link to="/categories" className="text-tech-blue hover:text-tech-blue-dark flex items-center transition-colors">
              View All <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
            {CATEGORIES.map(category => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-12 md:py-16">
        <div className="container-custom">
          <div className="flex justify-between items-center mb-8">
            <h2 className="section-title">Featured Products</h2>
            <Link to="/products?featured=true" className="text-tech-blue hover:text-tech-blue-dark flex items-center transition-colors">
              View All <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featuredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Banner */}
      <Banner 
        title="Summer Sale - Up to 40% Off"
        subtitle="Save big on the latest electronics and accessories."
        buttonText="Shop the Sale"
      />

      {/* New Arrivals */}
      <section className="py-12 md:py-16">
        <div className="container-custom">
          <div className="flex justify-between items-center mb-8">
            <h2 className="section-title">New Arrivals</h2>
            <Link to="/products?new=true" className="text-tech-blue hover:text-tech-blue-dark flex items-center transition-colors">
              View All <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {newProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Features/Benefits Section */}
      <section className="py-12 md:py-16 bg-gray-50">
        <div className="container-custom">
          <h2 className="section-title text-center mb-12">Why Choose ElectroNexus</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6 bg-white rounded-lg shadow-sm">
              <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-full bg-tech-blue/10 text-tech-blue mb-4">
                <Truck className="h-6 w-6" />
              </div>
              <h3 className="font-display font-medium text-lg mb-2">Free Shipping</h3>
              <p className="text-gray-600">On all orders over $99</p>
            </div>
            <div className="text-center p-6 bg-white rounded-lg shadow-sm">
              <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-full bg-tech-blue/10 text-tech-blue mb-4">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="font-display font-medium text-lg mb-2">Secure Payment</h3>
              <p className="text-gray-600">100% secure checkout</p>
            </div>
            <div className="text-center p-6 bg-white rounded-lg shadow-sm">
              <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-full bg-tech-blue/10 text-tech-blue mb-4">
                <CheckCircle className="h-6 w-6" />
              </div>
              <h3 className="font-display font-medium text-lg mb-2">Money Back Guarantee</h3>
              <p className="text-gray-600">30 day return policy</p>
            </div>
            <div className="text-center p-6 bg-white rounded-lg shadow-sm">
              <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-full bg-tech-blue/10 text-tech-blue mb-4">
                <Award className="h-6 w-6" />
              </div>
              <h3 className="font-display font-medium text-lg mb-2">Premium Quality</h3>
              <p className="text-gray-600">Authentic products only</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-12 md:py-16">
        <div className="container-custom">
          <h2 className="section-title text-center mb-4">Customer Testimonials</h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Don't just take our word for it. Here's what our customers have to say.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <div className="flex items-center text-yellow-500 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.62L12 2 9.19 8.62 2 9.24l5.45 4.73L5.82 21 12 17.27z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-700 mb-4">
                "The customer service is outstanding. I had an issue with my order and they resolved it immediately. Will definitely shop here again!"
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gray-300 rounded-full mr-3"></div>
                <div>
                  <h4 className="font-medium">Sarah Johnson</h4>
                  <p className="text-sm text-gray-500">Verified Customer</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <div className="flex items-center text-yellow-500 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.62L12 2 9.19 8.62 2 9.24l5.45 4.73L5.82 21 12 17.27z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-700 mb-4">
                "The laptop I purchased exceeded my expectations. Fast shipping and the price was much better than other retailers. Highly recommend!"
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gray-300 rounded-full mr-3"></div>
                <div>
                  <h4 className="font-medium">Michael Chen</h4>
                  <p className="text-sm text-gray-500">Verified Customer</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <div className="flex items-center text-yellow-500 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.62L12 2 9.19 8.62 2 9.24l5.45 4.73L5.82 21 12 17.27z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-700 mb-4">
                "The website is easy to navigate and the product descriptions are very detailed. My new headphones arrived quickly and work perfectly."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gray-300 rounded-full mr-3"></div>
                <div>
                  <h4 className="font-medium">David Rodriguez</h4>
                  <p className="text-sm text-gray-500">Verified Customer</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-12 md:py-16 bg-navy text-white">
        <div className="container-custom">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-display font-bold mb-4">Stay Updated</h2>
            <p className="text-gray-300 mb-6">
              Subscribe to our newsletter to get updates on our latest offers, new products, and tech news.
            </p>
            <form className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Your email address"
                className="flex-grow px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-tech-blue text-navy"
                required
              />
              <Button className="bg-tech-blue hover:bg-tech-blue-dark transition-colors">
                Subscribe
              </Button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
};

export default HomePage;
