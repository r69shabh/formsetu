import React, { useEffect, useMemo, useState, useRef } from 'react';
import {
  ArrowLeft, ArrowRight, Check, CheckCircle2, CircleHelp,
  FileText, Landmark, LoaderCircle, LockKeyhole, PanelRight,
  ShieldCheck, Sparkles, Upload, X, Zap, Globe, Smartphone, KeyRound, Building2, Mic
} from 'lucide-react';
import { api } from './api.js';
import { FORM_SCHEMAS, MOCK_DIGITALDOC, DEMO_PROFILES_LIST, getDigitalDocProfile, buildSubmissionPayload, getInitialState } from './data/forms.js';
import { TRANSLATIONS, t, tField } from './data/translations.js';

export const INDIAN_LANGUAGES = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'hinglish', name: 'Hinglish', native: 'Hinglish (हिंग्लिश)' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు' },
  { code: 'mr', name: 'Marathi', native: 'मराठी' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
  { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી' },
  { code: 'ur', name: 'Urdu', native: 'اردو' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'or', name: 'Odia', native: 'ଓଡ଼ିଆ' },
  { code: 'ml', name: 'Malayalam', native: 'മലയാളം' },
  { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
  { code: 'as', name: 'Assamese', native: 'অসমীয়া' },
  { code: 'mai', name: 'Maithili', native: 'मैथिली' },
  { code: 'sa', name: 'Sanskrit', native: 'संस्कृतम्' },
  { code: 'ne', name: 'Nepali', native: 'नेपाली' },
  { code: 'kok', name: 'Konkani', native: 'कोंकणी' },
  { code: 'ks', name: 'Kashmiri', native: 'कॉशुर' },
  { code: 'sat', name: 'Santali', native: 'ᱥᱟᱱᱛᱟᱲᱤ' },
  { code: 'sd', name: 'Sindhi', native: 'سنڌي / सिंधी' },
  { code: 'brx', name: 'Bodo', native: 'बड़ो' },
  { code: 'mni', name: 'Manipuri', native: 'মৈতৈলোন্' },
  { code: 'doi', name: 'Dogri', native: 'डोगरी' },
];

function App() {
  const [schema, setSchema] = useState(null);
  const [phase, setPhase] = useState('language'); // 'language' -> 'digitaldoc_mobile' -> 'digitaldoc_otp' -> 'connecting' -> 'form' -> 'review' -> 'status'
  const [lang, setLang] = useState('en');
  const [mobile, setMobile] = useState('');
  const [values, setValues] = useState({});
  const [sources, setSources] = useState({});
  const [documents, setDocuments] = useState({});
  const [current, setCurrent] = useState(0);
  const [mode, setMode] = useState('guided');
  const [issues, setIssues] = useState({});
  const [showOptions, setShowOptions] = useState(false);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState('');
  const [preview, setPreview] = useState(null);
  const [simulateMismatch, setSimulateMismatch] = useState(false);
  const [submission, setSubmission] = useState(null);
  const [status, setStatus] = useState(null);

  const field = schema?.fields[current];
  const completeCount = useMemo(() => schema?.fields.filter((item) => item.type === 'file' ? documents[item.id] : values[item.id]).length || 0, [schema, values, documents]);

  useEffect(() => {
    const requestedForm = new URLSearchParams(window.location.search).get('form');
    chooseForm(requestedForm === 'income' ? 'income' : 'form25d');
  }, []);
  
  useEffect(() => { 
    if (!toast) return undefined; 
    const timer = setTimeout(() => setToast(''), 3000); 
    return () => clearTimeout(timer); 
  }, [toast]);

  async function chooseForm(formId) {
    setBusy(true);
    try {
      let nextSchema = FORM_SCHEMAS[formId] || FORM_SCHEMAS.form25d || FORM_SCHEMAS.nsp;
      setSchema(nextSchema); 
      setCurrent(0); 
      setIssues({}); 
      setMode('guided'); 
      setSubmission(null); 
      setStatus(null);
      setMobile('');
      
      let payload = getInitialState(nextSchema);
      hydrate(payload, nextSchema);
      setPhase('language');
    } catch (error) {
      const fallback = FORM_SCHEMAS[formId] || FORM_SCHEMAS.form25d || FORM_SCHEMAS.nsp;
      setSchema(fallback);
      setMobile('');
      hydrate(getInitialState(fallback), fallback);
      setPhase('language');
    } finally {
      setBusy(false);
    }
  }

  function hydrate(payload, targetSchema = schema) {
    const currentSchema = targetSchema || schema;
    const base = currentSchema ? getInitialState(currentSchema) : payload;
    const nextValues = { ...(base.values || {}), ...(payload.values || {}) };
    const nextSources = { ...(base.sources || {}), ...(payload.sources || {}) };
    const nextDocuments = { ...(base.documents || {}), ...(payload.documents || {}) };

    if (currentSchema?.fields) {
      for (const f of currentSchema.fields) {
        if (!f.prefillSource) {
          delete nextDocuments[f.id];
          delete nextSources[f.id];
          if (f.defaultValue === undefined) {
            delete nextValues[f.id];
          }
        }
      }
    }

    setValues(nextValues);
    setSources(nextSources);
    setDocuments(nextDocuments);
  }

  async function authenticate(credentials) {
    setBusy(true);
    setPhase('connecting');
    try {
      const authResult = await api.auth({ formId: schema.id, mobile, credential: credentials.credential || '123456', mode: credentials.mode || 'otp' });
      
      // If user already has an active submission on file, show tracking screen immediately!
      if (authResult.hasExistingSubmission && authResult.submission) {
        setStatus(authResult.submission);
        await new Promise((resolve) => setTimeout(resolve, 600));
        setPhase('status');
        setToast(`Existing application found (${authResult.submission.reference}).`);
        return;
      }

      const payload = await api.prefill(schema.id, mobile);
      hydrate(payload, schema);
      await new Promise((resolve) => setTimeout(resolve, 600));
      setPhase('form');
      setToast(`${payload.matchedDocuments || 3} documents verified & ready.`);
    } catch (error) { 
      console.warn('[auth] Error during authentication, activating fallback:', error);
      const profile = getDigitalDocProfile(mobile);
      const fallbackPayload = getInitialState(schema, profile, mobile);
      hydrate(fallbackPayload, schema);
      await new Promise((resolve) => setTimeout(resolve, 600));
      setPhase('form');
      setToast('3 documents verified & ready.');
    } finally { 
      setBusy(false); 
    }
  }

  function uploadFile(fieldId, file) {
    const size = Math.max(1, Math.round(file.size / 1024));
    setDocuments((previous) => ({ ...previous, [fieldId]: { name: file.name, meta: `${size} KB · Uploaded from this device`, source: 'Device upload', status: 'Ready to review' } }));
    setSources((previous) => { const copy = { ...previous }; delete copy[fieldId]; return copy; });
    setIssues((previous) => { const copy = { ...previous }; delete copy[fieldId]; return copy; });
    setToast(`${file.name} added. Preview it before continuing.`);
  }

  function updateValue(fieldId, nextValue) {
    const cleaned = schema.fields.find((item) => item.id === fieldId)?.type === 'number' ? String(nextValue).replace(/[^\d]/g, '') : nextValue;
    setValues((previous) => ({ ...previous, [fieldId]: cleaned }));
    setSources((previous) => { const copy = { ...previous }; delete copy[fieldId]; return copy; });
    setIssues((previous) => { const copy = { ...previous }; delete copy[fieldId]; return copy; });
  }

  function validateCurrent() {
    if (!field) return true;
    const value = field.type === 'file' ? documents[field.id] : values[field.id];
    let message = '';
    if (field.required && !value) message = 'Please add an answer before continuing.';
    if (field.format === 'phone' && value && !/^\d{10}$/.test(String(value).replace(/\D/g, ''))) message = 'Use a 10-digit mobile number.';
    if (field.type === 'number' && value && !/^\d+$/.test(String(value))) message = 'Use numbers only, without commas or symbols.';
    if (message) { setIssues((previous) => ({ ...previous, [field.id]: message })); return false; }
    return true;
  }

  async function next() {
    if (!validateCurrent()) return;
    if (current < schema.fields.length - 1) { 
      setCurrent((previous) => previous + 1); 
      setShowOptions(false); 
      return; 
    }
    await review();
  }

  async function review() {
    setBusy(true);
    try {
      const validation = await api.validate({ formId: schema.id, values, documents });
      if (!validation.valid) {
        setIssues(validation.issues);
        const firstBad = schema.fields.findIndex((item) => validation.issues[item.id]);
        setCurrent(Math.max(firstBad, 0)); 
        setMode('guided'); 
        setPhase('form'); 
        setToast('A few answers need your attention.');
      } else {
        setPhase('review');
      }
    } catch (error) { 
      setToast(error.message); 
    } finally { 
      setBusy(false); 
    }
  }

  async function submit() {
    setPhase('submitting');
    try {
      const result = await api.submit({ formId: schema.id, mobile, values, documents, simulateMismatch });
      setSubmission(result); 
      setPhase('success');
    } catch (error) {
      setIssues(error.data?.issues || {}); 
      setPhase('failure');
    }
  }

  async function track(reference) {
    try { 
      const result = await api.status(reference || mobile); 
      setStatus(result); 
      setPhase('status'); 
    } catch (error) { 
      const demoRef = reference || `${schema?.id === 'nsp' ? 'NSP' : 'INC'}-2026-9A82F`;
      setStatus({
        reference: demoRef,
        stage: 'Under Civic Review',
        timeline: [
          { title: 'Application Submitted', detail: 'Application received and registered on portal.', state: 'complete' },
          { title: 'DigitalDoc Verification', detail: 'Identity, marksheet and income records verified.', state: 'complete' },
          { title: 'Civic review', detail: 'A review officer is checking eligibility.', state: 'complete' },
          { title: 'Decision & payout', detail: 'The final decision and payout update will appear here.', state: 'pending' }
        ]
      });
      setPhase('status'); 
    }
  }

  if (!schema) return <LoadingScreen label="Loading your form" />;

  // 1. Language Selection Screen
  if (phase === 'language') {
    return (
      <Shell schema={schema} lang={lang} setLang={setLang}>
        <LanguageSelect 
          languages={INDIAN_LANGUAGES}
          selected={lang}
          onSelect={(code) => setLang(code)}
          onContinue={() => setPhase('digitaldoc_mobile')}
          lang={lang}
        />
      </Shell>
    );
  }

  // 2. DigitalDoc Mobile Input Screen
  if (phase === 'digitaldoc_mobile') {
    return (
      <Shell schema={schema} lang={lang} setLang={setLang}>
        <AuthMobile 
          mobile={mobile}
          setMobile={setMobile}
          onBack={() => setPhase('language')}
          onNext={() => setPhase('digitaldoc_otp')}
          onTrack={() => track(`${schema?.id === 'nsp' ? 'NSP' : 'INC'}-2026-88192`)}
          lang={lang}
        />
      </Shell>
    );
  }

  // 3. DigitalDoc OTP Verification Screen
  if (phase === 'digitaldoc_otp') {
    return (
      <Shell schema={schema} lang={lang} setLang={setLang}>
        <AuthOTP 
          mobile={mobile}
          onBack={() => setPhase('digitaldoc_mobile')}
          onSubmit={authenticate}
          busy={busy}
          lang={lang}
        />
      </Shell>
    );
  }

  // 4. Fetching & Matching Documents Screen
  if (phase === 'connecting') {
    return (
      <Shell schema={schema} lang={lang} setLang={setLang}>
        <FetchingScreen lang={lang} />
      </Shell>
    );
  }

  // 5. Review Screen
  if (phase === 'review') {
    return (
      <Shell schema={schema} lang={lang} setLang={setLang}>
        <Review 
          schema={schema} 
          values={values} 
          sources={sources} 
          documents={documents} 
          payload={buildSubmissionPayload(schema, values, documents)} 
          mismatch={simulateMismatch} 
          onMismatch={setSimulateMismatch} 
          onEdit={() => { setMode('simple'); setPhase('form'); }} 
          onSubmit={submit} 
          lang={lang}
        />
      </Shell>
    );
  }

  if (phase === 'submitting') return <Shell schema={schema} lang={lang} setLang={setLang}><LoadingScreen label={t(lang, 'submitting_app')} /></Shell>;
  if (phase === 'success') return <Shell schema={schema} lang={lang} setLang={setLang}><Success schema={schema} submission={submission} onTrack={() => track(submission.reference)} onRestart={() => chooseForm(schema.id)} lang={lang} /></Shell>;
  if (phase === 'failure') return <Shell schema={schema} lang={lang} setLang={setLang}><Failure issues={issues} onReview={() => { setMode('simple'); setPhase('form'); }} lang={lang} /></Shell>;
  if (phase === 'status') return <Shell schema={schema} lang={lang} setLang={setLang}><Status status={status} onRestart={() => chooseForm(schema.id)} lang={lang} /></Shell>;

  // 6. Form Questions Screen (Guided or Simple Mode)
  return (
    <Shell schema={schema} mode={mode} setMode={setMode} showTabs={true} lang={lang} setLang={setLang} onOpenLanguage={() => setPhase('language')}>
      <main className="flow-layout">
        <section className="flow-main">
          {mode === 'guided' ? (
            <GuidedField
              field={field}
              current={current}
              totalFields={schema.fields.length}
              value={values[field.id] || ''}
              source={sources[field.id]}
              document={documents[field.id]}
              error={issues[field.id]}
              onChange={updateValue}
              onChoose={(value) => updateValue(field.id, value)}
              onUpload={uploadFile}
              onPreview={setPreview}
              showOptions={showOptions}
              setShowOptions={setShowOptions}
              onBack={() => setCurrent((item) => Math.max(0, item - 1))}
              onNext={next}
              atStart={current === 0}
              atEnd={current === schema.fields.length - 1}
              lang={lang}
            />
          ) : (
            <SimpleView
              schema={schema}
              values={values}
              sources={sources}
              documents={documents}
              issues={issues}
              onChange={updateValue}
              onUpload={uploadFile}
              onPreview={setPreview}
              onReview={review}
              lang={lang}
            />
          )}
        </section>
      </main>
      {busy && <BusyOverlay />}
      {preview && <DocumentModal document={preview} onClose={() => setPreview(null)} />}
      {toast && <div className="toast"><CheckCircle2 size={16} />{toast}</div>}
    </Shell>
  );
}

function Shell({ schema, children, mode, setMode, showTabs = false, lang = 'en', setLang, onOpenLanguage }) {
  const department = schema?.department || 'Civic Services Office';
  const formTitle = schema?.title || 'Form 25D';
  const currentLangObj = INDIAN_LANGUAGES.find(l => l.code === lang) || INDIAN_LANGUAGES[0];

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-inner">
          <div className="govt-brand">
            <GovtDomeLogo />
            <div className="govt-brand-text">
              <strong>{formTitle}</strong>
              <span>{department}</span>
            </div>
          </div>
          <div className="topbar-right-group">
            {onOpenLanguage && (
              <button 
                type="button" 
                className="lang-pill-btn" 
                onClick={onOpenLanguage}
                title="Change language"
                aria-label="Change language"
              >
                <Globe size={18} strokeWidth={2.5} />
                <span>{currentLangObj.name}</span>
              </button>
            )}
            {showTabs && setMode && (
              <div className="view-icon-toggle" role="tablist" aria-label="Form view mode">
                <button
                  type="button"
                  role="tab"
                  aria-selected={mode === 'guided'}
                  className={`icon-toggle-btn ${mode === 'guided' ? 'active' : ''}`}
                  onClick={() => setMode('guided')}
                  aria-label="Single question view"
                  title="Single question view"
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6 2C4.9 2 4 2.9 4 4v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6H6zm7 7V3.5L18.5 9H13z" />
                  </svg>
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={mode === 'simple'}
                  className={`icon-toggle-btn ${mode === 'simple' ? 'active' : ''}`}
                  onClick={() => setMode('simple')}
                  aria-label="Full form view"
                  title="Full form view"
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6 2C4.9 2 4 2.9 4 4v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6H6zm7 7V3.5L18.5 9H13zM8 12.5h8v1.8H8v-1.8zm0 3.6h8v1.8H8v-1.8z" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
      <div className="app-content">
        {children}
      </div>
    </div>
  );
}

function GovtDomeLogo() {
  return (
    <svg className="govt-dome-icon" viewBox="0 0 100 80" fill="#084c82" aria-hidden="true">
      <path d="M50 4 C49.3 4 48.8 6 48.8 9 L48 15 L52 15 L51.2 9 C51.2 6 50.7 4 50 4 Z" />
      <circle cx="50" cy="5" r="2.2" />
      <path d="M44 15 L56 15 C55 17 45 17 44 15 Z" />
      <rect x="45" y="17" width="10" height="3" rx="0.5" />
      <path d="M50 20 C36 20 31 34 29 43 L71 43 C69 34 64 20 50 20 Z" />
      <rect x="25" y="43" width="50" height="4" rx="1" />
      <rect x="27" y="47" width="46" height="2" />
      <rect x="28" y="49" width="3.5" height="15" rx="0.5" />
      <rect x="34" y="49" width="3.5" height="15" rx="0.5" />
      <rect x="40" y="49" width="3.5" height="15" rx="0.5" />
      <rect x="46" y="49" width="3.5" height="15" rx="0.5" />
      <rect x="52" y="49" width="3.5" height="15" rx="0.5" />
      <rect x="58" y="49" width="3.5" height="15" rx="0.5" />
      <rect x="64" y="49" width="3.5" height="15" rx="0.5" />
      <rect x="70" y="49" width="3.5" height="15" rx="0.5" />
      <rect x="24" y="64" width="52" height="3" rx="0.5" />
      <path d="M20 69 L80 69 L76 67 L24 67 Z" />
      <path d="M15 73 L85 73 L81 70 L19 70 Z" />
      <path d="M10 77 C35 74 65 74 90 77 L87 74 L13 74 Z" />
    </svg>
  );
}

function LanguageSelect({ languages, selected, onSelect, onContinue, lang }) {
  return (
    <main className="single-stage language-stage reveal">
      <div className="stage-intro text-center">
        <h1>{t(selected, 'choose_language')}</h1>
        <p>{t(selected, 'choose_language_sub')}</p>
      </div>
      <div className="language-grid">
        {languages.map((item) => {
          const isSelected = selected === item.code;
          return (
            <button
              key={item.code}
              type="button"
              className={`language-tile ${isSelected ? 'selected' : ''}`}
              onClick={() => onSelect(item.code)}
            >
              <span className="lang-native">{item.native}</span>
              <span className="lang-name">{item.name}</span>
              {isSelected && <span className="lang-check"><Check size={14} /></span>}
            </button>
          );
        })}
      </div>
      <div className="stage-action-center">
        <button type="button" className="button-primary continue-btn" onClick={onContinue}>
          <span>{t(selected, 'continue')}</span>
          <ArrowRight size={18} />
        </button>
      </div>
    </main>
  );
}

function AuthMobile({ mobile, setMobile, onBack, onNext, onTrack, lang }) {
  const isValid = /^\d{10}$/.test(mobile.replace(/\D/g, ''));
  return (
    <main className="single-stage auth-stage reveal">
      <div className="stage-intro text-center">
        <h1>{t(lang, 'signin_digitaldoc')}</h1>
        <p>{t(lang, 'signin_digitaldoc_sub')}</p>
      </div>
      
      <div className="auth-card-wrapper">
        <div className="input-card is-standard">
          <div className="input-card-field">
            <input
              type="tel"
              autoFocus
              inputMode="numeric"
              placeholder={t(lang, 'mobile_placeholder')}
              value={mobile}
              onChange={(e) => setMobile(e.target.value.replace(/[^\d]/g, '').slice(0, 10))}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && isValid) {
                  e.preventDefault();
                  onNext();
                }
              }}
            />
          </div>
        </div>

        <div className="demo-hint-row" style={{ flexDirection: 'column', gap: 6, alignItems: 'stretch' }}>
          <span style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 500 }}>
            Mock Profiles (Tap to test):
          </span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {DEMO_PROFILES_LIST.map((profile) => {
              const isSelected = mobile === profile.mobile;
              return (
                <button
                  key={profile.mobile}
                  type="button"
                  style={{
                    fontSize: '11px',
                    padding: '4px 8px',
                    borderRadius: '8px',
                    border: isSelected ? '1px solid #5835e5' : '1px solid #e2e7e4',
                    background: isSelected ? '#edeafe' : '#f8faf9',
                    color: isSelected ? '#5835e5' : '#2b3834',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                  onClick={() => setMobile(profile.mobile)}
                >
                  <strong>{profile.mobile}</strong>
                  <span>· {profile.name.split(' ')[0]}</span>
                  <span style={{ opacity: 0.75 }}>({profile.statusLabel})</span>
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="button"
          className="button-primary continue-btn"
          disabled={!isValid}
          onClick={onNext}
        >
          <span>{t(lang, 'get_otp')}</span>
          <ArrowRight size={18} />
        </button>

        <div className="auth-footer-nav">
          <button type="button" className="text-link-btn" onClick={onBack}>
            {t(lang, 'change_language')}
          </button>
          <button type="button" className="text-link-btn highlight" onClick={onTrack}>
            {t(lang, 'track_applied')}
          </button>
        </div>
      </div>
    </main>
  );
}

function AuthOTP({ mobile, onBack, onSubmit, busy, lang }) {
  const [otp, setOtp] = useState('123456');
  const isValid = otp.length === 6;

  return (
    <main className="single-stage auth-stage reveal">
      <div className="stage-intro text-center">
        <h1>{t(lang, 'enter_verification')}</h1>
        <p>{t(lang, 'enter_otp_sub')} <strong>+91 {mobile || '9876543210'}</strong></p>
      </div>

      <div className="auth-card-wrapper">
        <div className="input-card is-standard">
          <div className="input-card-field">
            <input
              type="text"
              autoFocus
              inputMode="numeric"
              maxLength={6}
              placeholder="123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/[^\d]/g, '').slice(0, 6))}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && isValid && !busy) {
                  e.preventDefault();
                  onSubmit({ credential: otp, mode: 'otp' });
                }
              }}
            />
          </div>
        </div>

        <div className="demo-hint-row">
          <span className="demo-badge" onClick={() => setOtp('123456')}>
            {t(lang, 'demo_otp_hint')}
          </span>
        </div>

        <button
          type="button"
          className="button-primary continue-btn"
          disabled={!isValid || busy}
          onClick={() => onSubmit({ credential: otp, mode: 'otp' })}
        >
          {busy ? (
            <>
              <LoaderCircle className="spin" size={18} />
              <span>{t(lang, 'verifying_otp')}</span>
            </>
          ) : (
            <>
              <span>{t(lang, 'verify_fetch')}</span>
              <ArrowRight size={18} />
            </>
          )}
        </button>

        <div className="auth-footer-nav">
          <button type="button" className="text-link-btn" onClick={onBack}>
            {t(lang, 'change_mobile')}
          </button>
        </div>
      </div>
    </main>
  );
}

function FetchingScreen({ lang }) {
  const [step, setStep] = useState(1);

  useEffect(() => {
    const timer1 = setTimeout(() => setStep(2), 200);
    const timer2 = setTimeout(() => setStep(3), 450);
    const timer3 = setTimeout(() => setStep(4), 700);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  const items = [
    { title: 'Civic ID card', desc: t(lang, 'identity_verified') },
    { title: 'Class 12 Marksheet', desc: t(lang, 'marksheet_linked') },
    { title: 'Residence & category record', desc: t(lang, 'category_verified') },
    { title: 'Income Certificate', desc: t(lang, 'income_verified') }
  ];

  return (
    <main className="single-stage connecting-stage reveal">
      <div className="stage-intro text-center">
        <div className="fetching-spinner-wrap">
          <div className="loader-ring" />
        </div>
        <h1>{t(lang, 'connecting_title')}</h1>
        <p>{t(lang, 'connecting_sub')}</p>
      </div>

      <div className="fetching-checklist">
        {items.map((item, idx) => {
          const isDone = step > idx;
          return (
            <div className={`fetching-item ${isDone ? 'done' : ''}`} key={idx} style={{ opacity: isDone ? 1 : 0.45, transition: 'opacity 0.25s ease' }}>
              <div className="item-icon">
                {isDone ? (
                  <Check size={16} />
                ) : (
                  <LoaderCircle className="spin" size={14} style={{ opacity: 0.6 }} />
                )}
              </div>
              <div className="item-content">
                <strong>{item.title}</strong>
                <span>{item.desc}</span>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}

function GuidedField({ field, current, totalFields, value, source, document, error, onChange, onChoose, onUpload, onPreview, showOptions, setShowOptions, onBack, onNext, atStart, atEnd, lang }) {
  const isFile = field.type === 'file';
  const labelText = tField(lang, field.id, field.label);

  return (
    <article className={`question-card reveal ${isFile && document ? 'has-doc-preview' : ''}`} key={field.id}>
      <div className={`question-body ${isFile && document ? 'doc-mode-body' : ''}`}>
        <div className="question-header-group">
          <h2>{labelText}</h2>
        </div>
        <div className="answer-area">
          <FieldControl
            field={field}
            value={value}
            source={source}
            document={document}
            onChange={onChange}
            onChoose={onChoose}
            onUpload={onUpload}
            onPreview={onPreview}
            onSubmit={onNext}
            error={error}
            lang={lang}
          />
          {error && <p className="field-error">{error}</p>}
        </div>
      </div>
      <footer className="question-actions">
        <button
          type="button"
          className="nav-text-btn"
          disabled={atStart}
          onClick={onBack}
          aria-label="Previous question"
        >
          {t(lang, 'prev')}
        </button>
        <span className="nav-counter">{current + 1}/{totalFields}</span>
        <button
          type="button"
          className="nav-text-btn"
          onClick={onNext}
          aria-label={atEnd ? 'Review application' : 'Next question'}
        >
          {atEnd ? t(lang, 'review_btn') : t(lang, 'next')}
        </button>
      </footer>
    </article>
  );
}

function dateForInput(value) { return /^\d{2}\/\d{2}\/\d{4}$/.test(String(value)) ? String(value).split('/').reverse().join('-') : value || ''; }
function displayDate(value) { return /^\d{4}-\d{2}-\d{2}$/.test(String(value)) ? String(value).split('-').reverse().join('/') : value; }


const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;

function MicButton({ onResult }) {
  const [recording, setRecording] = useState(false);
  const recognitionRef = useRef(null);

  const startRecording = (e) => {
    e.preventDefault();
    if (!SpeechRecognitionAPI) {
      alert("Speech Recognition is not supported in your browser.");
      return;
    }
    try {
      const recognition = new SpeechRecognitionAPI();
      recognition.continuous = false;
      recognition.interimResults = false;
      
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        onResult(transcript);
      };

      recognition.onend = () => {
        setRecording(false);
      };

      recognition.start();
      recognitionRef.current = recognition;
      setRecording(true);
    } catch (err) {
      console.error(err);
      setRecording(false);
    }
  };

  const stopRecording = (e) => {
    e.preventDefault();
    if (recognitionRef.current && recording) {
      recognitionRef.current.stop();
    }
    setRecording(false);
  };

  return (
    <button 
      className={`mic-button ${recording ? 'recording' : ''}`}
      onMouseDown={startRecording}
      onMouseUp={stopRecording}
      onMouseLeave={stopRecording}
      onTouchStart={startRecording}
      onTouchEnd={stopRecording}
      type="button"
      title="Hold to speak"
    >
      <Mic size={18} />
    </button>
  );
}

function FieldControl({ field, value, source, document, onChange, onChoose, onUpload, onPreview, onSubmit, error, lang }) {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && onSubmit) {
      e.preventDefault();
      onSubmit();
    }
  };

  const badgeText = t(lang, 'fetched_via_digitaldoc');

  if (field.type === 'file') {
    if (document) {
      return (
        <div className={`document-preview-container ${error ? 'has-error' : ''}`}>
          <div className={`input-card ${source ? 'is-digitaldoc' : 'is-standard'}`} style={{ cursor: 'pointer' }} onClick={() => onPreview(document)}>
            <div className="mockup-paper-sheet" role="button" tabIndex={0}>
              <div className="mockup-sheet-inner">
                <div className="sheet-heading">Cardboard, Inc.</div>
                <p className="sheet-sub">We are hiring a Growth Intern to come and run influencer marketing + UGC with us at <span className="sheet-link">Cardboard</span></p>
                <p className="sheet-p">This is not a <em>"support the marketing team"</em> internship. You too will own the creator function: the sourcing, the outreach, the negotiation, the briefs, the tracker, the budget, and the numbers. You will personally control a five-figure USD monthly creator budget within your first few months.</p>
                <div className="sheet-section-title">What you'll own?</div>
                <ol className="sheet-list">
                  <li><strong>1. Sourcing at volume:</strong> Build and maintain a pipeline of hundreds of creators across different viable niches, across India, the US, SEA, LATAM, and Europe. Find the non-obvious ones before anyone else does. Mid-tier and micro creators with real comment sections beat vanity follower counts every time.</li>
                  <li><strong>2. Outreach and closing:</strong> Write DMs and emails that get replies from people who ignore brand outreach for a living. Follow up without being annoying. Negotiate rates down without making it feel like a lowball. Get people from "interesting" to "posting" in days, not weeks.</li>
                  <li><strong>3. Deal structuring:</strong> Base fee, performance-based, bonuses and incentives, long-term retainers, multi-content deals. Know which structure to use for which creator and defend the choice.</li>
                  <li><strong>4. Campaign ops:</strong> Write briefs creators actually follow. Manage 100-200 open conversations without dropping anyone. Track live status, delivery, revisions, posting, and much more.</li>
                  <li><strong>5. Content and trend strategy:</strong> You'll help us decide what videos get made, not just who makes them. Spot a converting format you want to do, and get it shipped by creators fast.</li>
                  <li><strong>6. Performance and budget:</strong> Own the dashboard: cost per video, cost per thousand views, reply rate, close rate, time-to-live, signups and activations per creator. Reallocate the efforts weekly based on what's actually working. Tell us when something isn't.</li>
                  <li><strong>7. Community and events:</strong> Help run dinners, Cardboard café popups, and founder/creator gatherings with people you currently follow on the internet and can learn from.</li>
                </ol>
                <div className="sheet-section-title" style={{ marginTop: '10px' }}>Who we're looking for?</div>
                <p className="sheet-p">You are terminally online. You understand why a certain content format kicks off, you know when a creator is a "right fit," and you get the internet like the back of your hand.</p>
                <div className="sheet-section-title" style={{ marginTop: '8px' }}>You should have:</div>
              </div>
            </div>
            {source && (
              <div className="input-card-badge">
                <BadgeIcon />
                <span>{badgeText}</span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return (
      <label className={`minimal-upload-zone ${error ? 'has-error' : ''}`}>
        <div className="upload-bg-icon">
          <Upload size={40} />
        </div>
        <span className="upload-main-text">{t(lang, 'upload_doc')} {field.shortLabel || 'document'}</span>
        <span className="upload-sub-text">{t(lang, 'upload_sub')}</span>
        <input type="file" accept=".pdf,image/*" onChange={(event) => event.target.files?.[0] && onUpload(field.id, event.target.files[0])} />
      </label>
    );
  }
  if (field.type === 'yesno') {
    return (
      <div className="choice-row">
        {field.options.map((option) => {
          const displayOption = option === 'Yes' ? t(lang, 'yes') : option === 'No' ? t(lang, 'no') : option;
          return (
            <button
              key={option}
              type="button"
              onClick={() => onChoose(option)}
              className={`choice-tile ${value === option ? 'selected' : ''}`}
            >
              {value === option && <Check size={16} />}
              <span>{displayOption}</span>
            </button>
          );
        })}
      </div>
    );
  }
  if (field.type === 'category') {
    return (
      <div className={`input-card ${source ? 'is-digitaldoc' : 'is-standard'} ${error ? 'input-error' : ''}`}>
        <div className="input-card-field">
          <select value={value} onChange={(event) => onChange(field.id, event.target.value)}>
            <option value="">{field.placeholder}</option>
            {field.options.map((option) => <option key={option}>{option}</option>)}
          </select>
        <MicButton onResult={(t) => onChange(field.id, t)} />
        </div>
        {source && (
          <div className="input-card-badge">
            <BadgeIcon />
            <span>{badgeText}</span>
          </div>
        )}
      </div>
    );
  }
  if (field.type === 'date') {
    return (
      <div className={`input-card ${source ? 'is-digitaldoc' : 'is-standard'} ${error ? 'input-error' : ''}`}>
        <div className="input-card-field">
          <input type="date" value={dateForInput(value)} onKeyDown={handleKeyDown} onChange={(event) => onChange(field.id, event.target.value)} />
        <MicButton onResult={(t) => onChange(field.id, t)} />
        </div>
        {source && (
          <div className="input-card-badge">
            <BadgeIcon />
            <span>{badgeText}</span>
          </div>
        )}
      </div>
    );
  }
  return (
    <div className={`input-card ${source ? 'is-digitaldoc' : 'is-standard'} ${error ? 'input-error' : ''}`}>
      <div className="input-card-field">
        <input
          value={value}
          autoFocus
          inputMode={field.inputMode || (field.type === 'number' ? 'numeric' : undefined)}
          placeholder={field.placeholder}
          onKeyDown={handleKeyDown}
          onChange={(event) => onChange(field.id, event.target.value)}
        />
        {field.suffix && <span className="input-suffix">{field.suffix}</span>}
      <MicButton onResult={(t) => onChange(field.id, t)} />
      </div>
      {source && (
        <div className="input-card-badge">
          <BadgeIcon />
          <span>{badgeText}</span>
        </div>
      )}
    </div>
  );
}

function BadgeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="3" y="4" width="18" height="15" rx="3.5" fill="currentColor" fillOpacity="0.2" />
      <rect x="3" y="4" width="18" height="15" rx="3.5" stroke="currentColor" strokeWidth="2" />
      <circle cx="8.5" cy="11.5" r="2" fill="currentColor" />
      <path d="M13.5 10H17.5M13.5 13H16.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function SimpleView({ schema, values, sources, documents, issues, onChange, onUpload, onPreview, onReview, lang }) {
  return (
    <article className="simple-card reveal">
      <div className="simple-grid">
        {schema.fields.map((field) => (
          <div className="simple-field" key={field.id}>
            <div className="simple-field-label">
              <span>{tField(lang, field.id, field.label)}</span>
            </div>
            <FieldControl
              field={field}
              value={values[field.id] || ''}
              source={sources[field.id]}
              document={documents[field.id]}
              onChange={onChange}
              onChoose={(next) => onChange(field.id, next)}
              onUpload={onUpload}
              onPreview={onPreview}
              error={issues[field.id]}
              lang={lang}
            />
            {issues[field.id] && <p className="field-error">{issues[field.id]}</p>}
          </div>
        ))}
      </div>
      <div className="simple-footer">
        <button type="button" className="button-primary" onClick={onReview}>
          <span>{t(lang, 'continue_to_review')}</span>
          <ArrowRight size={17} />
        </button>
      </div>
    </article>
  );
}

function Review({ schema, values, sources, documents, payload, mismatch, onMismatch, onEdit, onSubmit, lang }) { 
  return (
    <main className="single-stage review-stage reveal">
      <div className="stage-intro">
        
        <h1>{t(lang, 'review_title')}<br /><em>{t(lang, 'review_title_em')}</em></h1>
        
      </div>
      <section className="review-card">
        <header>
          <div>
            <h2>{schema.title}</h2>
            <p>{t(lang, 'check_each_answer')}</p>
          </div>
          <button className="doc-replace-btn" onClick={onEdit}>
            {t(lang, 'edit_answers')} <ArrowRight size={15} />
          </button>
        </header>
        <div className="review-grid">
          {schema.fields.map((field) => (
            <div className="review-item" key={field.id}>
              <small>{field.shortLabel}</small>
              <div className="review-val">
                <strong>{field.type === 'file' ? (documents[field.id]?.name || t(lang, 'not_provided')) : field.type === 'date' ? displayDate(values[field.id]) : (values[field.id] === 'Yes' ? t(lang, 'yes') : values[field.id] === 'No' ? t(lang, 'no') : values[field.id] || t(lang, 'not_provided'))}</strong>
                {sources[field.id] && (
                  <span><Sparkles size={12} /> {sources[field.id] === 'digitaldoc' ? 'DigitalDoc' : sources[field.id]}</span>
                )}
              </div>
            </div>
          ))}
        </div>
        <details className="payload-preview">
          <summary>{t(lang, 'view_payload')}</summary>
          <pre>{JSON.stringify(payload, null, 2)}</pre>
        </details>
        <label className="mismatch-toggle">
          <input type="checkbox" checked={mismatch} onChange={(event) => onMismatch(event.target.checked)} />
          <span>
            <b>{t(lang, 'demo_mismatch')}</b>
            <small>{t(lang, 'demo_mismatch_sub')}</small>
          </span>
        </label>
        <footer>
          <span><LockKeyhole size={15} /> {t(lang, 'simulated_disclaimer')}</span>
          <button className="button button-primary" onClick={onSubmit}>
            {t(lang, 'submit_application')} <ArrowRight size={17} />
          </button>
        </footer>
      </section>
    </main>
  );
}

function LoadingScreen({ label }) { 
  return (
    <main className="loading-screen">
      <div className="loader-ring" />
      <h2>{label}</h2>
      <p>We are preparing a safe, synthetic response for this prototype.</p>
    </main>
  );
}

function Success({ schema, submission, onTrack, onRestart, lang }) { 
  return (
    <main className="outcome-stage reveal">
      <div className="outcome-mark success"><Check size={31} /></div>
      
      <h1>
        <>Your {schema?.title || 'Form 25D'}<br /><em>is on its way.</em></>
      </h1>
      
      <div className="reference">
        <span>Application Reference Number</span>
        <b>{submission?.reference}</b>
      </div>
      <div className="outcome-actions">
        <button className="button button-primary" onClick={onTrack}>
          Track application status <ArrowRight size={17} />
        </button>
        <button className="button button-quiet" onClick={onRestart}>
          {t(lang, 'start_new_app')}
        </button>
      </div>
    </main>
  );
}

function Failure({ issues, onReview, lang }) { 
  return (
    <main className="outcome-stage reveal">
      <div className="outcome-mark failure"><X size={31} /></div>
      <div className="eyebrow warning"><CircleHelp size={14} /> Mock API response · 422</div>
      <h1>One document needs<br /><em>a closer look.</em></h1>
      <p>Your answers have been kept safely. The submission API returned a clear, field-level reason to fix before retrying.</p>
      <div className="failure-detail">
        {Object.entries(issues).map(([key, message]) => (
          <p key={key}>
            <FileText size={16} />
            <span><b>{key}</b>{message}</span>
          </p>
        ))}
      </div>
      <button className="button button-primary" onClick={onReview}>
        Review and fix <ArrowRight size={17} />
      </button>
    </main>
  );
}

function Status({ status, onRestart, lang }) { 
  return (
    <main className="single-stage status-stage reveal">
      <div className="stage-intro text-center">
        <h1>{t(lang, 'app_status_title')}</h1>
        <p>Reference: <strong>{status?.reference || 'ITD-2026-88192'}</strong></p>
      </div>
      
      <section className="status-card">
        <div className="status-header">
          <div>
            <span className="status-badge-active">{status?.statusBadge || t(lang, 'in_progress')}</span>
            <h2 className="status-form-title">{status?.formTitle || 'Form 25D application'}</h2>
            {status?.applicantName && (
              <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--muted)' }}>
                Applicant: <strong>{status.applicantName}</strong> {status.mobile ? `(+91 ${status.mobile})` : ''}
              </p>
            )}
          </div>
          <span className="status-ref-text">Ref: {status?.reference}</span>
        </div>

        <div className="timeline-wrap">
          {(status?.timeline || [
            { title: 'Application Submitted', detail: 'Application received and registered on portal.', state: 'complete' },
            { title: 'DigitalDoc Verification', detail: 'Identity, marksheet, and income records verified.', state: 'complete' },
            { title: 'Civic review', detail: 'A review officer is checking eligibility.', state: 'complete' },
            { title: 'Decision & payout', detail: 'The final decision and payout update will appear here.', state: 'pending' }
          ]).map((item, idx) => (
            <div className={`timeline-item ${item.state}`} key={idx}>
              <div className="timeline-dot">
                {item.state === 'complete' ? <Check size={14} /> : <span>{idx + 1}</span>}
              </div>
              <div className="timeline-info">
                <h3>{item.title}</h3>
                <p>{item.detail}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="status-actions">
          <button className="button button-primary" onClick={onRestart}>
            <ArrowLeft size={16} /> {t(lang, 'start_new_app')}
          </button>
        </div>
      </section>
    </main>
  );
}

function DocumentModal({ document, onClose }) { 
  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <section className="document-modal reveal" onMouseDown={(event) => event.stopPropagation()}>
        <header>
          <div>
            <span className="eyebrow"><FileText size={14} /> Synthetic document preview</span>
            <h2>{document?.name}</h2>
            <p>{document?.meta} · {document?.source}</p>
          </div>
          <button onClick={onClose} aria-label="Close preview"><X size={18} /></button>
        </header>
        <div className="paper">
          <div className="paper-head">
            <span>FORMSETU DOCUMENT VIEWER</span>
            <b>DEMO COPY</b>
          </div>
          <h3>{document?.name}</h3>
          <p>This preview is intentionally synthetic. It is shown so the applicant can confirm the right document before submission.</p>
          <i /><i /><i className="short" /><i /><i className="short" />
          <footer>
            <span>Document ID · DEMO-2026</span>
            <span>{document?.status || 'Ready'}</span>
          </footer>
        </div>
      </section>
    </div>
  );
}

function BusyOverlay() { 
  return (
    <div className="busy-overlay">
      <LoaderCircle className="spin" size={20} /> Loading…
    </div>
  );
}

export default App;
