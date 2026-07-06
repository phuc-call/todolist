/**
 * Task Modals
 * All modal dialogs for Create / Edit / View task.
 */
import { openModal } from '../components/Modal/Modal.js';
import { createTask, updateTask, moveTasks, deleteTask } from '../services/taskService.js';
import { loadTasks } from './appController.js';
import { showToast } from '../components/Toast/Toast.js';
import { state } from '../store/state.js';

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
    <div id="${id}" class="form-input rt-editor" contenteditable="true" style="min-height: 150px; overflow-y: auto; outline: none; background: var(--bg);">
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

/**
 * Open "Create Task" modal.
 */
export function openCreateTaskModal() {
  if (!state.selectedCategory) {
    showToast('Vui lòng chọn một category trước', 'error');
    return;
  }

  openModal({
    title: 'Tạo Task mới',
    confirmLabel: 'Tạo',
    build(body) {
      const categories = state.categories;
      body.innerHTML = `
        <div class="form-group">
          <label class="form-label" for="task-name">Tên task <span style="color:#dc2626">*</span></label>
          <input id="task-name" class="form-input" type="text" placeholder="VD: Hoàn thiện báo cáo..." autocomplete="off" />
        </div>
        <div class="form-group">
          <label class="form-label">Nội dung</label>
          ${renderRichTextEditor('task-content')}
        </div>
        <div class="form-group">
          <label class="form-label" for="task-category">Category</label>
          <select id="task-category" class="form-select">
            <option value="">Không có category</option>
            ${categories.map((c) => `
              <option value="${c.id}" ${c.id === state.selectedCategory?.id ? 'selected' : ''}>
                ${escapeHtml(c.name)}
              </option>`).join('')}
          </select>
        </div>
      `;
      attachRichTextEvents(body);
    },
    async onConfirm() {
      const name = document.getElementById('task-name')?.value.trim();
      const content = document.getElementById('task-content')?.innerHTML.trim() || null;
      const categoryId = document.getElementById('task-category')?.value
        ? Number(document.getElementById('task-category').value)
        : null;

      if (!name) throw new Error('Tên task không được để trống');

      await createTask({ name, content, categoryId });
      showToast('Đã tạo task!', 'success');
      await loadTasks();
    },
  });
}

/**
 * Open "View/Edit Task" details modal.
 * @param {import('../api/types').TaskResponse} task
 */
export function openEditTaskModal(task) {
  const catName = task.categoryName || 'Không có category';

  openModal({
    title: `${catName} ➔ ${task.name}`,
    confirmLabel: 'Lưu',
    build(body) {
      const categories = state.categories;
      body.innerHTML = `
        <!-- VIEW MODE -->
        <div id="task-view-mode">
          <div class="task-detail-content" style="padding: 16px; background: var(--surface); border-radius: 8px; min-height: 150px; font-size: 15px; line-height: 1.6; border: 1px solid var(--border);">
            ${task.content ? task.content : '<span style="color:var(--text-muted)">Không có nội dung</span>'}
          </div>
          <div style="margin-top: 16px; display: flex; gap: 8px;">
            <button id="switch-to-edit-btn" class="btn btn--primary">Sửa nội dung & thông tin</button>
          </div>
        </div>

        <!-- EDIT MODE -->
        <div id="task-edit-mode" style="display: none;">
          <div class="form-group">
            <label class="form-label" for="task-edit-name">Tên task <span style="color:#dc2626">*</span></label>
            <input id="task-edit-name" class="form-input" type="text" value="${escapeHtml(task.name)}" autocomplete="off" />
          </div>
          <div class="form-group">
            <label class="form-label">Nội dung</label>
            ${renderRichTextEditor('task-edit-content', task.content || '')}
          </div>
          <div class="form-group">
            <label class="form-label" for="task-edit-category">Category</label>
            <select id="task-edit-category" class="form-select">
              <option value="">Không có category</option>
              ${categories.map((c) => `
                <option value="${c.id}" ${c.id === task.categoryId ? 'selected' : ''}>
                  ${escapeHtml(c.name)}
                </option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label" style="display:flex;align-items:center;gap:8px;cursor:pointer;user-select:none;">
              <input id="task-edit-completed" type="checkbox" ${task.isCompleted ? 'checked' : ''}
                style="width:16px;height:16px;accent-color:var(--text);cursor:pointer;" />
              Đánh dấu hoàn thành
            </label>
          </div>
        </div>
      `;

      attachRichTextEvents(body);

      // Hide footer initially (only show in edit mode)
      setTimeout(() => {
        const modal = body.closest('.modal');
        const footer = modal.querySelector('.modal__footer');
        if (footer) footer.style.display = 'none';

        // Switch to edit mode
        body.querySelector('#switch-to-edit-btn').addEventListener('click', () => {
          body.querySelector('#task-view-mode').style.display = 'none';
          body.querySelector('#task-edit-mode').style.display = 'block';
          if (footer) footer.style.display = 'flex';
          modal.querySelector('#modal-title').textContent = 'Chỉnh sửa Task';
        });
      }, 0);
    },
    async onConfirm() {
      const name = document.getElementById('task-edit-name')?.value.trim();
      const content = document.getElementById('task-edit-content')?.innerHTML.trim() || null;
      const categoryId = document.getElementById('task-edit-category')?.value
        ? Number(document.getElementById('task-edit-category').value)
        : null;
      const isCompleted = document.getElementById('task-edit-completed')?.checked ?? task.isCompleted;

      if (!name) throw new Error('Tên task không được để trống');

      await updateTask(task.id, { name, content, isCompleted, categoryId });
      showToast('Đã cập nhật task!', 'success');
      await loadTasks();
    },
  });
}

/**
 * Open "Move Task" modal to change category.
 * @param {import('../api/types').TaskResponse} task
 */
export function openMoveTaskModal(task) {
  openModal({
    title: 'Chuyển mục cho Task',
    confirmLabel: 'Chuyển',
    build(body) {
      const categories = state.categories;
      body.innerHTML = `
        <div class="form-group">
          <label class="form-label">Task: <strong>${escapeHtml(task.name)}</strong></label>
        </div>
        <div class="form-group">
          <label class="form-label" for="task-move-category">Chọn mục đích đến</label>
          <select id="task-move-category" class="form-select">
            <option value="">Không có phân loại</option>
            ${categories.map((c) => `
              <option value="${c.id}" ${c.id === task.categoryId ? 'selected' : ''}>
                ${escapeHtml(c.name)}
              </option>`).join('')}
          </select>
        </div>
      `;
    },
    async onConfirm() {
      const categoryId = document.getElementById('task-move-category')?.value
        ? Number(document.getElementById('task-move-category').value)
        : null;

      if (categoryId === task.categoryId) {
        return; // Nothing to change
      }

      await moveTasks([task.id], categoryId);
      showToast('Đã chuyển task thành công!', 'success');
      await loadTasks();
    },
  });
}

/**
 * Open "Bulk Move Task" modal to change category for multiple tasks.
 * @param {number[]} taskIds
 */
export function openBulkMoveModal(taskIds) {
  openModal({
    title: 'Chuyển nhiều Task',
    confirmLabel: 'Chuyển',
    build(body) {
      const categories = state.categories;
      body.innerHTML = `
        <div class="form-group">
          <label class="form-label">Đang chọn <strong>${taskIds.length}</strong> task(s)</label>
        </div>
        <div class="form-group">
          <label class="form-label" for="task-bulk-move-category">Chọn mục đích đến</label>
          <select id="task-bulk-move-category" class="form-select">
            <option value="">Không có phân loại</option>
            ${categories.map((c) => `
              <option value="${c.id}" ${c.id === state.selectedCategory?.id ? 'selected' : ''}>
                ${escapeHtml(c.name)}
              </option>`).join('')}
          </select>
        </div>
      `;
    },
    async onConfirm() {
      const categoryId = document.getElementById('task-bulk-move-category')?.value
        ? Number(document.getElementById('task-bulk-move-category').value)
        : null;

      await moveTasks(taskIds, categoryId);
      showToast('Đã chuyển các task thành công!', 'success');
      
      // Tắt chế độ chọn nhiều
      import('../store/state.js').then(m => m.setState({ isSelectionMode: false, selectedTaskIds: new Set() }));
      await loadTasks();
    },
  });
}

/**
 * Open "Delete Task" confirmation modal.
 * @param {import('../api/types').TaskResponse} task
 */
export function openDeleteTaskModal(task) {
  openModal({
    title: 'Xóa Task',
    confirmLabel: 'Xóa',
    build(body) {
      body.innerHTML = `
        <div style="font-size: 15px; line-height: 1.5; color: var(--text);">
          Bạn có chắc chắn muốn xóa task <strong>"${escapeHtml(task.name)}"</strong> không?<br/>
          <span style="color: var(--text-muted); font-size: 13px;">Hành động này không thể hoàn tác.</span>
        </div>
      `;
      // Đổi màu nút confirm thành đỏ (nguy hiểm)
      setTimeout(() => {
        const modal = body.closest('.modal');
        const confirmBtn = modal.querySelector('#modal-confirm-btn');
        if (confirmBtn) {
          confirmBtn.classList.remove('btn--primary');
          confirmBtn.style.backgroundColor = '#dc2626';
          confirmBtn.style.color = 'white';
          confirmBtn.style.border = 'none';
        }
      }, 0);
    },
    async onConfirm() {
      await deleteTask(task.id);
      showToast('Đã xóa task thành công!', 'success');
      await loadTasks();
    },
  });
}

function escapeHtml(str) {
  const d = document.createElement('div');
  d.textContent = str ?? '';
  return d.innerHTML;
}
