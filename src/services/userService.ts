
import { supabase } from '@/integrations/supabase/client';

export interface Role {
  id: string;
  role_name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface AppUser {
  id: string;
  email: string;
  name: string;
  role_id: string;
  password_hash: string;
  status: 'active' | 'inactive';
  last_login_date: string | null;
  created_at: string;
  updated_at: string;
  role?: Role;
}

export interface CreateUserRequest {
  email: string;
  name: string;
  role_id: string;
  password: string;
  status?: 'active' | 'inactive';
}

export interface UpdateUserRequest {
  email?: string;
  name?: string;
  role_id?: string;
  status?: 'active' | 'inactive';
}

export const userService = {
  async getAllUsers(): Promise<AppUser[]> {
    const { data, error } = await supabase
      .from('app_users')
      .select(`
        *,
        role:roles (*)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching users:', error);
      throw new Error('Failed to fetch users');
    }

    return (data || []).map(user => ({
      ...user,
      status: user.status as 'active' | 'inactive'
    }));
  },

  async getAllRoles(): Promise<Role[]> {
    const { data, error } = await supabase
      .from('roles')
      .select('*')
      .order('role_name');

    if (error) {
      console.error('Error fetching roles:', error);
      throw new Error('Failed to fetch roles');
    }

    return data || [];
  },

  async createUser(userData: CreateUserRequest): Promise<AppUser> {
    // Simple password hashing (in production, use proper bcrypt)
    const password_hash = btoa(userData.password); // Base64 encoding as simple hash

    const { data, error } = await supabase
      .from('app_users')
      .insert({
        email: userData.email,
        name: userData.name,
        role_id: userData.role_id,
        password_hash,
        status: userData.status || 'active'
      })
      .select(`
        *,
        role:roles (*)
      `)
      .single();

    if (error) {
      console.error('Error creating user:', error);
      throw new Error('Failed to create user');
    }

    return {
      ...data,
      status: data.status as 'active' | 'inactive'
    };
  },

  async updateUser(userId: string, userData: UpdateUserRequest): Promise<AppUser> {
    const { data, error } = await supabase
      .from('app_users')
      .update(userData)
      .eq('id', userId)
      .select(`
        *,
        role:roles (*)
      `)
      .single();

    if (error) {
      console.error('Error updating user:', error);
      throw new Error('Failed to update user');
    }

    return {
      ...data,
      status: data.status as 'active' | 'inactive'
    };
  },

  async deleteUser(userId: string): Promise<void> {
    const { error } = await supabase
      .from('app_users')
      .delete()
      .eq('id', userId);

    if (error) {
      console.error('Error deleting user:', error);
      throw new Error('Failed to delete user');
    }
  },

  async updateUserStatus(userId: string, status: 'active' | 'inactive'): Promise<void> {
    const { error } = await supabase
      .from('app_users')
      .update({ status })
      .eq('id', userId);

    if (error) {
      console.error('Error updating user status:', error);
      throw new Error('Failed to update user status');
    }
  }
};
