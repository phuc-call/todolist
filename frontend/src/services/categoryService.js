/**
 * CategoryService — all API calls for /api/v1/categories
 * @module services/categoryService
 */
import { http } from '../api/http.js';

/**
 * Get paginated list of categories with optional name filter.
 *
 * @param {Object} params
 * @param {string} [params.name]
 * @param {number} [params.page=0]
 * @param {number} [params.size=10]
 * @param {string} [params.sortBy='createdAt']
 * @param {string} [params.sortDir='desc']
 * @returns {Promise<import('../api/types').PageResponse>}
 */
export function getCategories({ name, page = 0, size = 10, sortBy = 'createdAt', sortDir = 'desc' } = {}) {
  const query = new URLSearchParams();
  if (name) query.set('name', name);
  query.set('page', page);
  query.set('size', size);
  query.set('sortBy', sortBy);
  query.set('sortDir', sortDir);
  return http(`/categories?${query}`);
}

/**
 * Create a new category.
 * @param {import('../api/types').CreateCategoryRequest} data
 * @returns {Promise<import('../api/types').CategoryResponse>}
 */
export function createCategory(data) {
  return http('/categories', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Update an existing category.
 * @param {number} id
 * @param {import('../api/types').UpdateCategoryRequest} data
 * @returns {Promise<import('../api/types').CategoryResponse>}
 */
export function updateCategory(id, data) {
  return http(`/categories/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/**
 * Delete a category with a specified task handling action.
 * @param {number} id
 * @param {import('../api/types').DeleteCategoryRequest} [data]
 * @returns {Promise<null>}
 */
export function deleteCategory(id, data) {
  return http(`/categories/${id}`, {
    method: 'DELETE',
    body: data ? JSON.stringify(data) : undefined,
  });
}
