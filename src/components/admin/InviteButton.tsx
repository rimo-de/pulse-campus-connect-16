
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Mail, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { inviteService } from '@/services/inviteService';

interface InviteButtonProps {
  name: string;
  email: string;
  userType: 'student' | 'trainer';
  size?: 'sm' | 'default';
  onSuccess?: () => void;
}

const InviteButton = ({ name, email, userType, size = 'sm', onSuccess }: InviteButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleInvite = async () => {
    setIsLoading(true);
    
    try {
      console.log(`Initiating invite for ${userType}:`, { name, email });
      
      const result = await inviteService.inviteUser({
        name,
        email,
        userType
      });

      if (result.success) {
        toast({
          title: "Invitation Sent",
          description: result.error 
            ? `User created but ${result.error.toLowerCase()}` 
            : `Invite email sent to ${email} successfully. They can now log in with their credentials.`,
        });
        
        // Call onSuccess callback if provided
        if (onSuccess) {
          onSuccess();
        }
      } else {
        toast({
          title: "Invitation Failed",
          description: result.error || "Failed to send invitation",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Unexpected error in invite process:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while sending the invitation",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      size={size}
      variant="ghost"
      onClick={handleInvite}
      disabled={isLoading}
      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 disabled:opacity-50"
      title={`Send invite to ${name} (${email})`}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Mail className="w-4 h-4" />
      )}
    </Button>
  );
};

export default InviteButton;
