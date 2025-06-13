
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
  Users,
  FileText,
  BarChart3,
  Calendar,
  GraduationCap,
  PlusCircle,
  UserCheck,
  ClipboardCheck,
  MessageSquare,
  TrendingUp,
  Library,
  Settings,
  UserPlus,
  Clock
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface TrainerSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const TrainerSidebar = ({ activeSection, onSectionChange }: TrainerSidebarProps) => {
  const { user } = useAuth();

  const navigationGroups = [
    {
      label: "Overview",
      items: [
        { id: "dashboard", title: "Dashboard", icon: LayoutDashboard },
      ]
    },
    {
      label: "Course Management",
      items: [
        { id: "my-courses", title: "My Courses", icon: BookOpen },
        { id: "create-course", title: "Create Course", icon: PlusCircle },
        { id: "course-materials", title: "Course Materials", icon: Library },
        { id: "class-schedule", title: "Class Schedule", icon: Calendar },
      ]
    },
    {
      label: "Student Management",
      items: [
        { id: "student-list", title: "Student List", icon: Users },
        { id: "student-progress", title: "Student Progress", icon: TrendingUp },
        { id: "attendance", title: "Attendance", icon: UserCheck },
        { id: "communications", title: "Communications", icon: MessageSquare },
      ]
    },
    {
      label: "Assessment",
      items: [
        { id: "create-assignments", title: "Create Assignments", icon: FileText },
        { id: "grade-assignments", title: "Grade Assignments", icon: ClipboardCheck },
        { id: "quizzes-exams", title: "Quizzes & Exams", icon: FileText },
      ]
    },
    {
      label: "Analytics",
      items: [
        { id: "performance-reports", title: "Performance Reports", icon: BarChart3 },
        { id: "course-analytics", title: "Course Analytics", icon: TrendingUp },
        { id: "student-insights", title: "Student Insights", icon: Users },
      ]
    },
    {
      label: "Resources",
      items: [
        { id: "content-library", title: "Content Library", icon: Library },
        { id: "shared-resources", title: "Shared Resources", icon: BookOpen },
        { id: "settings", title: "Settings", icon: Settings },
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
            <p className="text-xs text-gray-500">Trainer Portal</p>
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
            <p className="text-xs text-gray-500">Trainer</p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default TrainerSidebar;
