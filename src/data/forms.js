// Schema-driven form configurations for FormSetu
export const MOCK_DIGILOCKER = {
  digilocker: {
    identity: {
      fullName: { value: 'Ananya Sharma', source: 'Aadhaar card' },
      dob: { value: '2002-09-05', source: 'Aadhaar card' },
      pan: { value: 'ABCDE1234F', source: 'Revenue Authority' },
      state: { value: 'Maharashtra', source: 'Aadhaar card' }
    },
    tax: {
      category: { value: 'Individual (Resident)', source: 'Revenue Authority' }
    },
    income: {
      annualIncome: { value: '96000', source: 'Income certificate' }
    },
    incomeCertificate: {
      file: { value: { name: 'Income Certificate AY 2026-27', meta: 'PDF · 860 KB', source: 'DigiLocker', status: 'Verified' }, source: 'DigiLocker' }
    }
  }
};

const form25DFields = [
  {
    id: 'fullName', label: 'What is your name?', shortLabel: 'Full name', type: 'text', required: true,
    options: [], prefillSource: 'digilocker.identity.fullName', chatPrompt: 'I found your name on your Aadhaar card. Is “Ananya Sharma” correct?',
    backendField: 'applicant_name', placeholder: 'e.g. Ananya Sharma', help: 'Use the name exactly as it appears on your PAN or Aadhaar card.'
  },
  {
    id: 'phone', label: 'Which mobile number should receive updates?', shortLabel: 'Mobile number', type: 'text', format: 'phone', inputMode: 'numeric', required: true,
    options: [], prefillSource: null, defaultValue: '9876543210', chatPrompt: 'Which 10-digit mobile number should receive filing updates?',
    backendField: 'mobile_number', placeholder: '10-digit mobile number', help: 'We will send acknowledgment and e-filing status updates here.'
  },
  {
    id: 'dob', label: 'What is your date of birth?', shortLabel: 'Date of birth', type: 'date', required: true,
    options: [], prefillSource: 'digilocker.identity.dob', chatPrompt: 'Your Aadhaar card shows 05/09/2002 as your date of birth. Is that right?',
    backendField: 'date_of_birth', placeholder: 'DD / MM / YYYY', help: 'This should match your official identity documents.'
  },
  {
    id: 'pan', label: 'What is your Permanent Account Number (PAN)?', shortLabel: 'PAN number', type: 'text', required: true,
    options: [], prefillSource: 'digilocker.identity.pan', chatPrompt: 'I retrieved PAN ABCDE1234F from verified tax records. Is this correct?',
    backendField: 'pan_number', placeholder: 'e.g. ABCDE1234F', help: 'Verified 10-digit PAN linked with Aadhaar.'
  },
  {
    id: 'category', label: 'What is your taxpayer filing category?', shortLabel: 'Filing status', type: 'category', required: true,
    options: ['Individual (Resident)', 'HUF', 'Non-Resident Indian (NRI)', 'Partnership Firm'], prefillSource: 'digilocker.tax.category', chatPrompt: 'Your filing category is set to Individual (Resident). Keep that?',
    backendField: 'taxpayer_category', placeholder: 'Choose filing category', help: 'Select your taxpayer assessment category.'
  },
  {
    id: 'state', label: 'Which state do you currently live in?', shortLabel: 'State of residence', type: 'category', required: true,
    options: ['Maharashtra', 'Delhi', 'Karnataka', 'Gujarat', 'Tamil Nadu', 'Uttar Pradesh', 'Rajasthan'], prefillSource: 'digilocker.identity.state', chatPrompt: 'Your Aadhaar lists Maharashtra as your state. Is that your residential state?',
    backendField: 'residential_state', placeholder: 'Choose your state', help: 'Select your current residential state.'
  },
  {
    id: 'annualIncome', label: 'What is your gross annual income for this year?', shortLabel: 'Gross annual income', type: 'number', required: true,
    options: [], prefillSource: 'digilocker.income.annualIncome', chatPrompt: 'I found ₹96,000 on your income statement. Is that your gross annual income?',
    backendField: 'gross_annual_income', placeholder: 'e.g. 96000', suffix: 'per year', help: 'Enter your total gross income for the financial year.'
  },
  {
    id: 'bankAccount', label: 'What is your bank account number for refund?', shortLabel: 'Bank account for refund', type: 'text', required: true,
    options: [], prefillSource: null, defaultValue: '201145009811', chatPrompt: 'Please enter your bank account number for any direct refund credit.',
    backendField: 'bank_account_number', placeholder: 'Enter account number', help: 'Use a pre-validated bank account in your name.'
  },
  {
    id: 'form16', label: 'Upload your Form 16 / Proof of income', shortLabel: 'Form 16 / Salary proof', type: 'file', required: true,
    options: [], prefillSource: null, chatPrompt: 'Please upload your Form 16 or salary certificate.',
    backendField: 'form16_document', help: 'Upload salary certificate, Form 16, or income proof (PDF or Image up to 5MB).'
  },
  {
    id: 'incomeCertificate', label: 'Confirm your verified income declaration', shortLabel: 'Income certificate', type: 'file', required: true,
    options: [], prefillSource: 'digilocker.incomeCertificate.file', chatPrompt: 'I found your income certificate in DigiLocker. Please confirm it is from the latest financial year.',
    backendField: 'income_declaration_doc', help: 'Verified income certificate linked from DigiLocker.'
  },
  {
    id: 'rebateClaim', label: 'Are you claiming tax rebate under Section 87A?', shortLabel: 'Rebate under Sec 87A', type: 'yesno', required: true,
    options: ['Yes', 'No'], prefillSource: null, defaultValue: 'No', chatPrompt: 'Are you eligible and claiming rebate under Section 87A?',
    backendField: 'rebate_claimed_87a', help: 'Available for resident individuals with taxable income up to eligible threshold.'
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
  form14a: {
    formId: 'form25d', id: 'form25d', title: 'Form 25D', service: 'Revenue & Taxation Services', department: 'Dept of Public Revenue',
    description: 'Assessment & Tax Clearance Declaration · AY 2026–27', accent: 'navy', fields: form25DFields
  },
  nsp: {
    formId: 'form25d', id: 'form25d', title: 'Form 25D', service: 'Revenue & Taxation Services', department: 'Dept of Public Revenue',
    description: 'Assessment & Tax Clearance Declaration · AY 2026–27', accent: 'navy', fields: form25DFields
  },
  income: {
    formId: 'income', id: 'income', title: 'Income certificate request', service: 'Citizen services', department: 'Revenue Department',
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
