
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Mail, Loader2, AlertCircle } from 'lucide-react';
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
        if (result.error) {
          // User created but email had issues
          toast({
            title: "Partial Success",
            description: result.error,
            variant: "default",
          });
        } else {
          // Complete success
          toast({
            title: "Invitation Sent Successfully",
            description: `${name} has been invited as a ${userType}. They will receive login credentials via email.`,
          });
        }
        
        // Call onSuccess callback if provided
        if (onSuccess) {
          onSuccess();
        }
      } else {
        // Complete failure
        console.error('Invite failed:', result.error);
        toast({
          title: "Invitation Failed",
          description: result.error || "Failed to send invitation. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Unexpected error in invite process:', error);
      toast({
        title: "System Error",
        description: "An unexpected system error occurred. Please contact administrator if this persists.",
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
      title={`Send invite to ${name} (${email}) as ${userType}`}
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
