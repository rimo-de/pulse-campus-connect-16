
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Plus, Shield, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { userService, type Role } from '@/services/userService';
import { supabase } from '@/integrations/supabase/client';

const RoleManagement = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [formData, setFormData] = useState({ role_name: '', description: '' });
  const { toast } = useToast();

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    try {
      setIsLoading(true);
      const rolesData = await userService.getAllRoles();
      setRoles(rolesData);
    } catch (error) {
      console.error('Error loading roles:', error);
      toast({
        title: "Error",
        description: "Failed to load roles",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateRole = async () => {
    if (!formData.role_name.trim()) {
      toast({
        title: "Error",
        description: "Role name is required",
        variant: "destructive"
      });
      return;
    }

    try {
      console.log('Creating role with data:', formData);
      
      // Use RPC call to bypass RLS if needed, or use service role
      const { data, error } = await supabase.rpc('create_role', {
        p_role_name: formData.role_name.toLowerCase().trim(),
        p_description: formData.description.trim() || null
      });

      if (error) {
        console.error('RPC create_role error:', error);
        // Fallback to direct insert
        const { data: insertData, error: insertError } = await supabase
          .from('roles')
          .insert({
            role_name: formData.role_name.toLowerCase().trim(),
            description: formData.description.trim() || null
          })
          .select()
          .single();

        if (insertError) {
          throw insertError;
        }
      }

      toast({
        title: "Success",
        description: "Role created successfully"
      });

      setFormData({ role_name: '', description: '' });
      setShowCreateDialog(false);
      loadRoles();
    } catch (error: any) {
      console.error('Error creating role:', error);
      let errorMessage = "Failed to create role";
      
      if (error.message?.includes('duplicate key') || error.message?.includes('already exists')) {
        errorMessage = "A role with this name already exists";
      } else if (error.message?.includes('row-level security')) {
        errorMessage = "Permission denied. Please ensure you have admin access.";
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  const handleUpdateRole = async () => {
    if (!editingRole || !formData.role_name.trim()) return;

    try {
      const { error } = await supabase
        .from('roles')
        .update({
          role_name: formData.role_name.toLowerCase().trim(),
          description: formData.description.trim() || null
        })
        .eq('id', editingRole.id);

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Role updated successfully"
      });

      setEditingRole(null);
      setFormData({ role_name: '', description: '' });
      loadRoles();
    } catch (error: any) {
      console.error('Error updating role:', error);
      toast({
        title: "Error",
        description: "Failed to update role",
        variant: "destructive"
      });
    }
  };

  const handleDeleteRole = async (role: Role) => {
    try {
      // Check if role is in use
      const { data: usersWithRole } = await supabase
        .from('app_users')
        .select('id')
        .eq('role_id', role.id)
        .limit(1);

      if (usersWithRole && usersWithRole.length > 0) {
        toast({
          title: "Cannot Delete Role",
          description: "This role is currently assigned to users. Please reassign users before deleting.",
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase
        .from('roles')
        .delete()
        .eq('id', role.id);

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Role deleted successfully"
      });

      loadRoles();
    } catch (error) {
      console.error('Error deleting role:', error);
      toast({
        title: "Error",
        description: "Failed to delete role",
        variant: "destructive"
      });
    }
  };

  const openEditDialog = (role: Role) => {
    setEditingRole(role);
    setFormData({ role_name: role.role_name, description: role.description || '' });
  };

  const closeEditDialog = () => {
    setEditingRole(null);
    setFormData({ role_name: '', description: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Shield className="w-8 h-8 text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold edu-gradient-text">Role Management</h2>
            <p className="text-gray-600">Manage system roles and permissions</p>
          </div>
        </div>
      </div>

      <Card className="edu-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>System Roles</CardTitle>
              <CardDescription>Configure roles for different user types</CardDescription>
            </div>
            
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button className="flex items-center space-x-2">
                  <Plus className="w-4 h-4" />
                  <span>Create Role</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Role</DialogTitle>
                  <DialogDescription>Add a new role to the system</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Role Name</label>
                    <Input
                      value={formData.role_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, role_name: e.target.value }))}
                      placeholder="e.g., manager, instructor"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Description</label>
                    <Input
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Brief description of this role"
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateRole}>
                      Create Role
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading roles...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Role Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roles.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell className="font-medium capitalize">{role.role_name}</TableCell>
                    <TableCell>{role.description || 'No description'}</TableCell>
                    <TableCell>{new Date(role.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(role)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-red-600 hover:text-red-700"
                              disabled={['admin', 'student', 'trainer'].includes(role.role_name)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Role</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete the "{role.role_name}" role? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteRole(role)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Role Dialog */}
      <Dialog open={!!editingRole} onOpenChange={closeEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Role</DialogTitle>
            <DialogDescription>Update role information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Role Name</label>
              <Input
                value={formData.role_name}
                onChange={(e) => setFormData(prev => ({ ...prev, role_name: e.target.value }))}
                placeholder="e.g., manager, instructor"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of this role"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={closeEditDialog}>
                Cancel
              </Button>
              <Button onClick={handleUpdateRole}>
                Update Role
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RoleManagement;
