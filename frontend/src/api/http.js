/**
 * Base HTTP client — single source of truth for API base URL and error handling.
 */

const BASE_URL = 'http://localhost:8080/api/v1';

/**
 * Generic fetch wrapper that unwraps the backend ApiResponse envelope.
 * Throws an Error with the backend message on non-2xx responses.
 * Handles both JSON and plain-text responses (e.g. 429 rate limit).
 *
 * @param {string} path
 * @param {RequestInit} [options]
 * @returns {Promise<*>} - resolves with ApiResponse.data
 */
export async function http(path, options = {}) {
  const url = `${BASE_URL}${path}`;

  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  const response = await fetch(url, {
    ...options,
    headers: { ...defaultHeaders, ...options.headers },
  });

  // Check content type to handle plain-text responses (e.g. 429 rate limit)
  const contentType = response.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');

  if (!response.ok) {
    let message = `HTTP ${response.status}`;
    if (isJson) {
      try {
        const json = await response.json();
        message = json?.message || message;
      } catch { /* ignore parse error */ }
    } else {
      try {
        const text = await response.text();
        if (text) message = text.trim();
      } catch { /* ignore */ }
    }
    throw new Error(message);
  }

  if (isJson) {
    const json = await response.json();
    if (json.success === false) {
      throw new Error(json.message || 'Yêu cầu không thành công');
    }
    return json.data;
  }

  // For non-JSON success responses (e.g. 204 No Content)
  return null;
}
