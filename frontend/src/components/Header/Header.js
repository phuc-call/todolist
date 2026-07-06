/* ============================================================
   Header Component
   Renders the top navigation bar with a search input.
   ============================================================ */

import { state, setState } from '../../store/state.js';
import { loadCategories, loadTasks } from '../../controllers/appController.js';

let searchTimer = null;

/**
 * Create and return the Header DOM element.
 * @returns {HTMLElement}
 */
export function createHeader() {
  const header = document.createElement('header');
  header.className = 'header';
  header.id = 'app-header';

  header.innerHTML = `
    <div class="header__inner">
      <!-- Hamburger: chỉ hiện trên mobile -->
      <button class="header__menu-btn" id="header-menu-btn" aria-label="Mở menu">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
          <path d="M2 4.5h14M2 9h14M2 13.5h14" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
        </svg>
      </button>

      <div class="header__brand">
        <svg class="header__logo" width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <rect x="2" y="3" width="12" height="2" rx="1" fill="currentColor"/>
          <rect x="2" y="8" width="16" height="2" rx="1" fill="currentColor"/>
          <rect x="2" y="13" width="10" height="2" rx="1" fill="currentColor"/>
          <circle cx="16" cy="14" r="3" fill="currentColor" opacity="0.3"/>
          <path d="M15 14l1 1 2-2" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span class="header__title">TodoList</span>
      </div>

      <div class="header__search" role="search">
        <svg class="header__search-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <circle cx="7" cy="7" r="4.5" stroke="currentColor" stroke-width="1.5"/>
          <path d="M10.5 10.5L13.5 13.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
        <input
          id="global-search"
          class="header__search-input"
          type="search"
          placeholder="Tìm kiếm category hoặc task..."
          autocomplete="off"
          aria-label="Tìm kiếm"
          value="${state.searchQuery}"
        />
        <kbd class="header__shortcut" aria-hidden="true">⌘K</kbd>
      </div>

      <button class="header__new-btn" id="header-new-task-btn" aria-label="Tạo task mới">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path d="M7 1v12M1 7h12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        <span class="header__new-btn-text">Tạo task</span>
      </button>
    </div>
  `;

  const input = header.querySelector('#global-search');
  input.addEventListener('input', (e) => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      setState({ searchQuery: e.target.value, taskPage: 0 });
      loadCategories();
      if (state.selectedCategory) loadTasks();
    }, 350);
  });

  // Hamburger toggle (mobile)
  header.querySelector('#header-menu-btn')?.addEventListener('click', () => {
    document.dispatchEvent(new CustomEvent('todo:toggle-sidebar'));
  });

  // Keyboard shortcut Cmd/Ctrl+K
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      input.focus();
    }
  });

  return header;
}
