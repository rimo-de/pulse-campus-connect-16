
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface PlaceholderContentProps {
  title: string;
  description: string;
  icon: React.ElementType;
}

const PlaceholderContent = ({ title, description, icon }: PlaceholderContentProps) => {
  const Icon = icon;
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold edu-gradient-text mb-2">{title}</h1>
        <p className="text-gray-600">{description}</p>
      </div>
      
      <Card className="edu-card text-center py-12">
        <CardContent>
          <div className="bg-gradient-to-r from-blue-100 to-purple-100 p-4 rounded-full w-fit mx-auto mb-4">
            <Icon className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Coming Soon</h3>
          <p className="text-gray-600 mb-4">This functionality is under development.</p>
          <Button className="edu-button">
            Get Notified
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlaceholderContent;
