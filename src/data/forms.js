// Schema-driven form configurations and Mock Datasets for FormSetu

export const MOCK_CITIZEN_PROFILES = {
  '9876543210': {
    mobile: '9876543210',
    name: 'Ananya Sharma',
    statusLabel: 'New Form (Fresh)',
    isSubmitted: false,
    digitaldoc: {
      identity: {
        fullName: { value: 'Ananya Sharma', source: 'Civic ID card' },
        dob: { value: '2002-09-05', source: 'Civic ID card' },
        pan: { value: 'ABCDE1234F', source: 'Civic Tax Registry' },
        state: { value: 'Maharashtra', source: 'Civic ID card' }
      },
      tax: {
        category: { value: 'Individual (Resident)', source: 'Civic Tax Registry' }
      },
      income: {
        annualIncome: { value: '96000', source: 'Income certificate' }
      },
      incomeCertificate: {
        file: { value: { name: 'Income Certificate AY 2026-27', meta: 'PDF · 860 KB', source: 'DigitalDoc', status: 'Verified' }, source: 'DigitalDoc' }
      }
    }
  },
  '9810123456': {
    mobile: '9810123456',
    name: 'Rajesh Kumar Verma',
    statusLabel: 'Under Review',
    isSubmitted: true,
    digitaldoc: {
      identity: {
        fullName: { value: 'Rajesh Kumar Verma', source: 'Civic ID card' },
        dob: { value: '1988-11-14', source: 'Civic ID card' },
        pan: { value: 'BCDFG5678G', source: 'Civic Tax Registry' },
        state: { value: 'Uttar Pradesh', source: 'Civic ID card' }
      },
      tax: {
        category: { value: 'Individual (Resident)', source: 'Civic Tax Registry' }
      },
      income: {
        annualIncome: { value: '180000', source: 'Income certificate' }
      },
      incomeCertificate: {
        file: { value: { name: 'Income Certificate UP-2026-881', meta: 'PDF · 720 KB', source: 'DigitalDoc', status: 'Verified' }, source: 'DigitalDoc' }
      }
    }
  },
  '9711234567': {
    mobile: '9711234567',
    name: 'Priya Sundaram',
    statusLabel: 'Approved',
    isSubmitted: true,
    digitaldoc: {
      identity: {
        fullName: { value: 'Priya Sundaram', source: 'Civic ID card' },
        dob: { value: '1995-03-22', source: 'Civic ID card' },
        pan: { value: 'CDEFG9012H', source: 'Civic Tax Registry' },
        state: { value: 'Tamil Nadu', source: 'Civic ID card' }
      },
      tax: {
        category: { value: 'Individual (Resident)', source: 'Civic Tax Registry' }
      },
      income: {
        annualIncome: { value: '350000', source: 'Income certificate' }
      },
      incomeCertificate: {
        file: { value: { name: 'Income Statement TN-2026-042', meta: 'PDF · 940 KB', source: 'DigitalDoc', status: 'Verified' }, source: 'DigitalDoc' }
      }
    }
  },
  '9823456789': {
    mobile: '9823456789',
    name: 'Amit Patil',
    statusLabel: 'New Form',
    isSubmitted: false,
    digitaldoc: {
      identity: {
        fullName: { value: 'Amit Patil', source: 'Civic ID card' },
        dob: { value: '1991-07-19', source: 'Civic ID card' },
        pan: { value: 'DEFGH3456J', source: 'Civic Tax Registry' },
        state: { value: 'Maharashtra', source: 'Civic ID card' }
      },
      tax: {
        category: { value: 'Individual (Resident)', source: 'Civic Tax Registry' }
      },
      income: {
        annualIncome: { value: '240000', source: 'Income certificate' }
      },
      incomeCertificate: {
        file: { value: { name: 'Income Certificate MH-2026-119', meta: 'PDF · 610 KB', source: 'DigitalDoc', status: 'Verified' }, source: 'DigitalDoc' }
      }
    }
  },
  '9434567890': {
    mobile: '9434567890',
    name: 'Sneha Banerjee',
    statusLabel: 'Doc Check',
    isSubmitted: true,
    digitaldoc: {
      identity: {
        fullName: { value: 'Sneha Banerjee', source: 'Civic ID card' },
        dob: { value: '1997-12-08', source: 'Civic ID card' },
        pan: { value: 'EFGHI7890K', source: 'Civic Tax Registry' },
        state: { value: 'West Bengal', source: 'Civic ID card' }
      },
      tax: {
        category: { value: 'Individual (Resident)', source: 'Civic Tax Registry' }
      },
      income: {
        annualIncome: { value: '120000', source: 'Income certificate' }
      },
      incomeCertificate: {
        file: { value: { name: 'Income Certificate WB-2026-901', meta: 'PDF · 830 KB', source: 'DigitalDoc', status: 'Verified' }, source: 'DigitalDoc' }
      }
    }
  },
  '9845678901': {
    mobile: '9845678901',
    name: 'Vikram Hegde',
    statusLabel: 'New Form (HUF)',
    isSubmitted: false,
    digitaldoc: {
      identity: {
        fullName: { value: 'Vikram Hegde', source: 'Civic ID card' },
        dob: { value: '1984-05-30', source: 'Civic ID card' },
        pan: { value: 'FGHIJ1234L', source: 'Civic Tax Registry' },
        state: { value: 'Karnataka', source: 'Civic ID card' }
      },
      tax: {
        category: { value: 'HUF', source: 'Civic Tax Registry' }
      },
      income: {
        annualIncome: { value: '560000', source: 'Income certificate' }
      },
      incomeCertificate: {
        file: { value: { name: 'Income Certificate KA-2026-554', meta: 'PDF · 1.1 MB', source: 'DigitalDoc', status: 'Verified' }, source: 'DigitalDoc' }
      }
    }
  },
  '9829012345': {
    mobile: '9829012345',
    name: 'Pooja Rathore',
    statusLabel: 'Payout Processing',
    isSubmitted: true,
    digitaldoc: {
      identity: {
        fullName: { value: 'Pooja Rathore', source: 'Civic ID card' },
        dob: { value: '1999-01-15', source: 'Civic ID card' },
        pan: { value: 'GHIJK5678M', source: 'Civic Tax Registry' },
        state: { value: 'Rajasthan', source: 'Civic ID card' }
      },
      tax: {
        category: { value: 'Individual (Resident)', source: 'Civic Tax Registry' }
      },
      income: {
        annualIncome: { value: '85000', source: 'Income certificate' }
      },
      incomeCertificate: {
        file: { value: { name: 'Income Certificate RJ-2026-312', meta: 'PDF · 590 KB', source: 'DigitalDoc', status: 'Verified' }, source: 'DigitalDoc' }
      }
    }
  },
  '9898123456': {
    mobile: '9898123456',
    name: 'Jignesh Patel',
    statusLabel: 'New Form',
    isSubmitted: false,
    digitaldoc: {
      identity: {
        fullName: { value: 'Jignesh Patel', source: 'Civic ID card' },
        dob: { value: '1990-08-25', source: 'Civic ID card' },
        pan: { value: 'HIJKL9012N', source: 'Civic Tax Registry' },
        state: { value: 'Gujarat', source: 'Civic ID card' }
      },
      tax: {
        category: { value: 'Individual (Resident)', source: 'Civic Tax Registry' }
      },
      income: {
        annualIncome: { value: '420000', source: 'Income certificate' }
      },
      incomeCertificate: {
        file: { value: { name: 'Income Certificate GJ-2026-781', meta: 'PDF · 750 KB', source: 'DigitalDoc', status: 'Verified' }, source: 'DigitalDoc' }
      }
    }
  },
  '9419123456': {
    mobile: '9419123456',
    name: 'Tariq Ahmed Mir',
    statusLabel: 'Under Review',
    isSubmitted: true,
    digitaldoc: {
      identity: {
        fullName: { value: 'Tariq Ahmed Mir', source: 'Civic ID card' },
        dob: { value: '1993-04-10', source: 'Civic ID card' },
        pan: { value: 'IJKLM3456P', source: 'Civic Tax Registry' },
        state: { value: 'Delhi', source: 'Civic ID card' }
      },
      tax: {
        category: { value: 'Individual (Resident)', source: 'Civic Tax Registry' }
      },
      income: {
        annualIncome: { value: '150000', source: 'Income certificate' }
      },
      incomeCertificate: {
        file: { value: { name: 'Income Certificate DL-2026-443', meta: 'PDF · 680 KB', source: 'DigitalDoc', status: 'Verified' }, source: 'DigitalDoc' }
      }
    }
  },
  '9866123456': {
    mobile: '9866123456',
    name: 'K. Venkat Rao',
    statusLabel: 'New Form',
    isSubmitted: false,
    digitaldoc: {
      identity: {
        fullName: { value: 'K. Venkat Rao', source: 'Civic ID card' },
        dob: { value: '1986-10-03', source: 'Civic ID card' },
        pan: { value: 'JKLMN7890Q', source: 'Civic Tax Registry' },
        state: { value: 'Telangana', source: 'Civic ID card' }
      },
      tax: {
        category: { value: 'Individual (Resident)', source: 'Civic Tax Registry' }
      },
      income: {
        annualIncome: { value: '290000', source: 'Income certificate' }
      },
      incomeCertificate: {
        file: { value: { name: 'Income Certificate TS-2026-620', meta: 'PDF · 810 KB', source: 'DigitalDoc', status: 'Verified' }, source: 'DigitalDoc' }
      }
    }
  }
};

export const DEMO_PROFILES_LIST = Object.values(MOCK_CITIZEN_PROFILES).map(({ mobile, name, statusLabel, isSubmitted }) => ({
  mobile,
  name,
  statusLabel,
  isSubmitted
}));

export const PRELOADED_SUBMISSIONS = {
  '9810123456': {
    reference: 'ITD-2026-88192',
    formId: 'form25d',
    formTitle: 'Form 25D application',
    mobile: '9810123456',
    applicantName: 'Rajesh Kumar Verma',
    stage: 'Civic Review',
    statusBadge: 'Under Civic Review',
    createdAt: '2026-08-28T10:30:00.000Z',
    timeline: [
      { title: 'Application Submitted', detail: 'Application received and registered on portal.', state: 'complete' },
      { title: 'DigitalDoc Verification', detail: 'Identity, marksheet and income records verified.', state: 'complete' },
      { title: 'Civic review', detail: 'A review officer is checking eligibility.', state: 'current' },
      { title: 'Decision & payout', detail: 'The final decision and clearance notice will appear here.', state: 'pending' }
    ]
  },
  '9711234567': {
    reference: 'ITD-2026-72419',
    formId: 'form25d',
    formTitle: 'Form 25D application',
    mobile: '9711234567',
    applicantName: 'Priya Sundaram',
    stage: 'Approved',
    statusBadge: 'Verified & Approved',
    createdAt: '2026-08-25T14:15:00.000Z',
    timeline: [
      { title: 'Application Submitted', detail: 'Application received and registered on portal.', state: 'complete' },
      { title: 'DigitalDoc Verification', detail: 'Identity, marksheet and income records verified.', state: 'complete' },
      { title: 'Civic review', detail: 'Eligibility verified and confirmed by revenue officer.', state: 'complete' },
      { title: 'Decision & payout', detail: 'Assessment completed. Clearance certificate issued.', state: 'complete' }
    ]
  },
  '9434567890': {
    reference: 'ITD-2026-55901',
    formId: 'form25d',
    formTitle: 'Form 25D application',
    mobile: '9434567890',
    applicantName: 'Sneha Banerjee',
    stage: 'Document check',
    statusBadge: 'Document Verification',
    createdAt: '2026-08-29T09:00:00.000Z',
    timeline: [
      { title: 'Application Submitted', detail: 'Application received and registered on portal.', state: 'complete' },
      { title: 'DigitalDoc Verification', detail: 'Cross-verifying DigitalDoc records with tax registry.', state: 'current' },
      { title: 'Civic review', detail: 'Pending revenue officer queue.', state: 'pending' },
      { title: 'Decision & payout', detail: 'Final determination pending.', state: 'pending' }
    ]
  },
  '9829012345': {
    reference: 'ITD-2026-90312',
    formId: 'form25d',
    formTitle: 'Form 25D application',
    mobile: '9829012345',
    applicantName: 'Pooja Rathore',
    stage: 'Payout Processing',
    statusBadge: 'Payout Processing',
    createdAt: '2026-08-27T16:45:00.000Z',
    timeline: [
      { title: 'Application Submitted', detail: 'Application received and registered on portal.', state: 'complete' },
      { title: 'DigitalDoc Verification', detail: 'Identity, marksheet and income records verified.', state: 'complete' },
      { title: 'Civic review', detail: 'Approved for direct refund credit.', state: 'complete' },
      { title: 'Decision & payout', detail: 'Direct refund transmission initiated to bank account.', state: 'current' }
    ]
  },
  '9419123456': {
    reference: 'INC-2026-44319',
    formId: 'income',
    formTitle: 'Income certificate request',
    mobile: '9419123456',
    applicantName: 'Tariq Ahmed Mir',
    stage: 'Civic Review',
    statusBadge: 'Under Civic Review',
    createdAt: '2026-08-28T11:20:00.000Z',
    timeline: [
      { title: 'Application Submitted', detail: 'Application received and registered on portal.', state: 'complete' },
      { title: 'DigitalDoc Verification', detail: 'Identity and income records verified.', state: 'complete' },
      { title: 'Civic review', detail: 'Revenue inspector verifying residence details.', state: 'current' },
      { title: 'Decision & payout', detail: 'Digital certificate issuance pending.', state: 'pending' }
    ]
  }
};

export const MOCK_DIGITALDOC = MOCK_CITIZEN_PROFILES['9876543210'];

export function getDigitalDocProfile(mobile = '9876543210') {
  const cleanMobile = String(mobile || '').replace(/\D/g, '');
  if (MOCK_CITIZEN_PROFILES[cleanMobile]) {
    return MOCK_CITIZEN_PROFILES[cleanMobile];
  }
  // Generate consistent dynamic profile for any custom 10-digit number
  const num = cleanMobile.length >= 4 ? parseInt(cleanMobile.slice(-4), 10) : 1234;
  const states = ['Maharashtra', 'Delhi', 'Karnataka', 'Gujarat', 'Tamil Nadu', 'Uttar Pradesh', 'Rajasthan'];
  const state = states[num % states.length];
  const char1 = String.fromCharCode(65 + (num % 26));
  const char2 = String.fromCharCode(65 + ((num + 3) % 26));
  const taxId = `${char1}${char2}CPK${String(1000 + (num % 8999))}F`;
  const incomeVal = String(80000 + (num % 50) * 5000);

  return {
    mobile: cleanMobile || '9876543210',
    name: `Citizen ${cleanMobile ? cleanMobile.slice(-4) : 'User'}`,
    statusLabel: 'New Form',
    isSubmitted: false,
    digitaldoc: {
      identity: {
        fullName: { value: `Citizen ${cleanMobile ? cleanMobile.slice(-4) : 'Applicant'}`, source: 'Civic ID card' },
        dob: { value: '1996-06-15', source: 'Civic ID card' },
        pan: { value: taxId, source: 'Civic Tax Registry' },
        state: { value: state, source: 'Civic ID card' }
      },
      tax: {
        category: { value: 'Individual (Resident)', source: 'Civic Tax Registry' }
      },
      income: {
        annualIncome: { value: incomeVal, source: 'Income certificate' }
      },
      incomeCertificate: {
        file: { value: { name: `Income Certificate AY 2026-27`, meta: 'PDF · 750 KB', source: 'DigitalDoc', status: 'Verified' }, source: 'DigitalDoc' }
      }
    }
  };
}

const form25DFields = [
  {
    id: 'fullName', label: 'What is your name?', shortLabel: 'Full name', type: 'text', required: true,
    options: [], prefillSource: 'digitaldoc.identity.fullName', chatPrompt: 'I found your name on your Civic ID card. Is this correct?',
    backendField: 'applicant_name', placeholder: 'e.g. Ananya Sharma', help: 'Use the name exactly as it appears on your Civic ID card.'
  },
  {
    id: 'phone', label: 'Which mobile number should receive updates?', shortLabel: 'Mobile number', type: 'text', format: 'phone', inputMode: 'numeric', required: true,
    options: [], prefillSource: null, chatPrompt: 'Which 10-digit mobile number should receive filing updates?',
    backendField: 'mobile_number', placeholder: '10-digit mobile number', help: 'We will send acknowledgment and e-filing status updates here.'
  },
  {
    id: 'dob', label: 'What is your date of birth?', shortLabel: 'Date of birth', type: 'date', required: true,
    options: [], prefillSource: 'digitaldoc.identity.dob', chatPrompt: 'Your Civic ID card shows your date of birth. Is that right?',
    backendField: 'date_of_birth', placeholder: 'DD / MM / YYYY', help: 'This should match your identity records.'
  },
  {
    id: 'pan', label: 'What is your Taxpayer Identification Number (TIN)?', shortLabel: 'Tax ID (TIN)', type: 'text', required: true,
    options: [], prefillSource: 'digitaldoc.identity.pan', chatPrompt: 'I retrieved Tax ID from verified tax records. Is this correct?',
    backendField: 'tax_id_number', placeholder: 'e.g. ABCDE1234F', help: 'Verified 10-character tax identifier linked with your Civic ID.'
  },
  {
    id: 'category', label: 'What is your taxpayer filing category?', shortLabel: 'Filing status', type: 'category', required: true,
    options: ['Individual (Resident)', 'HUF', 'Non-Resident Indian (NRI)', 'Partnership Firm'], prefillSource: 'digitaldoc.tax.category', chatPrompt: 'Your filing category is set to Individual (Resident). Keep that?',
    backendField: 'taxpayer_category', placeholder: 'Choose filing category', help: 'Select your taxpayer assessment category.'
  },
  {
    id: 'state', label: 'Which state do you currently live in?', shortLabel: 'State of residence', type: 'category', required: true,
    options: ['Maharashtra', 'Delhi', 'Karnataka', 'Gujarat', 'Tamil Nadu', 'Uttar Pradesh', 'Rajasthan'], prefillSource: 'digitaldoc.identity.state', chatPrompt: 'Your Civic ID lists your state. Is that your residential state?',
    backendField: 'residential_state', placeholder: 'Choose your state', help: 'Select your current residential state.'
  },
  {
    id: 'annualIncome', label: 'What is your gross annual income for this year?', shortLabel: 'Gross annual income', type: 'number', required: true,
    options: [], prefillSource: 'digitaldoc.income.annualIncome', chatPrompt: 'I found this amount on your income statement. Is that your gross annual income?',
    backendField: 'gross_annual_income', placeholder: 'e.g. 96000', suffix: 'per year', help: 'Enter your total gross income for the financial year.'
  },
  {
    id: 'bankAccount', label: 'What is your bank account number for refund?', shortLabel: 'Bank account for refund', type: 'text', required: true,
    options: [], prefillSource: null, chatPrompt: 'Please enter your bank account number for any direct refund credit.',
    backendField: 'bank_account_number', placeholder: 'Enter account number', help: 'Use a pre-validated bank account in your name.'
  },
  {
    id: 'form16', label: 'Upload your Form 16 / Proof of income', shortLabel: 'Form 16 / Salary proof', type: 'file', required: true,
    options: [], prefillSource: null, chatPrompt: 'Please upload your Form 16 or salary certificate.',
    backendField: 'form16_document', help: 'Upload salary certificate, Form 16, or income proof (PDF or Image up to 5MB).'
  },
  {
    id: 'incomeCertificate', label: 'Confirm your verified income declaration', shortLabel: 'Income certificate', type: 'file', required: true,
    options: [], prefillSource: 'digitaldoc.incomeCertificate.file', chatPrompt: 'I found your income certificate in DigitalDoc. Please confirm it is from the latest financial year.',
    backendField: 'income_declaration_doc', help: 'Verified income certificate linked from DigitalDoc.'
  },
  {
    id: 'rebateClaim', label: 'Are you claiming tax rebate under Section 87A?', shortLabel: 'Rebate under Sec 87A', type: 'yesno', required: true,
    options: ['Yes', 'No'], prefillSource: null, chatPrompt: 'Are you eligible and claiming rebate under Section 87A?',
    backendField: 'rebate_claimed_87a', help: 'Available for resident individuals with taxable income up to eligible threshold.'
  }
];

const incomeFields = [
  {
    id: 'applicantName', label: 'What is your full name?', shortLabel: 'Full name', type: 'text', required: true,
    options: [], prefillSource: 'digitaldoc.identity.fullName', chatPrompt: 'I found your name on your Civic ID card. Is this correct?',
    backendField: 'applicant_name', placeholder: 'e.g. Ananya Sharma', help: 'Use the name shown on your identity document.'
  },
  {
    id: 'purpose', label: 'Why do you need this certificate?', shortLabel: 'Purpose', type: 'category', required: true,
    options: ['Education', 'Housing', 'Public program', 'Other'], prefillSource: null, chatPrompt: 'What is the main reason you need this income certificate?',
    backendField: 'certificate_purpose', placeholder: 'Choose a purpose', help: 'Choose the reason that best matches your request.'
  },
  {
    id: 'income', label: 'What is your family income for one year?', shortLabel: 'Annual income', type: 'number', required: true,
    options: [], prefillSource: 'digitaldoc.income.annualIncome', chatPrompt: 'I found this amount on your income certificate. Is that your annual family income?',
    backendField: 'annual_income', placeholder: 'e.g. 96000', suffix: 'per year', help: 'Enter your household income without commas or ₹.'
  }
];

export const FORM_SCHEMAS = {
  form25d: {
    formId: 'form25d', id: 'form25d', title: 'Form 25D', service: 'Revenue & Taxation Services', department: 'Dept of Public Revenue',
    description: 'Assessment & Tax Clearance Declaration · AY 2026–27', accent: 'navy', fields: form25DFields
  },
  form14a: {
    formId: 'form25d', id: 'form25d', title: 'Form 25D', service: 'Revenue & Taxation Services', department: 'Dept of Public Revenue',
    description: 'Assessment & Tax Clearance Declaration · AY 2026–27', accent: 'navy', fields: form25DFields
  },
  nsp: {
    formId: 'form25d', id: 'form25d', title: 'Form 25D', service: 'Revenue & Taxation Services', department: 'Dept of Public Revenue',
    description: 'Assessment & Tax Clearance Declaration · AY 2026–27', accent: 'navy', fields: form25DFields
  },
  income: {
    formId: 'income', id: 'income', title: 'Income certificate request', service: 'Civic services', department: 'Civic Revenue Office',
    description: 'A short form using the same FormSetu engine', accent: 'violet', fields: incomeFields
  }
};

export function getByPath(object, path) {
  if (!path) return undefined;
  return path.split('.').reduce((current, key) => current?.[key], object);
}

export function getInitialState(schema, response = MOCK_DIGITALDOC, mobile = '') {
  const profileResponse = response?.digitaldoc ? response : (response ? { digitaldoc: response } : MOCK_DIGITALDOC);
  return schema.fields.reduce((state, field) => {
    // If field is phone and a mobile is provided, initialize with that mobile
    if (field.format === 'phone' && mobile) {
      state.values[field.id] = String(mobile).replace(/\D/g, '').slice(0, 10);
      return state;
    }
    const matched = field.prefillSource ? getByPath(profileResponse, field.prefillSource) : undefined;
    const value = matched && typeof matched === 'object' && 'value' in matched ? matched.value : matched;
    const source = matched && typeof matched === 'object' ? matched.source : undefined;

    if (value !== undefined && value !== null) {
      if (field.type === 'file') state.documents[field.id] = value;
      else state.values[field.id] = String(value);
    } else {
      // Non-DigitalDoc fields remain clean and empty by default
      if (field.type !== 'file') {
        state.values[field.id] = '';
      }
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

export const MOCK_DIGILOCKER = MOCK_DIGITALDOC;

