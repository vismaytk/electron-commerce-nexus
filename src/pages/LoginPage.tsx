
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const LoginPage = () => {
  const { login, signup, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get redirect path from location state or default to home
  const from = location.state?.from?.pathname || '/';
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoginSubmitting, setIsLoginSubmitting] = useState(false);
  
  // Register form state
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
  const [registerError, setRegisterError] = useState('');
  const [isRegisterSubmitting, setIsRegisterSubmitting] = useState(false);
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from, isLoading]);
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    
    if (!loginEmail || !loginPassword) {
      setLoginError('Please fill in all fields');
      return;
    }
    
    setIsLoginSubmitting(true);
    try {
      await login(loginEmail, loginPassword);
      // Navigation should happen automatically in the useEffect when isAuthenticated changes
    } catch (error: any) {
      setLoginError(error.message || 'Login failed');
      setIsLoginSubmitting(false);
    }
  };
  
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError('');
    
    if (!registerName || !registerEmail || !registerPassword || !registerConfirmPassword) {
      setRegisterError('Please fill in all fields');
      return;
    }
    
    if (registerPassword !== registerConfirmPassword) {
      setRegisterError('Passwords do not match');
      return;
    }
    
    if (registerPassword.length < 6) {
      setRegisterError('Password must be at least 6 characters');
      return;
    }
    
    setIsRegisterSubmitting(true);
    try {
      const result = await signup(registerEmail, registerPassword, registerName);
      
      // Check if signup was successful and user is now authenticated
      if (result && result.user) {
        // Navigation will happen in the useEffect when isAuthenticated becomes true
        // If useEffect doesn't trigger, we manually navigate
        if (!isAuthenticated) {
          navigate(from, { replace: true });
        }
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      setRegisterError(error.message || 'Registration failed');
    } finally {
      setIsRegisterSubmitting(false);
    }
  };
  
  return (
    <div className="container-custom py-12">
      <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-8">
          <h1 className="text-2xl font-display font-bold text-center mb-6">Welcome to ElectroNexus</h1>
          
          <Tabs defaultValue="login">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin}>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      disabled={isLoginSubmitting}
                      required
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-baseline">
                      <Label htmlFor="password">Password</Label>
                      <a 
                        href="#" 
                        className="text-sm text-tech-blue hover:text-tech-blue-dark dark:text-tech-blue-light dark:hover:text-tech-blue transition-colors"
                      >
                        Forgot password?
                      </a>
                    </div>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      disabled={isLoginSubmitting}
                      required
                    />
                  </div>
                  
                  {loginError && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>{loginError}</AlertDescription>
                    </Alert>
                  )}
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-tech-blue hover:bg-tech-blue-dark dark:bg-tech-blue dark:hover:bg-tech-blue-dark transition-colors"
                    disabled={isLoginSubmitting}
                  >
                    {isLoginSubmitting ? 'Logging in...' : 'Login'}
                  </Button>
                </div>
              </form>
              
              <div className="mt-6">
                <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                  For demo purposes, you can use:
                </p>
                <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                  User: user@example.com / Password: user123
                </p>
                <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                  Admin: admin@example.com / Password: admin123
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="register">
              <form onSubmit={handleRegister}>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter your name"
                      value={registerName}
                      onChange={(e) => setRegisterName(e.target.value)}
                      disabled={isRegisterSubmitting}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="register-email">Email</Label>
                    <Input
                      id="register-email"
                      type="email" 
                      placeholder="Enter your email"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      disabled={isRegisterSubmitting}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="register-password">Password</Label>
                    <Input
                      id="register-password"
                      type="password"
                      placeholder="Create a password"
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      disabled={isRegisterSubmitting}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="Confirm your password"
                      value={registerConfirmPassword}
                      onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                      disabled={isRegisterSubmitting}
                      required
                    />
                  </div>
                  
                  {registerError && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>{registerError}</AlertDescription>
                    </Alert>
                  )}
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-tech-blue hover:bg-tech-blue-dark dark:bg-tech-blue dark:hover:bg-tech-blue-dark transition-colors"
                    disabled={isRegisterSubmitting}
                  >
                    {isRegisterSubmitting ? 'Creating Account...' : 'Create Account'}
                  </Button>
                </div>
              </form>
            </TabsContent>
          </Tabs>
          
          <Separator className="my-6" />
          
          <div className="text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              By signing in or creating an account, you agree to our <a href="#" className="text-tech-blue hover:text-tech-blue-dark dark:text-tech-blue-light dark:hover:text-tech-blue transition-colors">Terms of Service</a> and <a href="#" className="text-tech-blue hover:text-tech-blue-dark dark:text-tech-blue-light dark:hover:text-tech-blue transition-colors">Privacy Policy</a>.
            </p>
            
            <Link to="/" className="text-tech-blue hover:text-tech-blue-dark dark:text-tech-blue-light dark:hover:text-tech-blue transition-colors">
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
