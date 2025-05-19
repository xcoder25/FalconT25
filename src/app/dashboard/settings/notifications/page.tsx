import { PageHeader } from '@/components/shared/PageHeader';
import { NotificationSettingsForm } from '@/components/settings/NotificationSettingsForm';

export default function NotificationSettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Notification Settings"
        description="Customize your alert preferences for system events and recognitions."
      />
      <NotificationSettingsForm />
    </div>
  );
}
