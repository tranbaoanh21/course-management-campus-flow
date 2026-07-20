import { useEffect } from 'react';

function Modal({ title, description, children, onClose }) {
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/45 p-0 backdrop-blur-[2px] sm:items-center sm:p-6"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        aria-labelledby="modal-title"
        aria-modal="true"
        className="max-h-[90vh] w-full overflow-y-auto rounded-t-2xl bg-white p-6 shadow-2xl sm:max-w-xl sm:rounded-2xl"
        role="dialog"
      >
        <div className="flex items-start justify-between gap-6">
          <div>
            <h2 id="modal-title" className="text-xl font-semibold tracking-tight text-slate-950">
              {title}
            </h2>
            {description && <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>}
          </div>
          <button
            type="button"
            aria-label="Đóng"
            className="grid size-9 shrink-0 place-items-center rounded-lg text-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            onClick={onClose}
          >
            ×
          </button>
        </div>
        <div className="mt-6">{children}</div>
      </section>
    </div>
  );
}

export default Modal;
