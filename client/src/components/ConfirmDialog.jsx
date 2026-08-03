import Modal from './Modal';

function ConfirmDialog({
  title,
  description,
  confirmLabel = 'Xóa',
  isConfirming,
  onCancel,
  onConfirm,
}) {
  function handleClose() {
    if (!isConfirming) {
      onCancel();
    }
  }

  return (
    <Modal title={title} description={description} onClose={handleClose}>
      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          className="border border-[var(--cf-line)] px-4 py-2.5 text-sm font-semibold text-[var(--cf-muted)] transition hover:border-[var(--cf-line-strong)] hover:text-[var(--cf-ink)] disabled:opacity-50"
          disabled={isConfirming}
          onClick={onCancel}
        >
          Hủy
        </button>
        <button
          type="button"
          className="bg-[var(--cf-danger)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#8e3329] disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isConfirming}
          onClick={onConfirm}
        >
          {isConfirming ? 'Đang xóa...' : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}

export default ConfirmDialog;
