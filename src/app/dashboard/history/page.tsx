import { PageHeader } from '@/components/shared/PageHeader';
import { HistoryTable } from '@/components/history/HistoryTable';

export default function HistoryPage() {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Sign-In/Sign-Out History"
        description="Track staff presence with detailed timestamps and camera information."
      />
      <HistoryTable />
    </div>
  );
}
