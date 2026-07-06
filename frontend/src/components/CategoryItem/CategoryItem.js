/**
 * CategoryItem Component
 * Renders a single category row in the sidebar.
 */
import { state, setState } from '../../store/state.js';
import { loadTasks } from '../../controllers/appController.js';

/**
 * @param {import('../../api/types').CategoryResponse} category
 * @param {Object} callbacks
 * @param {(category: *) => void} callbacks.onEdit
 * @param {(category: *) => void} callbacks.onDelete
 * @returns {HTMLElement}
 */
export function createCategoryItem(category, { onEdit, onDelete }) {
  const li = document.createElement('li');
  li.className = 'category-item' + (state.selectedCategory?.id === category.id ? ' active' : '');
  li.dataset.categoryId = category.id;
  li.setAttribute('role', 'button');
  li.setAttribute('tabindex', '0');
  li.setAttribute('aria-label', `Category: ${category.name}`);

  li.innerHTML = `
    <span class="category-item__name">${escapeHtml(category.name)}</span>
    <div class="category-item__actions" aria-label="Category actions">
      <button class="category-item__btn" data-action="edit" title="Chỉnh sửa" aria-label="Chỉnh sửa ${escapeHtml(category.name)}">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path d="M9.5 2.5l2 2L4 12H2v-2L9.5 2.5z" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <button class="category-item__btn" data-action="delete" title="Xóa" aria-label="Xóa ${escapeHtml(category.name)}">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path d="M2 3.5h10M5.5 3.5V2.5h3V3.5M5 6l.5 5M9 6l-.5 5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
        </svg>
      </button>
    </div>
  `;

  // Select category on click
  li.addEventListener('click', (e) => {
    const action = e.target.closest('[data-action]')?.dataset.action;
    if (action === 'edit') {
      e.stopPropagation();
      onEdit(category);
      return;
    }
    if (action === 'delete') {
      e.stopPropagation();
      onDelete(category);
      return;
    }

    setState({ selectedCategory: category, taskPage: 0, taskFilter: null });
    
    // Xóa active cũ và gán active cho item hiện tại
    document.querySelectorAll('.category-item').forEach(el => el.classList.remove('active'));
    li.classList.add('active');

    loadTasks();
    document.dispatchEvent(new CustomEvent('todo:category-selected'));
  });

  li.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      li.click();
    }
  });

  return li;
}

function escapeHtml(str) {
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}
