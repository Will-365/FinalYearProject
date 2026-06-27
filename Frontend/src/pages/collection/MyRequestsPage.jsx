import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAppToast } from '@/hooks/useAppToast';
import { collectionService } from '@/services/collectionService';
import { RequestCard } from '@/components/collection/RequestCard';
import { ConfirmModal } from '@/components/ui/Modal';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { Pagination } from '@/components/ui/Pagination';
import { Tabs, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Truck } from 'lucide-react';

const STATUS_TABS = [
  { id: '', label: 'All' },
  { id: 'pending', label: 'Pending' },
  { id: 'assigned', label: 'Assigned' },
  { id: 'in_progress', label: 'In Progress' },
  { id: 'completed', label: 'Completed' },
  { id: 'cancelled', label: 'Cancelled' },
];

export function MyRequestsPage({ onNavigate }) {
  const { success, error, warning } = useAppToast();
  const [status, setStatus] = useState('');
  const [requests, setRequests] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [cancelId, setCancelId] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [markReadyLoading, setMarkReadyLoading] = useState(false);

  const loadRequests = useCallback(async (p = 1, st = status) => {
    setLoading(true);
    try {
      const data = await collectionService.getMyRequests({ status: st, page: p, limit: 10 });
      setRequests(data.requests || data.items || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setPage(p);
    } catch (err) {
      error(err.message);
    } finally {
      setLoading(false);
    }
  }, [status, error]);

  useEffect(() => {
    loadRequests(1, status);
  }, [status, loadRequests]);

  const handleCancel = async () => {
    if (!cancelId) return;
    setCancelLoading(true);
    try {
      await collectionService.cancelRequest(cancelId);
      success('Request cancelled');
      setCancelId(null);
      loadRequests(page, status);
    } catch (err) {
      if (err.message?.toLowerCase().includes('cancel')) {
        warning(err.message);
      } else {
        error(err.message);
      }
    } finally {
      setCancelLoading(false);
    }
  };

  const handleMarkReady = async (id) => {
    setMarkReadyLoading(true);
    try {
      await collectionService.confirmCollection(id);
      success('Marked as ready! Awaiting admin approval.');
      loadRequests(page, status);
    } catch (err) {
      error(err.message);
    } finally {
      setMarkReadyLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Requests</h1>
          <p className="text-slate-500">Track and manage your pickup requests</p>
        </div>
        <button
          type="button"
          onClick={() => onNavigate?.('collection-request')}
          className="rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700"
        >
          New Request
        </button>
      </div>

      <Tabs value={status || 'all'} onValueChange={(v) => setStatus(v === 'all' ? '' : v)}>
        <TabsList className="flex h-auto flex-wrap gap-1 rounded-xl bg-slate-100 p-1">
          {STATUS_TABS.map((tab) => (
            <TabsTrigger
              key={tab.id || 'all'}
              value={tab.id || 'all'}
              className="rounded-lg text-xs sm:text-sm"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {loading ? (
        <CardSkeleton count={4} />
      ) : requests.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
          <Truck className="mx-auto h-12 w-12 text-slate-300" />
          <p className="mt-3 font-semibold text-slate-900">No requests found</p>
          <p className="text-sm text-slate-500">Submit a pickup request to get started</p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {requests.map((req) => (
              <RequestCard
                key={req._id || req.id}
                request={req}
                onCancel={setCancelId}
                onMarkReady={handleMarkReady}
                cancelLoading={cancelLoading}
                markReadyLoading={markReadyLoading}
              />
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={(p) => loadRequests(p, status)} loading={loading} />
        </>
      )}

      <ConfirmModal
        open={Boolean(cancelId)}
        onClose={() => setCancelId(null)}
        onConfirm={handleCancel}
        loading={cancelLoading}
        title="Cancel request?"
        message="Are you sure you want to cancel this request? This cannot be undone."
        confirmLabel="Yes, cancel"
        variant="danger"
      />
    </div>
  );
}
