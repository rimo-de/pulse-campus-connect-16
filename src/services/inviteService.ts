
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

  // Get role ID by role name with better error handling
  async getRoleId(roleName: string): Promise<string | null> {
    try {
      console.log(`Getting role ID for: ${roleName}`);
      const roles = await userService.getAllRoles();
      console.log('Available roles:', roles);
      
      const role = roles.find(r => r.role_name.toLowerCase() === roleName.toLowerCase());
      if (!role) {
        console.error(`Role '${roleName}' not found in available roles:`, roles.map(r => r.role_name));
        return null;
      }
      
      console.log(`Found role ID for ${roleName}:`, role.id);
      return role.id;
    } catch (error) {
      console.error('Error getting role ID:', error);
      return null;
    }
  },

  // Check if user already exists
  async checkUserExists(email: string): Promise<boolean> {
    try {
      const users = await userService.getAllUsers();
      return users.some(user => user.email.toLowerCase() === email.toLowerCase());
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
      return data?.success || false;
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
        console.error(`Role '${userData.userType}' not found`);
        return { 
          success: false, 
          error: `Role '${userData.userType}' not found. Please ensure roles are properly configured.` 
        };
      }

      console.log('Creating user with role ID:', roleId);

      // Create user record
      const newUser = await userService.createUser({
        email: userData.email,
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
