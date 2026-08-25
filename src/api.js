async function request(path, options) {
  const response = await fetch(`/api${path}`, { headers: { 'Content-Type': 'application/json' }, ...options });
  const data = await response.json();
  if (!response.ok) throw Object.assign(new Error(data.error || 'Something went wrong.'), { data, status: response.status });
  return data;
}

export const api = {
  forms: () => request('/forms'),
  form: (formId) => request(`/forms/${formId}`),
  auth: (payload) => request('/auth/mock', { method: 'POST', body: JSON.stringify(payload) }),
  prefill: (formId) => request('/prefill', { method: 'POST', body: JSON.stringify({ formId }) }),
  validate: (payload) => request('/validate', { method: 'POST', body: JSON.stringify(payload) }),
  chat: (payload) => request('/chat', { method: 'POST', body: JSON.stringify(payload) }),
  submit: (payload) => request('/submit', { method: 'POST', body: JSON.stringify(payload) }),
  status: (reference) => request(`/status/${reference}`)
};
