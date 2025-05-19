import { PageHeader } from '@/components/shared/PageHeader';
import { CameraSettingsManager } from '@/components/settings/CameraSettingsManager';

export default function CameraSettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Camera Settings"
        description="Manage connected DVR cameras, add new ones, and control PTZ functions."
      />
      <CameraSettingsManager />
    </div>
  );
}
