
import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, signup, isAuthenticated, user, isLoading } = useAuth();
  const from = location.state?.from || '/';
  
  // Form states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user && !isLoading) {
      console.log('User is authenticated, redirecting from login page to:', from);
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, user, isLoading, navigate, from]);
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginEmail || !loginPassword) {
      toast.error('Please enter both email and password');
      return;
    }
    
    try {
      setIsSubmitting(true);
      console.log('Attempting login with:', loginEmail);
      
      await login(loginEmail, loginPassword);
      // Redirection is handled by the useEffect hook above
      
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(`Login failed: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!signupName || !signupEmail || !signupPassword) {
      toast.error('Please fill out all fields');
      return;
    }
    
    if (signupPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }
    
    try {
      setIsSubmitting(true);
      console.log('Attempting signup with:', signupEmail);
      
      await signup(signupEmail, signupPassword, signupName);
      
      // Attempt login after signup
      await login(signupEmail, signupPassword);
      
      toast.success('Account created successfully! You are now logged in.');
      
      // Redirection is handled by the useEffect hook above
      
    } catch (error: any) {
      console.error('Signup error:', error);
      toast.error(`Signup failed: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // If already logged in, don't show the login page
  if (isAuthenticated && !isLoading) {
    return null;
  }
  
  return (
    <div className="container-custom flex items-center justify-center min-h-[80vh] py-8">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 border border-gray-200 dark:border-gray-700">
          <h1 className="text-2xl font-display font-bold text-center mb-6">Welcome to GADA ELECTRONICS</h1>
          
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid grid-cols-2 mb-6">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="you@example.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="login-password">Password</Label>
                  </div>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-tech-blue hover:bg-tech-blue-dark dark:bg-tech-blue dark:hover:bg-tech-blue-dark"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Logging in...' : 'Login'}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Full Name</Label>
                  <Input
                    id="signup-name"
                    placeholder="John Doe"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="you@example.com"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="••••••••"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    required
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Password must be at least 6 characters long
                  </p>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-tech-blue hover:bg-tech-blue-dark dark:bg-tech-blue dark:hover:bg-tech-blue-dark"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Creating Account...' : 'Create Account'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
          
          <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
