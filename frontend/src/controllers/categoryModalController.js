/**
 * Category Modals
 * All modal dialogs for Create / Edit / Delete category.
 * Aligned exactly with backend DTO shapes.
 */
import { openModal } from '../components/Modal/Modal.js';
import { createCategory, updateCategory, deleteCategory } from '../services/categoryService.js';
import { loadCategories } from './appController.js';
import { showToast } from '../components/Toast/Toast.js';
import { state, setState } from '../store/state.js';

/**
 * Open "Create Category" modal.
 */
export function openCreateCategoryModal() {
  openModal({
    title: 'Tạo Category mới',
    confirmLabel: 'Tạo',
    build(body) {
      body.innerHTML = `
        <div class="form-group">
          <label class="form-label" for="cat-name">Tên category <span style="color:#dc2626">*</span></label>
          <input id="cat-name" class="form-input" type="text" placeholder="VD: Công việc, Học tập..." autocomplete="off" />
        </div>
        <div class="form-group">
          <label class="form-label" for="cat-desc">Mô tả</label>
          <textarea id="cat-desc" class="form-textarea" placeholder="Mô tả ngắn về category..."></textarea>
        </div>
      `;
    },
    async onConfirm() {
      const name = document.getElementById('cat-name')?.value.trim();
      const description = document.getElementById('cat-desc')?.value.trim() || null;

      if (!name) throw new Error('Tên category không được để trống');

      await createCategory({ name, description });
      showToast('Đã tạo category!', 'success');
      await loadCategories();
    },
  });
}

/**
 * Open "Edit Category" modal.
 * @param {import('../api/types').CategoryResponse} category
 */
export function openEditCategoryModal(category) {
  openModal({
    title: 'Chỉnh sửa Category',
    confirmLabel: 'Lưu',
    build(body) {
      body.innerHTML = `
        <div class="form-group">
          <label class="form-label" for="cat-edit-name">Tên category <span style="color:#dc2626">*</span></label>
          <input id="cat-edit-name" class="form-input" type="text" value="${escapeHtml(category.name)}" autocomplete="off" />
        </div>
        <div class="form-group">
          <label class="form-label" for="cat-edit-desc">Mô tả</label>
          <textarea id="cat-edit-desc" class="form-textarea" placeholder="Mô tả ngắn về category...">${escapeHtml(category.description || '')}</textarea>
        </div>
      `;
    },
    async onConfirm() {
      const name = document.getElementById('cat-edit-name')?.value.trim();
      const description = document.getElementById('cat-edit-desc')?.value.trim() || null;

      if (!name) throw new Error('Tên không được để trống');

      await updateCategory(category.id, { name, description });
      showToast('Đã cập nhật category!', 'success');
      await loadCategories();
      if (state.selectedCategory?.id === category.id) {
        setState({ selectedCategory: { ...state.selectedCategory, name, description } });
      }
    },
  });
}

/**
 * Open "Delete Category" modal with task action options.
 * Backend field: newCategoryId (not targetCategoryId)
 * Backend enum: DELETE | MOVE | SET_NULL
 * @param {import('../api/types').CategoryResponse} category
 */
export function openDeleteCategoryModal(category) {
  openModal({
    title: `Xóa "${category.name}"`,
    confirmLabel: 'Xóa',
    build(body) {
      const otherCategories = state.categories.filter((c) => c.id !== category.id);
      body.innerHTML = `
        <p style="font-size:var(--font-body);color:var(--text-secondary);margin:0 0 var(--gap-md)">
          Category này có thể chứa tasks. Bạn muốn xử lý chúng thế nào?
        </p>
        <div class="form-group">
          <label class="form-label" for="delete-action">Hành động với tasks</label>
          <select id="delete-action" class="form-select">
            <option value="DELETE">Xóa tất cả tasks</option>
            <option value="SET_NULL">Giữ tasks (bỏ liên kết category)</option>
            ${otherCategories.length > 0 ? '<option value="MOVE">Chuyển sang category khác</option>' : ''}
          </select>
        </div>
        ${otherCategories.length > 0 ? `
          <div class="form-group" id="move-target-group" style="display:none">
            <label class="form-label" for="move-target">Chuyển đến</label>
            <select id="move-target" class="form-select">
              ${otherCategories.map((c) => `<option value="${c.id}">${escapeHtml(c.name)}</option>`).join('')}
            </select>
          </div>` : ''}
      `;

      const actionSelect = body.querySelector('#delete-action');
      const moveGroup = body.querySelector('#move-target-group');

      actionSelect?.addEventListener('change', () => {
        if (moveGroup) {
          moveGroup.style.display = actionSelect.value === 'MOVE' ? 'flex' : 'none';
        }
      });
    },
    async onConfirm() {
      const taskAction = document.getElementById('delete-action')?.value;
      // Backend field name is "newCategoryId", not "targetCategoryId"
      const newCategoryId = taskAction === 'MOVE'
        ? Number(document.getElementById('move-target')?.value)
        : null;

      await deleteCategory(category.id, { taskAction, newCategoryId });
      showToast('Đã xóa category', 'success');

      if (state.selectedCategory?.id === category.id) {
        setState({ selectedCategory: null, tasks: [] });
      }
      await loadCategories();
    },
  });
}

function escapeHtml(str) {
  const d = document.createElement('div');
  d.textContent = str ?? '';
  return d.innerHTML;
}
