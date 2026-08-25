# FormSetu

FormSetu is a self-contained concept prototype for a unified public-form experience. It demonstrates a schema-driven renderer through a National Scholarship Portal journey and a smaller income-certificate reuse flow.

## Run locally

Install dependencies and run the local development server:

```sh
npm install
npm run dev
```

Then open <http://127.0.0.1:5173>.

The demo path is:

1. Start the National Scholarship Portal journey.
2. Accept the synthetic-data consent screen.
3. Sign in to the mock DigiLocker with mobile `9876543210` and OTP `123456` (or switch to password mode).
4. Review the pre-filled fields, try guided voice input, change a date or dropdown, and add/replace a PDF or image document.
5. Review the schema-derived backend payload and submit the mock application to receive a reference number.

The same renderer also powers the shorter income-certificate form. Form schemas live in
`src/data/forms.js`; each field declares its parser type, scripted `chatPrompt`, dotted
`prefillSource`, and `backendField`. The local API walks the synthetic DigiLocker response,
validates the active schema, waits before responding, and supports both an accepted response
and a recoverable document-mismatch response.

Create a production build with:

```sh
npm run build
```

## What is real vs mocked

- **Real:** form schema format, React renderer, guided one-question flow, schema-derived progress/back/edit behavior, scripted field prompts, mock-auth handoff, validation, simple view, voice binding when supported by the browser, date/category/yes-no/text/number controls, device document upload, document previews, backend payload preview, review and confirmation UI.
- **Mocked:** DigiLocker consent/login/fetch, synthetic documents, form submission payload/response, authentication, and government status data.

This is a prototype, not an official government service. It uses no government logos, emblems, real credentials, Aadhaar data, or live government endpoints.
