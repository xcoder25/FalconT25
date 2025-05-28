
'use client';

import React, { useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Edit3, Trash2, Users, KeyRound, ShieldCheck, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

interface Role {
  id: string;
  name: string;
  description: string;
}

// Mock data - in a real app, this would come from a backend
const initialMockRoles: Role[] = [
  { id: 'role_admin', name: 'Administrator', description: 'Full system access and configuration capabilities.' },
  { id: 'role_manager', name: 'Manager', description: 'Can manage staff, view reports, and approve recognitions.' },
  { id: 'role_staff', name: 'Staff Member', description: 'Can nominate colleagues and view recognition feed.' },
];

const mockPermissions = [
  { id: 'perm_view_dashboard', label: 'View Dashboard' },
  { id: 'perm_manage_staff', label: 'Manage Staff Profiles' },
  { id: 'perm_view_reports', label: 'View Reports & Analytics' },
  { id: 'perm_nominate_colleague', label: 'Nominate Colleagues' },
  { id: 'perm_approve_recognition', label: 'Approve Recognitions (if applicable)' },
  { id: 'perm_manage_settings', label: 'Manage System Settings' },
  { id: 'perm_view_audit_logs', label: 'View Audit Logs' },
  { id: 'perm_manage_payroll', label: 'Manage Payroll' },
  { id: 'perm_manage_roles', label: 'Manage Roles & Permissions'},
];

const roleFormSchema = z.object({
  name: z.string().min(2, 'Role name must be at least 2 characters.'),
  description: z.string().min(5, 'Description must be at least 5 characters.'),
});
type RoleFormValues = z.infer<typeof roleFormSchema>;


export default function RolesAndPermissionsPage() {
  const { toast } = useToast();
  const [roles, setRoles] = useState<Role[]>(initialMockRoles);
  const [isSubmittingNewRole, setIsSubmittingNewRole] = useState(false);
  const [selectedRoleForPermissions, setSelectedRoleForPermissions] = useState<Role | null>(initialMockRoles[1] || null); // Default to Manager for display

  const { control, handleSubmit, reset, formState: { errors } } = useForm<RoleFormValues>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: { name: '', description: '' },
  });

  const handleAddRole = async (data: RoleFormValues) => {
    setIsSubmittingNewRole(true);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call

    const newRole: Role = {
      id: `role_${data.name.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`,
      name: data.name,
      description: data.description,
    };
    setRoles(prevRoles => [newRole, ...prevRoles]);
    toast({
      title: 'Role Created (Simulated)',
      description: `The role "${data.name}" has been added.`,
    });
    reset();
    setIsSubmittingNewRole(false);
  };

  const handleEditRole = (role: Role) => {
    toast({
      title: 'Edit Role (Simulated)',
      description: `Editing functionality for "${role.name}" would be triggered here.`,
    });
  };

  const handleDeleteRole = (role: Role) => {
    if (window.confirm(`Are you sure you want to delete the role "${role.name}"? This is a simulated action.`)) {
      // Simulate deletion from local state for UI feedback
      setRoles(prevRoles => prevRoles.filter(r => r.id !== role.id));
      toast({
        title: 'Role Deleted (Simulated)',
        description: `The role "${role.name}" has been removed.`,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Roles &amp; Permissions Management"
        description="Define user roles and assign specific permissions to control access across the Falcon T25 system."
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><PlusCircle size={20} /> Create New Role</CardTitle>
            <CardDescription>Define a new role and its associated permissions.</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit(handleAddRole)}>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="roleName">Role Name</Label>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => <Input id="roleName" placeholder="e.g., HR Specialist" {...field} disabled={isSubmittingNewRole} />}
                />
                {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <Label htmlFor="roleDescription">Description</Label>
                 <Controller
                  name="description"
                  control={control}
                  render={({ field }) => <Input id="roleDescription" placeholder="Briefly describe the role's purpose" {...field} disabled={isSubmittingNewRole} />}
                />
                {errors.description && <p className="text-sm text-destructive mt-1">{errors.description.message}</p>}
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={isSubmittingNewRole}>
                {isSubmittingNewRole ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                 Add Role
              </Button>
            </CardFooter>
          </form>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Users size={20} /> Existing Roles</CardTitle>
            <CardDescription>Review and manage current roles within the system.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Role Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roles.length > 0 ? roles.map((role) => (
                  <TableRow key={role.id} onClick={() => setSelectedRoleForPermissions(role)} className="cursor-pointer hover:bg-muted/50">
                    <TableCell className="font-medium">{role.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{role.description}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="outline" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); handleEditRole(role); }}>
                        <Edit3 className="h-4 w-4" />
                        <span className="sr-only">Edit Role</span>
                      </Button>
                      <Button variant="destructive" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); handleDeleteRole(role); }}>
                        <Trash2 className="h-4 w-4" />
                         <span className="sr-only">Delete Role</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                )) : (
                    <TableRow>
                        <TableCell colSpan={3} className="h-24 text-center">No roles defined yet.</TableCell>
                    </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><ShieldCheck size={20} /> Permission Assignment</CardTitle>
          <CardDescription>
            Select permissions to assign to the chosen role. This is a conceptual representation.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {selectedRoleForPermissions ? (
            <>
                <p className="text-sm font-medium">Permissions for: <span className="text-primary">{selectedRoleForPermissions.name}</span></p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-h-60 overflow-y-auto p-2 rounded-md border">
                    {mockPermissions.map(permission => (
                        <div key={permission.id} className="flex items-center space-x-2 p-2 hover:bg-muted/50 rounded">
                            <Checkbox 
                                id={`perm-${permission.id}-${selectedRoleForPermissions.id}`} 
                                // Mock checked state based on role (example)
                                defaultChecked={
                                    (selectedRoleForPermissions.name === 'Administrator') ||
                                    (selectedRoleForPermissions.name === 'Manager' && ['perm_view_dashboard', 'perm_manage_staff', 'perm_view_reports', 'perm_nominate_colleague', 'perm_approve_recognition', 'perm_view_audit_logs'].includes(permission.id)) ||
                                    (selectedRoleForPermissions.name === 'Staff Member' && ['perm_view_dashboard', 'perm_nominate_colleague'].includes(permission.id))
                                }
                            />
                            <Label htmlFor={`perm-${permission.id}-${selectedRoleForPermissions.id}`} className="text-sm font-normal cursor-pointer">
                                {permission.label}
                            </Label>
                        </div>
                    ))}
                </div>
                <Button onClick={() => toast({title: "Save Permissions (Simulated)", description: `Permissions for ${selectedRoleForPermissions.name} would be saved here.`})}>
                    <KeyRound className="mr-2 h-4 w-4" /> Save Permissions for {selectedRoleForPermissions.name}
                </Button>
            </>
          ) : (
            <p className="text-muted-foreground">Select a role from the table above to see and assign permissions.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
