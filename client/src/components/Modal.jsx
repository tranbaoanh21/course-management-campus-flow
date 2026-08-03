import { useEffect, useId, useRef } from 'react';

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

function Modal({ title, description, children, onClose }) {
  const titleId = useId();
  const descriptionId = useId();
  const panelRef = useRef(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const previousActiveElement = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const initialFocusElement =
      panelRef.current?.querySelector('[autofocus]') ||
      panelRef.current?.querySelector(FOCUSABLE_SELECTOR);
    initialFocusElement?.focus();

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onCloseRef.current();
        return;
      }

      if (event.key !== 'Tab' || !panelRef.current) {
        return;
      }

      const focusableElements = [...panelRef.current.querySelectorAll(FOCUSABLE_SELECTOR)];

      if (focusableElements.length === 0) {
        event.preventDefault();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements.at(-1);

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previousActiveElement?.focus();
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-[#182019]/55 p-0 backdrop-blur-[2px] sm:items-center sm:p-6"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        ref={panelRef}
        aria-describedby={description ? descriptionId : undefined}
        aria-labelledby={titleId}
        aria-modal="true"
        className="max-h-[90vh] w-full overflow-y-auto rounded-t-xl border border-[var(--cf-line)] bg-[var(--cf-paper)] p-6 shadow-2xl sm:max-w-xl sm:rounded-md"
        role="dialog"
      >
        <div className="flex items-start justify-between gap-6 border-b border-[var(--cf-line)] pb-5">
          <div>
            <h2 id={titleId} className="font-editorial text-2xl font-semibold tracking-tight">
              {title}
            </h2>
            {description && (
              <p id={descriptionId} className="mt-2 text-sm leading-6 text-[var(--cf-muted)]">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            aria-label="Đóng"
            className="grid size-8 shrink-0 place-items-center border border-[var(--cf-line)] text-xl text-[var(--cf-muted)] transition hover:border-[var(--cf-line-strong)] hover:text-[var(--cf-ink)]"
            onClick={onClose}
          >
            ×
          </button>
        </div>
        <div className="mt-5">{children}</div>
      </section>
    </div>
  );
}

export default Modal;
