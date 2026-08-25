import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft, ArrowRight, Bot, Check, CheckCircle2, ChevronRight, CircleHelp,
  FileText, Globe2, Landmark, LoaderCircle, LockKeyhole, Mic, PanelRight,
  Send, ShieldCheck, Sparkles, Upload, X, Zap
} from 'lucide-react';
import { api } from './api.js';
import { buildSubmissionPayload, getInitialState } from './data/forms.js';

const demoVoice = { fullName: 'Ananya Sharma', phone: '9876543210', dob: '05/09/2002', category: 'OBC-NCL', state: 'Maharashtra', annualIncome: '96000', bankAccount: '201145009811', applicantName: 'Ananya Sharma', purpose: 'Education', income: '96000' };

function App() {
  const [catalog, setCatalog] = useState([]);
  const [schema, setSchema] = useState(null);
  const [phase, setPhase] = useState('home');
  const [values, setValues] = useState({});
  const [sources, setSources] = useState({});
  const [documents, setDocuments] = useState({});
  const [current, setCurrent] = useState(0);
  const [mode, setMode] = useState('guided');
  const [issues, setIssues] = useState({});
  const [showOptions, setShowOptions] = useState(false);
  const [chatOpen, setChatOpen] = useState(true);
  const [chat, setChat] = useState([]);
  const [chatDraft, setChatDraft] = useState('');
  const [chatBusy, setChatBusy] = useState(false);
  const [language, setLanguage] = useState('English');
  const [tone, setTone] = useState('simple');
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState('');
  const [preview, setPreview] = useState(null);
  const [simulateMismatch, setSimulateMismatch] = useState(false);
  const [submission, setSubmission] = useState(null);
  const [status, setStatus] = useState(null);

  const field = schema?.fields[current];
  const completeCount = useMemo(() => schema?.fields.filter((item) => item.type === 'file' ? documents[item.id] : values[item.id]).length || 0, [schema, values, documents]);

  useEffect(() => { api.forms().then(setCatalog).catch(() => setToast('The local API is not running yet. Start with npm run dev.')); }, []);
  useEffect(() => { if (!toast) return undefined; const timer = setTimeout(() => setToast(''), 3000); return () => clearTimeout(timer); }, [toast]);

  async function chooseForm(formId) {
    setBusy(true);
    try {
      const nextSchema = await api.form(formId);
      setSchema(nextSchema); setCurrent(0); setIssues({}); setMode('guided'); setSubmission(null); setStatus(null);
      setChat([{ role: 'assistant', text: `Hi, I’m Setu. I’ll guide you through this ${nextSchema.title.toLowerCase()} one clear question at a time.` }]);
      if (formId === 'nsp') { setPhase('consent'); }
      else {
        const payload = await api.prefill(formId);
        hydrate(payload, nextSchema); setPhase('form');
      }
    } catch (error) { setToast(error.message); }
    finally { setBusy(false); }
  }

  function hydrate(payload, targetSchema = schema) {
    const state = payload.mockResponse && targetSchema ? getInitialState(targetSchema, payload.mockResponse) : payload;
    setValues(state.values || {}); setSources(state.sources || {}); setDocuments(state.documents || {});
  }

  async function authenticate(credentials) {
    setBusy(true);
    setPhase('connecting');
    try {
      await api.auth({ formId: schema.id, ...credentials });
      const payload = await api.prefill(schema.id);
      hydrate(payload, schema); setPhase('form'); setToast(`${payload.matchedDocuments} documents matched and ready to review.`);
    } catch (error) { setPhase('auth'); setToast(error.message); }
    finally { setBusy(false); }
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
    if (current < schema.fields.length - 1) { setCurrent((previous) => previous + 1); setShowOptions(false); return; }
    await review();
  }

  async function review() {
    setBusy(true);
    try {
      const validation = await api.validate({ formId: schema.id, values, documents });
      if (!validation.valid) {
        setIssues(validation.issues);
        const firstBad = schema.fields.findIndex((item) => validation.issues[item.id]);
        setCurrent(Math.max(firstBad, 0)); setMode('guided'); setPhase('form'); setToast('A few answers need your attention.');
      } else setPhase('review');
    } catch (error) { setToast(error.message); }
    finally { setBusy(false); }
  }

  async function submit() {
    setPhase('submitting');
    try {
      const result = await api.submit({ formId: schema.id, values, documents, simulateMismatch });
      setSubmission(result); setPhase('success');
    } catch (error) {
      setIssues(error.data?.issues || {}); setPhase('failure');
    }
  }

  async function askChat(text = chatDraft) {
    const message = text.trim(); if (!message || !schema) return;
    setChat((previous) => [...previous, { role: 'user', text: message }]); setChatDraft(''); setChatBusy(true);
    try {
      const result = await api.chat({ formId: schema.id, fieldId: field?.id, message, mode: tone, language });
      setChat((previous) => [...previous, { role: 'assistant', text: result.reply }]);
      if (result.action?.type === 'show_options') setShowOptions(true);
      if (result.action?.type === 'prefill') setToast('Matched document details are marked in green.');
    } catch (error) { setChat((previous) => [...previous, { role: 'assistant', text: 'I could not reach the local guide right now. Please try again.' }]); }
    finally { setChatBusy(false); }
  }

  function listen() {
  if (!field || field.type === 'file') return;
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) { updateValue(field.id, demoVoice[field.id] || 'No'); setToast('Voice preview added a sample answer.'); return; }
    const recognition = new Recognition(); recognition.lang = language === 'Hindi' ? 'hi-IN' : 'en-IN';
    setToast('Listening…');
    recognition.onresult = (event) => updateValue(field.id, event.results[0][0].transcript);
    recognition.onerror = () => setToast('I could not hear that. Try typing instead.');
    recognition.start();
  }

  async function track(reference) {
    try { const result = await api.status(reference); setStatus(result); setPhase('status'); }
    catch (error) { setToast(error.message); }
  }

  if (phase === 'home') return <Home catalog={catalog} onChoose={chooseForm} busy={busy} />;
  if (!schema) return <LoadingScreen label="Loading your form" />;
  if (phase === 'consent') return <Shell schema={schema} onHome={() => setPhase('home')}><Consent onContinue={() => setPhase('auth')} /></Shell>;
  if (phase === 'auth') return <Shell schema={schema} onHome={() => setPhase('home')}><Auth onSubmit={authenticate} busy={busy} /></Shell>;
  if (phase === 'connecting') return <Shell schema={schema} onHome={() => setPhase('home')}><LoadingScreen label="Matching your documents" /></Shell>;
  if (phase === 'review') return <Shell schema={schema} onHome={() => setPhase('home')}><Review schema={schema} values={values} sources={sources} documents={documents} payload={buildSubmissionPayload(schema, values, documents)} mismatch={simulateMismatch} onMismatch={setSimulateMismatch} onEdit={() => { setMode('simple'); setPhase('form'); }} onSubmit={submit} /></Shell>;
  if (phase === 'submitting') return <Shell schema={schema} onHome={() => setPhase('home')}><LoadingScreen label="Sending your application" /></Shell>;
  if (phase === 'success') return <Shell schema={schema} onHome={() => setPhase('home')}><Success schema={schema} submission={submission} onTrack={() => track(submission.reference)} onHome={() => setPhase('home')} /></Shell>;
  if (phase === 'failure') return <Shell schema={schema} onHome={() => setPhase('home')}><Failure issues={issues} onReview={() => { setMode('simple'); setPhase('form'); }} /></Shell>;
  if (phase === 'status') return <Shell schema={schema} onHome={() => setPhase('home')}><Status status={status} onHome={() => setPhase('home')} /></Shell>;

  return <Shell schema={schema} onHome={() => setPhase('home')}><main className="flow-layout"><section className="flow-main"><FormHeader schema={schema} mode={mode} setMode={setMode} /><Progress schema={schema} current={current} completeCount={completeCount} />{mode === 'guided' ? <GuidedField field={field} value={values[field.id] || ''} source={sources[field.id]} document={documents[field.id]} error={issues[field.id]} onChange={updateValue} onChoose={(value) => updateValue(field.id, value)} onUpload={uploadFile} onPreview={setPreview} showOptions={showOptions} setShowOptions={setShowOptions} onListen={listen} onBack={() => setCurrent((item) => Math.max(0, item - 1))} onNext={next} atStart={current === 0} atEnd={current === schema.fields.length - 1} /> : <SimpleView schema={schema} values={values} sources={sources} documents={documents} issues={issues} onChange={updateValue} onUpload={uploadFile} onPreview={setPreview} onReview={review} />}</section>{chatOpen && <ChatPanel chat={chat} draft={chatDraft} setDraft={setChatDraft} busy={chatBusy} language={language} setLanguage={setLanguage} tone={tone} setTone={setTone} onAsk={askChat} onClose={() => setChatOpen(false)} field={field} />}{!chatOpen && <button className="chat-fab" onClick={() => setChatOpen(true)} aria-label="Open Setu guide"><Bot size={20} /></button>}</main>{busy && <BusyOverlay />}{preview && <DocumentModal document={preview} onClose={() => setPreview(null)} />}{toast && <div className="toast"><CheckCircle2 size={16} />{toast}</div>}</Shell>;
}

function Home({ catalog, onChoose, busy }) {
  return <div className="landing"><nav className="landing-nav"><Brand /><div className="nav-note"><span className="online-dot" /> Local prototype · schema API enabled</div></nav><main className="landing-main"><section className="hero-copy reveal"><div className="eyebrow"><Sparkles size={14} /> A kinder way through public forms</div><h1>Every question<br /><em>feels familiar.</em></h1><p>FormSetu turns long, high-stakes forms into a calm conversation that remembers what your documents already know.</p><div className="hero-actions"><button className="button button-primary" onClick={() => onChoose('nsp')} disabled={busy}>Start scholarship flow <ArrowRight size={17} /></button><button className="text-button" onClick={() => document.getElementById('forms')?.scrollIntoView({ behavior: 'smooth' })}>Explore the engine <ChevronRight size={16} /></button></div><div className="proof-row"><span><ShieldCheck size={16} /> Consent first</span><span><Bot size={16} /> Guide built in</span><span><Landmark size={16} /> No real government API</span></div></section><section className="hero-scene reveal delay-1"><div className="orb orb-one" /><div className="orb orb-two" /><div className="hero-card"><div className="card-top"><span className="mini-brand"><i /> formsetu</span><span className="live-pill"><span /> Guided</span></div><div className="mini-steps"><b /><b /><b className="current" /><b /><b /></div><p className="mini-kicker">Step 03 · Your identity</p><h3>Is this date of birth correct?</h3><div className="mini-answer"><span>05 / 09 / 2002</span><CheckCircle2 size={19} /></div><div className="mini-source"><span><Sparkles size={13} /> Matched from DigiLocker</span><button>Change</button></div><div className="mini-chat"><Bot size={17} /><span>Want an explanation? I can help.</span></div></div></section></main><section id="forms" className="form-chooser"><div><div className="eyebrow"><Zap size={14} /> One renderer, many services</div><h2>Pick a form to explore</h2></div><div className="chooser-grid">{catalog.length ? catalog.map((item, index) => <button key={item.id} className={`form-option ${index ? 'violet' : ''}`} onClick={() => onChoose(item.id)}><span className="form-option-icon">{index ? <FileText size={21} /> : <Landmark size={21} />}</span><span><strong>{item.title}</strong><small>{item.description}</small></span><ArrowRight size={18} /></button>) : <div className="skeleton-card" />}</div></section><footer>FormSetu concept prototype · Synthetic data only · Not an official government service</footer></div>;
}

function Shell({ schema, onHome, children }) { return <div className="app-shell"><aside className="sidebar"><Brand /><div className="nav-section"><span>Workspace</span><button className="nav-link" onClick={onHome}><Globe2 size={17} /> Explore forms</button><button className="nav-link active"><FileText size={17} /> My application</button></div><div className="side-foot"><span className="prototype-chip">Prototype</span><p>Built for demonstration. All document, submission and status data is synthetic.</p></div></aside><div className="app-content"><header className="topbar"><div><span className="crumb">Forms / {schema.service}</span><h2>{schema.title}</h2></div><div className="save-state"><span className="online-dot" /> Saved locally</div></header>{children}</div></div> }
function Brand() { return <div className="brand"><span className="brand-mark"><i /><b /></span><span><strong>formsetu</strong><small>guided public forms</small></span></div> }
function FormHeader({ schema, mode, setMode }) { return <div className="form-heading"><div><div className="eyebrow"><Sparkles size={14} /> {mode === 'guided' ? 'Guided journey' : 'Simple form view'}</div><h1>{mode === 'guided' ? <>Let’s make this<br /><em>feel easier.</em></> : <>All the details,<br /><em>one clear view.</em></>}</h1><p>{mode === 'guided' ? 'One question at a time, with a guide beside you when you need one.' : 'This is the same application state. Edit any answer, then review it together.'}</p></div><div className="view-toggle"><button className={mode === 'guided' ? 'active' : ''} onClick={() => setMode('guided')}>Guided</button><button className={mode === 'simple' ? 'active' : ''} onClick={() => setMode('simple')}>Simple</button></div></div> }
function Progress({ schema, current, completeCount }) { return <div className="progress-block"><div className="progress-label"><span>Question <b>{String(current + 1).padStart(2, '0')}</b> of {String(schema.fields.length).padStart(2, '0')}</span><span>{Math.round((completeCount / schema.fields.length) * 100)}% ready</span></div><div className="progress-track">{schema.fields.map((item, index) => <i key={item.id} className={index < current ? 'done' : index === current ? 'current' : ''} />)}</div></div> }

function fieldPrompt(field, value, source, document) {
  if (source && field.type === 'file' && document) return `I found ${document.name} in ${source}. Please confirm it is the document you want to submit.`;
  if (source && value) {
    const shown = field.type === 'date' ? displayDate(value) : field.id.toLowerCase().includes('income') ? `₹${Number(value).toLocaleString('en-IN')}` : value;
    return `I found ${shown} on your ${source}. Is that right?`;
  }
  return field.chatPrompt || field.help;
}

function GuidedField({ field, value, source, document, error, onChange, onChoose, onUpload, onPreview, showOptions, setShowOptions, onListen, onBack, onNext, atStart, atEnd }) {
  const isFile = field.type === 'file';
  const isChoice = field.type === 'category' || field.type === 'yesno';
  return <article className="question-card reveal"><div className="question-type">{isFile ? 'Document check' : isChoice ? 'Choose an option' : field.type === 'date' ? 'Date' : 'Your answer'}</div><div className="field-prompt"><Bot size={16} /><span>{fieldPrompt(field, value, source, document)}</span></div><h2>{field.label}</h2><p className="question-help">{field.help}</p><div className="answer-area"><FieldControl field={field} value={value} document={document} onChange={onChange} onChoose={onChoose} onUpload={onUpload} onPreview={onPreview} error={error} /><div className="field-utility">{!isFile && <button className="voice-button" onClick={onListen}><Mic size={15} /> Speak instead</button>}{source && <span className="source-pill"><Sparkles size={14} /> Matched from {source}</span>}{isChoice && <button className="options-button" onClick={() => setShowOptions(!showOptions)}><CircleHelp size={14} /> {showOptions ? 'Hide choices' : 'Show choices'}</button>}</div>{(value || document) && <span className="confirm-chip"><CheckCircle2 size={14} /> {source ? 'Prefilled — review before continuing' : 'Answer captured'}</span>}{showOptions && field.options && <div className="option-cloud">{field.options.map((option) => <button className={value === option ? 'selected' : ''} key={option} onClick={() => onChoose(option)}>{option}</button>)}</div>}{error && <p className="field-error">{error}</p>}</div><div className="question-actions"><button className="button button-quiet" disabled={atStart} onClick={onBack}><ArrowLeft size={16} /> Back</button><button className="button button-primary" onClick={onNext}>{atEnd ? 'Review application' : 'Continue'} <ArrowRight size={17} /></button></div></article>;
}

function dateForInput(value) { return /^\d{2}\/\d{2}\/\d{4}$/.test(String(value)) ? String(value).split('/').reverse().join('-') : value || ''; }
function displayDate(value) { return /^\d{4}-\d{2}-\d{2}$/.test(String(value)) ? String(value).split('-').reverse().join('/') : value; }

function FieldControl({ field, value, document, onChange, onChoose, onUpload, onPreview, error }) {
  if (field.type === 'file') return <div className={`document-card ${error ? 'has-error' : ''}`}><div className="document-icon"><FileText size={23} /></div><div><strong>{document?.name || 'No document added'}</strong><span>{document?.meta || 'Choose a PDF or image'}</span><span className="document-verified"><CheckCircle2 size={14} /> {document?.status || 'Ready to add'} · {document?.source || 'Device'}</span></div><div className="document-actions"><button className="text-button small" disabled={!document} onClick={() => onPreview(document)}>Preview</button><label className="upload-button"><Upload size={14} /> {document ? 'Replace' : 'Add file'}<input type="file" accept=".pdf,image/*" onChange={(event) => event.target.files?.[0] && onUpload(field.id, event.target.files[0])} /></label></div></div>;
  if (field.type === 'yesno') return <div className="choice-row">{field.options.map((option) => <button key={option} onClick={() => onChoose(option)} className={value === option ? 'selected' : ''}>{value === option && <Check size={16} />}{option}</button>)}</div>;
  if (field.type === 'category') return <div className="select-wrap"><select className={error ? 'input-error' : ''} value={value} onChange={(event) => onChange(field.id, event.target.value)}><option value="">{field.placeholder}</option>{field.options.map((option) => <option key={option}>{option}</option>)}</select></div>;
  if (field.type === 'date') return <label className={`input-wrap ${error ? 'input-error' : ''}`}><input type="date" value={dateForInput(value)} onChange={(event) => onChange(field.id, event.target.value)} /></label>;
  return <label className={`input-wrap ${error ? 'input-error' : ''}`}><input value={value} inputMode={field.inputMode || (field.type === 'number' ? 'numeric' : undefined)} placeholder={field.placeholder} onChange={(event) => onChange(field.id, event.target.value)} />{field.suffix && <span>{field.suffix}</span>}</label>;
}

function SimpleView({ schema, values, sources, documents, issues, onChange, onUpload, onPreview, onReview }) { return <article className="simple-card reveal"><div className="simple-card-head"><div><span className="eyebrow"><PanelRight size={14} /> Edit application</span><h2>Everything in one place</h2></div><p>Fields with a mint marker were pre-filled from a matched document.</p></div><div className="simple-grid">{schema.fields.map((field) => <div className="simple-field" key={field.id}><label>{field.shortLabel}{sources[field.id] && <small><Sparkles size={12} /> {sources[field.id]}</small>}</label><FieldControl field={field} value={values[field.id] || ''} document={documents[field.id]} onChange={onChange} onChoose={(next) => onChange(field.id, next)} onUpload={onUpload} onPreview={onPreview} error={issues[field.id]} />{issues[field.id] && <p className="field-error">{issues[field.id]}</p>}</div>)}</div><div className="simple-footer"><span><LockKeyhole size={15} /> You can still edit anything after review.</span><button className="button button-primary" onClick={onReview}>Review application <ArrowRight size={17} /></button></div></article> }

function ChatPanel({ chat, draft, setDraft, busy, language, setLanguage, tone, setTone, onAsk, onClose, field }) { return <aside className="chat-panel reveal delay-1"><header><div><span className="guide-avatar"><Bot size={18} /></span><span><strong>Setu Guide</strong><small><i /> Local AI assistant</small></span></div><button onClick={onClose} aria-label="Close chat"><X size={17} /></button></header><div className="guide-options"><button className={tone === 'simple' ? 'active' : ''} onClick={() => setTone('simple')}>Simple</button><button className={tone === 'detailed' ? 'active' : ''} onClick={() => setTone('detailed')}>Detailed</button><button className={language === 'Hindi' ? 'active' : ''} onClick={() => setLanguage(language === 'English' ? 'Hindi' : 'English')}>{language}</button></div><div className="chat-scroll">{chat.map((item, index) => <div className={`message ${item.role}`} key={`${item.role}-${index}`}>{item.role === 'assistant' && <Bot size={14} />}<p>{item.text}</p></div>)}{busy && <div className="message assistant typing"><Bot size={14} /><p><i /><i /><i /></p></div>}</div><div className="suggestion-row"><button onClick={() => onAsk('Explain this field')}>Explain this</button>{field?.options && <button onClick={() => onAsk('Show options')}>Show choices</button>}<button onClick={() => onAsk('Use DigiLocker documents')}>Use documents</button></div><form className="chat-input" onSubmit={(event) => { event.preventDefault(); onAsk(); }}><input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Ask Setu anything…" /><button disabled={!draft.trim() || busy} aria-label="Send message"><Send size={16} /></button></form><footer><LockKeyhole size={12} /> Mock guide · no personal data leaves this device</footer></aside> }

function Consent({ onContinue }) { const [checked, setChecked] = useState(false); return <main className="single-stage reveal"><div className="stage-intro"><div className="eyebrow"><ShieldCheck size={14} /> Before we begin</div><h1>Let your documents<br /><em>do the remembering.</em></h1><p>Connect once to reduce repetitive typing. You will see exactly what was found and can edit every answer before submission.</p></div><section className="consent-card"><div><span className="consent-icon"><LockKeyhole size={24} /></span><h2>You stay in control</h2><p>This prototype uses synthetic documents only. No real DigiLocker account, government credential or identity data is accessed.</p><label className="consent-check"><input type="checkbox" checked={checked} onChange={(event) => setChecked(event.target.checked)} /><span>I understand this is a concept prototype and consent to use the displayed synthetic document data.</span></label><button className="button button-primary" onClick={onContinue} disabled={!checked}>Continue to mock sign-in <ArrowRight size={17} /></button></div><div className="consent-docs"><span>Available in this demo</span>{['Identity record · name, date of birth', 'Income certificate · annual income', 'Community certificate · category'].map((line) => <p key={line}><FileText size={16} /> {line}<CheckCircle2 size={15} /></p>)}</div></section></main> }
function Auth({ onSubmit, busy }) { const [mode, setMode] = useState('otp'); const [mobile, setMobile] = useState('9876543210'); const [credential, setCredential] = useState('123456'); return <main className="single-stage reveal"><div className="stage-intro"><div className="eyebrow"><LockKeyhole size={14} /> Mock DigiLocker sign-in</div><h1>Connect once.<br /><em>Reuse what you have.</em></h1><p>This step mirrors the handoff a real document source would need. Use the demo OTP <b>123456</b>, or enter any password in password mode.</p></div><section className="auth-card"><div className="auth-top"><span className="auth-logo"><Landmark size={19} /></span><div><strong>DigiLocker</strong><small>Mock document source · synthetic account</small></div><span className="prototype-chip">Demo only</span></div><div className="auth-tabs"><button className={mode === 'otp' ? 'active' : ''} onClick={() => { setMode('otp'); setCredential('123456'); }}>One-time password</button><button className={mode === 'password' ? 'active' : ''} onClick={() => { setMode('password'); setCredential('demo-pass'); }}>Password</button></div><label className="auth-label">Mobile number<input className="auth-input" inputMode="numeric" value={mobile} onChange={(event) => setMobile(event.target.value)} /></label><label className="auth-label">{mode === 'otp' ? 'Six-digit OTP' : 'Password'}<input className="auth-input" type={mode === 'password' ? 'password' : 'text'} inputMode={mode === 'otp' ? 'numeric' : undefined} value={credential} onChange={(event) => setCredential(event.target.value)} /></label><button className="button button-primary auth-submit" onClick={() => onSubmit({ mobile, mode, credential })} disabled={busy}>{busy ? <><LoaderCircle className="spin" size={17} /> Connecting…</> : <>Continue securely <ArrowRight size={17} /></>}</button><p className="auth-note"><ShieldCheck size={14} /> No real login, OTP or identity data is sent anywhere.</p></section></main> }
function Review({ schema, values, sources, documents, payload, mismatch, onMismatch, onEdit, onSubmit }) { return <main className="single-stage review-stage reveal"><div className="stage-intro"><div className="eyebrow"><CheckCircle2 size={14} /> Final check</div><h1>Review before<br /><em>you send.</em></h1><p>This is exactly what the local submission API will validate.</p></div><section className="review-card"><header><div><h2>{schema.title}</h2><p>Check each answer and attached document.</p></div><button className="text-button" onClick={onEdit}>Edit answers <ArrowRight size={15} /></button></header><div className="review-grid">{schema.fields.map((field) => <div className="review-item" key={field.id}><small>{field.shortLabel}</small><strong>{field.type === 'file' ? documents[field.id]?.name : field.type === 'date' ? displayDate(values[field.id]) : values[field.id] || 'Not provided'}</strong>{sources[field.id] && <span><Sparkles size={12} /> {sources[field.id]}</span>}</div>)}</div><details className="payload-preview"><summary>View backend payload</summary><pre>{JSON.stringify(payload, null, 2)}</pre></details><label className="mismatch-toggle"><input type="checkbox" checked={mismatch} onChange={(event) => onMismatch(event.target.checked)} /><span><b>Demo a document mismatch</b><small>See the API’s clear failure state without losing your answers.</small></span></label><footer><span><LockKeyhole size={15} /> Simulated API request · no data is sent to a government service</span><button className="button button-primary" onClick={onSubmit}>Submit application <ArrowRight size={17} /></button></footer></section></main> }
function LoadingScreen({ label }) { return <main className="loading-screen"><div className="loader-ring" /><h2>{label}…</h2><p>We are preparing a safe, synthetic response for this prototype.</p></main> }
function Success({ schema, submission, onTrack, onHome }) { return <main className="outcome-stage reveal"><div className="outcome-mark success"><Check size={31} /></div><div className="eyebrow"><CheckCircle2 size={14} /> Mock API response · 200</div><h1>{schema.id === 'nsp' ? <>Your application<br /><em>is on its way.</em></> : <>Your request<br /><em>is on its way.</em></>}</h1><p>The local submission service accepted your application and generated a reference number.</p><div className="reference"><span>Reference number</span><b>{submission?.reference}</b></div><div className="outcome-actions"><button className="button button-primary" onClick={onTrack}>Track application <ArrowRight size={17} /></button><button className="button button-quiet" onClick={onHome}>Back to forms</button></div></main> }
function Failure({ issues, onReview }) { return <main className="outcome-stage reveal"><div className="outcome-mark failure"><X size={31} /></div><div className="eyebrow warning"><CircleHelp size={14} /> Mock API response · 422</div><h1>One document needs<br /><em>a closer look.</em></h1><p>Your answers have been kept safely. The submission API returned a clear, field-level reason to fix before retrying.</p><div className="failure-detail">{Object.entries(issues).map(([key, message]) => <p key={key}><FileText size={16} /><span><b>{key}</b>{message}</span></p>)}</div><button className="button button-primary" onClick={onReview}>Review and fix <ArrowRight size={17} /></button></main> }
function Status({ status, onHome }) { return <main className="single-stage review-stage reveal"><div className="stage-intro"><div className="eyebrow"><Zap size={14} /> Application tracker</div><h1>Know where things<br /><em>stand.</em></h1><p>Your reference <b>{status?.reference}</b> is stored in the local prototype API.</p></div><section className="status-card">{status?.timeline.map((item) => <div className={`timeline-item ${item.state}`} key={item.title}><i>{item.state === 'complete' ? <Check size={13} /> : null}</i><div><h3>{item.title}</h3><p>{item.detail}</p></div></div>)}<button className="button button-quiet" onClick={onHome}><ArrowLeft size={16} /> Back to forms</button></section></main> }
function DocumentModal({ document, onClose }) { return <div className="modal-backdrop" onMouseDown={onClose}><section className="document-modal reveal" onMouseDown={(event) => event.stopPropagation()}><header><div><span className="eyebrow"><FileText size={14} /> Synthetic document preview</span><h2>{document?.name}</h2><p>{document?.meta} · {document?.source}</p></div><button onClick={onClose} aria-label="Close preview"><X size={18} /></button></header><div className="paper"><div className="paper-head"><span>FORMSETU DOCUMENT VIEWER</span><b>DEMO COPY</b></div><h3>{document?.name}</h3><p>This preview is intentionally synthetic. It is shown so the applicant can confirm the right document before submission.</p><i /><i /><i className="short" /><i /><i className="short" /><footer><span>Document ID · DEMO-2026</span><span>{document?.status || 'Ready'}</span></footer></div></section></div> }
function BusyOverlay() { return <div className="busy-overlay"><LoaderCircle className="spin" size={20} /> Checking the form schema…</div> }

export default App;
