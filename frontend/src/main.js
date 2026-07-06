/**
 * main.js — Application entry point
 *
 * Responsibilities:
 * - Import all CSS (component styles + global)
 * - Mount components into the DOM
 * - Wire event callbacks
 * - Bootstrap initial data load
 */

// Global styles
import './style.css';

// Component styles
import './components/Header/Header.css';
import './components/Sidebar/Sidebar.css';
import './components/CategoryItem/CategoryItem.css';
import './components/TaskList/TaskList.css';
import './components/TaskItem/TaskItem.css';
import './components/Modal/Modal.css';
import './components/Toast/Toast.css';

// Components
import { createHeader } from './components/Header/Header.js';
import { createSidebar } from './components/Sidebar/Sidebar.js';
import { createTaskPanel } from './components/TaskList/TaskList.js';
import { createTaskDetailPanel } from './components/TaskDetail/TaskDetail.js';

// Controllers
import { loadCategories, loadTasks, clearTaskSelection } from './controllers/appController.js';
import { state } from './store/state.js';
import {
  openCreateCategoryModal,
  openEditCategoryModal,
  openDeleteCategoryModal,
} from './controllers/categoryModalController.js';
import { openCreateTaskModal } from './controllers/taskModalController.js';

// -------------------------------------------------------
// Mount app
// -------------------------------------------------------
const app = document.getElementById('app');

// Header
const header = createHeader();
app.appendChild(header);

// Body (sidebar + main)
const body = document.createElement('div');
body.className = 'app-body';

const sidebar = createSidebar({
  onAddCategory: openCreateCategoryModal,
  onEditCategory: openEditCategoryModal,
  onDeleteCategory: openDeleteCategoryModal,
});
body.appendChild(sidebar);

const mainArea = document.createElement('main');
mainArea.className = 'main-area';
mainArea.style.flex = '1';
mainArea.style.display = 'flex';
mainArea.style.flexDirection = 'column';
mainArea.style.minWidth = '0';

const taskPanel = createTaskPanel({
  onAddTask: openCreateTaskModal,
});
taskPanel.style.display = 'flex';
taskPanel.style.height = '100%';

const taskDetailPanel = createTaskDetailPanel({
  onBack: clearTaskSelection,
});
taskDetailPanel.style.display = 'none';
taskDetailPanel.style.height = '100%';

mainArea.appendChild(taskPanel);
mainArea.appendChild(taskDetailPanel);

body.appendChild(mainArea);
app.appendChild(body);

// Listen to task-selected event to toggle views
document.addEventListener('todo:task-selected', () => {
  if (state.selectedTaskId) {
    taskPanel.style.display = 'none';
    taskDetailPanel.style.display = 'flex';
  } else {
    taskDetailPanel.style.display = 'none';
    taskPanel.style.display = 'flex';
  }
});

// Auto-close sidebar on mobile when a category is selected or task is selected
document.addEventListener('todo:category-selected', () => {
  clearTaskSelection(); // Return to list view if changing category
  if (window.innerWidth <= 640) closeSidebar();
});

// -------------------------------------------------------
// Mobile sidebar backdrop & toggle
// -------------------------------------------------------
const backdrop = document.createElement('div');
backdrop.className = 'sidebar-backdrop';
backdrop.id = 'sidebar-backdrop';
document.body.appendChild(backdrop);

function openSidebar() {
  sidebar.classList.add('open');
  backdrop.classList.add('visible');
  document.body.style.overflow = 'hidden';
}

function closeSidebar() {
  sidebar.classList.remove('open');
  backdrop.classList.remove('visible');
  document.body.style.overflow = '';
}

document.addEventListener('todo:toggle-sidebar', () => {
  sidebar.classList.contains('open') ? closeSidebar() : openSidebar();
});

backdrop.addEventListener('click', closeSidebar);

// Auto-close sidebar on mobile when a category is selected
// Đã xử lý ở trên

// Header "Tạo task" button
document.getElementById('header-new-task-btn')?.addEventListener('click', openCreateTaskModal);

// Task panel dispatches this event when "Thêm task" is clicked
document.addEventListener('todo:add-task', openCreateTaskModal);

// -------------------------------------------------------
// Bootstrap
// -------------------------------------------------------
loadCategories();
