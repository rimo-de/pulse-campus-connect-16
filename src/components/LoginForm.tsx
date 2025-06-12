
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, Lock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const success = await login(email, password);
    if (!success) {
      setError('Invalid email or password. Try password123 for any demo account.');
    }
  };

  const demoAccounts = [
    { email: 'admin@digital4pulse.edu', role: 'Admin' },
    { email: 'student@digital4pulse.edu', role: 'Student' },
    { email: 'trainer@digital4pulse.edu', role: 'Trainer' }
  ];

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-6 animate-fade-in">
        {/* Header Section - removed graduation cap logo */}
        <div className="text-center space-y-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold edu-gradient-text tracking-tight">Digital4 Pulse</h1>
            <p className="text-base text-gray-600 font-medium">Sign in to your account</p>
          </div>
        </div>

        {/* Main Login Card */}
        <Card className="edu-shadow border-0 glass-card">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Input */}
              <div className="space-y-2">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email address"
                    className="h-12 pl-10 text-sm border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="h-12 pl-10 text-sm border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                    required
                  />
                </div>
              </div>
              
              {error && (
                <Alert variant="destructive" className="rounded-lg">
                  <AlertDescription className="text-sm">{error}</AlertDescription>
                </Alert>
              )}
              
              {/* Sign In Button */}
              <Button 
                type="submit" 
                className="w-full h-12 text-base font-semibold rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 transition-all duration-300 hover-scale" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>

            {/* Sign up link */}
            <div className="mt-5 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <span className="text-blue-600 font-semibold hover:text-blue-800 cursor-pointer transition-colors">
                  Sign up
                </span>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Demo Accounts Card */}
        <Card className="edu-shadow border-0 glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-gray-800">Demo Accounts</CardTitle>
            <CardDescription className="text-xs text-gray-600">
              Click on any email below to auto-fill, then use password: password123
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {demoAccounts.map((account) => (
                <div key={account.email} className="demo-account-card">
                  <div className="flex flex-col">
                    <span className="demo-account-role">{account.role}</span>
                    <span className="demo-account-email">{account.email}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEmail(account.email)}
                    className="demo-account-button"
                  >
                    Use
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginForm;
