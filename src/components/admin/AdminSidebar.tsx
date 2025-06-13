
import React from 'react';
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
  Clock
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface AdminSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const AdminSidebar = ({ activeSection, onSectionChange }: AdminSidebarProps) => {
  const { user } = useAuth();

  const navigationGroups = [
    {
      label: "Overview",
      items: [
        { id: "dashboard", title: "Dashboard", icon: LayoutDashboard },
      ]
    },
    {
      label: "Administration",
      items: [
        { id: "system-settings", title: "System Settings", icon: Settings },
        { id: "user-management", title: "User Management", icon: Users },
      ]
    },
    {
      label: "Students",
      items: [
        { id: "add-student", title: "Add Student", icon: UserPlus },
        { id: "view-students", title: "View Students", icon: UserCheck },
        { id: "enrollments", title: "Enrollments", icon: BookOpenCheck },
      ]
    },
    {
      label: "Trainers",
      items: [
        { id: "manage-trainers", title: "Manage Trainers", icon: GraduationCap },
        { id: "trainer-assignments", title: "Assignments", icon: Users },
      ]
    },
    {
      label: "Courses",
      items: [
        { id: "create-course", title: "Create Course", icon: PlusCircle },
        { id: "manage-courses", title: "Manage Courses", icon: BookOpen },
      ]
    },
    {
      label: "Reporting",
      items: [
        { id: "analytics", title: "Analytics", icon: BarChart3 },
        { id: "completion-rates", title: "Completion Rates", icon: TrendingUp },
        { id: "system-reports", title: "System Reports", icon: FileText },
      ]
    },
    {
      label: "Events",
      items: [
        { id: "schedule-events", title: "Schedule Events", icon: Calendar },
        { id: "calendar-view", title: "Calendar View", icon: Clock },
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
        {navigationGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel className="text-xs font-medium text-gray-500 px-2 py-1">
              {group.label}
            </SidebarGroupLabel>
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
