
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { useAuth } from '@/contexts/AuthContext';
import TrainerSidebar from '@/components/trainer/TrainerSidebar';
import TrainerContent from '@/components/trainer/TrainerContent';

const TrainerDashboard = () => {
  const { user, logout } = useAuth();
  const [activeSection, setActiveSection] = useState('dashboard');

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full">
        <TrainerSidebar 
          activeSection={activeSection} 
          onSectionChange={setActiveSection}
        />
        
        <SidebarInset className="flex-1">
          {/* Header */}
          <header className="bg-white border-b border-gray-200 edu-shadow sticky top-0 z-10">
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <SidebarTrigger className="hover-scale" />
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      Welcome back, {user?.name}
                    </h2>
                    <p className="text-sm text-gray-500">Manage your courses and students</p>
                  </div>
                </div>
                <Button variant="outline" onClick={logout} className="hover-scale">
                  Sign Out
                </Button>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="p-6 gradient-bg min-h-[calc(100vh-80px)]">
            <div className="max-w-7xl mx-auto animate-fade-in">
              <TrainerContent activeSection={activeSection} />
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default TrainerDashboard;
