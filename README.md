# FormSetu 🇮🇳

FormSetu is a modern, accessible, schema-driven public form filling engine designed to streamline citizen interactions with government services, scholarships, and departmental applications.

It reimagines public portals by unifying synthetic DigiLocker authentication, 22 official Indian languages plus conversational Hinglish, WhatsApp-style hold-to-speak voice input, and seamless schema-driven validation into a clean desktop and mobile experience.

---

## Table of Contents

1. [Key Features](#key-features)
2. [Architecture Overview](#architecture-overview)
3. [User Flow & Lifecycle](#user-flow--lifecycle)
4. [Backend API Reference & Examples](#backend-api-reference--examples)
5. [Frontend Architecture & Components](#frontend-architecture--components)
6. [Voice Input & Internationalization (i18n)](#voice-input--internationalization-i18n)
7. [Setup & Running Locally](#setup--running-locally)

---

## Key Features

- **Multi-Lingual Engine (22 Indian Languages + Hinglish)**: Complete i18n support spanning Hindi, Bengali, Marathi, Tamil, Telugu, Gujarati, Kannada, Malayalam, Punjabi, Odia, Assamese, and conversational Hinglish.
- **Synthetic DigiLocker Integration**: Secure mobile number + OTP verification flow that automatically fetches and verifies citizen records (Aadhaar, Caste Certificate, Income Certificate).
- **Dual-Mode Schema Renderer**:
  - **Guided View**: Distraction-free, single-question card flow with `< Prev`, `1/10` counter, and `Next >` navigation.
  - **Simple View**: Complete, all-in-one form for fast scanning and bulk editing.
- **Hold-to-Speak Voice Dictation**: WhatsApp-style voice note interaction on every field using browser-native Web Speech API. Hold to speak, release to instantly transcribe.
- **Verified DigiLocker Notch Badges**: Visual bottom-attached badge pills displaying verified data origin with rounded corners on all inputs.
- **A4 Document Preview & Upload Dropzone**: Authentic A4 aspect-ratio previews for prefilled certificates, with dashed drag-and-drop replacement zones for empty documents.
- **Application Tracker & Status Timeline**: Dynamic timeline tracking from application receipt, document verification, eligibility review, to decision dispatch.

---

## Architecture Overview

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                                 FRONTEND                                    │
│  React 19 + Vite + Lucide Icons + Pure CSS Design System                   │
│                                                                             │
│  ┌────────────────────┐  ┌────────────────────┐  ┌───────────────────────┐  │
│  │  Language Selector │─▶│  DigiLocker Auth   │─▶│   Schema Renderer     │  │
│  │  (22 Langs + Hing) │  │  (Mobile + OTP)    │  │ (Guided / Simple Mode)│  │
│  └────────────────────┘  └────────────────────┘  └───────────┬───────────┘  │
│                                                              │              │
│  ┌────────────────────┐  ┌────────────────────┐              ▼              │
│  │   Status Tracker   │◀─│   Review Screen    │◀── [Inputs / Mic / Uploads] │
│  └────────────────────┘  └────────────────────┘                             │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ HTTP / REST (/api/*)
┌──────────────────────────────────────▼──────────────────────────────────────┐
│                                  BACKEND                                    │
│  Node.js + Express 5 + Zod Schema Validation Engine                         │
│                                                                             │
│  • GET  /api/forms/:id          → Schema definition & field metadata        │
│  • POST /api/auth/mock          → Mobile & OTP verification                 │
│  • POST /api/prefill            → DigiLocker document & field extractor     │
│  • POST /api/validate           → Zod schema validation                     │
│  • POST /api/submit             → Government payload generator & reference  │
│  • GET  /api/status/:reference  → Live application status & stage timeline  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## User Flow & Lifecycle

```text
[1. Choose Language] ──▶ [2. DigiLocker Sign In] ──▶ [3. Auto-Prefill & Hydrate]
                                                                 │
  ┌──────────────────────────────────────────────────────────────┘
  ▼
[4. Fill / Edit Form] ── (Guided View or Simple View)
  ├── Text & Phone Fields (Auto-verified or manual input)
  ├── Hold-to-Speak Mic (Voice transcription on release)
  ├── A4 Document Previews (Replace or Upload via dropzone)
  └── Date & Category Selectors
  │
  ▼
[5. Review Summary] ──▶ [6. Submit Application] ──▶ [7. Live Status Tracker]
```

1. **Language Selection**: Citizen chooses their preferred language (e.g. English, Hindi, Hinglish, Marathi, Tamil, etc.).
2. **DigiLocker Verification**: Enters a 10-digit mobile number and receives/enters a 6-digit mock OTP (`123456`).
3. **Auto-Prefill Engine**: The backend matches Aadhaar and certificates from DigiLocker, mapping them directly to schema fields with bottom-attached verified badges.
4. **Interactive Form Filling**: Citizen navigates through the form using either Guided mode (one question at a time) or Simple mode (full document view). Any field can be dictated by holding the mic icon.
5. **Document Verification**: Class 10/12 marksheet and income certificates can be viewed in true A4 ratio or replaced via dropzones.
6. **Final Review**: Form displays a clean summary of all verified and manual inputs.
7. **Submission & Tracking**: Submits the validated schema to the backend, receives a permanent reference number (`ITD-2026-XXXXX`), and displays the official status timeline.

---

## Backend API Reference & Examples

The backend is powered by **Express 5** and **Zod** (`server/index.js`).

### 1. Form Schema Retrieval
`GET /api/forms/:formId`

Returns the full schema definition including field types, validation rules, DigiLocker mapping paths, and localized prompts.

**Example Response (`/api/forms/form14a`):**
```json
{
  "id": "nsp",
  "title": "Form 14A",
  "service": "Income Tax Dept, GoI",
  "fields": [
    {
      "id": "name",
      "label": "What is your name?",
      "shortLabel": "Full name",
      "type": "text",
      "required": true,
      "placeholder": "e.g. Ananya Sharma",
      "prefillSource": "identity.name",
      "backendField": "applicant_name"
    },
    {
      "id": "mobile",
      "label": "Which mobile number should receive updates?",
      "shortLabel": "Mobile number",
      "type": "text",
      "format": "phone",
      "required": true,
      "placeholder": "10-digit mobile number",
      "backendField": "mobile_number"
    }
  ]
}
```

### 2. Mock DigiLocker Authentication
`POST /api/auth/mock`

**Request Payload:**
```json
{
  "formId": "nsp",
  "mobile": "9876543210",
  "mode": "otp",
  "credential": "123456"
}
```

**Response:**
```json
{
  "authenticated": true,
  "method": "otp",
  "disclaimer": "Mock authentication only — no credentials were checked."
}
```

### 3. DigiLocker Document Prefill
`POST /api/prefill`

Maps synthetic DigiLocker document data (`MOCK_DIGILOCKER`) directly into the target form schema values, document objects, and provenance tracking sources.

**Request Payload:**
```json
{
  "formId": "nsp"
}
```

**Response:**
```json
{
  "values": {
    "name": "Ananya Sharma",
    "dob": "05/09/2002",
    "category": "OBC-NCL",
    "state": "Maharashtra",
    "annualIncome": "96000",
    "bankAccount": "201145009811"
  },
  "documents": {
    "incomeCertificate": {
      "name": "income-cert-2025.pdf",
      "size": "1.2 MB",
      "source": "digilocker",
      "verified": true
    }
  },
  "sources": {
    "name": "digilocker",
    "dob": "digilocker",
    "category": "digilocker",
    "state": "digilocker",
    "annualIncome": "digilocker"
  },
  "matchedFields": 5,
  "matchedDocuments": 1
}
```

### 4. Form Submission
`POST /api/submit`

Validates the completed form against schema rules and produces the official normalized government backend payload.

**Request Payload:**
```json
{
  "formId": "nsp",
  "values": {
    "name": "Ananya Sharma",
    "mobile": "9876543210",
    "dob": "05/09/2002",
    "category": "OBC-NCL",
    "state": "Maharashtra",
    "annualIncome": "96000",
    "bankAccount": "201145009811",
    "anotherScholarship": "No"
  },
  "documents": {
    "class10Marksheet": { "name": "class10_marksheet.pdf", "size": "850 KB" },
    "marksheet": { "name": "class12_marksheet.pdf", "size": "1.1 MB" },
    "incomeCertificate": { "name": "income-cert.pdf", "size": "1.2 MB" }
  }
}
```

**Response:**
```json
{
  "status": "success",
  "reference": "ITD-2026-X9K2A",
  "referenceNumber": "ITD-2026-X9K2A",
  "stage": "Document check",
  "message": "Your prototype submission was accepted.",
  "payload": {
    "schema": "nsp",
    "submittedAt": "2026-08-28T02:15:00.000Z",
    "applicant_name": "Ananya Sharma",
    "mobile_number": "9876543210",
    "date_of_birth": "05/09/2002",
    "category": "OBC-NCL",
    "state": "Maharashtra",
    "annual_family_income": 96000,
    "bank_account_number": "201145009811",
    "receiving_other_scholarship": false
  }
}
```

### 5. Application Status Tracker
`GET /api/status/:reference`

**Response:**
```json
{
  "reference": "ITD-2026-X9K2A",
  "formId": "nsp",
  "stage": "Document check",
  "createdAt": "2026-08-28T02:15:00.000Z",
  "timeline": [
    { "title": "Application received", "detail": "Your mock submission was accepted.", "state": "complete" },
    { "title": "Document check", "detail": "Documents are being checked for clarity and match.", "state": "current" },
    { "title": "Eligibility review", "detail": "The department will review eligibility next.", "state": "upcoming" },
    { "title": "Decision shared", "detail": "An update will appear here when the review finishes.", "state": "upcoming" }
  ]
}
```

---

## Voice Input & Internationalization (i18n)

### WhatsApp-Style Hold-to-Speak Mic
- Built into every field control (`FieldControl`).
- **Interaction**: Mouse/Touch `onMouseDown` / `onTouchStart` initializes the browser `webkitSpeechRecognition` or `SpeechRecognition` instance and begins listening.
- **Visual Indicator**: The mic icon turns active red with a subtle pulsating ring.
- **Release to Send**: Releasing the button (`onMouseUp` / `onTouchEnd`) triggers `recognition.stop()`. The transcript is sanitized and immediately updates the form state via `onChange(field.id, transcript)`.

### Multi-Lingual Dictionaries
- Managed in `src/data/translations.js`.
- Includes full translations for 22 scheduled Indian languages plus Hinglish.
- Uses helper methods `t(key, lang)` for UI text and `tField(field, prop, lang)` for field-level labels and placeholders.

---

## Setup & Running Locally

### Prerequisites
- **Node.js**: v18 or later
- **npm**: v9 or later

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
Runs both the Express API (`port 8787`) and Vite frontend (`port 5173`) concurrently:
```bash
npm run dev
```
Open **<http://localhost:5173>** in your browser.

### 3. Build for Production
```bash
npm run build
```
