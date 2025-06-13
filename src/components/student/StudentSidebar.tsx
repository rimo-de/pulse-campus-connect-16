
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
  BookOpen,
  FileText,
  BarChart3,
  Calendar,
  Award,
  Users,
  Settings,
  Clock,
  GraduationCap,
  PlayCircle,
  MessageCircle,
  Bell,
  User
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface StudentSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const StudentSidebar = ({ activeSection, onSectionChange }: StudentSidebarProps) => {
  const { user } = useAuth();

  const navigationGroups = [
    {
      label: "Overview",
      items: [
        { id: "dashboard", title: "Dashboard", icon: LayoutDashboard },
      ]
    },
    {
      label: "Learning",
      items: [
        { id: "my-courses", title: "My Courses", icon: BookOpen },
        { id: "assignments", title: "Assignments", icon: FileText },
        { id: "study-materials", title: "Study Materials", icon: PlayCircle },
        { id: "progress-tracking", title: "Progress Tracking", icon: BarChart3 },
      ]
    },
    {
      label: "Schedule",
      items: [
        { id: "class-schedule", title: "Class Schedule", icon: Calendar },
        { id: "upcoming-events", title: "Upcoming Events", icon: Clock },
        { id: "calendar-view", title: "Calendar View", icon: Calendar },
      ]
    },
    {
      label: "Academic",
      items: [
        { id: "grades-results", title: "Grades & Results", icon: Award },
        { id: "certificates", title: "Certificates", icon: GraduationCap },
      ]
    },
    {
      label: "Community",
      items: [
        { id: "study-groups", title: "Study Groups", icon: Users },
        { id: "forums", title: "Forums", icon: MessageCircle },
      ]
    },
    {
      label: "Settings",
      items: [
        { id: "profile", title: "Profile", icon: User },
        { id: "notifications", title: "Notifications", icon: Bell },
        { id: "preferences", title: "Preferences", icon: Settings },
      ]
    }
  ];

  return (
    <Sidebar className="border-r border-gray-200">
      <SidebarHeader className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-r from-green-500 to-blue-500 p-2 rounded-lg">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold edu-gradient-text">Digital4 Pulse</h1>
            <p className="text-xs text-gray-500">Student Portal</p>
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
            <p className="text-xs text-gray-500">Student</p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default StudentSidebar;
