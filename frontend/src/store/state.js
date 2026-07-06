/**
 * Global application state — single source of truth passed to components.
 */
export const state = {
  /** @type {import('../api/types').CategoryResponse[]} */
  categories: [],

  /** @type {import('../api/types').CategoryResponse|null} */
  selectedCategory: null,

  /** @type {import('../api/types').TaskResponse[]} */
  tasks: [],

  /** @type {number|null} ID của task đang được chọn để xem chi tiết */
  selectedTaskId: null,

  /** @type {import('../api/types').TaskResponse|null} Dữ liệu chi tiết của task đang chọn */
  selectedTask: null,

  /** @type {boolean} */
  loadingCategories: false,

  /** @type {boolean} — true sau khi load categories thành công lần đầu */
  categoriesLoaded: false,

  /** @type {boolean} */
  loadingTasks: false,

  /** @type {string} search query */
  searchQuery: '',

  /** @type {string|null} 'completed' | 'incomplete' | null */
  taskFilter: null,

  /** @type {number} current task page */
  taskPage: 0,

  /** @type {number} */
  taskTotalPages: 1,

  /** @type {number} */
  taskTotalElements: 0,

  /** @type {string} */
  taskSortBy: 'createdAt',

  /** @type {string} */
  taskSortDir: 'desc',

  /** @type {boolean} Có đang bật chế độ chọn nhiều hay không */
  isSelectionMode: false,

  /** @type {Set<number>} Danh sách các ID đang được chọn */
  selectedTaskIds: new Set(),
};

/** @type {Array<() => void>} listeners for state changes */
const listeners = [];

/**
 * Subscribe to state changes.
 * @param {() => void} fn
 * @returns {() => void} unsubscribe
 */
export function subscribe(fn) {
  listeners.push(fn);
  return () => {
    const idx = listeners.indexOf(fn);
    if (idx !== -1) listeners.splice(idx, 1);
  };
}

/**
 * Merge updates into state and notify all subscribers.
 * @param {Partial<typeof state>} updates
 */
export function setState(updates) {
  Object.assign(state, updates);
  listeners.forEach((fn) => fn());
}
