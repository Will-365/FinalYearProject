import { useAuth } from '@/hooks/useAuth';
import { RequestForm } from '@/components/collection/RequestForm';

export function CollectionRequestPage({ onNavigate }) {
  const { collectionPrefill, setCollectionPrefill } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Request Pickup</h1>
        <p className="text-slate-500">Schedule a waste collection at your convenience</p>
      </div>
      <RequestForm
        prefill={collectionPrefill}
        onSuccess={() => {
          setCollectionPrefill(null);
          onNavigate?.('my-requests');
        }}
      />
    </div>
  );
}
