import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

const Toast = ({ type, title, message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const isSuccess = type === 'success';

  return (
    <div style={{
      position: 'fixed', top: '24px', right: '24px', zIndex: 9999,
      width: '340px', borderRadius: '10px', padding: '16px 20px',
      display: 'flex', alignItems: 'flex-start', gap: '12px',
      boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
      background: isSuccess ? '#f0fdf4' : '#fef2f2',
      borderLeft: `4px solid ${isSuccess ? '#16a34a' : '#ef4444'}`,
      animation: 'slideInRight 0.3s forwards',
    }}>
      <style>
        {`
          @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
          @keyframes shrink {
            from { width: 100%; }
            to { width: 0%; }
          }
        `}
      </style>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: '24px', height: '24px', borderRadius: '50%', flexShrink: 0,
        background: isSuccess ? '#16a34a' : '#ef4444', color: 'white', fontWeight: 'bold'
      }}>
        {isSuccess ? '✓' : '✕'}
      </div>
      <div style={{ flex: 1 }}>
        <h4 style={{ margin: '0 0 4px 0', fontWeight: 700, color: '#0d1f13' }}>{title}</h4>
        <p style={{ margin: 0, fontSize: '0.875rem', color: '#4b5563' }}>{message}</p>
      </div>
      <button onClick={onClose} style={{
        background: 'none', border: 'none', cursor: 'pointer', padding: 0,
        color: '#9ca3af', fontSize: '1rem'
      }}>
        ✕
      </button>
      <div style={{
        position: 'absolute', bottom: 0, left: 0, height: '4px',
        background: isSuccess ? '#16a34a' : '#ef4444',
        animation: 'shrink 5s linear forwards'
      }} />
    </div>
  );
};

let toastCallback = null;

export const ToastContainer = () => {
  const [toast, setToast] = useState(null);

  useEffect(() => {
    toastCallback = setToast;
    return () => { toastCallback = null; };
  }, []);

  if (!toast) return null;

  return createPortal(
    <Toast {...toast} onClose={() => setToast(null)} />,
    document.body
  );
};

export const useToast = () => {
  const showToast = useCallback((options) => {
    if (toastCallback) {
      toastCallback(options);
    }
  }, []);

  return { showToast };
};
