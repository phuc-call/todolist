/**
 * TaskItem Component
 * Renders a single task row with checkbox toggle, edit, and delete actions.
 */
import { toggleTaskCompletion, deleteTask } from '../../services/taskService.js';
import { loadTasks } from '../../controllers/appController.js';
import { state, setState } from '../../store/state.js';
import { showToast } from '../Toast/Toast.js';

/**
 * @param {import('../../api/types').TaskResponse} task
 * @param {Object} callbacks
 * @param {(task: *) => void} callbacks.onEdit
 * @returns {HTMLElement}
 */
export function createTaskItem(task, { onEdit }) {
  const li = document.createElement('li');
  li.className = 'task-item' + (task.isCompleted ? ' completed' : '');
  li.dataset.taskId = task.id;
  li.setAttribute('role', 'listitem');

  const dateLabel = formatDate(task.updatedAt || task.createdAt);
  const contentPreview = task.content
    ? `<span class="task-item__content">${escapeHtml(task.content.length > 80 ? task.content.slice(0, 80) + '…' : task.content)}</span>`
    : '';

  const isSelected = state.selectedTaskIds.has(task.id);
  const selectionCheckboxHtml = state.isSelectionMode ? `
    <input
      type="checkbox"
      class="task-item__selection-box"
      id="task-select-${task.id}"
      aria-label="Chọn ${escapeHtml(task.name)}"
      ${isSelected ? 'checked' : ''}
      style="margin-right: 12px; width:18px; height:18px; accent-color: var(--text); cursor: pointer;"
    />
  ` : '';

  li.innerHTML = `
    ${selectionCheckboxHtml}
    <input
      type="checkbox"
      class="task-item__checkbox"
      id="task-check-${task.id}"
      aria-label="${escapeHtml(task.name)}"
      ${task.isCompleted ? 'checked' : ''}
    />
    <div class="task-item__body">
      <label for="task-check-${task.id}" class="task-item__name">${escapeHtml(task.name)}</label>
      ${contentPreview}
      <div class="task-item__meta">
        ${task.categoryName ? `<span class="task-item__category-tag">${escapeHtml(task.categoryName)}</span>` : ''}
        <span class="task-item__date">${dateLabel}</span>
      </div>
    </div>
    <div class="task-item__actions" aria-label="Task actions">
      <button class="task-item__btn" data-action="move" title="Chuyển thư mục" aria-label="Chuyển thư mục">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
        </svg>
      </button>
      <button class="task-item__btn task-item__btn--danger" data-action="delete" title="Xóa" aria-label="Xóa task">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path d="M2 3.5h10M5.5 3.5V2.5h3V3.5M5 6l.5 5M9 6l-.5 5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
        </svg>
      </button>
    </div>
  `;

  // Toggle completion via checkbox
  const checkbox = li.querySelector('.task-item__checkbox');
  checkbox.addEventListener('change', async () => {
    const nowChecked = checkbox.checked;
    checkbox.disabled = true;
    try {
      const updated = await toggleTaskCompletion(task.id);
      // Cập nhật local state thay vì reload network
      task.isCompleted = updated.isCompleted;
      li.classList.toggle('completed', updated.isCompleted);
      showToast(
        updated.isCompleted ? 'Đã đánh dấu hoàn thành ✓' : 'Đã đánh dấu chưa hoàn thành',
        'success'
      );
    } catch (err) {
      // Revert checkbox nếu lỗi
      checkbox.checked = !nowChecked;
      showToast('Không thể cập nhật: ' + err.message, 'error');
    } finally {
      checkbox.disabled = false;
    }
  });

  // Handle selection checkbox
  if (state.isSelectionMode) {
    const selectBox = li.querySelector('.task-item__selection-box');
    selectBox?.addEventListener('change', () => {
      const newSelected = new Set(state.selectedTaskIds);
      if (selectBox.checked) {
        newSelected.add(task.id);
      } else {
        newSelected.delete(task.id);
      }
      setState({ selectedTaskIds: newSelected });
      import('../../controllers/appController.js').then(m => m.refreshTaskPanel());
    });
  }

  // Open details when clicking on body
  li.querySelector('.task-item__body').addEventListener('click', () => {
    onEdit(task.id);
  });

  // Action buttons (delete)
  li.addEventListener('click', async (e) => {
    const action = e.target.closest('[data-action]')?.dataset.action;
    if (!action) return;

    if (action === 'move') {
      import('../../controllers/taskModalController.js').then(m => m.openMoveTaskModal(task));
      return;
    }

    if (action === 'delete') {
      import('../../controllers/taskModalController.js').then(m => m.openDeleteTaskModal(task));
      return;
    }
  });

  return li;
}

function formatDate(isoString) {
  if (!isoString) return '';
  try {
    return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(isoString));
  } catch {
    return '';
  }
}

function escapeHtml(str) {
  const d = document.createElement('div');
  d.textContent = str ?? '';
  return d.innerHTML;
}
