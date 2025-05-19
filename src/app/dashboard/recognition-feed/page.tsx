import { PageHeader } from '@/components/shared/PageHeader';
import { RecognitionCard } from '@/components/recognition/RecognitionCard';
import { mockRecognitions } from '@/lib/mockData';
import type { Recognition } from '@/lib/types';

export default function RecognitionFeedPage() {
  const sortedRecognitions = [...mockRecognitions].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Recognition Feed" 
        description="See the latest acts of appreciation and excellence across the team." 
      />
      
      {sortedRecognitions.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
          {sortedRecognitions.map((recognition: Recognition) => (
            <RecognitionCard key={recognition.id} recognition={recognition} />
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-muted-foreground">No recognitions yet. Be the first to appreciate someone!</p>
        </div>
      )}
    </div>
  );
}
