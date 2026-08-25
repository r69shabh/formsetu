// Phase 2 keeps the form contract intentionally small: the renderer only
// needs the field metadata below, while the mock response stands in for a
// real DigiLocker integration during local development.
export const MOCK_DIGILOCKER = {
  digilocker: {
    identity: {
      fullName: { value: 'Ananya Sharma', source: 'Aadhaar card' },
      dob: { value: '2002-09-05', source: 'Aadhaar card' },
      state: { value: 'Maharashtra', source: 'Aadhaar card' }
    },
    caste: {
      category: { value: 'OBC-NCL', source: 'Caste certificate' }
    },
    income: {
      annualIncome: { value: '96000', source: 'Income certificate' }
    },
    marksheet: {
      file: { value: { name: 'Class 12 marksheet', meta: 'PDF · 1.2 MB', source: 'DigiLocker', status: 'Verified' }, source: 'DigiLocker' }
    },
    incomeCertificate: {
      file: { value: { name: 'Income certificate', meta: 'PDF · 860 KB', source: 'DigiLocker', status: 'Verified' }, source: 'DigiLocker' }
    }
  }
};

const nspFields = [
  {
    id: 'fullName', label: 'What is your full name?', shortLabel: 'Full name', type: 'text', required: true,
    options: [], prefillSource: 'digilocker.identity.fullName', chatPrompt: 'I found your name on your Aadhaar card. Is “Ananya Sharma” correct?',
    backendField: 'applicant_name', placeholder: 'e.g. Ananya Sharma', help: 'Use the name exactly as it appears on your Aadhaar or marksheet.'
  },
  {
    id: 'phone', label: 'Which mobile number should receive updates?', shortLabel: 'Mobile number', type: 'text', format: 'phone', inputMode: 'numeric', required: true,
    options: [], prefillSource: null, defaultValue: '9876543210', chatPrompt: 'Which 10-digit mobile number should receive application updates?',
    backendField: 'mobile_number', placeholder: '10-digit mobile number', help: 'Choose a number you can access. We will use it only for application updates.'
  },
  {
    id: 'dob', label: 'What is your date of birth?', shortLabel: 'Date of birth', type: 'date', required: true,
    options: [], prefillSource: 'digilocker.identity.dob', chatPrompt: 'Your Aadhaar card shows 05/09/2002 as your date of birth. Is that right?',
    backendField: 'date_of_birth', placeholder: 'DD / MM / YYYY', help: 'This should match your identity document or school record.'
  },
  {
    id: 'category', label: 'Which category do you belong to?', shortLabel: 'Category', type: 'category', required: true,
    options: ['General', 'OBC-NCL', 'SC', 'ST', 'EWS'], prefillSource: 'digilocker.caste.category', chatPrompt: 'Your caste certificate shows OBC-NCL. Should I keep that category?',
    backendField: 'social_category', placeholder: 'Choose a category', help: 'Choose the category printed on your valid community certificate.'
  },
  {
    id: 'state', label: 'Which state do you currently live in?', shortLabel: 'State', type: 'category', required: true,
    options: ['Maharashtra', 'Karnataka', 'Delhi', 'Rajasthan', 'Uttar Pradesh'], prefillSource: 'digilocker.identity.state', chatPrompt: 'Your Aadhaar card lists Maharashtra as your state. Is that your current residential state?',
    backendField: 'residential_state', placeholder: 'Choose your state', help: 'Choose your current residential state, not necessarily your college state.'
  },
  {
    id: 'annualIncome', label: 'What is your family income for one year?', shortLabel: 'Annual family income', type: 'number', required: true,
    options: [], prefillSource: 'digilocker.income.annualIncome', chatPrompt: 'I found ₹96,000 on your income certificate. Is that your annual family income?',
    backendField: 'annual_family_income', placeholder: 'e.g. 96000', suffix: 'per year', help: 'Enter the amount from your latest income certificate, without commas or ₹.'
  },
  {
    id: 'bankAccount', label: 'What is your bank account number?', shortLabel: 'Bank account', type: 'text', required: true,
    options: [], prefillSource: null, defaultValue: '201145009811', chatPrompt: 'Please enter an active bank account in your name. Double-check every digit before continuing.',
    backendField: 'bank_account_number', placeholder: 'Enter account number', help: 'Use an active account in your name and double-check every digit.'
  },
  {
    id: 'marksheet', label: 'Confirm your latest marksheet', shortLabel: 'Latest marksheet', type: 'file', required: true,
    options: [], prefillSource: 'digilocker.marksheet.file', chatPrompt: 'I found your Class 12 marksheet in DigiLocker. Please confirm it is the document you want to submit.',
    backendField: 'class_12_marksheet', help: 'Check that the document is readable and all its corners are visible.'
  },
  {
    id: 'incomeCertificate', label: 'Confirm your income certificate', shortLabel: 'Income certificate', type: 'file', required: true,
    options: [], prefillSource: 'digilocker.incomeCertificate.file', chatPrompt: 'I found your income certificate in DigiLocker. Please confirm it is from the latest financial year.',
    backendField: 'income_certificate', help: 'Use a certificate from the latest financial year.'
  },
  {
    id: 'otherScholarship', label: 'Are you receiving another scholarship?', shortLabel: 'Another scholarship', type: 'yesno', required: true,
    options: ['Yes', 'No'], prefillSource: null, defaultValue: 'No', chatPrompt: 'Are you receiving another scholarship for the same academic year?',
    backendField: 'receiving_other_scholarship', help: 'Tell us about any scholarship received for the same academic year.'
  }
];

const incomeFields = [
  {
    id: 'applicantName', label: 'What is your full name?', shortLabel: 'Full name', type: 'text', required: true,
    options: [], prefillSource: 'digilocker.identity.fullName', chatPrompt: 'I found your name on your Aadhaar card. Is “Ananya Sharma” correct?',
    backendField: 'applicant_name', placeholder: 'e.g. Ananya Sharma', help: 'Use the name shown on your identity document.'
  },
  {
    id: 'purpose', label: 'Why do you need this certificate?', shortLabel: 'Purpose', type: 'category', required: true,
    options: ['Education', 'Housing', 'Government scheme', 'Other'], prefillSource: null, defaultValue: 'Education', chatPrompt: 'What is the main reason you need this income certificate?',
    backendField: 'certificate_purpose', placeholder: 'Choose a purpose', help: 'Choose the reason that best matches your request.'
  },
  {
    id: 'income', label: 'What is your family income for one year?', shortLabel: 'Annual income', type: 'number', required: true,
    options: [], prefillSource: 'digilocker.income.annualIncome', chatPrompt: 'I found ₹96,000 on your income certificate. Is that your annual family income?',
    backendField: 'annual_income', placeholder: 'e.g. 96000', suffix: 'per year', help: 'Enter your household income without commas or ₹.'
  }
];

export const FORM_SCHEMAS = {
  nsp: {
    formId: 'nsp', id: 'nsp', title: 'Scholarship application', service: 'National Scholarship Portal',
    description: 'Post-matric scholarship · 2026–27', accent: 'mint', fields: nspFields
  },
  income: {
    formId: 'income', id: 'income', title: 'Income certificate request', service: 'Citizen services',
    description: 'A short form using the same FormSetu engine', accent: 'violet', fields: incomeFields
  }
};

export function getByPath(object, path) {
  if (!path) return undefined;
  return path.split('.').reduce((current, key) => current?.[key], object);
}

export function getInitialState(schema, response = MOCK_DIGILOCKER) {
  return schema.fields.reduce((state, field) => {
    const matched = field.prefillSource ? getByPath(response, field.prefillSource) : undefined;
    const value = matched && typeof matched === 'object' && 'value' in matched ? matched.value : matched;
    const source = matched && typeof matched === 'object' ? matched.source : undefined;

    if (value !== undefined) {
      if (field.type === 'file') state.documents[field.id] = value;
      else state.values[field.id] = value;
    } else if (field.defaultValue !== undefined) {
      state.values[field.id] = field.defaultValue;
    }
    if (source) state.sources[field.id] = source;
    return state;
  }, { values: {}, sources: {}, documents: {} });
}

export function buildSubmissionPayload(schema, values = {}, documents = {}) {
  return Object.fromEntries(schema.fields.map((field) => [
    field.backendField,
    field.type === 'file' ? (documents[field.id]?.id || documents[field.id]?.name || 'uploaded_document') : values[field.id] ?? null
  ]));
}
