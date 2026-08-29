import { FORM_SCHEMAS, MOCK_DIGITALDOC, buildSubmissionPayload, getInitialState } from './data/forms.js';

const REQUEST_TIMEOUT_MS = 3000;

const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
const getSchema = (id) => FORM_SCHEMAS[id] || (id === 'nsp' ? FORM_SCHEMAS.form25d : FORM_SCHEMAS.form25d);

function localValidate(schema, values = {}, documents = {}) {
  const issues = {};
  for (const field of schema.fields) {
    const value = field.type === 'file' ? documents[field.id] : values[field.id];
    if (field.required && !value) issues[field.id] = 'This answer is required.';
    if (field.format === 'phone' && value && !/^\d{10}$/.test(String(value).replace(/\D/g, ''))) issues[field.id] = 'Use a 10-digit mobile number.';
    if (field.type === 'number' && value && !/^\d+$/.test(String(value))) issues[field.id] = 'Use numbers only, without commas or symbols.';
    if ((field.type === 'category' || field.type === 'yesno') && value && !field.options.includes(value)) issues[field.id] = 'Choose one of the listed options.';
  }
  return issues;
}

const mockSubmissions = new Map();

async function request(path, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(`/api${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
      signal: options.signal || controller.signal
    });
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      throw new Error(`Server returned non-JSON response (${response.status})`);
    }
    const data = await response.json();
    if (!response.ok) throw Object.assign(new Error(data.error || 'Something went wrong.'), { data, status: response.status });
    return data;
  } catch (error) {
    if (error.name === 'AbortError') {
      console.warn(`[api] Request to /api${path} timed out. Using local fallback.`);
    } else {
      console.warn(`[api] Request to /api${path} failed (${error.message}). Using local fallback.`);
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

export const api = {
  forms: async () => {
    try {
      return await request('/forms');
    } catch {
      const forms = [...new Map(Object.values(FORM_SCHEMAS).map((schema) => [schema.id, schema])).values()];
      return forms.map(({ id, title, service, description, fields }) => ({ id, title, service, description, fieldCount: fields.length }));
    }
  },
  form: async (formId) => {
    try {
      return await request(`/forms/${formId}`);
    } catch {
      const schema = getSchema(formId);
      if (!schema) throw new Error('Form not found.');
      return schema;
    }
  },
  auth: async (payload) => {
    try {
      return await request('/auth/mock', { method: 'POST', body: JSON.stringify(payload) });
    } catch {
      await wait(300);
      return { authenticated: true, method: payload.mode || 'otp', disclaimer: 'Client mock authentication' };
    }
  },
  prefill: async (formId) => {
    try {
      return await request('/prefill', { method: 'POST', body: JSON.stringify({ formId }) });
    } catch {
      await wait(400);
      const schema = getSchema(formId);
      const prefill = getInitialState(schema, MOCK_DIGITALDOC);
      return {
        ...prefill,
        mockResponse: MOCK_DIGITALDOC,
        matchedDocuments: Object.keys(prefill.documents).length,
        matchedFields: Object.keys(prefill.sources).length,
        disclaimer: 'Synthetic client-side data'
      };
    }
  },
  validate: async (payload) => {
    try {
      return await request('/validate', { method: 'POST', body: JSON.stringify(payload) });
    } catch {
      const schema = getSchema(payload.formId);
      const issues = localValidate(schema, payload.values, payload.documents);
      return { valid: Object.keys(issues).length === 0, issues };
    }
  },
  chat: async (payload) => {
    try {
      return await request('/chat', { method: 'POST', body: JSON.stringify(payload) });
    } catch {
      await wait(200);
      const schema = getSchema(payload.formId);
      const field = schema.fields.find((item) => item.id === payload.fieldId) || schema.fields[0];
      return { reply: `${field.chatPrompt}`, action: null, provider: 'Local assistant' };
    }
  },
  submit: async (payload) => {
    try {
      return await request('/submit', { method: 'POST', body: JSON.stringify(payload) });
    } catch (err) {
      if (err.data && err.status === 422) {
        throw err;
      }
      await wait(500);
      const schema = getSchema(payload.formId);
      const issues = localValidate(schema, payload.values, payload.documents);
      if (Object.keys(issues).length) {
        const error = new Error('Please resolve the highlighted answers.');
        error.data = { issues };
        error.status = 422;
        throw error;
      }
      const submissionPayload = buildSubmissionPayload(schema, payload.values, payload.documents);
      if (payload.simulateMismatch) {
        const error = new Error('Document mismatch');
        error.data = {
          status: 'error', error: 'Document mismatch', code: 'DOC_MISMATCH', field: 'income_certificate', fieldId: 'incomeCertificate',
          message: 'The applicant name does not match the income certificate.',
          issues: { incomeCertificate: 'The applicant name does not match the income certificate.' }, payload: submissionPayload
        };
        error.status = 422;
        throw error;
      }
      const reference = `${schema.id === 'income' ? 'INC' : 'ITD'}-${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
      mockSubmissions.set(reference, { reference, formId: schema.id, stage: 'Document check', createdAt: new Date().toISOString() });
      return { status: 'success', reference, referenceNumber: reference, stage: 'Document check', submittedPayload: submissionPayload, payload: submissionPayload, message: 'Your prototype submission was accepted.' };
    }
  },
  status: async (reference) => {
    try {
      return await request(`/status/${reference}`);
    } catch {
      const item = mockSubmissions.get(reference);
      return {
        reference: item?.reference || reference || 'INC-2026-9A82F',
        stage: item?.stage || 'Under Civic Review',
        timeline: [
          { title: 'Application Submitted', detail: 'Application received and registered on portal.', state: 'complete' },
          { title: 'DigitalDoc Verification', detail: 'Identity, marksheet and income records verified.', state: 'complete' },
          { title: 'Civic review', detail: 'A review officer is checking eligibility.', state: 'complete' },
          { title: 'Decision & payout', detail: 'The final decision and payout update will appear here.', state: 'pending' }
        ]
      };
    }
  }
};
