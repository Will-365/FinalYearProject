import { ConfirmModal, Modal } from '@/components/ui/Modal';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';

export function ClaimModal({
  open,
  onClose,
  coupon,
  userPoints,
  onConfirm,
  loading,
  successData,
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const code = successData?.couponCode;
    if (!code) return;
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (successData) {
    return (
      <Modal open={open} onClose={onClose} title="Coupon claimed!" size="sm">
        <p className="mb-4 text-sm text-slate-600">
          Show this code at {successData.partner || 'the partner store'}:
        </p>
        <div className="mb-6 rounded-2xl border-2 border-green-200 bg-green-50 px-6 py-5 text-center">
          <p className="text-2xl font-mono font-bold tracking-widest text-green-800">
            {successData.couponCode}
          </p>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 py-3 text-sm font-bold text-white hover:bg-green-700"
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? 'Copied!' : 'Copy to clipboard'}
        </button>
      </Modal>
    );
  }

  const cost = coupon?.pointsRequired || 0;
  const balanceAfter = (userPoints || 0) - cost;

  return (
    <ConfirmModal
      open={open}
      onClose={onClose}
      onConfirm={onConfirm}
      loading={loading}
      title="Claim this coupon?"
      message={`You're about to spend ${cost} points. Your balance will drop to ${balanceAfter} pts.`}
      confirmLabel={`Spend ${cost} pts`}
      variant="primary"
    />
  );
}
