
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, GraduationCap, Mail, Lock } from 'lucide-react';
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
      <div className="w-full max-w-lg space-y-8 animate-fade-in">
        {/* Header Section */}
        <div className="text-center space-y-6">
          <div className="flex justify-center mb-6">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-4 rounded-2xl hover-scale">
              <GraduationCap className="w-12 h-12 text-white" />
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-5xl font-bold edu-gradient-text tracking-tight">Digital4 Pulse</h1>
            <p className="text-xl text-gray-600 font-medium">Sign in to your account</p>
          </div>
        </div>

        {/* Main Login Card */}
        <Card className="edu-shadow border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Input */}
              <div className="space-y-3">
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email address"
                    className="h-14 pl-12 text-lg border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-3">
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="h-14 pl-12 text-lg border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                    required
                  />
                </div>
              </div>
              
              {error && (
                <Alert variant="destructive" className="rounded-xl">
                  <AlertDescription className="text-sm">{error}</AlertDescription>
                </Alert>
              )}
              
              {/* Sign In Button */}
              <Button 
                type="submit" 
                className="w-full h-14 text-lg font-semibold rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 transition-all duration-300 hover-scale" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>

            {/* Sign up link */}
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Don't have an account?{' '}
                <span className="text-blue-600 font-semibold hover:text-blue-800 cursor-pointer transition-colors">
                  Sign up
                </span>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Demo Accounts Card */}
        <Card className="edu-shadow border-0 bg-white/60 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-gray-800">Demo Accounts</CardTitle>
            <CardDescription className="text-sm text-gray-600">
              Click on any email below to auto-fill, then use password: password123
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {demoAccounts.map((account) => (
                <div key={account.email} className="flex justify-between items-center p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-800">{account.role}</span>
                    <span className="text-sm text-gray-600">{account.email}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEmail(account.email)}
                    className="hover-scale rounded-lg"
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
