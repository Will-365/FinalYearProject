import { useState } from 'react';
import { formatDateWithSlot, wasteTypeConfig } from '@/utils/formatters';
import { StatusBadge, WasteTypeBadge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Phone, User, MapPin } from 'lucide-react';

export function RequestCard({
  request,
  onCancel,
  onConfirm,
  cancelLoading,
  confirmLoading,
}) {
  const [expanded, setExpanded] = useState(false);
  const id = request._id || request.id;
  const cfg = wasteTypeConfig[request.wasteType] || wasteTypeConfig.unknown;
  const canCancel = ['pending', 'assigned'].includes(request.status);
  const canConfirm = request.status === 'in_progress';

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
            <StatusBadge status={request.status} />
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
          {canConfirm && (
            <button
              type="button"
              onClick={() => onConfirm?.(id, request.quantity)}
              disabled={confirmLoading}
              className="rounded-xl bg-green-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-green-700 disabled:opacity-50"
            >
              Confirm Collection
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
            <dd><StatusBadge status={request.status} /></dd>
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
                  <span>{request.collector.phone}</span>
                </div>
              )}
            </div>
          )}
        </dl>
      </Modal>
    </>
  );
}
