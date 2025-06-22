
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  BarChart3,
  Calendar,
  Settings,
  UserPlus,
  UserCheck,
  PlusCircle,
  BookOpenCheck,
  TrendingUp,
  FileText,
  Clock,
  Plus,
  HardDrive,
  FileImage,
  Folder
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface AdminSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const AdminSidebar = ({ activeSection, onSectionChange }: AdminSidebarProps) => {
  const { user } = useAuth();
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['students', 'trainers', 'courses']);

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => 
      prev.includes(groupId) 
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  const navigationGroups = [
    {
      id: "dashboard",
      label: "Dashboard",
      collapsible: false,
      items: [
        { id: "dashboard", title: "Dashboard", icon: LayoutDashboard },
      ]
    },
    {
      id: "students",
      label: "Students",
      collapsible: true,
      items: [
        { id: "maintain-students", title: "Maintain Students", icon: Users },
      ]
    },
    {
      id: "trainers",
      label: "Trainers",
      collapsible: true,
      items: [
        { id: "manage-trainers", title: "Manage Trainers", icon: GraduationCap },
        { id: "assigned-trainers", title: "Assigned Trainers", icon: Users },
      ]
    },
    {
      id: "courses",
      label: "Courses",
      collapsible: true,
      items: [
        { id: "create-course", title: "Maintain Course", icon: PlusCircle },
        { id: "course-schedule", title: "Course Schedule", icon: Calendar },
        { id: "view-enrolled-students", title: "View Enrolled Students", icon: UserCheck },
      ]
    },
    {
      id: "administration",
      label: "Administration",
      collapsible: true,
      items: [
        { id: "system-settings", title: "System Settings", icon: Settings },
        { id: "user-management", title: "User Management", icon: Users },
      ]
    },
    {
      id: "reporting",
      label: "Reporting",
      collapsible: true,
      items: [
        { id: "analytics", title: "Analytics", icon: BarChart3 },
        { id: "completion-rates", title: "Completion Rates", icon: TrendingUp },
        { id: "system-reports", title: "System Reports", icon: FileText },
      ]
    },
    {
      id: "events",
      label: "Events",
      collapsible: true,
      items: [
        { id: "schedule-events", title: "Schedule Events", icon: Calendar },
        { id: "calendar-view", title: "Calendar View", icon: Clock },
      ]
    },
    {
      id: "assets",
      label: "Assets",
      collapsible: true,
      items: [
        { id: "manage-assets", title: "Manage Assets", icon: HardDrive },
        { id: "media-library", title: "Media Library", icon: FileImage },
        { id: "file-storage", title: "File Storage", icon: Folder },
      ]
    }
  ];

  return (
    <Sidebar className="border-r border-gray-200">
      <SidebarHeader className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-2 rounded-lg">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold edu-gradient-text">Digital4 Pulse</h1>
            <p className="text-xs text-gray-500">Admin Panel</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">
        {navigationGroups.map((group) => {
          const isExpanded = expandedGroups.includes(group.id);
          const hasActiveItem = group.items.some(item => item.id === activeSection);
          
          if (!group.collapsible) {
            // Non-collapsible groups (like Dashboard)
            return (
              <SidebarGroup key={group.id}>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {group.items.map((item) => (
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
            );
          }

          return (
            <SidebarGroup key={group.id}>
              <Collapsible open={isExpanded} onOpenChange={() => toggleGroup(group.id)}>
                <CollapsibleTrigger asChild>
                  <SidebarGroupLabel className="text-xs font-medium text-gray-500 px-2 py-2 hover:text-gray-700 cursor-pointer flex items-center justify-between group">
                    <span>{group.label}</span>
                    <Plus className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-45' : ''}`} />
                  </SidebarGroupLabel>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-1">
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {group.items.map((item) => (
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
                </CollapsibleContent>
              </Collapsible>
            </SidebarGroup>
          );
        })}
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
