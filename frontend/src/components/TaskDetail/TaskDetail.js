/**
 * TaskDetail Component
 * Renders the detail view of a task (replacing TaskList).
 */
import './TaskDetail.css';
import { state } from '../../store/state.js';
import { updateTask } from '../../services/taskService.js';
import { loadTasks } from '../../controllers/appController.js';
import { showToast } from '../Toast/Toast.js';

let currentCallbacks = {};

export function createTaskDetailPanel(callbacks) {
  currentCallbacks = callbacks;
  const panel = document.createElement('section');
  panel.className = 'task-detail-panel';
  panel.id = 'task-detail-panel';
  panel.innerHTML = `
    <div class="task-detail__header">
      <button class="task-detail__back-btn" id="task-detail-back">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M10 13L5 8l5-5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Trở lại
      </button>
      <h2 class="task-detail__title" id="task-detail-title">Đang tải...</h2>
    </div>
    <div class="task-detail__body" id="task-detail-body">
      <!-- Loading skeleton can go here -->
    </div>
  `;

  panel.querySelector('#task-detail-back').addEventListener('click', () => {
    if (currentCallbacks.onBack) currentCallbacks.onBack();
  });

  return panel;
}

export function updateTaskDetailPanel(container, callbacks) {
  if (callbacks) currentCallbacks = callbacks;
  const panel = container || document.getElementById('task-detail-panel');
  if (!panel) return;

  const titleEl = panel.querySelector('#task-detail-title');
  const bodyEl = panel.querySelector('#task-detail-body');

  const task = state.selectedTask;
  if (!task) {
    titleEl.textContent = 'Đang tải...';
    bodyEl.innerHTML = '<div style="color:var(--text-muted);text-align:center;margin-top:40px;">Đang lấy dữ liệu chi tiết...</div>';
    return;
  }

  const catName = task.categoryName || 'Không có category';
  titleEl.textContent = `${catName} ➔ ${task.name}`;

  const createdStr = task.createdAt ? new Intl.DateTimeFormat('vi-VN', { dateStyle: 'long', timeStyle: 'short' }).format(new Date(task.createdAt)) : '';
  const updatedStr = task.updatedAt ? new Intl.DateTimeFormat('vi-VN', { dateStyle: 'long', timeStyle: 'short' }).format(new Date(task.updatedAt)) : '';

  bodyEl.innerHTML = `
    <div class="task-detail-meta">
      <span><strong>Tạo lúc:</strong> ${createdStr}</span>
      <span><strong>Cập nhật lúc:</strong> ${updatedStr}</span>
    </div>

    <!-- VIEW MODE -->
    <div id="td-view-mode">
      <div class="task-detail-content-box">
        ${task.content ? task.content : '<span style="color:var(--text-muted)">Không có nội dung</span>'}
      </div>
      <div style="margin-top: 16px;">
        <button id="td-edit-btn" class="btn btn--primary">Sửa nội dung & thông tin</button>
      </div>
    </div>

    <!-- EDIT MODE -->
    <div id="td-edit-mode" style="display:none; flex-direction: column; gap: 16px; flex: 1;">
      <div class="form-group">
        <label class="form-label" for="td-edit-name">Tên task <span style="color:#dc2626">*</span></label>
        <input id="td-edit-name" class="form-input" type="text" value="${escapeHtml(task.name)}" autocomplete="off" />
      </div>
      <div class="form-group" style="flex:1; display:flex; flex-direction:column;">
        <label class="form-label">Nội dung</label>
        ${renderRichTextEditor('td-edit-content', task.content || '')}
      </div>
      <div class="form-group">
        <label class="form-label" for="td-edit-category">Category</label>
        <select id="td-edit-category" class="form-select">
          <option value="">Không có category</option>
          ${state.categories.map((c) => `
            <option value="${c.id}" ${c.id === task.categoryId ? 'selected' : ''}>
              ${escapeHtml(c.name)}
            </option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label" style="display:flex;align-items:center;gap:8px;cursor:pointer;user-select:none;">
          <input id="td-edit-completed" type="checkbox" ${task.isCompleted ? 'checked' : ''}
            style="width:16px;height:16px;accent-color:var(--text);cursor:pointer;" />
          Đánh dấu hoàn thành
        </label>
      </div>
      <div class="task-detail__footer" style="margin: 0 -24px -24px -24px;">
        <button id="td-cancel-btn" class="btn btn--ghost">Hủy</button>
        <button id="td-save-btn" class="btn btn--primary">Lưu thay đổi</button>
      </div>
    </div>
  `;

  attachRichTextEvents(bodyEl);

  // Switch modes
  const viewMode = bodyEl.querySelector('#td-view-mode');
  const editMode = bodyEl.querySelector('#td-edit-mode');

  bodyEl.querySelector('#td-edit-btn').addEventListener('click', () => {
    viewMode.style.display = 'none';
    editMode.style.display = 'flex';
  });

  bodyEl.querySelector('#td-cancel-btn').addEventListener('click', () => {
    editMode.style.display = 'none';
    viewMode.style.display = 'block';
  });

  const saveBtn = bodyEl.querySelector('#td-save-btn');
  saveBtn.addEventListener('click', async () => {
    saveBtn.disabled = true;
    saveBtn.textContent = 'Đang lưu...';
    try {
      const name = document.getElementById('td-edit-name')?.value.trim();
      const content = document.getElementById('td-edit-content')?.innerHTML.trim() || null;
      const categoryId = document.getElementById('td-edit-category')?.value
        ? Number(document.getElementById('td-edit-category').value) : null;
      const isCompleted = document.getElementById('td-edit-completed')?.checked ?? task.isCompleted;

      if (!name) throw new Error('Tên task không được để trống');

      await updateTask(task.id, { name, content, isCompleted, categoryId });
      showToast('Đã cập nhật task!', 'success');

      // Reload detail and list
      await loadTasks();
      // loadTasks will indirectly re-fetch the list, but we also want to stay on this screen
      // Wait, appController's loadTasks doesn't update selectedTask.
      // So we just call selectTask again or update it locally.
      // Actually, since we want to see the updated changes, let's just trigger a re-select:
      import('../../controllers/appController.js').then(m => m.selectTask(task.id));
    } catch (err) {
      showToast(err.message, 'error');
      saveBtn.disabled = false;
      saveBtn.textContent = 'Lưu thay đổi';
    }
  });
}

function renderRichTextEditor(id, initialContent = '') {
  return `
    <div class="rt-toolbar" style="display:flex; flex-wrap:wrap; gap: 4px; margin-bottom: 8px; padding: 4px; border: 1px solid var(--border); border-radius: 6px; background: var(--surface);">
      <select class="rt-select form-select" data-cmd="formatBlock" style="width: auto; padding: 0 24px 0 8px; height: 28px; font-size: 12px;">
        <option value="P">Bình thường</option>
        <option value="H1">Tiêu đề 1</option>
        <option value="H2">Tiêu đề 2</option>
        <option value="H3">Tiêu đề 3</option>
      </select>
      <div style="width: 1px; background: var(--border); margin: 0 2px;"></div>
      <button type="button" class="btn btn--ghost rt-btn" data-cmd="bold" title="In đậm" style="padding: 4px 8px; font-weight:bold;">B</button>
      <button type="button" class="btn btn--ghost rt-btn" data-cmd="italic" title="In nghiêng" style="padding: 4px 8px; font-style:italic;">I</button>
      <button type="button" class="btn btn--ghost rt-btn" data-cmd="underline" title="Gạch chân" style="padding: 4px 8px; text-decoration:underline;">U</button>
      <button type="button" class="btn btn--ghost rt-btn" data-cmd="strikeThrough" title="Gạch ngang" style="padding: 4px 8px; text-decoration:line-through;">S</button>
      <div style="width: 1px; background: var(--border); margin: 0 2px;"></div>
      <button type="button" class="btn btn--ghost rt-btn" data-cmd="justifyLeft" title="Căn trái" style="padding: 4px 8px;">⇤</button>
      <button type="button" class="btn btn--ghost rt-btn" data-cmd="justifyCenter" title="Căn giữa" style="padding: 4px 8px;">↔</button>
      <button type="button" class="btn btn--ghost rt-btn" data-cmd="justifyRight" title="Căn phải" style="padding: 4px 8px;">⇥</button>
      <div style="width: 1px; background: var(--border); margin: 0 2px;"></div>
      <button type="button" class="btn btn--ghost rt-btn" data-cmd="insertUnorderedList" title="Danh sách chấm" style="padding: 4px 8px;">•</button>
      <button type="button" class="btn btn--ghost rt-btn" data-cmd="insertOrderedList" title="Danh sách số" style="padding: 4px 8px;">1.</button>
      <div style="width: 1px; background: var(--border); margin: 0 2px;"></div>
      <button type="button" class="btn btn--ghost rt-btn" data-cmd="outdent" title="Giảm lề" style="padding: 4px 8px;">←</button>
      <button type="button" class="btn btn--ghost rt-btn" data-cmd="indent" title="Tăng lề" style="padding: 4px 8px;">→</button>
      <div style="width: 1px; background: var(--border); margin: 0 2px;"></div>
      <label style="display:flex; align-items:center; gap:4px; font-size:12px; cursor:pointer;" title="Màu chữ">
        <input type="color" class="rt-color" data-cmd="foreColor" style="width:20px; height:20px; padding:0; border:none; background:transparent; cursor:pointer;" value="#000000">
      </label>
      <label style="display:flex; align-items:center; gap:4px; font-size:12px; cursor:pointer;" title="Màu nền">
        <input type="color" class="rt-color" data-cmd="backColor" style="width:20px; height:20px; padding:0; border:none; background:transparent; cursor:pointer;" value="#ffff00">
      </label>
      <div style="width: 1px; background: var(--border); margin: 0 2px;"></div>
      <button type="button" class="btn btn--ghost rt-link-btn" title="Chèn liên kết" style="padding: 4px 8px;">🔗</button>
      <button type="button" class="btn btn--ghost rt-btn" data-cmd="unlink" title="Xóa liên kết" style="padding: 4px 8px;">❌</button>
      <div style="width: 1px; background: var(--border); margin: 0 2px;"></div>
      <button type="button" class="btn btn--ghost rt-btn" data-cmd="removeFormat" title="Xóa định dạng" style="padding: 4px 8px;">Tx</button>
    </div>
    <div id="${id}" class="form-input rt-editor" contenteditable="true" style="flex:1; min-height: 250px; overflow-y: auto; outline: none; background: var(--bg);">
      ${initialContent}
    </div>
  `;
}

function attachRichTextEvents(container) {
  container.querySelectorAll('.rt-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      document.execCommand(btn.dataset.cmd, false, null);
    });
  });

  container.querySelectorAll('.rt-color').forEach(picker => {
    picker.addEventListener('input', (e) => {
      document.execCommand(picker.dataset.cmd, false, e.target.value);
    });
  });

  container.querySelectorAll('.rt-select').forEach(select => {
    select.addEventListener('change', (e) => {
      document.execCommand(select.dataset.cmd, false, e.target.value);
    });
  });

  container.querySelectorAll('.rt-link-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const url = prompt('Nhập địa chỉ URL:');
      if (url) {
        document.execCommand('createLink', false, url);
      }
    });
  });
}

function escapeHtml(str) {
  const d = document.createElement('div');
  d.textContent = str ?? '';
  return d.innerHTML;
}
