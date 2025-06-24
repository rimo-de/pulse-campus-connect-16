
import { supabase } from '@/integrations/supabase/client';
import { userService } from './userService';

interface InviteUserData {
  name: string;
  email: string;
  userType: 'student' | 'trainer';
}

interface InviteResult {
  success: boolean;
  error?: string;
  userId?: string;
}

export const inviteService = {
  // Generate a secure temporary password
  generateTempPassword(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let result = '';
    for (let i = 0; i < 12; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  },

  // Get role ID by role name with improved error handling
  async getRoleId(roleName: string): Promise<string | null> {
    try {
      console.log(`Looking up role: ${roleName}`);
      
      const { data: roles, error } = await supabase
        .from('roles')
        .select('*')
        .eq('role_name', roleName.toLowerCase())
        .limit(1);

      if (error) {
        console.error('Error fetching role:', error);
        return null;
      }

      if (!roles || roles.length === 0) {
        console.error(`Role '${roleName}' not found in database`);
        // Try to create the role if it doesn't exist
        const { data: newRole, error: createError } = await supabase
          .from('roles')
          .insert({
            role_name: roleName.toLowerCase(),
            description: `${roleName.charAt(0).toUpperCase() + roleName.slice(1)} role`
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating role:', createError);
          return null;
        }

        console.log(`Created new role: ${roleName}`, newRole);
        return newRole.id;
      }

      console.log(`Found role ${roleName}:`, roles[0].id);
      return roles[0].id;
    } catch (error) {
      console.error('Unexpected error getting role ID:', error);
      return null;
    }
  },

  // Check if user already exists
  async checkUserExists(email: string): Promise<boolean> {
    try {
      const { data: users, error } = await supabase
        .from('app_users')
        .select('id')
        .eq('email', email.toLowerCase())
        .limit(1);

      if (error) {
        console.error('Error checking user existence:', error);
        return false;
      }

      return users && users.length > 0;
    } catch (error) {
      console.error('Error checking if user exists:', error);
      return false;
    }
  },

  // Send invite email with improved error handling
  async sendInviteEmail(userData: InviteUserData, tempPassword: string): Promise<boolean> {
    try {
      console.log('Sending invite email to:', userData.email);
      
      const { data, error } = await supabase.functions.invoke('send-invite-email', {
        body: {
          name: userData.name,
          email: userData.email,
          password: tempPassword,
          userType: userData.userType
        }
      });

      if (error) {
        console.error('Error sending invite email:', error);
        return false;
      }

      console.log('Invite email sent successfully:', data);
      return data?.success === true;
    } catch (error) {
      console.error('Error invoking email function:', error);
      return false;
    }
  },

  // Main invite function with comprehensive error handling
  async inviteUser(userData: InviteUserData): Promise<InviteResult> {
    try {
      console.log('Starting invite process for:', userData);

      // Check if user already exists
      const userExists = await this.checkUserExists(userData.email);
      if (userExists) {
        console.log('User already exists:', userData.email);
        return { 
          success: false, 
          error: 'A user with this email already exists in the system' 
        };
      }

      // Generate temporary password
      const tempPassword = this.generateTempPassword();
      console.log('Generated temporary password for:', userData.email);
      
      // Get role ID based on user type
      const roleId = await this.getRoleId(userData.userType);
      if (!roleId) {
        console.error(`Failed to get or create role '${userData.userType}'`);
        return { 
          success: false, 
          error: `Could not find or create role '${userData.userType}'. Please check your database configuration.` 
        };
      }

      console.log('Creating user with role ID:', roleId);

      // Create user record
      const newUser = await userService.createUser({
        email: userData.email.toLowerCase(),
        name: userData.name,
        role_id: roleId,
        password: tempPassword,
        status: 'active'
      });

      console.log('User created successfully:', newUser.id);

      // Send invite email
      const emailSent = await this.sendInviteEmail(userData, tempPassword);
      
      if (!emailSent) {
        console.warn('User created but email failed to send for:', userData.email);
        return { 
          success: true, 
          userId: newUser.id,
          error: 'User created successfully, but invitation email could not be sent. Please manually provide login credentials.' 
        };
      }

      console.log('Invite process completed successfully for:', userData.email);
      return { 
        success: true, 
        userId: newUser.id 
      };

    } catch (error) {
      console.error('Error in invite process:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'An unexpected error occurred during the invite process'
      };
    }
  }
};
