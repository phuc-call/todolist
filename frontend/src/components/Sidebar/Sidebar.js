/**
 * Sidebar Component
 * Shows the list of categories fetched from /api/v1/categories.
 */
import { state } from '../../store/state.js';
import { createCategoryItem } from '../CategoryItem/CategoryItem.js';

let _onAddCategory = () => { };
let _onEditCategory = () => { };
let _onDeleteCategory = () => { };

/**
 * Create the sidebar DOM element.
 * @param {Object} callbacks
 * @param {() => void} callbacks.onAddCategory
 * @param {(category: *) => void} callbacks.onEditCategory
 * @param {(category: *) => void} callbacks.onDeleteCategory
 * @returns {HTMLElement}
 */
export function createSidebar({ onAddCategory, onEditCategory, onDeleteCategory }) {
  _onAddCategory = onAddCategory;
  _onEditCategory = onEditCategory;
  _onDeleteCategory = onDeleteCategory;

  const aside = document.createElement('aside');
  aside.className = 'sidebar';
  aside.id = 'app-sidebar';
  aside.setAttribute('aria-label', 'Category list');

  renderSidebar(aside);
  return aside;
}

/**
 * Re-render sidebar contents in place.
 * Called by the app controller when state changes.
 * @param {HTMLElement} [container]
 */
export function updateSidebar(container) {
  const el = container || document.getElementById('app-sidebar');
  if (!el) return;
  renderSidebar(el);
}

function renderSidebar(aside) {
  aside.innerHTML = `
    <div class="sidebar__header">
      <h2 class="sidebar__heading">Categories</h2>
      <button class="sidebar__add-btn" id="sidebar-add-category-btn" aria-label="Thêm category mới">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <path d="M6 1v10M1 6h10" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
        </svg>
      </button>
    </div>
    <ul class="sidebar__list" id="sidebar-category-list" role="listbox" aria-label="Danh sách category">
      ${renderContent()}
    </ul>
    
    <div class="sidebar__uncategorized" style="margin-top: 16px; padding-top: 8px; border-top: 1px solid var(--border);">
      <ul class="sidebar__list">
        <li class="category-item ${state.selectedCategory?.id === 'uncategorized' ? 'active' : ''}" id="sidebar-uncategorized-item" tabindex="0" role="option" style="padding-left: 8px;">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-right: 8px; flex-shrink: 0; opacity: 0.7;">
            <path d="M2.5 4h11v8h-11z" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M2.5 8h11" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span class="category-item__name">Không có phân loại</span>
        </li>
      </ul>
    </div>
  `;

  // Re-attach non-skeleton items
  if (!state.loadingCategories && state.categories.length > 0) {
    const list = aside.querySelector('#sidebar-category-list');
    list.innerHTML = '';
    state.categories.forEach((cat) => {
      const item = createCategoryItem(cat, {
        onEdit: _onEditCategory,
        onDelete: _onDeleteCategory,
      });
      list.appendChild(item);
    });
  }

  aside.querySelector('#sidebar-add-category-btn')?.addEventListener('click', _onAddCategory);

  aside.querySelector('#sidebar-uncategorized-item')?.addEventListener('click', async () => {
    import('../../store/state.js').then(m => {
      m.setState({
        selectedCategory: { id: 'uncategorized', name: 'Không có phân loại' },
        taskPage: 0,
        taskFilter: null
      });
      document.dispatchEvent(new CustomEvent('todo:category-selected'));
      updateSidebar();
      import('../../controllers/appController.js').then(c => c.loadTasks());
    });
  });
}

function renderContent() {
  // Đang load → hiện skeleton
  if (state.loadingCategories) {
    return `
      <div class="sidebar__loading" aria-label="Đang tải...">
        <div style="width:100%">
          ${[...Array(5)].map(() => `<div class="sidebar__skeleton"></div>`).join('')}
        </div>
      </div>`;
  }

  // Đã load thành công ít nhất 1 lần nhưng danh sách trống → hiện empty state
  if (state.categoriesLoaded && state.categories.length === 0) {
    return `<li class="sidebar__empty">Chưa có category nào.<br>Nhấn + để tạo mới.</li>`;
  }

  // Chưa load thành công (lỗi ngay lần đầu) hoặc đang chờ → không hiện gì
  // Items được append bởi createCategoryItem sau khi innerHTML reset
  return '';
}
