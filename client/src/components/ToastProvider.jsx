import { useCallback, useEffect, useMemo, useState } from 'react';

import ToastContext from '../contexts/ToastContext';

function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);

  const dismissToast = useCallback(() => {
    setToast(null);
  }, []);

  const showToast = useCallback((message) => {
    setToast({
      id: Date.now(),
      message,
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
          className="fixed top-20 right-4 z-40 flex max-w-sm items-start gap-3 rounded-xl border border-emerald-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-xl shadow-slate-200/60 sm:right-6"
          role="status"
          aria-live="polite"
        >
          <span className="grid size-6 shrink-0 place-items-center rounded-full bg-emerald-100 font-bold text-emerald-700">
            ✓
          </span>
          <p className="pt-0.5 font-medium leading-5">{toast.message}</p>
          <button
            type="button"
            aria-label="Đóng thông báo"
            className="ml-2 text-lg leading-5 text-slate-300 hover:text-slate-600"
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
