
import { supabase } from '@/integrations/supabase/client';
import { userService } from './userService';

interface InviteUserData {
  name: string;
  email: string;
  userType: 'student' | 'trainer';
}

export const inviteService = {
  // Generate a temporary password
  generateTempPassword(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 12; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  },

  // Get role ID by role name
  async getRoleId(roleName: string): Promise<string | null> {
    try {
      const roles = await userService.getAllRoles();
      const role = roles.find(r => r.role_name === roleName);
      return role?.id || null;
    } catch (error) {
      console.error('Error getting role ID:', error);
      return null;
    }
  },

  // Send invite email
  async sendInviteEmail(userData: InviteUserData, tempPassword: string): Promise<boolean> {
    try {
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

      return data?.success || false;
    } catch (error) {
      console.error('Error invoking email function:', error);
      return false;
    }
  },

  // Create user and send invite
  async inviteUser(userData: InviteUserData): Promise<{ success: boolean; error?: string }> {
    try {
      // Generate temporary password
      const tempPassword = this.generateTempPassword();
      
      // Get role ID based on user type
      const roleId = await this.getRoleId(userData.userType);
      if (!roleId) {
        return { success: false, error: `Role '${userData.userType}' not found` };
      }

      // Create user record
      const newUser = await userService.createUser({
        email: userData.email,
        name: userData.name,
        role_id: roleId,
        password: tempPassword,
        status: 'active'
      });

      // Send invite email
      const emailSent = await this.sendInviteEmail(userData, tempPassword);
      
      if (!emailSent) {
        // If email fails, we should still return success since user was created
        console.warn('User created but email failed to send');
      }

      return { success: true };
    } catch (error) {
      console.error('Error inviting user:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to invite user'
      };
    }
  }
};
