
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

  // Get role ID by role name - simplified to only lookup existing roles
  async getRoleId(roleName: string): Promise<string | null> {
    try {
      console.log(`Looking up role: ${roleName}`);
      
      const { data: roles, error } = await supabase
        .from('roles')
        .select('*')
        .eq('role_name', roleName.toLowerCase())
        .limit(1);

      if (error) {
        console.error('Database error fetching role:', error);
        return null;
      }

      if (!roles || roles.length === 0) {
        console.error(`Role '${roleName}' not found in database. Available roles should include: admin, student, trainer`);
        return null;
      }

      console.log(`Found role ${roleName}:`, roles[0]);
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
  async sendInviteEmail(userData: InviteUserData, tempPassword: string): Promise<{ success: boolean; error?: string }> {
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
        console.error('Error invoking email function:', error);
        return { success: false, error: `Email service error: ${error.message}` };
      }

      if (!data?.success) {
        console.error('Email function returned failure:', data);
        return { success: false, error: data?.error || 'Email sending failed' };
      }

      console.log('Invite email sent successfully');
      return { success: true };
    } catch (error) {
      console.error('Unexpected error sending email:', error);
      return { success: false, error: 'Failed to send invitation email' };
    }
  },

  // Main invite function with enhanced error handling and rollback
  async inviteUser(userData: InviteUserData): Promise<InviteResult> {
    let createdUserId: string | null = null;
    
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

      // Get role ID based on user type
      const roleId = await this.getRoleId(userData.userType);
      if (!roleId) {
        console.error(`Failed to find role '${userData.userType}'`);
        return { 
          success: false, 
          error: `Role '${userData.userType}' not found. Please contact administrator to ensure required roles are configured.` 
        };
      }

      console.log('Creating user with role ID:', roleId);

      // Generate temporary password
      const tempPassword = this.generateTempPassword();
      console.log('Generated temporary password for:', userData.email);

      // Create user record
      const newUser = await userService.createUser({
        email: userData.email.toLowerCase(),
        name: userData.name,
        role_id: roleId,
        password: tempPassword,
        status: 'active'
      });

      createdUserId = newUser.id;
      console.log('User created successfully:', newUser.id);

      // Send invite email
      const emailResult = await this.sendInviteEmail(userData, tempPassword);
      
      if (!emailResult.success) {
        console.warn('User created but email failed to send for:', userData.email);
        return { 
          success: true, 
          userId: newUser.id,
          error: `User created successfully, but invitation email could not be sent: ${emailResult.error}. Please manually provide login credentials.` 
        };
      }

      console.log('Invite process completed successfully for:', userData.email);
      return { 
        success: true, 
        userId: newUser.id 
      };

    } catch (error) {
      console.error('Error in invite process:', error);
      
      // Rollback: Delete created user if email failed
      if (createdUserId) {
        try {
          console.log('Rolling back user creation due to error:', createdUserId);
          await userService.deleteUser(createdUserId);
          console.log('User rollback completed');
        } catch (rollbackError) {
          console.error('Failed to rollback user creation:', rollbackError);
        }
      }
      
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'An unexpected error occurred during the invite process'
      };
    }
  }
};
