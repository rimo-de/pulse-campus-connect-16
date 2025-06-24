
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User, AuthContextType } from '@/types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if we have a stored user session
    const storedUser = localStorage.getItem('digital4pulse_user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('digital4pulse_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('Attempting login for:', email);
      
      // Query the app_users table directly with role information
      const { data: userData, error } = await supabase
        .from('app_users')
        .select(`
          *,
          role:roles (*)
        `)
        .eq('email', email.toLowerCase().trim())
        .eq('status', 'active')
        .single();

      if (error) {
        console.error('Database query error:', error);
        return false;
      }

      if (!userData) {
        console.error('No user found with email:', email);
        return false;
      }

      // Simple password verification (decode base64 and compare)
      const storedPassword = atob(userData.password_hash);
      if (storedPassword !== password) {
        console.error('Invalid password');
        return false;
      }

      // Create user object
      const userObj: User = {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        role: userData.role?.role_name as 'admin' | 'student' | 'trainer',
        institutionId: 'digital4pulse',
        avatar: undefined
      };

      console.log('Login successful for user:', userObj);

      // Update last login date
      await supabase
        .from('app_users')
        .update({ last_login_date: new Date().toISOString() })
        .eq('id', userData.id);

      setUser(userObj);
      localStorage.setItem('digital4pulse_user', JSON.stringify(userObj));
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('digital4pulse_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
