
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { userService, type Role, type AppUser, type CreateUserRequest, type UpdateUserRequest } from '@/services/userService';
import { useToast } from '@/hooks/use-toast';

interface UserFormProps {
  user?: AppUser;
  onSave: () => void;
  onCancel: () => void;
}

const UserForm = ({ user, onSave, onCancel }: UserFormProps) => {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    role_id: '',
    password: '',
    status: 'active' as 'active' | 'inactive'
  });
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadRoles();
    if (user) {
      setFormData({
        email: user.email,
        name: user.name,
        role_id: user.role_id,
        password: '', // Don't populate password for edit
        status: user.status
      });
    }
  }, [user]);

  const loadRoles = async () => {
    try {
      const rolesData = await userService.getAllRoles();
      setRoles(rolesData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load roles",
        variant: "destructive"
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (user) {
        // Update existing user
        const updateData: UpdateUserRequest = {
          email: formData.email,
          name: formData.name,
          role_id: formData.role_id,
          status: formData.status
        };
        await userService.updateUser(user.id, updateData);
        toast({
          title: "Success",
          description: "User updated successfully"
        });
      } else {
        // Create new user
        if (!formData.password) {
          toast({
            title: "Error",
            description: "Password is required for new users",
            variant: "destructive"
          });
          return;
        }
        const createData: CreateUserRequest = {
          email: formData.email,
          name: formData.name,
          role_id: formData.role_id,
          password: formData.password,
          status: formData.status
        };
        await userService.createUser(createData);
        toast({
          title: "Success",
          description: "User created successfully"
        });
      }
      onSave();
    } catch (error) {
      toast({
        title: "Error",
        description: user ? "Failed to update user" : "Failed to create user",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{user ? 'Edit User' : 'Create New User'}</CardTitle>
        <CardDescription>
          {user ? 'Update user information and role assignment' : 'Add a new user to the system'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={formData.role_id} onValueChange={(value) => setFormData(prev => ({ ...prev, role_id: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.role_name.charAt(0).toUpperCase() + role.role_name.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value: 'active' | 'inactive') => setFormData(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {!user && (
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                required={!user}
                placeholder="Enter password for new user"
              />
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : (user ? 'Update User' : 'Create User')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default UserForm;
