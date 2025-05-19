import { PageHeader } from '@/components/shared/PageHeader';
import { StaffManagementTable } from '@/components/staff/StaffManagementTable';

export default function ManageStaffPage() {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Manage Staff"
        description="Add, edit, or remove staff members and manage their information."
      />
      <StaffManagementTable />
    </div>
  );
}
