/**
 * App Controller — orchestrates data loading and wires components together.
 * This is the single point of coordination between services and UI components.
 */
import { state, setState } from '../store/state.js';
import { getCategories } from '../services/categoryService.js';
import { getTasksByCategory, getTaskById, getUncategorizedTasks } from '../services/taskService.js';
import { updateSidebar } from '../components/Sidebar/Sidebar.js';
import { updateTaskPanel, populateTaskItems } from '../components/TaskList/TaskList.js';
import { updateTaskDetailPanel } from '../components/TaskDetail/TaskDetail.js';
import { showToast } from '../components/Toast/Toast.js';

/** Stored onEditTask callback — set when app mounts */
let _onEditTask = () => { };

export function setEditTaskCallback(fn) {
  _onEditTask = fn;
}

/**
 * Load categories from backend and refresh sidebar.
 */
export async function loadCategories() {
  setState({ loadingCategories: true });
  updateSidebar();

  try {
    const page = await getCategories({
      name: state.searchQuery || undefined,
      size: 20,
    });
    setState({ categories: page.content, loadingCategories: false, categoriesLoaded: true });
  } catch (err) {
    // Giữ nguyên categories cũ, chỉ tắt loading — tránh sidebar hiện "Chưa có category nào"
    setState({ loadingCategories: false });
    showToast('Không thể tải categories: ' + err.message, 'error');
  }

  updateSidebar();
}

/**
 * Load tasks for the currently selected category and refresh the task panel.
 */
export async function loadTasks() {
  if (!state.selectedCategory) return;

  setState({ loadingTasks: true });
  refreshTaskPanel();

  const isCompleted =
    state.taskFilter === 'completed' ? true :
      state.taskFilter === 'incomplete' ? false :
        undefined;

  try {
    let page;
    if (state.selectedCategory.id === 'uncategorized') {
      page = await getUncategorizedTasks({
        name: state.searchQuery || undefined,
        isCompleted,
        page: state.taskPage,
        size: 5,
        sortBy: state.taskSortBy,
        sortDir: state.taskSortDir,
      });
    } else {
      page = await getTasksByCategory({
        categoryId: state.selectedCategory.id,
        name: state.searchQuery || undefined,
        isCompleted,
        page: state.taskPage,
        size: 5,
        sortBy: state.taskSortBy,
        sortDir: state.taskSortDir,
      });
    }
    setState({
      tasks: page.content,
      taskTotalPages: page.totalPages,
      taskTotalElements: page.totalElements,
      loadingTasks: false,
    });
  } catch (err) {
    setState({ loadingTasks: false });
    showToast('Không thể tải tasks: ' + err.message, 'error');
  }

  refreshTaskPanel();
}

/**
 * Mở chi tiết của một task.
 */
export async function selectTask(taskId) {
  if (!taskId) {
    clearTaskSelection();
    return;
  }

  setState({ selectedTaskId: taskId, selectedTask: null });
  // Bắn event để main.js chuyển đổi UI
  document.dispatchEvent(new CustomEvent('todo:task-selected'));

  try {
    const task = await getTaskById(taskId);
    setState({ selectedTask: task });
    refreshTaskDetailPanel();
  } catch (err) {
    showToast('Không thể tải chi tiết task: ' + err.message, 'error');
    clearTaskSelection();
  }
}

/**
 * Đóng chi tiết task và quay lại danh sách.
 */
export function clearTaskSelection() {
  setState({ selectedTaskId: null, selectedTask: null });
  document.dispatchEvent(new CustomEvent('todo:task-selected'));
}

/**
 * Re-render the task panel and populate task items.
 */
export function refreshTaskPanel() {
  updateTaskPanel(null, {
    onAddTask: () => {
      // Will be set by main.js via callbacks
      document.dispatchEvent(new CustomEvent('todo:add-task'));
    },
    onEditTask: _onEditTask,
  });

  if (!state.loadingTasks) {
    populateTaskItems(selectTask);
  }
}

/**
 * Re-render task detail panel.
 */
function refreshTaskDetailPanel() {
  if (state.selectedTaskId && state.selectedTask) {
    updateTaskDetailPanel(null, {
      onBack: clearTaskSelection,
    });
  }
}
