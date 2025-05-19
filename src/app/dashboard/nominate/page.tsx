import { PageHeader } from '@/components/shared/PageHeader';
import { NominationForm } from '@/components/recognition/NominationForm';

export default function NominatePage() {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Nominate a Colleague" 
        description="Acknowledge the hard work and positive impact of your peers." 
      />
      <NominationForm />
    </div>
  );
}
