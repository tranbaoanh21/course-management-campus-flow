import { useCallback, useEffect, useMemo, useState } from 'react';

import ToastContext from '../contexts/ToastContext';

function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);

  const dismissToast = useCallback(() => {
    setToast(null);
  }, []);

  const showToast = useCallback((message, variant = 'success') => {
    setToast({
      id: Date.now(),
      message,
      variant,
    });
  }, []);

  useEffect(() => {
    if (!toast) {
      return undefined;
    }

    const timeoutId = window.setTimeout(dismissToast, 3200);
    return () => window.clearTimeout(timeoutId);
  }, [toast, dismissToast]);

  const contextValue = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={contextValue}>
      {children}

      {toast && (
        <div
          key={toast.id}
          className={`fixed top-20 right-4 z-40 flex max-w-sm items-start gap-3 border bg-[var(--cf-paper)] px-4 py-3 text-sm text-[var(--cf-ink)] shadow-lg sm:right-6 ${
            toast.variant === 'error' ? 'border-[var(--cf-danger)]' : 'border-[var(--cf-accent)]'
          }`}
          role={toast.variant === 'error' ? 'alert' : 'status'}
          aria-live={toast.variant === 'error' ? 'assertive' : 'polite'}
        >
          <span
            className={`grid size-6 shrink-0 place-items-center rounded-full font-bold ${
              toast.variant === 'error'
                ? 'bg-[var(--cf-danger-soft)] text-[var(--cf-danger)]'
                : 'bg-[var(--cf-accent-soft)] text-[var(--cf-accent)]'
            }`}
          >
            {toast.variant === 'error' ? '!' : '✓'}
          </span>
          <p className="pt-0.5 font-medium leading-5">{toast.message}</p>
          <button
            type="button"
            aria-label="Đóng thông báo"
            className="ml-2 text-lg leading-5 text-[var(--cf-faint)] hover:text-[var(--cf-ink)]"
            onClick={dismissToast}
          >
            ×
          </button>
        </div>
      )}
    </ToastContext.Provider>
  );
}

export default ToastProvider;
