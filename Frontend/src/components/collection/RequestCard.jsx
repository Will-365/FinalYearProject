import { useState } from 'react';
import { formatDateWithSlot, wasteTypeConfig } from '@/utils/formatters';
import { StatusBadge, WasteTypeBadge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Phone, User, MapPin, Clock, CheckCircle2, Loader2 } from 'lucide-react';

export function RequestCard({
  request,
  onCancel,
  onMarkReady,
  cancelLoading,
  markReadyLoading,
}) {
  const [expanded, setExpanded] = useState(false);
  const id = request._id || request.id;
  const cfg = wasteTypeConfig[request.wasteType] || wasteTypeConfig.unknown;
  const canCancel = ['pending', 'assigned'].includes(request.status);
  const canMarkReady = request.status === 'in_progress' && !request.residentConfirmed;
  const isCompleted = request.status === 'completed';
  const adminApproved = request.adminApproved;

  // Approval status display for completed requests
  const ApprovalBadge = () => {
    if (!isCompleted) return null;
    if (adminApproved) {
      const pts = request.pointsAwarded || request.pointsEarned;
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Approved{pts ? ` — +${pts} pts` : ''}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
        <Clock className="h-3.5 w-3.5" />
        Awaiting Admin Approval
      </span>
    );
  };

  return (
    <>
      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="w-full text-left"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <span className="text-2xl">{cfg.icon}</span>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <WasteTypeBadge type={request.wasteType} />
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold capitalize">
                    {request.quantity}
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-600">
                  {formatDateWithSlot(request.preferredDate, request.preferredTimeSlot)}
                </p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <StatusBadge status={request.status} />
              <ApprovalBadge />
            </div>
          </div>
        </button>

        <div className="mt-4 flex flex-wrap gap-2">
          {canCancel && (
            <button
              type="button"
              onClick={() => onCancel?.(id)}
              disabled={cancelLoading}
              className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel Request
            </button>
          )}
          {canMarkReady && (
            <button
              type="button"
              onClick={() => onMarkReady?.(id)}
              disabled={markReadyLoading}
              className="inline-flex items-center gap-1.5 rounded-xl border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700 hover:bg-green-100 disabled:opacity-50"
            >
              {markReadyLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
              I'm Ready
            </button>
          )}
        </div>
      </div>

      <Modal
        open={expanded}
        onClose={() => setExpanded(false)}
        title="Request Details"
        size="md"
      >
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-slate-500">Status</dt>
            <dd className="flex flex-col items-end gap-1">
              <StatusBadge status={request.status} />
              <ApprovalBadge />
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-500">Waste type</dt>
            <dd className="capitalize font-medium">{request.wasteType}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-500">Quantity</dt>
            <dd className="capitalize font-medium">{request.quantity}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-500">Preferred</dt>
            <dd className="font-medium">{formatDateWithSlot(request.preferredDate, request.preferredTimeSlot)}</dd>
          </div>
          {request.description && (
            <div>
              <dt className="text-slate-500 mb-1">Notes</dt>
              <dd className="text-slate-700">{request.description}</dd>
            </div>
          )}
          {request.location && (
            <div className="flex items-start gap-2 rounded-xl bg-slate-50 p-3">
              <MapPin className="h-4 w-4 mt-0.5 text-slate-400" />
              <span>
                {[request.location.district, request.location.sector, request.location.street]
                  .filter(Boolean)
                  .join(', ')}
              </span>
            </div>
          )}
          {request.collector && (
            <div className="rounded-xl border border-blue-100 bg-blue-50 p-3 space-y-2">
              <p className="text-xs font-semibold uppercase text-blue-700">Assigned Collector</p>
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-blue-600" />
                <span>{request.collector.fullName || request.collector.name}</span>
              </div>
              {request.collector.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-blue-600" />
                  <a href={`tel:${request.collector.phone}`} className="text-blue-700 underline">{request.collector.phone}</a>
                </div>
              )}
            </div>
          )}
        </dl>
      </Modal>
    </>
  );
}
