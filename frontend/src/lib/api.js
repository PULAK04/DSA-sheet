const API_URL =
  import.meta.env.VITE_API_URL ||
  'http://localhost:5000/api';

/*
 * This is now OUR application JWT.
 *
 * It is NOT the Google ID token.
 */
let authToken =
  localStorage.getItem('dsa_jwt') || '';

export function setAuthToken(token) {
  authToken = token || '';

  if (authToken) {
    localStorage.setItem(
      'dsa_jwt',
      authToken
    );
  } else {
    localStorage.removeItem('dsa_jwt');
  }
}

export function getAuthToken() {
  return authToken;
}

/*
 * Any protected API request that returns 401
 * can notify the authentication context.
 */
let unauthorizedHandler = null;

export function setUnauthorizedHandler(fn) {
  unauthorizedHandler = fn;
}

async function request(path, options = {}) {
  const headers = new Headers(
    options.headers || {}
  );

  if (
    !headers.has('Content-Type') &&
    options.body &&
    !(options.body instanceof FormData)
  ) {
    headers.set(
      'Content-Type',
      'application/json'
    );
  }

  /*
   * Send OUR JWT with API requests.
   */
  if (authToken) {
    headers.set(
      'Authorization',
      `Bearer ${authToken}`
    );
  }

  const response = await fetch(
    `${API_URL}${path}`,
    {
      ...options,
      headers
    }
  );

  const data =
    response.status === 204
      ? null
      : await response
          .json()
          .catch(() => ({}));

  if (!response.ok) {
    if (
      response.status === 401 &&
      unauthorizedHandler
    ) {
      unauthorizedHandler();
    }

    throw new Error(
      data.message || 'Request failed'
    );
  }

  return data;
}

export const api = {
  /*
   * Authentication
   */
  googleLogin: (credential) =>
    request('/auth/google', {
      method: 'POST',
      body: JSON.stringify({
        credential
      })
    }),

  getMe: () =>
    request('/auth/me'),

  /*
   * DSA tree
   */
  getTree: () =>
    request('/dsa/tree'),

  /*
   * Topics
   */
  createTopic: (name) =>
    request('/dsa/topics', {
      method: 'POST',
      body: JSON.stringify({ name })
    }),

  updateTopic: (id, name) =>
    request(`/dsa/topics/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ name })
    }),

  deleteTopic: (id) =>
    request(`/dsa/topics/${id}`, {
      method: 'DELETE'
    }),

  /*
   * Subtopics
   */
  createSubtopic: (topicId, name) =>
    request(
      `/dsa/topics/${topicId}/subtopics`,
      {
        method: 'POST',
        body: JSON.stringify({ name })
      }
    ),

  updateSubtopic: (id, name) =>
    request(`/dsa/subtopics/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ name })
    }),

  deleteSubtopic: (id) =>
    request(`/dsa/subtopics/${id}`, {
      method: 'DELETE'
    }),

  /*
   * Questions
   */
  createQuestion: (subtopicId, name) =>
    request(
      `/dsa/subtopics/${subtopicId}/questions`,
      {
        method: 'POST',
        body: JSON.stringify({ name })
      }
    ),

  getQuestion: (id) =>
    request(`/dsa/questions/${id}`),

  updateQuestion: (id, payload) =>
    request(`/dsa/questions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    }),

  deleteQuestion: (id) =>
    request(`/dsa/questions/${id}`, {
      method: 'DELETE'
    }),

  /*
   * Cloudinary
   */
  cloudinarySignature: () =>
    request('/upload/signature', {
      method: 'POST'
    })
};