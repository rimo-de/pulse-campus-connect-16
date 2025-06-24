
import React, { useState } from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  LayoutDashboard,
  Users,
  UserPlus,
  BookOpen,
  Calendar,
  GraduationCap,
  Download,
  Plus,
  Minus,
  Package,
  Eye
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface AdminSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const AdminSidebar = ({ activeSection, onSectionChange }: AdminSidebarProps) => {
  const { user } = useAuth();
  const [openSections, setOpenSections] = useState({
    students: true,
    trainers: true,
    courses: true,
    assets: true,
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const navigationItems = [
    {
      id: "dashboard",
      title: "Dashboard",
      icon: LayoutDashboard,
      type: "single" as const
    }
  ];

  const collapsibleGroups = [
    {
      key: "students" as const,
      label: "Students",
      icon: Users,
      items: [
        { id: "students", title: "Maintain Students", icon: Users }
      ]
    },
    {
      key: "trainers" as const,
      label: "Trainers", 
      icon: UserPlus,
      items: [
        { id: "trainers", title: "Maintain Trainers", icon: UserPlus }
      ]
    },
    {
      key: "courses" as const,
      label: "Courses",
      icon: BookOpen,
      items: [
        { id: "courses", title: "Courses", icon: BookOpen },
        { id: "schedules", title: "Schedules", icon: Calendar },
        { id: "assets", title: "Assets", icon: Download }
      ]
    },
    {
      key: "assets" as const,
      label: "Assets",
      icon: Package,
      items: [
        { id: "maintain-assets", title: "Maintain Assets", icon: Package },
        { id: "view-asset-assignments", title: "View Asset Assignments", icon: Eye }
      ]
    }
  ];

  return (
    <Sidebar className="border-r border-gray-200">
      <SidebarHeader className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-lg">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold edu-gradient-text">Digital4 Pulse</h1>
            <p className="text-xs text-gray-500">Admin Portal</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">
        {/* Single Dashboard Item */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => onSectionChange(item.id)}
                    isActive={activeSection === item.id}
                    className="w-full justify-start"
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Collapsible Groups */}
        {collapsibleGroups.map((group) => (
          <SidebarGroup key={group.key}>
            <Collapsible 
              open={openSections[group.key]} 
              onOpenChange={() => toggleSection(group.key)}
            >
              <CollapsibleTrigger asChild>
                <SidebarGroupLabel className="text-xs font-medium text-gray-500 px-2 py-1 cursor-pointer hover:text-gray-700 flex items-center justify-between group">
                  <div className="flex items-center space-x-2">
                    <group.icon className="w-4 h-4" />
                    <span>{group.label}</span>
                  </div>
                  {openSections[group.key] ? (
                    <Minus className="w-3 h-3 transition-transform group-hover:scale-110" />
                  ) : (
                    <Plus className="w-3 h-3 transition-transform group-hover:scale-110" />
                  )}
                </SidebarGroupLabel>
              </CollapsibleTrigger>
              
              <CollapsibleContent className="transition-all duration-200">
                <SidebarGroupContent className="ml-6">
                  <SidebarMenu>
                    {group.items.map((item) => (
                      <SidebarMenuItem key={item.id}>
                        <SidebarMenuButton
                          onClick={() => onSectionChange(item.id)}
                          isActive={activeSection === item.id}
                          className="w-full justify-start text-sm"
                        >
                          <item.icon className="w-3 h-3" />
                          <span>{item.title}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </Collapsible>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <Avatar className="w-8 h-8">
            <AvatarImage src={user?.avatar} alt={user?.name} />
            <AvatarFallback className="text-xs">
              {user?.name?.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
            <p className="text-xs text-gray-500">Administrator</p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AdminSidebar;
