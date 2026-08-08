# YUCI Partnership & Sponsorship Forms — Portable Implementation Guide

A complete, self-contained reference to re-implement the **Partnership** and
**Sponsorship** multi-step forms on another website.

Stack used here: **React 18 + Vite + Tailwind CSS + lucide-react**, with a
**Google Apps Script Web App** backend (Google Sheet + Drive + email). No
custom server, no database.

---

## 1. How it works (both forms)

- 4-step wizard (progress bar + step navigation) built with plain React `useState`.
- Per-step validation gates "Next"; full re-validation on submit.
- Draft autosave to `localStorage` (safe wrapper) — restores on reload, cleared on success.
- Drag-and-drop + click file upload (proposal document).
- Success screen replaces the form; error banner on failure.
- Submits via `submitForm(formType, fields, { proposal })` → Apps Script endpoint.

## 2. Files you need to copy

| File | Purpose |
|---|---|
| `src/pages/Partnership/index.jsx` | Partnership form (4 steps) |
| `src/pages/Sponsorship/index.jsx` | Sponsorship form (4 steps) |
| `src/lib/submitForm.js` | Shared submit helper (base64 file + POST) |
| `src/lib/draftStore.js` | Safe localStorage wrapper for autosave |
| `google-apps-script/Code.gs` | Backend Web App (paste into Apps Script) |
| `.env` | `VITE_FORMS_ENDPOINT`, `VITE_FORMS_SECRET` |

Dependencies: `react`, `react-router-dom` (for `Link`), `react-helmet-async`
(page title — optional), `lucide-react` (icons), Tailwind CSS.

## 3. Environment variables (`.env`)

```
VITE_FORMS_ENDPOINT="https://script.google.com/macros/s/XXXX/exec"
VITE_FORMS_SECRET="a-long-random-string"
```
These are inlined at BUILD time (Vite). The secret ships in the client bundle —
treat it as a light spam filter, not real auth. Real protection lives in Apps Script.

## 4. Field reference

### Partnership (`formType: 'partnership'`)
Steps: Institution Info · Representative Info · Partnership Scope · Review & Submit

| Step | name | type | validation |
|---|---|---|---|
| 1 | institutionType | radio: `University / College` \| `School / Other` | default University/College |
| 1 | institutionName | text | required, >=3 |
| 1 | address | text | required, >=5 |
| 1 | city | text | required, >=2 |
| 1 | state | select (STATES) | required |
| 1 | website | text | optional |
| 2 | repName | text | required, >=2 |
| 2 | repDesignation | text | required, >=2 |
| 2 | repEmail | email | required, valid |
| 2 | repPhone | tel | required, >=10 digits |
| 3 | area | select (PARTNERSHIP_AREAS) | required |
| 3 | motivation | textarea | required, >=10 |
| 3 | proposal | file (.pdf/.doc/.docx) | required |

Adaptive labels: when `School / Other`, "Institution Name" -> "School / Organisation Name", etc.

### Sponsorship (`formType: 'sponsorship'`)
Steps: Sponsor Profile · Contact Details · Sponsorship Details · Review & Submit

| Step | name | type | validation |
|---|---|---|---|
| 1 | profileType | radio (default `Corporate / Brand`) | — |
| 1 | sponsorName | text | required, >=2 |
| 1 | industry | text | required, >=2 |
| 1 | city | text | required, >=2 |
| 1 | state | select (STATES) | required |
| 1 | website | text | optional |
| 2 | contactName | text | required, >=2 |
| 2 | contactDesignation | text | required, >=2 |
| 2 | contactEmail | email | required, valid |
| 2 | contactPhone | tel | required, >=10 digits |
| 3 | type | select (SPONSORSHIP_TYPES) | required |
| 3 | details | textarea | required, >=10 |
| 3 | proposal | file (.pdf/.doc/.docx) | optional |

## 5. Backend setup (one-time)
1. Create a Google Sheet "Form Submissions" with tabs: `Applications`, `Contact`, `Partnership`, `Sponsorship`.
2. Create a Drive folder for uploads; note its ID.
3. Extensions -> Apps Script -> paste `Code.gs`; set `SHEET_ID`, `UPLOAD_FOLDER_ID`, `NOTIFY_EMAIL`, `SHARED_SECRET`.
4. Deploy -> New deployment -> Web app -> Execute as: Me · Who has access: Anyone. Copy the `/exec` URL into `.env`.
5. `SHARED_SECRET` in Code.gs MUST equal `VITE_FORMS_SECRET`.

---

# 6. Full source

## `src/lib/submitForm.js`
```javascript
// Shared form-submission helper for all YUCI forms.
//
// Every form (Contact, Join Now, Partnership, Sponsorship) posts here. The
// endpoint is a Google Apps Script Web App that appends a row to a Google
// Sheet, saves any uploaded file to Google Drive, and emails the management
// inbox. See google-apps-script/README.md for the one-time Google setup.

const ENDPOINT = import.meta.env.VITE_FORMS_ENDPOINT
const SECRET = import.meta.env.VITE_FORMS_SECRET

// The one message a visitor ever sees for anything unexpected — friendly,
// and free of any technical/config detail.
const GENERIC_ERROR =
  "Sorry, we couldn't submit your form right now. Please try again in a moment."

// Technical details are logged ONLY during local development, so the browser
// console stays clean for end users in production.
function devLog(...args) {
  if (import.meta.env.DEV) console.warn('[submitForm]', ...args)
}

// Read a File as base64 so it can travel inside the JSON body. The Apps Script
// side decodes it back into a real file in Drive. Returns null for no file.
function fileToPayload(file) {
  return new Promise((resolve, reject) => {
    if (!file) return resolve(null)
    const reader = new FileReader()
    reader.onload = () => {
      // reader.result looks like "data:application/pdf;base64,JVBERi0..."
      const dataBase64 = String(reader.result).split(',')[1] || ''
      resolve({ name: file.name, mimeType: file.type || 'application/octet-stream', dataBase64 })
    }
    reader.onerror = () => reject(new Error('We couldn’t read the selected file. Please try a different file.'))
    reader.readAsDataURL(file)
  })
}

/**
 * Submit a form to the YUCI collection endpoint.
 *
 * Always rejects with a user-friendly Error message (safe to show directly);
 * technical/config details are only logged in development, never surfaced to
 * the visitor and never printed to the production console.
 *
 * @param {'application'|'contact'|'partnership'|'sponsorship'} formType
 * @param {Object} fields  Plain object of text field values.
 * @param {Object} [files] Optional map of File objects, e.g. { resume }, { proposal }.
 * @returns {Promise<Object>} Resolves to the endpoint response ({ ok: true, ... }).
 * @throws {Error} With a message that is safe to display to the user.
 */
export async function submitForm(formType, fields, files = {}) {
  // Missing config is a developer/setup problem — never expose it to visitors.
  if (!ENDPOINT) {
    devLog('VITE_FORMS_ENDPOINT is not set. Add it to your .env file to enable form submissions.')
    throw new Error(GENERIC_ERROR)
  }

  // Encode any attached files (fileToPayload throws a friendly message on failure).
  const _files = {}
  for (const [key, file] of Object.entries(files)) {
    const payload = await fileToPayload(file)
    if (payload) _files[key] = payload
  }

  let res
  try {
    res = await fetch(ENDPOINT, {
      method: 'POST',
      // text/plain keeps this a CORS "simple request" so the browser skips the
      // OPTIONS preflight, which Apps Script Web Apps do not answer.
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ formType, secret: SECRET, ...fields, _files }),
    })
  } catch (err) {
    devLog('Network request failed:', err)
    throw new Error('Network error — please check your connection and try again.')
  }

  let data = {}
  try {
    data = await res.json()
  } catch (err) {
    devLog('Response was not valid JSON:', err)
  }

  if (!res.ok || !data.ok) {
    devLog('Submission rejected:', { status: res.status, data })
    throw new Error(GENERIC_ERROR)
  }
  return data
}
```

## `src/lib/draftStore.js`
```javascript
// Best-effort localStorage wrapper for form autosave drafts.
//
// Access to localStorage can throw (Safari private mode, storage disabled,
// or quota exceeded). Draft autosave is a non-critical convenience, so these
// helpers never throw — on any failure they quietly no-op, keeping the form
// fully usable and the console clean.

export function getDraft(key) {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

export function setDraft(key, value) {
  try {
    localStorage.setItem(key, value)
  } catch {
    /* storage unavailable or full — skip autosave */
  }
}

export function clearDraft(key) {
  try {
    localStorage.removeItem(key)
  } catch {
    /* ignore */
  }
}
```

## `src/pages/Partnership/index.jsx`
```jsx
import { Helmet } from 'react-helmet-async'
import { useState, useEffect } from 'react'
import {
  CheckCircle, ArrowRight, ArrowLeft, Building, User,
  Award, ClipboardCheck, Star, Shield, Globe, Users,
  UploadCloud, FileText, AlertCircle, FileCheck
} from 'lucide-react'
import { submitForm } from '../../lib/submitForm'
import { getDraft, setDraft, clearDraft } from '../../lib/draftStore'

/* ─── Data ─────────────────────────────────────────────────────────────── */
const STEPS = [
  { id: 1, label: 'Institution Info',  icon: Building },
  { id: 2, label: 'Representative Info',icon: User },
  { id: 3, label: 'Partnership Scope',  icon: Award },
  { id: 4, label: 'Review & Submit',   icon: ClipboardCheck },
]

const STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa',
  'Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala',
  'Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland',
  'Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura',
  'Uttar Pradesh','Uttarakhand','West Bengal',
]

const PARTNERSHIP_AREAS = [
  'Youth Empowerment Chapters', 'Joint Research & Policy Studies',
  'Skill Development Programs', 'National/International Events Collaboration',
  'Social Welfare & Community Service', 'Other'
]

const BENEFITS = [
  { icon: Award,     text: 'Official MOU with an ISO certified National NGO' },
  { icon: Globe,     text: 'Access to global opportunities & international networks' },
  { icon: Users,     text: 'Engage students in national development campaigns' },
  { icon: Star,      text: 'Opportunities for students to host national-level summits' },
  { icon: Shield,    text: 'Strengthen institutional NIRF and NAAC accreditation points' },
]

/* ─── Validation ────────────────────────────────────────────────────────── */
function validateField(name, value) {
  const v = (typeof value === 'string') ? value.trim() : value

  switch (name) {
    case 'institutionName':
      return v && String(v).length >= 3 ? '' : 'Institution name is required (Min 3 chars)'
    case 'address':
      return v && String(v).length >= 5 ? '' : 'Full address is required'
    case 'city':
      return v && String(v).length >= 2 ? '' : 'City is required'
    case 'state':
      return v ? '' : 'State selection is required'
    case 'repName':
      return v && String(v).length >= 2 ? '' : 'Representative name is required'
    case 'repDesignation':
      return v && String(v).length >= 2 ? '' : 'Designation is required'
    case 'repEmail':
      return v && /^\S+@\S+\.\S+$/.test(v) ? '' : 'Valid email required'
    case 'repPhone':
      return v && String(v).replace(/\D/g,'').length >= 10 ? '' : 'Valid 10-digit number required'
    case 'area':
      return v ? '' : 'Partnership area selection is required'
    case 'proposal':
      return v ? '' : 'MOU Proposal or Profile document upload required'
    case 'motivation':
      return v && String(v).length >= 10 ? '' : 'Please write at least 10 characters describing objectives'
    default:
      return ''
  }
}

/* ─── Shared Components ─────────────────────────────────────────────────── */
function Field({ label, name, v, onChange, touched, children, noStatusIcon }) {
  const value = v[name]
  const isTouched = touched[name]
  const error = isTouched ? validateField(name, value) : null
  const isValid = isTouched && validateField(name, value) === ''

  return (
    <div className="flex flex-col gap-1.5 relative">
      <label className="text-xs font-bold tracking-wider uppercase text-[#0e5ea8]">{label}</label>
      <div className={`relative transition-transform duration-300 ${error ? 'shake' : ''}`}>
        {children}
        {isValid && name !== 'proposal' && !noStatusIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500 check-anim pointer-events-none">
            <CheckCircle size={18} />
          </div>
        )}
        {error && name !== 'proposal' && !noStatusIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500 pointer-events-none">
            <AlertCircle size={18} />
          </div>
        )}
      </div>
      {error && <span className="text-xs text-red-500 font-medium mt-0.5">{error}</span>}
    </div>
  )
}

function Input({ name, type='text', placeholder, v, onChange, touched }) {
  const isTouched = touched[name]
  const error = isTouched && validateField(name, v[name])
  const isValid = isTouched && !error

  return (
    <input
      name={name} type={type} placeholder={placeholder}
      value={v[name] || ''} onChange={onChange}
      className={`w-full px-4 py-3.5 rounded-xl border-2 text-sm font-medium text-slate-800 placeholder-slate-400 bg-white transition-all focus:outline-none focus:ring-4 focus:ring-sky-500/10
        ${error ? 'border-red-300 focus:border-red-500 bg-red-50/30' : isValid ? 'border-green-300 focus:border-green-500' : 'border-slate-200 focus:border-sky-500 hover:border-slate-300'}`}
    />
  )
}

function Select({ name, placeholder, options, v, onChange, touched }) {
  const isTouched = touched[name]
  const error = isTouched && validateField(name, v[name])
  const isValid = isTouched && !error

  return (
    <select
      name={name} value={v[name] || ''} onChange={onChange}
      className={`w-full px-4 py-3.5 rounded-xl border-2 text-sm font-medium text-slate-800 bg-white transition-all focus:outline-none focus:ring-4 focus:ring-sky-500/10 appearance-none cursor-pointer
        ${error ? 'border-red-300 focus:border-red-500 bg-red-50/30' : isValid ? 'border-green-300 focus:border-green-500' : 'border-slate-200 focus:border-sky-500 hover:border-slate-300'}`}
    >
      <option value="">{placeholder}</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  )
}

function Textarea({ name, rows=3, placeholder, v, onChange, touched }) {
  const isTouched = touched[name]
  const error = isTouched && validateField(name, v[name])
  const isValid = isTouched && !error

  return (
    <textarea
      name={name} rows={rows} placeholder={placeholder}
      value={v[name] || ''} onChange={onChange}
      className={`w-full px-4 py-3.5 rounded-xl border-2 text-sm font-medium text-slate-800 placeholder-slate-400 bg-white transition-all focus:outline-none focus:ring-4 focus:ring-sky-500/10 resize-none
        ${error ? 'border-red-300 focus:border-red-500 bg-red-50/30' : isValid ? 'border-green-300 focus:border-green-500' : 'border-slate-200 focus:border-sky-500 hover:border-slate-300'}`}
    />
  )
}

function FileUpload({ file, onFileSelect, error }) {
  const [drag, setDrag] = useState(false)
  
  const handleDrop = (e) => {
    e.preventDefault()
    setDrag(false)
    const f = e.dataTransfer.files[0]
    if (f) onFileSelect(f)
  }

  return (
    <div 
      onDragOver={e => { e.preventDefault(); setDrag(true) }}
      onDragLeave={() => setDrag(false)}
      onDrop={handleDrop}
      onClick={() => document.getElementById('proposal-upload').click()}
      className={`relative p-8 border-2 border-dashed rounded-2xl transition-all text-center cursor-pointer overflow-hidden
        ${drag ? 'border-sky-500 bg-sky-50 scale-[1.02]' : error ? 'border-red-400 bg-red-50/50' : 'border-slate-300 hover:border-sky-400 bg-slate-50/50'}`}
    >
      <input type="file" id="proposal-upload" className="hidden" accept=".pdf,.doc,.docx" onChange={e => e.target.files[0] && onFileSelect(e.target.files[0])} />
      
      {file ? (
        <div className="flex flex-col items-center gap-3 check-anim">
          <div className="w-14 h-14 rounded-full bg-sky-100 flex items-center justify-center">
            <FileCheck className="text-sky-600" size={28} />
          </div>
          <div>
            <p className="font-bold text-slate-800 text-sm">{file.name}</p>
            <p className="text-xs text-slate-500 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
          </div>
          <button 
            onClick={e => { e.stopPropagation(); onFileSelect(null) }} 
            className="text-xs font-bold text-red-500 hover:text-red-700 uppercase tracking-wide px-3 py-1 bg-red-50 rounded-full"
          >
            Remove File
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-white shadow-sm border border-slate-200 flex items-center justify-center transition-transform group-hover:scale-110">
            <UploadCloud className="text-slate-400" size={28} />
          </div>
          <div>
            <p className="font-bold text-slate-800 text-sm">Click to upload or drag & drop</p>
            <p className="text-xs text-slate-500 mt-1 font-medium">Proposal/Profile document in PDF, DOC, DOCX (Max 5MB)</p>
          </div>
        </div>
      )}
    </div>
  )
}

/* ─── Main Page ─────────────────────────────────────────────────────────── */
export default function Partnership() {
  const [mounted, setMounted] = useState(false)
  const [step, setStep] = useState(1)
  const [values, setValues] = useState({ institutionType: 'University / College' })
  const [touched, setTouched] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState('')

  // Autosave load
  useEffect(() => {
    const saved = getDraft('yuci_partnership_autosave')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (parsed.values) {
          const { proposal, ...rest } = parsed.values
          setValues(rest)
          setStep(parsed.step || 1)
        }
      } catch { /* corrupt saved draft — start fresh */ }
    }
    setMounted(true)
  }, [])

  // Autosave save
  useEffect(() => {
    if (mounted && !submitted) {
      const { proposal, ...rest } = values
      setDraft('yuci_partnership_autosave', JSON.stringify({ values: rest, step }))
    }
  }, [values, step, mounted, submitted])

  const onChange = e => {
    const { name, value } = e.target
    setValues(v => ({ ...v, [name]: value }))
    if (!touched[name]) setTouched(t => ({ ...t, [name]: true }))
  }

  const validateCurrentStep = () => {
    const fields = {
      1: ['institutionName', 'institutionType', 'address', 'city', 'state'],
      2: ['repName', 'repDesignation', 'repEmail', 'repPhone'],
      3: ['area', 'motivation', 'proposal']
    }[step]
    
    let valid = true
    const newTouched = { ...touched }
    fields.forEach(f => {
      newTouched[f] = true
      if (validateField(f, values[f]) !== '') valid = false
    })
    setTouched(newTouched)
    return valid
  }

  const next = () => {
    if (!validateCurrentStep()) return
    setStep(s => s + 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const back = () => { 
    setStep(s => s - 1)
    window.scrollTo({ top: 0, behavior: 'smooth' }) 
  }

  const submit = async () => {
    setSubmitting(true)
    setSubmitError('')
    try {
      const { proposal, ...fields } = values
      await submitForm('partnership', fields, { proposal })
      setSubmitted(true)
      clearDraft('yuci_partnership_autosave')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      setSubmitError(err.message || 'Could not submit your application. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  /* ─── Success Screen ────────────────────────────────────────────────── */
  if (submitted) {
    return (
      <>
        <Helmet><title>MOU Partnership Application Submitted — YUCI</title></Helmet>
        <section className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-slate-50">
          
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(40)].map((_, i) => (
              <div key={i} className="confetti" style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                backgroundColor: ['#0e5ea8', '#10b981', '#f59e0b', '#ef4444'][Math.floor(Math.random()*4)]
              }}/>
            ))}
          </div>

          <div className="relative text-center max-w-lg bg-white rounded-[2.5rem] shadow-2xl shadow-sky-900/5 p-12 border border-slate-100 z-10 scale-up">
            <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8 relative">
              <div className="absolute inset-0 border-2 border-green-200 rounded-full animate-ping opacity-20" />
              <CheckCircle size={48} className="text-green-500 draw-check" />
            </div>
            
            <h2 className="text-4xl font-bold text-slate-900 mb-4 tracking-tight">Application Received</h2>
            <p className="text-slate-600 text-lg mb-8 leading-relaxed">
              Thank you! The partnership proposal from <span className="font-bold text-slate-900">{values.institutionName}</span> has been successfully received.
            </p>

            <div className="bg-slate-50 rounded-2xl p-6 text-left border border-slate-100">
              <div className="text-xs font-bold tracking-widest uppercase text-[#0e5ea8] mb-4">What happens next?</div>
              {[
                { text: 'Proposal and verification checks completed by Secretariat' },
                { text: 'Official partnership draft & MOU emailed to ' + values.repEmail },
                { text: 'Coordination call scheduled with ' + values.repName },
                { text: 'Collaborative youth activities launched!', Icon: Star },
              ].map(({ text, Icon }, i) => (
                <div key={i} className="flex items-start gap-3 mb-3 last:mb-0 slide-in-item" style={{ animationDelay: `${i * 0.15}s` }}>
                  <div className="w-6 h-6 rounded-full bg-sky-100 text-sky-600 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">{i+1}</div>
                  <span className="text-slate-600 text-sm font-medium leading-relaxed inline-flex items-center gap-1.5">{text}{Icon && <Icon size={15} className="text-sky-600 shrink-0" />}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
        <style>{globalCSS}</style>
      </>
    )
  }

  if (!mounted) return null
  const progress = ((step - 1) / (STEPS.length - 1)) * 100

  /* ─── Main Form UI ─────────────────────────────────────────────────── */
  return (
    <>
      <Helmet><title>Apply for MOU Partnership — YUCI</title></Helmet>
      
      <section className="relative overflow-hidden text-white" style={{ background: 'linear-gradient(135deg, #050a15 0%, #0d1f38 40%, #162d54 100%)' }}>
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(53,182,214,0.08) 0%, transparent 70%)', transform: 'translate(20%, -30%)' }} />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(200,168,75,0.06) 0%, transparent 70%)', transform: 'translate(-30%, 40%)' }} />
        <div className="absolute left-0 top-0 bottom-0 w-[3px]" style={{ background: 'linear-gradient(180deg, transparent, #35b6d6, transparent)' }} />

        <div className="max-w-7xl mx-auto px-6 relative z-10 pt-28 pb-20 lg:pt-32 lg:pb-24">
          <nav className="flex items-center gap-2 mb-7">
            <a href="/" className="font-accent text-[11px] tracking-[0.12em] uppercase text-white/40 hover:text-white transition-colors">Home</a>
            <span className="text-white/20 text-xs">›</span>
            <span className="font-accent text-[11px] tracking-[0.12em] uppercase" style={{ color: '#35b6d6' }}>Apply for Partnership</span>
          </nav>

          <div className="inline-flex items-center gap-2.5 mb-5">
            <span className="h-[2px] w-9 rounded-full" style={{ background: '#c8a84b' }} />
            <span className="font-accent text-[11px] font-semibold tracking-[0.2em] uppercase" style={{ color: '#c8a84b' }}>MOU Partnership</span>
          </div>

          <h1 className="font-display font-bold leading-[1.1] mb-4 max-w-2xl text-white" style={{ fontSize: 'clamp(2.4rem, 5vw, 3.8rem)' }}>
            Partner with{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-br from-[#35b6d6] to-[#7ce3ff]">YUCI</span>
          </h1>

          <p className="font-body text-[17px] leading-relaxed max-w-xl" style={{ color: 'rgba(214,234,248,0.65)' }}>
            Join forces with one of India's largest youth organizations to establish student chapters, host social welfare activities, and drive youth advocacy.
          </p>
        </div>

        <div className="absolute bottom-0 inset-x-0 pointer-events-none">
          <svg viewBox="0 0 1440 60" preserveAspectRatio="none" className="w-full h-[60px] block" fill="none">
            <path d="M0 60 L0 30 Q360 0 720 24 Q1080 48 1440 15 L1440 60 Z" fill="#f8fafc" />
          </svg>
        </div>
      </section>

      <section className="pb-20 bg-slate-50 min-h-screen relative">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-12 gap-10">

            {/* ── SIDEBAR ─────────────────────────────────────────────── */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Progress Timeline */}
              <div className="bg-white rounded-3xl p-8 shadow-xl shadow-sky-900/5 border border-slate-100">
                <div className="text-xs font-bold tracking-widest uppercase text-[#0e5ea8] mb-8">Partnership Progress</div>
                <div className="relative">
                  <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-slate-100" />
                  
                  <div className="space-y-6 relative">
                    {STEPS.map(s => {
                      const done = step > s.id
                      const cur  = step === s.id
                      const Icon = s.icon
                      return (
                        <div key={s.id} className="flex items-center gap-4 relative">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 z-10 transition-all duration-300
                            ${done ? 'bg-green-500 text-white shadow-lg shadow-green-500/20 scale-105' : cur ? 'bg-[#0e5ea8] text-white shadow-lg shadow-[#0e5ea8]/30 scale-110' : 'bg-slate-100 text-slate-400 border-2 border-white'}`}
                          >
                            {done ? <CheckCircle size={18}/> : <Icon size={18}/>}
                          </div>
                          <div>
                            <div className={`text-sm font-bold tracking-wide transition-colors ${cur ? 'text-[#0e5ea8]' : done ? 'text-green-600' : 'text-slate-400'}`}>
                              {s.label}
                            </div>
                            <div className="text-xs font-medium text-slate-400 mt-0.5">
                              {cur ? 'In Progress' : done ? 'Completed' : 'Pending'}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Benefits Card */}
              <div className="bg-[#0a1628] rounded-3xl p-8 relative overflow-hidden shadow-2xl shadow-[#0a1628]/30 text-white" style={{ background: '#0a1628' }}>
                <div className="absolute top-0 right-0 w-48 h-48 bg-sky-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="relative z-10">
                  <div className="text-xs font-bold tracking-widest uppercase text-sky-400 mb-2">Benefits</div>
                  <div className="text-2xl font-bold mb-6">Partner Benefits</div>
                  <ul className="space-y-4">
                    {BENEFITS.map(({ icon: Icon, text }, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 border border-white/5">
                          <Icon size={14} className="text-sky-300"/>
                        </div>
                        <span className="text-sm font-medium text-sky-50 leading-relaxed pt-1">{text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

            </div>

            {/* ── FORM AREA ────────────────────────────────────────────── */}
            <div className="lg:col-span-8">
              
              <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl shadow-sky-900/5 border border-slate-100">
                
                {/* Header */}
                <div className="mb-10 pb-8 border-b border-slate-100">
                  <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-sky-50 text-sky-600 text-xs font-bold tracking-wider uppercase mb-4">
                    Step {step} of {STEPS.length}
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-[#0e5ea8] tracking-tight mb-3">
                    {STEPS[step-1].label}
                  </h2>
                  <p className="text-slate-500 font-medium text-lg">
                    {step===1 && (values.institutionType === 'School / Other'
                      ? 'Enter your school / organisation details.'
                      : 'Enter your college / university details.')}
                    {step===2 && 'Provide details of the authorized contact representative.'}
                    {step===3 && 'Choose your scope of partnership and share/upload your MOU proposal.'}
                    {step===4 && 'Review information before finalizing.'}
                  </p>
                </div>

                {/* Content */}
                <div className="space-y-8 animate-fade-in">

                  {/* ── STEP 1 ── */}
                  {step === 1 && (
                    <>
                      <Field label="Institution Type *" name="institutionType" v={values} onChange={onChange} touched={touched} noStatusIcon>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {['University / College', 'School / Other'].map(type => (
                            <label key={type} className="cursor-pointer">
                              <input type="radio" name="institutionType" value={type} checked={values.institutionType === type} onChange={onChange} className="sr-only"/>
                              <div className={`text-center py-4 px-2 rounded-2xl border-2 transition-all duration-300 ${values.institutionType === type ? 'bg-[#0a1628] border-[#0a1628] text-white shadow-xl shadow-[#0a1628]/20 scale-105' : 'border-slate-200 text-slate-600 hover:border-sky-300 hover:bg-slate-50'}`} style={values.institutionType === type ? { background: '#0a1628', borderColor: '#0a1628' } : {}}>
                                <div className="font-bold text-sm tracking-wide">{type}</div>
                              </div>
                            </label>
                          ))}
                        </div>
                      </Field>
                      
                      <Field label={values.institutionType === 'School / Other' ? 'School / Organisation Name *' : 'Institution Name *'} name="institutionName" v={values} onChange={onChange} touched={touched}>
                        <Input name="institutionName" placeholder={values.institutionType === 'School / Other' ? 'e.g. DAV Public School' : 'e.g. Anna University'} v={values} onChange={onChange} touched={touched}/>
                      </Field>

                      <Field label={values.institutionType === 'School / Other' ? 'Website (Optional)' : 'Institution Website (Optional)'} name="website" v={values} onChange={onChange} touched={touched}>
                        <Input name="website" placeholder="https://www.example.edu.in" v={values} onChange={onChange} touched={touched}/>
                      </Field>

                      <Field label="Street Address *" name="address" v={values} onChange={onChange} touched={touched}>
                        <Input name="address" placeholder={values.institutionType === 'School / Other' ? 'Address of the School / Organisation' : 'Address of the Main Campus'} v={values} onChange={onChange} touched={touched}/>
                      </Field>

                      <div className="grid md:grid-cols-2 gap-6">
                        <Field label="City *" name="city" v={values} onChange={onChange} touched={touched}>
                          <Input name="city" placeholder="e.g. Chennai" v={values} onChange={onChange} touched={touched}/>
                        </Field>
                        <Field label="State *" name="state" v={values} onChange={onChange} touched={touched}>
                          <Select name="state" placeholder="Select State" options={STATES} v={values} onChange={onChange} touched={touched}/>
                        </Field>
                      </div>
                    </>
                  )}

                  {/* ── STEP 2 ── */}
                  {step === 2 && (
                    <>
                      <div className="grid md:grid-cols-2 gap-6">
                        <Field label="Representative Name *" name="repName" v={values} onChange={onChange} touched={touched}>
                          <Input name="repName" placeholder="Dr. John Doe" v={values} onChange={onChange} touched={touched}/>
                        </Field>
                        <Field label="Representative Designation *" name="repDesignation" v={values} onChange={onChange} touched={touched}>
                          <Input name="repDesignation" placeholder="e.g. Registrar, Dean, Student Advisor" v={values} onChange={onChange} touched={touched}/>
                        </Field>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <Field label="Representative Email *" name="repEmail" v={values} onChange={onChange} touched={touched}>
                          <Input name="repEmail" type="email" placeholder="dean@university.edu.in" v={values} onChange={onChange} touched={touched}/>
                        </Field>
                        <Field label="Representative Phone Number *" name="repPhone" v={values} onChange={onChange} touched={touched}>
                          <Input name="repPhone" type="tel" placeholder="+91 98765 43210" v={values} onChange={onChange} touched={touched}/>
                        </Field>
                      </div>
                    </>
                  )}

                  {/* ── STEP 3 ── */}
                  {step === 3 && (
                    <>
                      <Field label="Preferred Area of Partnership *" name="area" v={values} onChange={onChange} touched={touched}>
                        <Select name="area" placeholder="Select an Area" options={PARTNERSHIP_AREAS} v={values} onChange={onChange} touched={touched}/>
                      </Field>

                      <Field label="Why does your Institution want to partner with YUCI? *" name="motivation" v={values} onChange={onChange} touched={touched}>
                        <Textarea name="motivation" rows={4} placeholder="Describe the objectives and student benefits of establishing this partnership..." v={values} onChange={onChange} touched={touched}/>
                      </Field>

                      <Field label="Upload MOU Draft / Institution Profile *" name="proposal" v={values} onChange={onChange} touched={touched}>
                        <FileUpload 
                          file={values.proposal} 
                          onFileSelect={f => { setValues(v => ({ ...v, proposal: f })); setTouched(t => ({...t, proposal: true})) }}
                          error={touched.proposal && validateField('proposal', values.proposal)}
                        />
                      </Field>
                    </>
                  )}

                  {/* ── STEP 4 ── */}
                  {step === 4 && (
                    <div className="space-y-6">
                      <div className="bg-sky-50 border border-sky-100 rounded-2xl p-5 flex items-start gap-4">
                        <div className="bg-[#0e5ea8] text-white p-2 rounded-xl mt-0.5"><ClipboardCheck size={20}/></div>
                        <p className="text-sky-900 font-medium text-sm leading-relaxed">
                          Please review the partnership proposal dossier. Once submitted, our Executive Committee will review your profile and reach out within 48 hours to sign the official MOU.
                        </p>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        {[
                          { title: 'Institution Info', fields: { 'Name': values.institutionName, 'Type': values.institutionType, 'Website': values.website, 'Campus Address': `${values.address}, ${values.city}, ${values.state}` } },
                          { title: 'Representative Info', fields: { 'Name': values.repName, 'Designation': values.repDesignation, 'Email': values.repEmail, 'Phone': values.repPhone } },
                          { title: 'Partnership Details', fields: { 'Area': values.area, 'Motivation': values.motivation, 'Proposal File': values.proposal?.name } }
                        ].map(section => (
                          <div key={section.title} className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
                            <h4 className="text-xs font-bold uppercase tracking-widest text-[#0e5ea8] mb-4">{section.title}</h4>
                            <dl className="space-y-3">
                              {Object.entries(section.fields).map(([k, v]) => v ? (
                                <div key={k} className="flex flex-col">
                                  <dt className="text-xs font-semibold text-slate-500 uppercase">{k}</dt>
                                  <dd className="text-sm font-bold text-slate-800">{v}</dd>
                                </div>
                              ) : null)}
                            </dl>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>

                {/* ── Navigation Actions ── */}
                <div className="mt-10 pt-8 border-t border-slate-100 flex items-center justify-between">
                  {step > 1 ? (
                    <button onClick={back} className="flex items-center gap-2 px-6 py-3.5 rounded-full font-bold text-sm text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors">
                      <ArrowLeft size={18} /> Back
                    </button>
                  ) : <div/>}

                  {step < 4 ? (
                    <button onClick={next} className="flex items-center gap-2 px-8 py-3.5 rounded-full font-bold text-sm text-white bg-gradient-to-br from-[#1a7fc4] to-[#083b6f] hover:from-[#2a8fd4] hover:to-[#0e5ea8] shadow-lg shadow-[#0e5ea8]/30 hover:shadow-[#0e5ea8]/50 hover:-translate-y-0.5 transition-all">
                      Continue <ArrowRight size={18} />
                    </button>
                  ) : (
                    <button onClick={submit} disabled={submitting} className="flex items-center gap-2 px-8 py-3.5 rounded-full font-bold text-sm text-white bg-gradient-to-br from-[#1a7fc4] to-[#083b6f] hover:from-[#2a8fd4] hover:to-[#0e5ea8] shadow-lg shadow-[#0e5ea8]/30 hover:shadow-[#0e5ea8]/50 hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none">
                      {submitting ? (
                        <><svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> Submitting...</>
                      ) : (
                        <>Submit Application <CheckCircle size={18} /></>
                      )}
                    </button>
                  )}
                </div>

                {submitError && step === 4 && (
                  <div className="mt-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    <AlertCircle size={18} className="mt-0.5 shrink-0" />
                    <span>{submitError}</span>
                  </div>
                )}

              </div>
            </div>

          </div>
        </div>
      </section>

      <style>{globalCSS}</style>
    </>
  )
}

/* ─── Global CSS ────────────────────────────────────────────────────────── */
const globalCSS = `
  @keyframes shakeError {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-4px); }
    75% { transform: translateX(4px); }
  }
  .shake { animation: shakeError 0.3s ease-in-out; }
  
  @keyframes slideInCheck {
    0% { transform: scale(0.5) translateY(-50%); opacity: 0; }
    100% { transform: scale(1) translateY(-50%); opacity: 1; }
  }
  .check-anim { animation: slideInCheck 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }

  @keyframes drawCheck {
    0% { stroke-dasharray: 100; stroke-dashoffset: 100; opacity: 0; transform: scale(0.5); }
    100% { stroke-dasharray: 100; stroke-dashoffset: 0; opacity: 1; transform: scale(1); }
  }
  .draw-check { animation: drawCheck 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }

  @keyframes scaleUp {
    0% { transform: scale(0.95); opacity: 0; }
    100% { transform: scale(1); opacity: 1; }
  }
  .scale-up { animation: scaleUp 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }

  @keyframes slideInItem {
    0% { transform: translateX(-20px); opacity: 0; }
    100% { transform: translateX(0); opacity: 1; }
  }
  .slide-in-item { opacity: 0; animation: slideInItem 0.5s forwards; }

  .confetti {
    position: absolute;
    width: 10px;
    height: 10px;
    top: -10px;
    border-radius: 2px;
    animation: confetti-fall 4s linear infinite;
  }
  @keyframes confetti-fall {
    0% { transform: translateY(0) rotate(0deg); opacity: 1; }
    100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
  }
`
```

## `src/pages/Sponsorship/index.jsx`
```jsx
import { Helmet } from 'react-helmet-async'
import { useState, useEffect } from 'react'
import {
  CheckCircle, ArrowRight, ArrowLeft, Heart, User,
  Award, ClipboardCheck, Star, Shield, Globe, Users,
  UploadCloud, FileText, AlertCircle, FileCheck, Rocket
} from 'lucide-react'
import { submitForm } from '../../lib/submitForm'
import { getDraft, setDraft, clearDraft } from '../../lib/draftStore'

/* ─── Data ─────────────────────────────────────────────────────────────── */
const STEPS = [
  { id: 1, label: 'Sponsor Profile',  icon: Heart },
  { id: 2, label: 'Contact Details',  icon: User },
  { id: 3, label: 'Sponsorship Details', icon: Award },
  { id: 4, label: 'Review & Submit',   icon: ClipboardCheck },
]

const STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa',
  'Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala',
  'Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland',
  'Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura',
  'Uttar Pradesh','Uttarakhand','West Bengal',
]

const SPONSORSHIP_TYPES = [
  'Financial Support / Grant', 'Resource Contribution (In-Kind)',
  'Event Sponsorship / Partnership', 'Venue / Logistics Support',
  'Media / Publicity Partnership', 'Other'
]

const BENEFITS = [
  { icon: Globe,     text: 'Brand visibility among 5L+ youth members across India' },
  { icon: Award,     text: 'Tax exemption certificate under section 80G (as applicable)' },
  { icon: Star,      text: 'Featured logo on official websites and event backdrops' },
  { icon: Users,     text: 'Direct reach to top universities and institutions' },
  { icon: Heart,     text: 'CSR partnership certification and compliance validation' },
]

/* ─── Validation ────────────────────────────────────────────────────────── */
function validateField(name, value) {
  const v = (typeof value === 'string') ? value.trim() : value

  switch (name) {
    case 'sponsorName':
      return v && String(v).length >= 2 ? '' : 'Name is required (Min 2 chars)'
    case 'industry':
      return v && String(v).length >= 2 ? '' : 'Industry/Domain is required'
    case 'city':
      return v && String(v).length >= 2 ? '' : 'City is required'
    case 'state':
      return v ? '' : 'State selection is required'
    case 'contactName':
      return v && String(v).length >= 2 ? '' : 'Contact name is required'
    case 'contactDesignation':
      return v && String(v).length >= 2 ? '' : 'Designation is required'
    case 'contactEmail':
      return v && /^\S+@\S+\.\S+$/.test(v) ? '' : 'Valid email required'
    case 'contactPhone':
      return v && String(v).replace(/\D/g,'').length >= 10 ? '' : 'Valid 10-digit number required'
    case 'type':
      return v ? '' : 'Sponsorship type is required'
    case 'details':
      return v && String(v).length >= 10 ? '' : 'Please write at least 10 characters detailing contribution'
    default:
      return ''
  }
}

/* ─── Shared Components ─────────────────────────────────────────────────── */
function Field({ label, name, v, onChange, touched, children, noStatusIcon }) {
  const value = v[name]
  const isTouched = touched[name]
  const error = isTouched ? validateField(name, value) : null
  const isValid = isTouched && validateField(name, value) === ''

  return (
    <div className="flex flex-col gap-1.5 relative">
      <label className="text-xs font-bold tracking-wider uppercase text-[#0e5ea8]">{label}</label>
      <div className={`relative transition-transform duration-300 ${error ? 'shake' : ''}`}>
        {children}
        {isValid && name !== 'proposal' && !noStatusIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500 check-anim pointer-events-none">
            <CheckCircle size={18} />
          </div>
        )}
        {error && name !== 'proposal' && !noStatusIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500 pointer-events-none">
            <AlertCircle size={18} />
          </div>
        )}
      </div>
      {error && <span className="text-xs text-red-500 font-medium mt-0.5">{error}</span>}
    </div>
  )
}

function Input({ name, type='text', placeholder, v, onChange, touched }) {
  const isTouched = touched[name]
  const error = isTouched && validateField(name, v[name])
  const isValid = isTouched && !error

  return (
    <input
      name={name} type={type} placeholder={placeholder}
      value={v[name] || ''} onChange={onChange}
      className={`w-full px-4 py-3.5 rounded-xl border-2 text-sm font-medium text-slate-800 placeholder-slate-400 bg-white transition-all focus:outline-none focus:ring-4 focus:ring-sky-500/10
        ${error ? 'border-red-300 focus:border-red-500 bg-red-50/30' : isValid ? 'border-green-300 focus:border-green-500' : 'border-slate-200 focus:border-sky-500 hover:border-slate-300'}`}
    />
  )
}

function Select({ name, placeholder, options, v, onChange, touched }) {
  const isTouched = touched[name]
  const error = isTouched && validateField(name, v[name])
  const isValid = isTouched && !error

  return (
    <select
      name={name} value={v[name] || ''} onChange={onChange}
      className={`w-full px-4 py-3.5 rounded-xl border-2 text-sm font-medium text-slate-800 bg-white transition-all focus:outline-none focus:ring-4 focus:ring-sky-500/10 appearance-none cursor-pointer
        ${error ? 'border-red-300 focus:border-red-500 bg-red-50/30' : isValid ? 'border-green-300 focus:border-green-500' : 'border-slate-200 focus:border-sky-500 hover:border-slate-300'}`}
    >
      <option value="">{placeholder}</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  )
}

function Textarea({ name, rows=3, placeholder, v, onChange, touched }) {
  const isTouched = touched[name]
  const error = isTouched && validateField(name, v[name])
  const isValid = isTouched && !error

  return (
    <textarea
      name={name} rows={rows} placeholder={placeholder}
      value={v[name] || ''} onChange={onChange}
      className={`w-full px-4 py-3.5 rounded-xl border-2 text-sm font-medium text-slate-800 placeholder-slate-400 bg-white transition-all focus:outline-none focus:ring-4 focus:ring-sky-500/10 resize-none
        ${error ? 'border-red-300 focus:border-red-500 bg-red-50/30' : isValid ? 'border-green-300 focus:border-green-500' : 'border-slate-200 focus:border-sky-500 hover:border-slate-300'}`}
    />
  )
}

function FileUpload({ file, onFileSelect, error }) {
  const [drag, setDrag] = useState(false)
  
  const handleDrop = (e) => {
    e.preventDefault()
    setDrag(false)
    const f = e.dataTransfer.files[0]
    if (f) onFileSelect(f)
  }

  return (
    <div 
      onDragOver={e => { e.preventDefault(); setDrag(true) }}
      onDragLeave={() => setDrag(false)}
      onDrop={handleDrop}
      onClick={() => document.getElementById('proposal-upload').click()}
      className={`relative p-8 border-2 border-dashed rounded-2xl transition-all text-center cursor-pointer overflow-hidden
        ${drag ? 'border-sky-500 bg-sky-50 scale-[1.02]' : error ? 'border-red-400 bg-red-50/50' : 'border-slate-300 hover:border-sky-400 bg-slate-50/50'}`}
    >
      <input type="file" id="proposal-upload" className="hidden" accept=".pdf,.doc,.docx" onChange={e => e.target.files[0] && onFileSelect(e.target.files[0])} />
      
      {file ? (
        <div className="flex flex-col items-center gap-3 check-anim">
          <div className="w-14 h-14 rounded-full bg-sky-100 flex items-center justify-center">
            <FileCheck className="text-sky-600" size={28} />
          </div>
          <div>
            <p className="font-bold text-slate-800 text-sm">{file.name}</p>
            <p className="text-xs text-slate-500 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
          </div>
          <button 
            onClick={e => { e.stopPropagation(); onFileSelect(null) }} 
            className="text-xs font-bold text-red-500 hover:text-red-700 uppercase tracking-wide px-3 py-1 bg-red-50 rounded-full"
          >
            Remove File
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-white shadow-sm border border-slate-200 flex items-center justify-center transition-transform group-hover:scale-110">
            <UploadCloud className="text-slate-400" size={28} />
          </div>
          <div>
            <p className="font-bold text-slate-800 text-sm">Click to upload or drag & drop</p>
            <p className="text-xs text-slate-500 mt-1 font-medium">Sponsorship Proposal/Details (Optional, PDF, DOC, DOCX, Max 5MB)</p>
          </div>
        </div>
      )}
    </div>
  )
}

/* ─── Main Page ─────────────────────────────────────────────────────────── */
export default function Sponsorship() {
  const [mounted, setMounted] = useState(false)
  const [step, setStep] = useState(1)
  const [values, setValues] = useState({ profileType: 'Corporate / Brand' })
  const [touched, setTouched] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState('')

  // Autosave load
  useEffect(() => {
    const saved = getDraft('yuci_sponsorship_autosave')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (parsed.values) {
          const { proposal, ...rest } = parsed.values
          setValues(rest)
          setStep(parsed.step || 1)
        }
      } catch { /* corrupt saved draft — start fresh */ }
    }
    setMounted(true)
  }, [])

  // Autosave save
  useEffect(() => {
    if (mounted && !submitted) {
      const { proposal, ...rest } = values
      setDraft('yuci_sponsorship_autosave', JSON.stringify({ values: rest, step }))
    }
  }, [values, step, mounted, submitted])

  const onChange = e => {
    const { name, value } = e.target
    setValues(v => ({ ...v, [name]: value }))
    if (!touched[name]) setTouched(t => ({ ...t, [name]: true }))
  }

  const validateCurrentStep = () => {
    const fields = {
      1: ['sponsorName', 'profileType', 'industry', 'city', 'state'],
      2: ['contactName', 'contactDesignation', 'contactEmail', 'contactPhone'],
      3: ['type', 'details']
    }[step]
    
    let valid = true
    const newTouched = { ...touched }
    fields.forEach(f => {
      newTouched[f] = true
      if (validateField(f, values[f]) !== '') valid = false
    })
    setTouched(newTouched)
    return valid
  }

  const next = () => {
    if (!validateCurrentStep()) return
    setStep(s => s + 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const back = () => { 
    setStep(s => s - 1)
    window.scrollTo({ top: 0, behavior: 'smooth' }) 
  }

  const submit = async () => {
    setSubmitting(true)
    setSubmitError('')
    try {
      const { proposal, ...fields } = values
      await submitForm('sponsorship', fields, { proposal })
      setSubmitted(true)
      clearDraft('yuci_sponsorship_autosave')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      setSubmitError(err.message || 'Could not submit your application. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  /* ─── Success Screen ────────────────────────────────────────────────── */
  if (submitted) {
    return (
      <>
        <Helmet><title>Sponsorship Proposal Submitted — YUCI</title></Helmet>
        <section className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-slate-50">
          
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(40)].map((_, i) => (
              <div key={i} className="confetti" style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                backgroundColor: ['#0e5ea8', '#10b981', '#f59e0b', '#ef4444'][Math.floor(Math.random()*4)]
              }}/>
            ))}
          </div>

          <div className="relative text-center max-w-lg bg-white rounded-[2.5rem] shadow-2xl shadow-sky-900/5 p-12 border border-slate-100 z-10 scale-up">
            <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8 relative">
              <div className="absolute inset-0 border-2 border-green-200 rounded-full animate-ping opacity-20" />
              <CheckCircle size={48} className="text-green-500 draw-check" />
            </div>
            
            <h2 className="text-4xl font-bold text-slate-900 mb-4 tracking-tight">Proposal Received</h2>
            <p className="text-slate-600 text-lg mb-8 leading-relaxed">
              Thank you, <span className="font-bold text-slate-900">{values.contactName}</span>! The sponsorship details for <span className="font-bold text-sky-600">{values.sponsorName}</span> have been recorded.
            </p>

            <div className="bg-slate-50 rounded-2xl p-6 text-left border border-slate-100">
              <div className="text-xs font-bold tracking-widest uppercase text-[#0e5ea8] mb-4">What happens next?</div>
              {[
                { text: 'Review of contribution scope by Partnership team' },
                { text: 'Call/Meeting scheduled to align CSR & brand integration goals' },
                { text: 'Coordination email sent to ' + values.contactEmail },
                { text: 'Empowering communities together!', Icon: Rocket },
              ].map(({ text, Icon }, i) => (
                <div key={i} className="flex items-start gap-3 mb-3 last:mb-0 slide-in-item" style={{ animationDelay: `${i * 0.15}s` }}>
                  <div className="w-6 h-6 rounded-full bg-sky-100 text-sky-600 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">{i+1}</div>
                  <span className="text-slate-600 text-sm font-medium leading-relaxed inline-flex items-center gap-1.5">{text}{Icon && <Icon size={15} className="text-sky-600 shrink-0" />}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
        <style>{globalCSS}</style>
      </>
    )
  }

  if (!mounted) return null
  const progress = ((step - 1) / (STEPS.length - 1)) * 100

  /* ─── Main Form UI ─────────────────────────────────────────────────── */
  return (
    <>
      <Helmet><title>Become a Sponsor — YUCI</title></Helmet>
      
      <section className="relative overflow-hidden text-white" style={{ background: 'linear-gradient(135deg, #050a15 0%, #0d1f38 40%, #162d54 100%)' }}>
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(53,182,214,0.08) 0%, transparent 70%)', transform: 'translate(20%, -30%)' }} />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(200,168,75,0.06) 0%, transparent 70%)', transform: 'translate(-30%, 40%)' }} />
        <div className="absolute left-0 top-0 bottom-0 w-[3px]" style={{ background: 'linear-gradient(180deg, transparent, #35b6d6, transparent)' }} />

        <div className="max-w-7xl mx-auto px-6 relative z-10 pt-28 pb-20 lg:pt-32 lg:pb-24">
          <nav className="flex items-center gap-2 mb-7">
            <a href="/" className="font-accent text-[11px] tracking-[0.12em] uppercase text-white/40 hover:text-white transition-colors">Home</a>
            <span className="text-white/20 text-xs">›</span>
            <span className="font-accent text-[11px] tracking-[0.12em] uppercase" style={{ color: '#35b6d6' }}>Sponsorship</span>
          </nav>

          <div className="inline-flex items-center gap-2.5 mb-5">
            <span className="h-[2px] w-9 rounded-full" style={{ background: '#c8a84b' }} />
            <span className="font-accent text-[11px] font-semibold tracking-[0.2em] uppercase" style={{ color: '#c8a84b' }}>Sponsorship &amp; Support</span>
          </div>

          <h1 className="font-display font-bold leading-[1.1] mb-4 max-w-2xl text-white" style={{ fontSize: 'clamp(2.4rem, 5vw, 3.8rem)' }}>
            Support the{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-br from-[#35b6d6] to-[#7ce3ff]">NGO Movement</span>
          </h1>

          <p className="font-body text-[17px] leading-relaxed max-w-xl" style={{ color: 'rgba(214,234,248,0.65)' }}>
            Help YUCI scale its youth empowerment, educational, and sustainability campaigns across India. Partner as a brand, corporate, or individual sponsor.
          </p>
        </div>

        <div className="absolute bottom-0 inset-x-0 pointer-events-none">
          <svg viewBox="0 0 1440 60" preserveAspectRatio="none" className="w-full h-[60px] block" fill="none">
            <path d="M0 60 L0 30 Q360 0 720 24 Q1080 48 1440 15 L1440 60 Z" fill="#f8fafc" />
          </svg>
        </div>
      </section>

      <section className="pb-20 bg-slate-50 min-h-screen relative">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-12 gap-10">

            {/* ── SIDEBAR ─────────────────────────────────────────────── */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Progress Timeline */}
              <div className="bg-white rounded-3xl p-8 shadow-xl shadow-sky-900/5 border border-slate-100">
                <div className="text-xs font-bold tracking-widest uppercase text-[#0e5ea8] mb-8">Sponsorship Progress</div>
                <div className="relative">
                  <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-slate-100" />
                  
                  <div className="space-y-6 relative">
                    {STEPS.map(s => {
                      const done = step > s.id
                      const cur  = step === s.id
                      const Icon = s.icon
                      return (
                        <div key={s.id} className="flex items-center gap-4 relative">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 z-10 transition-all duration-300
                            ${done ? 'bg-green-500 text-white shadow-lg shadow-green-500/20 scale-105' : cur ? 'bg-[#0e5ea8] text-white shadow-lg shadow-[#0e5ea8]/30 scale-110' : 'bg-slate-100 text-slate-400 border-2 border-white'}`}
                          >
                            {done ? <CheckCircle size={18}/> : <Icon size={18}/>}
                          </div>
                          <div>
                            <div className={`text-sm font-bold tracking-wide transition-colors ${cur ? 'text-[#0e5ea8]' : done ? 'text-green-600' : 'text-slate-400'}`}>
                              {s.label}
                            </div>
                            <div className="text-xs font-medium text-slate-400 mt-0.5">
                              {cur ? 'In Progress' : done ? 'Completed' : 'Pending'}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Benefits Card */}
              <div className="bg-[#0a1628] rounded-3xl p-8 relative overflow-hidden shadow-2xl shadow-[#0a1628]/30 text-white" style={{ background: '#0a1628' }}>
                <div className="absolute top-0 right-0 w-48 h-48 bg-sky-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="relative z-10">
                  <div className="text-xs font-bold tracking-widest uppercase text-sky-400 mb-2">Impact</div>
                  <div className="text-2xl font-bold mb-6">Sponsor Outreach</div>
                  <ul className="space-y-4">
                    {BENEFITS.map(({ icon: Icon, text }, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 border border-white/5">
                          <Icon size={14} className="text-sky-300"/>
                        </div>
                        <span className="text-sm font-medium text-sky-50 leading-relaxed pt-1">{text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

            </div>

            {/* ── FORM AREA ────────────────────────────────────────────── */}
            <div className="lg:col-span-8">
              
              <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl shadow-sky-900/5 border border-slate-100">
                
                {/* Header */}
                <div className="mb-10 pb-8 border-b border-slate-100">
                  <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-sky-50 text-sky-600 text-xs font-bold tracking-wider uppercase mb-4">
                    Step {step} of {STEPS.length}
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-[#0e5ea8] tracking-tight mb-3">
                    {STEPS[step-1].label}
                  </h2>
                  <p className="text-slate-500 font-medium text-lg">
                    {step===1 && 'Select profile type and enter company or individual details.'}
                    {step===2 && 'Enter contact information of the primary sponsor representative.'}
                    {step===3 && 'Choose sponsorship areas and detail your contribution proposal.'}
                    {step===4 && 'Review details before submission.'}
                  </p>
                </div>

                {/* Content */}
                <div className="space-y-8 animate-fade-in">

                  {/* ── STEP 1 ── */}
                  {step === 1 && (
                    <>
                      <Field label="I am sponsoring as *" name="profileType" v={values} onChange={onChange} touched={touched} noStatusIcon>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {['Corporate / Brand', 'Individual Sponsor'].map(type => (
                            <label key={type} className="cursor-pointer">
                              <input type="radio" name="profileType" value={type} checked={values.profileType === type} onChange={onChange} className="sr-only"/>
                              <div className={`text-center py-4 px-2 rounded-2xl border-2 transition-all duration-300 ${values.profileType === type ? 'bg-[#0a1628] border-[#0a1628] text-white shadow-xl shadow-[#0a1628]/20 scale-105' : 'border-slate-200 text-slate-600 hover:border-sky-300 hover:bg-slate-50'}`} style={values.profileType === type ? { background: '#0a1628', borderColor: '#0a1628' } : {}}>
                                <div className="font-bold text-sm tracking-wide">{type}</div>
                              </div>
                            </label>
                          ))}
                        </div>
                      </Field>
                      
                      <Field label="Sponsor Name / Company Name *" name="sponsorName" v={values} onChange={onChange} touched={touched}>
                        <Input name="sponsorName" placeholder="e.g. Acme Corp or John Doe" v={values} onChange={onChange} touched={touched}/>
                      </Field>

                      <Field label="Sponsor Industry / Domain *" name="industry" v={values} onChange={onChange} touched={touched}>
                        <Input name="industry" placeholder="e.g. Technology, Education, Finance, Personal Support" v={values} onChange={onChange} touched={touched}/>
                      </Field>

                      <Field label="Website / Social Profile (Optional)" name="website" v={values} onChange={onChange} touched={touched}>
                        <Input name="website" placeholder="https://www.company.com or LinkedIn URL" v={values} onChange={onChange} touched={touched}/>
                      </Field>

                      <div className="grid md:grid-cols-2 gap-6">
                        <Field label="City *" name="city" v={values} onChange={onChange} touched={touched}>
                          <Input name="city" placeholder="e.g. Bangalore" v={values} onChange={onChange} touched={touched}/>
                        </Field>
                        <Field label="State *" name="state" v={values} onChange={onChange} touched={touched}>
                          <Select name="state" placeholder="Select State" options={STATES} v={values} onChange={onChange} touched={touched}/>
                        </Field>
                      </div>
                    </>
                  )}

                  {/* ── STEP 2 ── */}
                  {step === 2 && (
                    <>
                      <div className="grid md:grid-cols-2 gap-6">
                        <Field label="Contact Person Name *" name="contactName" v={values} onChange={onChange} touched={touched}>
                          <Input name="contactName" placeholder="Jane Doe" v={values} onChange={onChange} touched={touched}/>
                        </Field>
                        <Field label="Contact Designation *" name="contactDesignation" v={values} onChange={onChange} touched={touched}>
                          <Input name="contactDesignation" placeholder="e.g. CSR Manager, Director, Individual" v={values} onChange={onChange} touched={touched}/>
                        </Field>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <Field label="Contact Email Address *" name="contactEmail" v={values} onChange={onChange} touched={touched}>
                          <Input name="contactEmail" type="email" placeholder="csr@company.com" v={values} onChange={onChange} touched={touched}/>
                        </Field>
                        <Field label="Contact Phone Number *" name="contactPhone" v={values} onChange={onChange} touched={touched}>
                          <Input name="contactPhone" type="tel" placeholder="+91 98765 43210" v={values} onChange={onChange} touched={touched}/>
                        </Field>
                      </div>
                    </>
                  )}

                  {/* ── STEP 3 ── */}
                  {step === 3 && (
                    <>
                      <Field label="Sponsorship Type *" name="type" v={values} onChange={onChange} touched={touched}>
                        <Select name="type" placeholder="Select sponsorship type" options={SPONSORSHIP_TYPES} v={values} onChange={onChange} touched={touched}/>
                      </Field>

                      <Field label="Details of Support / Contribution *" name="details" v={values} onChange={onChange} touched={touched}>
                        <Textarea name="details" rows={4} placeholder="Describe the scale, structure, budget or materials you wish to sponsor or contribute to the NGO..." v={values} onChange={onChange} touched={touched}/>
                      </Field>

                      <Field label="Upload Proposal Document (Optional)" name="proposal" v={values} onChange={onChange} touched={touched}>
                        <FileUpload 
                          file={values.proposal} 
                          onFileSelect={f => { setValues(v => ({ ...v, proposal: f })); setTouched(t => ({...t, proposal: true})) }}
                          error={touched.proposal && validateField('proposal', values.proposal)}
                        />
                      </Field>
                    </>
                  )}

                  {/* ── STEP 4 ── */}
                  {step === 4 && (
                    <div className="space-y-6">
                      <div className="bg-sky-50 border border-sky-100 rounded-2xl p-5 flex items-start gap-4">
                        <div className="bg-[#0e5ea8] text-white p-2 rounded-xl mt-0.5"><ClipboardCheck size={20}/></div>
                        <p className="text-sky-900 font-medium text-sm leading-relaxed">
                          Please review your sponsorship details. Once submitted, our team will review the details and reach out within 48 hours to discuss mutual alignment and execution plans.
                        </p>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        {[
                          { title: 'Sponsor Profile', fields: { 'Name': values.sponsorName, 'Type': values.profileType, 'Industry': values.industry, 'Website': values.website, 'Location': `${values.city}, ${values.state}` } },
                          { title: 'Contact Person', fields: { 'Name': values.contactName, 'Designation': values.contactDesignation, 'Email': values.contactEmail, 'Phone': values.contactPhone } },
                          { title: 'Sponsorship Details', fields: { 'Type': values.type, 'Details': values.details, 'Proposal Document': values.proposal?.name } }
                        ].map(section => (
                          <div key={section.title} className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
                            <h4 className="text-xs font-bold uppercase tracking-widest text-[#0e5ea8] mb-4">{section.title}</h4>
                            <dl className="space-y-3">
                              {Object.entries(section.fields).map(([k, v]) => v ? (
                                <div key={k} className="flex flex-col">
                                  <dt className="text-xs font-semibold text-slate-500 uppercase">{k}</dt>
                                  <dd className="text-sm font-bold text-slate-800">{v}</dd>
                                </div>
                              ) : null)}
                            </dl>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>

                {/* ── Navigation Actions ── */}
                <div className="mt-10 pt-8 border-t border-slate-100 flex items-center justify-between">
                  {step > 1 ? (
                    <button onClick={back} className="flex items-center gap-2 px-6 py-3.5 rounded-full font-bold text-sm text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors">
                      <ArrowLeft size={18} /> Back
                    </button>
                  ) : <div/>}

                  {step < 4 ? (
                    <button onClick={next} className="flex items-center gap-2 px-8 py-3.5 rounded-full font-bold text-sm text-white bg-gradient-to-br from-[#1a7fc4] to-[#083b6f] hover:from-[#2a8fd4] hover:to-[#0e5ea8] shadow-lg shadow-[#0e5ea8]/30 hover:shadow-[#0e5ea8]/50 hover:-translate-y-0.5 transition-all">
                      Continue <ArrowRight size={18} />
                    </button>
                  ) : (
                    <button onClick={submit} disabled={submitting} className="flex items-center gap-2 px-8 py-3.5 rounded-full font-bold text-sm text-white bg-gradient-to-br from-[#1a7fc4] to-[#083b6f] hover:from-[#2a8fd4] hover:to-[#0e5ea8] shadow-lg shadow-[#0e5ea8]/30 hover:shadow-[#0e5ea8]/50 hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none">
                      {submitting ? (
                        <><svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> Submitting...</>
                      ) : (
                        <>Submit Application <CheckCircle size={18} /></>
                      )}
                    </button>
                  )}
                </div>

                {submitError && step === 4 && (
                  <div className="mt-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    <AlertCircle size={18} className="mt-0.5 shrink-0" />
                    <span>{submitError}</span>
                  </div>
                )}

              </div>
            </div>

          </div>
        </div>
      </section>

      <style>{globalCSS}</style>
    </>
  )
}

/* ─── Global CSS ────────────────────────────────────────────────────────── */
const globalCSS = `
  @keyframes shakeError {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-4px); }
    75% { transform: translateX(4px); }
  }
  .shake { animation: shakeError 0.3s ease-in-out; }
  
  @keyframes slideInCheck {
    0% { transform: scale(0.5) translateY(-50%); opacity: 0; }
    100% { transform: scale(1) translateY(-50%); opacity: 1; }
  }
  .check-anim { animation: slideInCheck 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }

  @keyframes drawCheck {
    0% { stroke-dasharray: 100; stroke-dashoffset: 100; opacity: 0; transform: scale(0.5); }
    100% { stroke-dasharray: 100; stroke-dashoffset: 0; opacity: 1; transform: scale(1); }
  }
  .draw-check { animation: drawCheck 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }

  @keyframes scaleUp {
    0% { transform: scale(0.95); opacity: 0; }
    100% { transform: scale(1); opacity: 1; }
  }
  .scale-up { animation: scaleUp 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }

  @keyframes slideInItem {
    0% { transform: translateX(-20px); opacity: 0; }
    100% { transform: translateX(0); opacity: 1; }
  }
  .slide-in-item { opacity: 0; animation: slideInItem 0.5s forwards; }

  .confetti {
    position: absolute;
    width: 10px;
    height: 10px;
    top: -10px;
    border-radius: 2px;
    animation: confetti-fall 4s linear infinite;
  }
  @keyframes confetti-fall {
    0% { transform: translateY(0) rotate(0deg); opacity: 1; }
    100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
  }
`
```

## `google-apps-script/Code.gs`
```javascript
/**
 * YUCI form-collection endpoint (Google Apps Script Web App).
 *
 * This is the ONLY backend piece. It receives form submissions from the YUCI
 * website, appends a row to a Google Sheet (one tab per form type), saves any
 * uploaded file to a Drive folder, and emails the management inbox.
 *
 * This file is a version-controlled reference copy. To make it run you must
 * paste it into the Apps Script editor of the "YUCI Form Submissions" Google
 * Sheet and deploy it as a Web App. See README.md in this folder.
 *
 * ─── Set these four constants after creating the Sheet and Drive folder ───
 */
var SHEET_ID = 'PASTE_GOOGLE_SHEET_ID_HERE';       // from the Sheet URL
var UPLOAD_FOLDER_ID = 'PASTE_DRIVE_FOLDER_ID_HERE'; // from the Drive folder URL
var NOTIFY_EMAIL = '';                              // e.g. youthunitedcouncilofindia@gmail.com — set once the team confirms
var SHARED_SECRET = 'CHANGE_ME_TO_A_LONG_RANDOM_STRING'; // must match VITE_FORMS_SECRET on the site

/**
 * Column order per form tab. The first element of each row is always a
 * server-stamped timestamp. Keep these in sync with the Sheet header rows.
 */
var HEADERS = {
  application: ['Timestamp', 'Application Type', 'First Name', 'Last Name', 'Email', 'Phone',
    'WhatsApp', 'DOB', 'Gender', 'Address', 'City', 'State', 'Organization', 'Qualification',
    'Occupation', 'Skills', 'Interests', 'Apply For', 'Committee', 'Experience', 'Motivation',
    'Reference', 'Resume Link'],
  contact: ['Timestamp', 'Name', 'Email', 'Phone', 'Subject', 'Message'],
  partnership: ['Timestamp', 'Institution Type', 'Institution Name', 'Website', 'Address', 'City',
    'State', 'Representative Name', 'Designation', 'Rep Email', 'Rep Phone', 'Partnership Area',
    'Motivation', 'Proposal Link'],
  sponsorship: ['Timestamp', 'Profile Type', 'Sponsor Name', 'Industry', 'Website', 'City', 'State',
    'Contact Name', 'Designation', 'Contact Email', 'Contact Phone', 'Sponsorship Type', 'Details',
    'Proposal Link'],
};

// Maps a form type to its Sheet tab name and the payload key of its file (if any).
var TABS = {
  application: { sheet: 'Applications', fileKey: 'resume' },
  contact: { sheet: 'Contact', fileKey: null },
  partnership: { sheet: 'Partnership', fileKey: 'proposal' },
  sponsorship: { sheet: 'Sponsorship', fileKey: 'proposal' },
};

function doPost(e) {
  try {
    var payload = JSON.parse(e.postData.contents);

    if (SHARED_SECRET && payload.secret !== SHARED_SECRET) {
      return json({ ok: false, error: 'Unauthorized' });
    }

    var formType = payload.formType;
    var cfg = TABS[formType];
    if (!cfg) return json({ ok: false, error: 'Unknown form type' });

    // Save an uploaded file (if this form has one) and get a shareable link.
    var fileLink = '';
    if (cfg.fileKey && payload._files && payload._files[cfg.fileKey]) {
      fileLink = saveFile(payload._files[cfg.fileKey], formType);
    }

    // Build the row in the exact column order for this form.
    var row = buildRow(formType, payload, fileLink);

    var sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(cfg.sheet);
    ensureHeader(sheet, formType);
    sheet.appendRow(row);

    notify(formType, payload, fileLink);

    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  }
}

// Bump this whenever you change the script, so you can confirm which version is
// actually live: open the /exec URL in a browser and check the "version" value.
var VERSION = 2; // v2 = branded HTML email template

// Simple GET so you can confirm the deployment is live in a browser.
function doGet() {
  return json({ ok: true, service: 'YUCI form endpoint', version: VERSION });
}

function buildRow(formType, p, fileLink) {
  var now = new Date();
  switch (formType) {
    case 'application':
      return [now, p.applicationType, p.firstName, p.lastName, p.email, p.phone, p.whatsapp,
        p.dob, p.gender, p.address, p.city, p.state, p.organization, p.qualification,
        p.occupation, p.skills, p.interests, p.applyFor, p.committee, p.experience,
        p.motivation, p.reference, fileLink];
    case 'contact':
      return [now, p.name, p.email, p.phone, p.subject, p.message];
    case 'partnership':
      return [now, p.institutionType, p.institutionName, p.website, p.address, p.city, p.state,
        p.repName, p.repDesignation, p.repEmail, p.repPhone, p.area, p.motivation, fileLink];
    case 'sponsorship':
      return [now, p.profileType, p.sponsorName, p.industry, p.website, p.city, p.state,
        p.contactName, p.contactDesignation, p.contactEmail, p.contactPhone, p.type, p.details,
        fileLink];
    default:
      return [now];
  }
}

// Write the header row once if the tab is empty.
function ensureHeader(sheet, formType) {
  if (sheet.getLastRow() === 0) sheet.appendRow(HEADERS[formType]);
}

function saveFile(file, formType) {
  var bytes = Utilities.base64Decode(file.dataBase64);
  var blob = Utilities.newBlob(bytes, file.mimeType, formType + '_' + Date.now() + '_' + file.name);
  var folder = DriveApp.getFolderById(UPLOAD_FOLDER_ID);
  var saved = folder.createFile(blob);
  saved.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return saved.getUrl();
}

// Human-readable label for each form, shown in the subject and email header.
var FORM_LABELS = {
  application: 'Application',
  contact: 'Contact Message',
  partnership: 'MOU Partnership Enquiry',
  sponsorship: 'Sponsorship Enquiry',
};

function notify(formType, p, fileLink) {
  if (!NOTIFY_EMAIL) return; // destination not set yet — skip quietly

  var subjects = {
    application: 'New ' + (p.applicationType || 'Membership') + ' Application — ' + (p.firstName || '') + ' ' + (p.lastName || ''),
    contact: 'New Contact Message — ' + (p.subject || '') + ' (' + (p.name || '') + ')',
    partnership: 'New MOU Partnership Enquiry — ' + (p.institutionName || ''),
    sponsorship: 'New Sponsorship Enquiry — ' + (p.sponsorName || ''),
  };
  var subject = subjects[formType] || 'New YUCI form submission';

  var headers = HEADERS[formType];
  var row = buildRow(formType, p, fileLink);

  // Plain-text fallback (for clients that don't render HTML).
  var plain = headers.map(function (h, i) { return h + ': ' + (row[i] == null ? '' : row[i]); }).join('\n');

  MailApp.sendEmail(NOTIFY_EMAIL, subject, plain, {
    name: 'YUCI Website',
    htmlBody: buildHtmlEmail(formType, headers, row),
  });
}

// Build a branded, readable HTML email from the header/value pairs.
function buildHtmlEmail(formType, headers, row) {
  var navy = '#0a1628', saffron = '#ff7d10', ink = '#1e293b', muted = '#64748b', line = '#e8ecf1';
  var label = FORM_LABELS[formType] || 'Submission';

  var timestamp = row[0] ? formatStamp(row[0]) : '';
  var fileUrl = '', fileLabel = '';

  var rowsHtml = '';
  var alt = false;
  for (var i = 1; i < headers.length; i++) { // skip index 0 (Timestamp) — shown in footer
    var h = headers[i];
    var val = row[i];
    if (val == null || String(val).trim() === '') continue;

    // The last "... Link" column becomes a download button, not a table row.
    if (/link$/i.test(h)) { fileUrl = String(val); fileLabel = h.replace(/\s*link$/i, ''); continue; }

    var display = escapeHtml(String(val));
    if (/email/i.test(h) && display.indexOf('@') !== -1) {
      display = '<a href="mailto:' + display + '" style="color:' + navy + ';">' + display + '</a>';
    }

    var bg = alt ? '#fbfcfd' : '#ffffff';
    alt = !alt;
    rowsHtml +=
      '<tr>' +
        '<td style="padding:11px 16px;background:' + bg + ';border-bottom:1px solid ' + line + ';' +
          'font-size:12px;color:' + muted + ';font-weight:600;text-transform:uppercase;letter-spacing:.4px;' +
          'width:38%;vertical-align:top;">' + escapeHtml(h) + '</td>' +
        '<td style="padding:11px 16px;background:' + bg + ';border-bottom:1px solid ' + line + ';' +
          'font-size:14px;color:' + ink + ';line-height:1.55;">' + display + '</td>' +
      '</tr>';
  }

  var button = '';
  if (fileUrl) {
    button =
      '<tr><td colspan="2" style="padding:20px 16px 4px;">' +
        '<a href="' + escapeHtml(fileUrl) + '" ' +
          'style="display:inline-block;background:' + saffron + ';color:#ffffff;text-decoration:none;' +
          'font-size:13px;font-weight:700;padding:11px 22px;border-radius:8px;">' +
          '📎 View ' + escapeHtml(fileLabel) +
        '</a>' +
      '</td></tr>';
  }

  return '' +
  '<div style="margin:0;padding:24px 12px;background:#eef1f5;font-family:Arial,Helvetica,sans-serif;">' +
    '<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;margin:0 auto;">' +
      // Header
      '<tr><td style="background:' + navy + ';padding:24px 28px;border-radius:12px 12px 0 0;">' +
        '<div style="color:#ffffff;font-size:17px;font-weight:700;letter-spacing:.2px;">Youth United Council of India</div>' +
        '<div style="color:' + saffron + ';font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:1.5px;margin-top:6px;">New ' + escapeHtml(label) + '</div>' +
      '</td></tr>' +
      // Body
      '<tr><td style="background:#ffffff;padding:22px 28px 26px;border:1px solid ' + line + ';border-top:none;">' +
        '<p style="margin:0 0 18px;font-size:14px;color:' + ink + ';line-height:1.6;">' +
          'A new <strong>' + escapeHtml(label.toLowerCase()) + '</strong> was submitted through the YUCI website.' +
        '</p>' +
        '<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border:1px solid ' + line + ';border-radius:10px;border-collapse:separate;overflow:hidden;">' +
          rowsHtml + button +
        '</table>' +
      '</td></tr>' +
      // Footer
      '<tr><td style="background:#f8fafc;padding:14px 28px;border:1px solid ' + line + ';border-top:none;border-radius:0 0 12px 12px;text-align:center;">' +
        '<div style="font-size:11px;color:' + muted + ';line-height:1.5;">Sent automatically by the YUCI website' + (timestamp ? ' · ' + escapeHtml(timestamp) : '') + '</div>' +
      '</td></tr>' +
    '</table>' +
  '</div>';
}

function formatStamp(d) {
  try { return Utilities.formatDate(new Date(d), Session.getScriptTimeZone(), "d MMM yyyy, h:mm a"); }
  catch (e) { return String(d); }
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
```
