const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

let idToken = localStorage.getItem('dsa_google_token') || '';

export function setIdToken(token) {
  idToken = token || '';
  if (idToken) localStorage.setItem('dsa_google_token', idToken);
  else localStorage.removeItem('dsa_google_token');
}

export function getIdToken() {
  return idToken;
}

// Google ID tokens expire (~1 hour) and there's no silent-refresh flow, so an
// admin action can start failing with 401 while the UI still shows the person
// as signed in. Any part of the app can register a handler here to react
// globally (clear the stale token, prompt sign-in again) instead of that
// failure surfacing as a confusing one-off error deep in some component.
let unauthorizedHandler = null;
export function setUnauthorizedHandler(fn) {
  unauthorizedHandler = fn;
}

async function request(path, options = {}) {
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  if (idToken) headers.set('Authorization', `Bearer ${idToken}`);

  const response = await fetch(`${API_URL}${path}`, { ...options, headers });
  const data = response.status === 204 ? null : await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401 && unauthorizedHandler) unauthorizedHandler();
    throw new Error(data.message || 'Request failed');
  }
  return data;
}

export const api = {
  getTree: () => request('/dsa/tree'),
  getMe: () => request('/auth/me'),
  createTopic: (name) => request('/dsa/topics', { method: 'POST', body: JSON.stringify({ name }) }),
  updateTopic: (id, name) => request(`/dsa/topics/${id}`, { method: 'PATCH', body: JSON.stringify({ name }) }),
  deleteTopic: (id) => request(`/dsa/topics/${id}`, { method: 'DELETE' }),
  createSubtopic: (topicId, name) => request(`/dsa/topics/${topicId}/subtopics`, { method: 'POST', body: JSON.stringify({ name }) }),
  updateSubtopic: (id, name) => request(`/dsa/subtopics/${id}`, { method: 'PATCH', body: JSON.stringify({ name }) }),
  deleteSubtopic: (id) => request(`/dsa/subtopics/${id}`, { method: 'DELETE' }),
  createQuestion: (subtopicId, name) => request(`/dsa/subtopics/${subtopicId}/questions`, { method: 'POST', body: JSON.stringify({ name }) }),
  getQuestion: (id) => request(`/dsa/questions/${id}`),
  updateQuestion: (id, payload) => request(`/dsa/questions/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  deleteQuestion: (id) => request(`/dsa/questions/${id}`, { method: 'DELETE' }),
  cloudinarySignature: () => request('/upload/signature', { method: 'POST' })
};
