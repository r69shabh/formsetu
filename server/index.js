import express from 'express';
import { z } from 'zod';
import { FORM_SCHEMAS, MOCK_DIGITALDOC, buildSubmissionPayload, getInitialState } from '../src/data/forms.js';

const app = express();
const port = Number(process.env.PORT || 8787);
const submissions = new Map();

app.use(express.json({ limit: '1mb' }));

const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
const getSchema = (id) => FORM_SCHEMAS[id] || (id === 'nsp' ? FORM_SCHEMAS.form25d : undefined);

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

const router = express.Router();

router.get('/health', (_request, response) => response.json({ ok: true, provider: 'FormSetu local API', time: new Date().toISOString() }));

router.get('/forms', (_request, response) => {
  const forms = [...new Map(Object.values(FORM_SCHEMAS).map((schema) => [schema.id, schema])).values()];
  return response.json(forms.map(({ id, title, service, description, fields }) => ({ id, title, service, description, fieldCount: fields.length })));
});

router.get('/forms/:formId', (request, response) => {
  const schema = getSchema(request.params.formId);
  if (!schema) return response.status(404).json({ error: 'Form not found.' });
  return response.json(schema);
});

router.post('/auth/mock', async (request, response) => {
  const parsed = z.object({ formId: z.string(), mobile: z.string(), mode: z.enum(['otp', 'password']).default('otp'), credential: z.string().min(1) }).safeParse(request.body);
  if (!parsed.success || !getSchema(parsed.data.formId)) return response.status(400).json({ error: 'A valid form and sign-in details are required.' });
  if (!/^\d{10}$/.test(parsed.data.mobile.replace(/\D/g, ''))) return response.status(422).json({ error: 'Use a 10-digit mobile number.' });
  if (parsed.data.mode === 'otp' && !/^\d{6}$/.test(parsed.data.credential)) return response.status(422).json({ error: 'Use the six-digit demo OTP 123456.' });
  await wait(500);
  return response.json({ authenticated: true, method: parsed.data.mode, disclaimer: 'Mock authentication only — no credentials were checked.' });
});

router.post('/prefill', async (request, response) => {
  const parsed = z.object({ formId: z.string() }).safeParse(request.body);
  if (!parsed.success || !getSchema(parsed.data.formId)) return response.status(400).json({ error: 'A valid formId is required.' });
  await wait(700);
  const schema = getSchema(parsed.data.formId);
  const prefill = getInitialState(schema, MOCK_DIGITALDOC);
  return response.json({ ...prefill, mockResponse: MOCK_DIGITALDOC, matchedDocuments: Object.keys(prefill.documents).length, matchedFields: Object.keys(prefill.sources).length, disclaimer: 'Synthetic data only — no external DigitalDoc account is contacted.' });
});

router.post('/validate', (request, response) => {
  const parsed = z.object({ formId: z.string(), values: z.record(z.string(), z.string()).default({}), documents: z.record(z.string(), z.any()).default({}) }).safeParse(request.body);
  if (!parsed.success || !getSchema(parsed.data.formId)) return response.status(400).json({ error: 'Invalid validation payload.' });
  const issues = validate(getSchema(parsed.data.formId), parsed.data.values, parsed.data.documents);
  return response.json({ valid: Object.keys(issues).length === 0, issues });
});

router.post('/chat', async (request, response) => {
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
  if (message.includes('digitaldoc') || message.includes('document')) {
    reply = hindi ? 'मैं आपके नकली DigitalDoc दस्तावेज़ों से मिलान की गई जानकारी दिखा सकता हूँ। हर उत्तर को आगे बढ़ने से पहले आप बदल सकते हैं।' : 'I can show the information matched from your synthetic DigitalDoc documents. You can still change every answer before you continue.';
    action = { type: 'prefill' };
  }
  return response.json({ reply, action, provider: 'Local assistant simulator' });
});

router.post('/submit', async (request, response) => {
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
  const reference = `${schema.id === 'income' ? 'INC' : 'ITD'}-${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
  submissions.set(reference, { reference, formId: schema.id, stage: 'Document check', createdAt: new Date().toISOString() });
  return response.json({ status: 'success', reference, referenceNumber: reference, stage: 'Document check', submittedPayload: payload, payload, message: 'Your prototype submission was accepted.' });
});

router.get('/status/:reference', (request, response) => {
  const item = submissions.get(request.params.reference);
  if (!item) return response.status(404).json({ error: 'Reference not found.' });
  return response.json({ ...item, timeline: [
    { title: 'Application received', detail: 'Your mock submission was accepted.', state: 'complete' },
    { title: 'Document check', detail: 'Documents are being checked for clarity and match.', state: 'current' },
    { title: 'Civic review', detail: 'A review officer will check eligibility next.', state: 'upcoming' },
    { title: 'Decision shared', detail: 'An update will appear here when the review finishes.', state: 'upcoming' }
  ] });
});

app.use('/api', router);
app.use('/', router);

if (!process.env.VERCEL && process.env.NODE_ENV !== 'test') {
  app.listen(port, '127.0.0.1', () => console.log(`FormSetu API listening on http://127.0.0.1:${port}`));
}

export default app;
