/**
 * Modal Component
 * Generic accessible modal dialog. Content is injected via the build() callback.
 */

/**
 * @typedef {Object} ModalOptions
 * @property {string} title
 * @property {(body: HTMLElement) => void} build  - populate the modal body
 * @property {string} [confirmLabel]
 * @property {() => Promise<void>|void} onConfirm
 */

/**
 * Open a modal dialog.
 * @param {ModalOptions} options
 * @returns {{ close: () => void }}
 */
export function openModal({ title, build, confirmLabel = 'Lưu', onConfirm }) {
  // Overlay
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-labelledby', 'modal-title');

  const modal = document.createElement('div');
  modal.className = 'modal';

  modal.innerHTML = `
    <div class="modal__header">
      <h2 class="modal__title" id="modal-title">${escapeHtml(title)}</h2>
      <button class="modal__close" id="modal-close-btn" aria-label="Đóng">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </button>
    </div>
    <div class="modal__body" id="modal-body"></div>
    <div class="modal__footer">
      <button class="btn btn--ghost" id="modal-cancel-btn">Hủy</button>
      <button class="btn btn--primary" id="modal-confirm-btn">${escapeHtml(confirmLabel)}</button>
    </div>
  `;

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  // Build body content
  const body = modal.querySelector('#modal-body');
  build(body);

  // Focus first input
  setTimeout(() => body.querySelector('input,textarea,select')?.focus(), 50);

  const close = () => {
    overlay.remove();
    document.removeEventListener('keydown', onKeyDown);
  };

  const onKeyDown = (e) => {
    if (e.key === 'Escape') close();
  };
  document.addEventListener('keydown', onKeyDown);

  modal.querySelector('#modal-close-btn').addEventListener('click', close);
  modal.querySelector('#modal-cancel-btn').addEventListener('click', close);

  const confirmBtn = modal.querySelector('#modal-confirm-btn');
  confirmBtn.addEventListener('click', async () => {
    confirmBtn.disabled = true;
    confirmBtn.textContent = 'Đang lưu...';
    try {
      await onConfirm();
      close();
    } catch (err) {
      confirmBtn.disabled = false;
      confirmBtn.textContent = confirmLabel;
      // Error shown by caller via toast
    }
  });

  // Click outside to close
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });

  return { close };
}

function escapeHtml(str) {
  const d = document.createElement('div');
  d.textContent = str ?? '';
  return d.innerHTML;
}
