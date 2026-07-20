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
      <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
        <button
          type="button"
          className="rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-50"
          disabled={isConfirming}
          onClick={onCancel}
        >
          Hủy
        </button>
        <button
          type="button"
          className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
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
