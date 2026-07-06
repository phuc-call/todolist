/**
 * TaskList (Main Panel) Component
 * Shows pending and completed task sections for the selected category.
 */
import { state, setState } from '../../store/state.js';
import { createTaskItem } from '../TaskItem/TaskItem.js';
import { loadTasks, refreshTaskPanel } from '../../controllers/appController.js';

/**
 * Create the task panel DOM element.
 * @param {Object} callbacks
 * @param {(task?: *) => void} callbacks.onAddTask
 * @param {(task: *) => void} callbacks.onEditTask
 * @returns {HTMLElement}
 */
export function createTaskPanel({ onAddTask, onEditTask }) {
  const panel = document.createElement('main');
  panel.className = 'task-panel';
  panel.id = 'task-panel';
  panel.setAttribute('aria-label', 'Task list');

  renderTaskPanel(panel, { onAddTask, onEditTask });
  return panel;
}

/**
 * Re-render the task panel in-place.
 * @param {HTMLElement} [container]
 * @param {Object} [callbacks]
 */
export function updateTaskPanel(container, callbacks = {}) {
  const el = container || document.getElementById('task-panel');
  if (!el) return;
  renderTaskPanel(el, callbacks);
}

function renderTaskPanel(panel, { onAddTask = () => {}, onEditTask = () => {} } = {}) {
  if (!state.selectedCategory) {
    panel.innerHTML = `
      <div class="task-placeholder">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
          <rect x="8" y="10" width="28" height="4" rx="2" fill="currentColor"/>
          <rect x="8" y="20" width="32" height="4" rx="2" fill="currentColor"/>
          <rect x="8" y="30" width="20" height="4" rx="2" fill="currentColor"/>
        </svg>
        <p class="task-placeholder__text">Chọn một category từ bên trái<br>để xem danh sách task</p>
      </div>`;
    return;
  }

  const pending = state.tasks.filter((t) => !t.isCompleted);
  const completed = state.tasks.filter((t) => t.isCompleted);

  panel.innerHTML = `
    <div class="task-panel__header">
      <div style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
        <h1 class="task-panel__title" id="task-panel-title">${escapeHtml(state.selectedCategory.name)}</h1>
        <span style="font-size: var(--font-small); color: var(--text-secondary);">
          Tổng số: ${state.taskTotalElements ?? 0} task(s)
        </span>
      </div>
      
      ${state.isSelectionMode ? `
        <div class="task-panel__toolbar" role="toolbar" style="background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 8px 12px; margin-top: 16px;">
          <span style="font-size: 14px; font-weight: 500;">Đã chọn: ${state.selectedTaskIds.size} task</span>
          <div style="display: flex; gap: 8px; margin-left: auto;">
            <button class="btn btn--primary" id="bulk-move-btn" ${state.selectedTaskIds.size === 0 ? 'disabled' : ''}>Chuyển thư mục</button>
            <button class="btn btn--ghost" id="cancel-selection-btn">Hủy</button>
          </div>
        </div>
      ` : `
        <div class="task-panel__toolbar" role="toolbar" aria-label="Bộ lọc task">
          <button class="task-panel__filter-btn ${state.taskFilter === null ? 'active' : ''}" data-filter="null" id="filter-all">Tất cả</button>
          <button class="task-panel__filter-btn ${state.taskFilter === 'incomplete' ? 'active' : ''}" data-filter="incomplete" id="filter-incomplete">Chưa xong</button>
          <button class="task-panel__filter-btn ${state.taskFilter === 'completed' ? 'active' : ''}" data-filter="completed" id="filter-completed">Hoàn thành</button>
          
          <div style="display: flex; align-items: center; margin-left: auto; gap: 8px; flex-wrap: wrap;">
            <button class="task-panel__filter-btn" id="toggle-selection-mode" title="Bật chế độ chọn nhiều" style="padding: 0 12px;">☑️ Chọn</button>
            <div style="width: 1px; height: 20px; background: var(--border);"></div>
            <select id="task-sort-by" class="form-select" style="padding: 0 24px 0 8px; font-size: 12px; height: 30px; border-radius: 6px; width: auto; max-width: 140px;">
              <option value="createdAt" ${state.taskSortBy === 'createdAt' ? 'selected' : ''}>Ngày tạo</option>
              <option value="updatedAt" ${state.taskSortBy === 'updatedAt' ? 'selected' : ''}>Ngày cập nhật</option>
              <option value="name" ${state.taskSortBy === 'name' ? 'selected' : ''}>Tên A-Z</option>
            </select>
            <button class="task-panel__filter-btn" id="task-sort-dir" style="padding: 0 8px; font-size: 14px;" title="Đổi chiều sắp xếp">
              ${state.taskSortDir === 'desc' ? '⬇' : '⬆'}
            </button>
            <button class="task-panel__filter-btn" id="task-panel-add-btn" aria-label="Thêm task mới" style="background:var(--text);color:var(--bg);border-color:var(--text);">
              + Thêm task
            </button>
          </div>
        </div>
      `}
    </div>

    <div class="task-panel__content" id="task-panel-content">
      ${state.loadingTasks ? renderSkeletons() : renderSections(pending, completed, onEditTask)}
    </div>

    ${state.taskTotalPages > 1 ? `
      <div class="task-panel__pagination" role="navigation" aria-label="Phân trang">
        <button class="task-panel__page-btn" id="page-prev" aria-label="Trang trước" ${state.taskPage === 0 ? 'disabled' : ''}>← Trước</button>
        <span class="task-panel__page-info">Trang ${state.taskPage + 1} / ${state.taskTotalPages}</span>
        <button class="task-panel__page-btn" id="page-next" aria-label="Trang sau" ${state.taskPage >= state.taskTotalPages - 1 ? 'disabled' : ''}>Tiếp →</button>
      </div>` : ''}
  `;

  // Filter buttons
  panel.querySelectorAll('[data-filter]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const val = btn.dataset.filter;
      setState({ taskFilter: val === 'null' ? null : val, taskPage: 0 });
      loadTasks();
    });
  });

  // Bulk action handlers
  panel.querySelector('#toggle-selection-mode')?.addEventListener('click', () => {
    setState({ isSelectionMode: true, selectedTaskIds: new Set() });
    refreshTaskPanel();
  });
  
  panel.querySelector('#cancel-selection-btn')?.addEventListener('click', () => {
    setState({ isSelectionMode: false, selectedTaskIds: new Set() });
    refreshTaskPanel();
  });

  panel.querySelector('#bulk-move-btn')?.addEventListener('click', () => {
    if (state.selectedTaskIds.size > 0) {
      import('../../controllers/taskModalController.js').then(m => m.openBulkMoveModal(Array.from(state.selectedTaskIds)));
    }
  });

  // Add task button
  panel.querySelector('#task-panel-add-btn')?.addEventListener('click', () => onAddTask());

  // Sort controls
  panel.querySelector('#task-sort-by')?.addEventListener('change', (e) => {
    setState({ taskSortBy: e.target.value, taskPage: 0 });
    loadTasks();
  });
  
  panel.querySelector('#task-sort-dir')?.addEventListener('click', () => {
    setState({ taskSortDir: state.taskSortDir === 'desc' ? 'asc' : 'desc', taskPage: 0 });
    loadTasks();
  });

  // Pagination
  panel.querySelector('#page-prev')?.addEventListener('click', () => {
    setState({ taskPage: state.taskPage - 1 });
    loadTasks();
  });
  panel.querySelector('#page-next')?.addEventListener('click', () => {
    setState({ taskPage: state.taskPage + 1 });
    loadTasks();
  });
}

function renderSections(pending, completed, onEditTask) {
  if (pending.length === 0 && completed.length === 0) {
    return `
      <div class="task-empty">
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
          <rect x="6" y="8" width="22" height="4" rx="2" fill="currentColor"/>
          <rect x="6" y="17" width="28" height="4" rx="2" fill="currentColor"/>
          <rect x="6" y="26" width="16" height="4" rx="2" fill="currentColor"/>
        </svg>
        <p>Chưa có task nào trong category này.<br>Nhấn "+ Thêm task" để tạo mới.</p>
      </div>`;
  }

  // We'll return placeholder divs and fill them with components after innerHTML is set
  return `
    ${pending.length > 0 ? `
      <section class="task-section" aria-labelledby="section-todo">
        <h2 class="task-section__heading" id="section-todo">
          Cần làm
          <span class="task-section__count">${pending.length}</span>
        </h2>
        <ul class="task-list" id="task-list-todo" role="list" aria-label="Danh sách chưa hoàn thành"></ul>
      </section>` : ''}
    ${completed.length > 0 ? `
      <section class="task-section" aria-labelledby="section-done">
        <h2 class="task-section__heading" id="section-done">
          Hoàn thành
          <span class="task-section__count">${completed.length}</span>
        </h2>
        <ul class="task-list" id="task-list-done" role="list" aria-label="Danh sách đã hoàn thành"></ul>
      </section>` : ''}
  `;
}

function renderSkeletons() {
  return `
    <div class="task-section" aria-label="Đang tải...">
      ${[...Array(4)].map(() => `<div class="task-skeleton"></div>`).join('')}
    </div>`;
}

/**
 * Append TaskItem elements to the rendered UL containers.
 * Called after renderTaskPanel when DOM is ready.
 */
export function populateTaskItems(onEditTask) {
  const pending = state.tasks.filter((t) => !t.isCompleted);
  const completed = state.tasks.filter((t) => t.isCompleted);

  const todoList = document.getElementById('task-list-todo');
  const doneList = document.getElementById('task-list-done');

  if (todoList) {
    pending.forEach((task) => todoList.appendChild(createTaskItem(task, { onEdit: onEditTask })));
  }

  if (doneList) {
    completed.forEach((task) => doneList.appendChild(createTaskItem(task, { onEdit: onEditTask })));
  }
}

function escapeHtml(str) {
  const d = document.createElement('div');
  d.textContent = str ?? '';
  return d.innerHTML;
}
