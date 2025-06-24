
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { inviteService } from '@/services/inviteService';

interface InviteButtonProps {
  name: string;
  email: string;
  userType: 'student' | 'trainer';
  size?: 'sm' | 'default';
}

const InviteButton = ({ name, email, userType, size = 'sm' }: InviteButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleInvite = async () => {
    setIsLoading(true);
    
    try {
      const result = await inviteService.inviteUser({
        name,
        email,
        userType
      });

      if (result.success) {
        toast({
          title: "Invitation Sent",
          description: `Invite email sent to ${email} successfully`,
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to send invitation",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
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
      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
      title={`Send invite to ${name}`}
    >
      <Mail className="w-4 h-4" />
    </Button>
  );
};

export default InviteButton;
