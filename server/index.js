import express from 'express';
import { z } from 'zod';
import { FORM_SCHEMAS, MOCK_DIGILOCKER, buildSubmissionPayload, getInitialState } from '../src/data/forms.js';

const app = express();
const port = Number(process.env.PORT || 8787);
const submissions = new Map();

app.use(express.json({ limit: '1mb' }));

const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
const getSchema = (id) => FORM_SCHEMAS[id];

function validate(schema, values = {}, documents = {}) {
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

app.get('/api/health', (_request, response) => response.json({ ok: true, provider: 'FormSetu local API', time: new Date().toISOString() }));

app.get('/api/forms', (_request, response) => response.json(Object.values(FORM_SCHEMAS).map(({ id, title, service, description, fields }) => ({ id, title, service, description, fieldCount: fields.length }))));

app.get('/api/forms/:formId', (request, response) => {
  const schema = getSchema(request.params.formId);
  if (!schema) return response.status(404).json({ error: 'Form not found.' });
  return response.json(schema);
});

app.post('/api/auth/mock', async (request, response) => {
  const parsed = z.object({ formId: z.string(), mobile: z.string(), mode: z.enum(['otp', 'password']).default('otp'), credential: z.string().min(1) }).safeParse(request.body);
  if (!parsed.success || !getSchema(parsed.data.formId)) return response.status(400).json({ error: 'A valid form and sign-in details are required.' });
  if (!/^\d{10}$/.test(parsed.data.mobile.replace(/\D/g, ''))) return response.status(422).json({ error: 'Use a 10-digit mobile number.' });
  if (parsed.data.mode === 'otp' && !/^\d{6}$/.test(parsed.data.credential)) return response.status(422).json({ error: 'Use the six-digit demo OTP 123456.' });
  await wait(500);
  return response.json({ authenticated: true, method: parsed.data.mode, disclaimer: 'Mock authentication only — no credentials were checked.' });
});

app.post('/api/prefill', async (request, response) => {
  const parsed = z.object({ formId: z.string() }).safeParse(request.body);
  if (!parsed.success || !getSchema(parsed.data.formId)) return response.status(400).json({ error: 'A valid formId is required.' });
  await wait(700);
  const schema = getSchema(parsed.data.formId);
  const prefill = getInitialState(schema, MOCK_DIGILOCKER);
  return response.json({ ...prefill, mockResponse: MOCK_DIGILOCKER, matchedDocuments: Object.keys(prefill.documents).length, matchedFields: Object.keys(prefill.sources).length, disclaimer: 'Synthetic data only — no real DigiLocker account is contacted.' });
});

app.post('/api/validate', (request, response) => {
  const parsed = z.object({ formId: z.string(), values: z.record(z.string(), z.string()).default({}), documents: z.record(z.string(), z.any()).default({}) }).safeParse(request.body);
  if (!parsed.success || !getSchema(parsed.data.formId)) return response.status(400).json({ error: 'Invalid validation payload.' });
  const issues = validate(getSchema(parsed.data.formId), parsed.data.values, parsed.data.documents);
  return response.json({ valid: Object.keys(issues).length === 0, issues });
});

app.post('/api/chat', async (request, response) => {
  const parsed = z.object({ formId: z.string(), fieldId: z.string().optional(), message: z.string().trim().min(1).max(500), mode: z.enum(['simple', 'detailed']).default('simple'), language: z.enum(['English', 'Hindi']).default('English') }).safeParse(request.body);
  if (!parsed.success || !getSchema(parsed.data.formId)) return response.status(400).json({ error: 'Please send a valid message.' });
  await wait(360);
  const schema = getSchema(parsed.data.formId);
  const field = schema.fields.find((item) => item.id === parsed.data.fieldId) || schema.fields[0];
  const message = parsed.data.message.toLowerCase();
  const hindi = parsed.data.language === 'Hindi';
  const concise = parsed.data.mode === 'simple';
  let reply = hindi
    ? `इस सवाल के लिए ${field.chatPrompt}`
    : `${field.chatPrompt}${concise ? '' : ` This is used only to complete the ${schema.title.toLowerCase()}.`}`;
  let action = null;
  if (message.includes('option') && field.options) {
    reply = hindi ? `आप इनमें से चुन सकते हैं: ${field.options.join(', ')}.` : `You can choose one of these: ${field.options.join(', ')}.`;
    action = { type: 'show_options', fieldId: field.id };
  }
  if (message.includes('digilocker') || message.includes('document')) {
    reply = hindi ? 'मैं आपके नकली DigiLocker दस्तावेज़ों से मिलान की गई जानकारी दिखा सकता हूँ। हर उत्तर को आगे बढ़ने से पहले आप बदल सकते हैं।' : 'I can show the information matched from your synthetic DigiLocker documents. You can still change every answer before you continue.';
    action = { type: 'prefill' };
  }
  return response.json({ reply, action, provider: 'Local assistant simulator' });
});

app.post('/api/submit', async (request, response) => {
  const parsed = z.object({ formId: z.string(), values: z.record(z.string(), z.string()).default({}), documents: z.record(z.string(), z.any()).default({}), simulateMismatch: z.boolean().default(false) }).safeParse(request.body);
  if (!parsed.success || !getSchema(parsed.data.formId)) return response.status(400).json({ error: 'Invalid submission payload.' });
  const schema = getSchema(parsed.data.formId);
  const issues = validate(schema, parsed.data.values, parsed.data.documents);
  if (Object.keys(issues).length) return response.status(422).json({ error: 'Please resolve the highlighted answers.', issues });
  await wait(950);
  const payload = buildSubmissionPayload(schema, parsed.data.values, parsed.data.documents);
  if (parsed.data.simulateMismatch) {
    return response.status(422).json({
      status: 'error', error: 'Document mismatch', code: 'DOC_MISMATCH', field: 'income_certificate', fieldId: 'incomeCertificate',
      message: 'The applicant name does not match the income certificate.',
      issues: { incomeCertificate: 'The applicant name does not match the income certificate.' }, payload
    });
  }
  const reference = `${schema.id === 'nsp' ? 'NSP' : 'INC'}-${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
  submissions.set(reference, { reference, formId: schema.id, stage: 'Document check', createdAt: new Date().toISOString() });
  return response.json({ status: 'success', reference, referenceNumber: reference, stage: 'Document check', submittedPayload: payload, payload, message: 'Your prototype submission was accepted.' });
});

app.get('/api/status/:reference', (request, response) => {
  const item = submissions.get(request.params.reference);
  if (!item) return response.status(404).json({ error: 'Reference not found.' });
  return response.json({ ...item, timeline: [
    { title: 'Application received', detail: 'Your mock submission was accepted.', state: 'complete' },
    { title: 'Document check', detail: 'Documents are being checked for clarity and match.', state: 'current' },
    { title: 'Eligibility review', detail: 'The department will review eligibility next.', state: 'upcoming' },
    { title: 'Decision shared', detail: 'An update will appear here when the review finishes.', state: 'upcoming' }
  ] });
});

app.listen(port, '127.0.0.1', () => console.log(`FormSetu API listening on http://127.0.0.1:${port}`));
