
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Edit3, Trash2, Users, KeyRound, ShieldCheck } from 'lucide-react';

// Mock data - in a real app, this would come from a backend
const mockRoles = [
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
];


export default function RolesAndPermissionsPage() {
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
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="roleName">Role Name</Label>
              <Input id="roleName" placeholder="e.g., HR Specialist" />
            </div>
            <div>
              <Label htmlFor="roleDescription">Description</Label>
              <Input id="roleDescription" placeholder="Briefly describe the role's purpose" />
            </div>
            <Button className="w-full">
              <PlusCircle className="mr-2 h-4 w-4" /> Add Role
            </Button>
          </CardContent>
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
                {mockRoles.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell className="font-medium">{role.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{role.description}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="outline" size="icon" className="h-8 w-8">
                        <Edit3 className="h-4 w-4" />
                        <span className="sr-only">Edit Role</span>
                      </Button>
                      <Button variant="destructive" size="icon" className="h-8 w-8">
                        <Trash2 className="h-4 w-4" />
                         <span className="sr-only">Delete Role</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                 {mockRoles.length === 0 && (
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
          <CardTitle className="flex items-center gap-2"><ShieldCheck size={20} /> Permission Assignment (Example for "Manager" Role)</CardTitle>
          <CardDescription>
            Select permissions to assign to the highlighted role. This is a conceptual representation.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
            <p className="text-sm font-medium">Permissions for: <span className="text-primary">Manager</span></p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-h-60 overflow-y-auto p-1 rounded-md border">
                {mockPermissions.map(permission => (
                    <div key={permission.id} className="flex items-center space-x-2 p-2 hover:bg-muted/50 rounded">
                        <Checkbox 
                            id={`perm-${permission.id}`} 
                            defaultChecked={['perm_manage_staff', 'perm_view_reports', 'perm_nominate_colleague'].includes(permission.id)} // Mock checked state
                        />
                        <Label htmlFor={`perm-${permission.id}`} className="text-sm font-normal cursor-pointer">
                            {permission.label}
                        </Label>
                    </div>
                ))}
            </div>
            <Button>
                <KeyRound className="mr-2 h-4 w-4" /> Save Permissions for Manager
            </Button>
        </CardContent>
      </Card>
    </div>
  );
}
