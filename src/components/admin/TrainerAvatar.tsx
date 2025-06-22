
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Trainer } from '@/types/trainer';

interface TrainerAvatarProps {
  trainer: Trainer;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const TrainerAvatar = ({ trainer, size = 'md', className }: TrainerAvatarProps) => {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  };

  const getInitials = () => {
    return `${trainer.first_name.charAt(0)}${trainer.last_name.charAt(0)}`.toUpperCase();
  };

  return (
    <Avatar className={`${sizeClasses[size]} ${className || ''}`}>
      <AvatarImage 
        src={trainer.profile_image_url || undefined} 
        alt={`${trainer.first_name} ${trainer.last_name}`} 
      />
      <AvatarFallback className="bg-blue-100 text-blue-600 font-medium">
        {getInitials()}
      </AvatarFallback>
    </Avatar>
  );
};

export default TrainerAvatar;
