/**
 * Mirror of backend DTOs — matches Spring Boot response/request shapes exactly.
 * All field names match JSON serialization of Java camelCase fields.
 */

/**
 * @typedef {Object} ApiResponse
 * @property {number} code
 * @property {string} message
 * @property {*} data
 */

/**
 * @typedef {Object} PageResponse
 * @property {Array} content
 * @property {number} totalElements
 * @property {number} totalPages
 * @property {number} number      - current page index (0-based)
 * @property {number} size
 * @property {boolean} last
 */

/**
 * @typedef {Object} CategoryResponse
 * @property {number} id
 * @property {string} name
 * @property {string|null} description
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * @typedef {Object} TaskResponse
 * @property {number} id
 * @property {string} name
 * @property {string|null} content
 * @property {boolean} isCompleted
 * @property {number|null} categoryId
 * @property {string|null} categoryName
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * @typedef {Object} CreateTaskRequest
 * @property {string} name
 * @property {string|null} content
 * @property {number|null} categoryId
 */

/**
 * @typedef {Object} UpdateTaskRequest
 * @property {string|null} name
 * @property {string|null} content
 * @property {boolean|null} isCompleted
 * @property {number|null} categoryId
 */

/**
 * @typedef {Object} CreateCategoryRequest
 * @property {string} name
 * @property {string|null} description
 */

/**
 * @typedef {Object} UpdateCategoryRequest
 * @property {string|null} name
 * @property {string|null} description
 */

/**
 * @typedef {'DELETE'|'MOVE'|'SET_NULL'} TaskAction
 */

/**
 * @typedef {Object} DeleteCategoryRequest
 * @property {TaskAction} taskAction
 * @property {number|null} newCategoryId  - used when taskAction === 'MOVE'
 */

export {};
