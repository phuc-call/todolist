/**
 * TaskService — all API calls for /api/v1/tasks
 * @module services/taskService
 */
import { http } from '../api/http.js';

/**
 * Get paginated tasks for a category with optional filters.
 *
 * @param {Object} params
 * @param {number} params.categoryId
 * @param {string} [params.name]
 * @param {boolean} [params.isCompleted]
 * @param {number} [params.page=0]
 * @param {number} [params.size=20]
 * @param {string} [params.sortBy='createdAt']
 * @param {string} [params.sortDir='desc']
 * @returns {Promise<import('../api/types').PageResponse>}
 */
export function getTasksByCategory({ categoryId, name, isCompleted, page = 0, size = 10, sortBy = 'createdAt', sortDir = 'desc' }) {
  const query = new URLSearchParams();
  query.set('categoryId', categoryId);
  if (name) query.set('name', name);
  if (isCompleted !== undefined && isCompleted !== null) query.set('isCompleted', isCompleted);
  query.set('page', page);
  query.set('size', size);
  query.set('sortBy', sortBy);
  query.set('sortDir', sortDir);
  return http(`/tasks?${query}`);
}

/**
 * Get paginated tasks without any category.
 *
 * @param {Object} params
 * @param {string} [params.name]
 * @param {boolean} [params.isCompleted]
 * @param {number} [params.page=0]
 * @param {number} [params.size=20]
 * @param {string} [params.sortBy='createdAt']
 * @param {string} [params.sortDir='desc']
 * @returns {Promise<import('../api/types').PageResponse>}
 */
export function getUncategorizedTasks({ name, isCompleted, page = 0, size = 10, sortBy = 'createdAt', sortDir = 'desc' }) {
  const query = new URLSearchParams();
  if (name) query.set('name', name);
  if (isCompleted !== undefined && isCompleted !== null) query.set('isCompleted', isCompleted);
  query.set('page', page);
  query.set('size', size);
  query.set('sortBy', sortBy);
  query.set('sortDir', sortDir);
  return http(`/tasks/uncategorized?${query}`);
}

/**
 * Get task details by ID.
 * @param {number} id
 * @returns {Promise<import('../api/types').TaskResponse>}
 */
export function getTaskById(id) {
  return http(`/tasks/${id}`);
}

/**
 * Create a new task.
 * @param {import('../api/types').CreateTaskRequest} data
 * @returns {Promise<import('../api/types').TaskResponse>}
 */
export function createTask(data) {
  return http('/tasks', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Update an existing task (partial update — only send non-null fields).
 * @param {number} id
 * @param {import('../api/types').UpdateTaskRequest} data
 * @returns {Promise<import('../api/types').TaskResponse>}
 */
export function updateTask(id, data) {
  return http(`/tasks/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/**
 * Toggle task completion status (completed ↔ incomplete).
 * Maps to PATCH /tasks/{id}/toggle
 *
 * @param {number} id
 * @returns {Promise<import('../api/types').TaskResponse>}
 */
export function toggleTaskCompletion(id) {
  return http(`/tasks/${id}/toggle`, {
    method: 'PATCH',
  });
}

/**
 * Move multiple tasks to a different category.
 * @param {number[]} taskIds
 * @param {number|null} categoryId
 * @returns {Promise<void>}
 */
export function moveTasks(taskIds, categoryId) {
  return http('/tasks/move', {
    method: 'PATCH',
    body: JSON.stringify({ taskIds, categoryId }),
  });
}

/**
 * Move a task to a different category.
 * @param {number} taskId
 * @param {number|null} categoryId
 * @returns {Promise<import('../api/types').TaskResponse>}
 */
export function changeTaskCategory(taskId, categoryId) {
  return http(`/tasks/${taskId}/category`, {
    method: 'PATCH',
    body: JSON.stringify({ categoryId }),
  });
}

/**
 * Delete a task permanently.
 * @param {number} id
 * @returns {Promise<null>}
 */
export function deleteTask(id) {
  return http(`/tasks/${id}`, {
    method: 'DELETE',
  });
}
