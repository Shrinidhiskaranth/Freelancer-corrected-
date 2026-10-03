import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase, Globe, MapPin,
  CheckCircle, Save, Sparkles,
  Building, Phone, ChevronRight, ChevronLeft
} from 'lucide-react';
import api from '../../api/axiosInstance';
import LuminaSelect from '../../components/ui/LuminaSelect';
import '../../styles/dashboard.css';

/* ── Shared field styles ─────────────────────── */
const inp = {
  width: '100%', padding: '13px 16px', borderRadius: 'var(--r-sm)',
  border: '1px solid var(--border-strong)', background: 'rgba(255,255,255,.025)',
  color: 'var(--text)', fontSize: 14.5, fontFamily: 'var(--font-body)',
  outline: 'none', boxSizing: 'border-box', transition: 'border-color .25s, box-shadow .25s',
};
const focusIn  = e => { e.target.style.borderColor = 'var(--cyan)'; e.target.style.boxShadow = '0 0 0 4px rgba(47,216,238,.1)'; };
const focusOut = e => { e.target.style.borderColor = 'var(--border-strong)'; e.target.style.boxShadow = 'none'; };

const Label = ({ children, required }) => (
  <label style={{ display: 'block', fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 9 }}>
    {children}{required && <span style={{ color: 'var(--cyan)', marginLeft: 4 }}>*</span>}
  </label>
);

const Field = ({ children, span = 1 }) => (
  <div style={{ gridColumn: `span ${span}` }}>{children}</div>
);

/* ── Step config ─────────────────────────────── */
const STEPS = [
  { id: 'company',     label: 'Company',     icon: Building },
  { id: 'preferences', label: 'Preferences', icon: Briefcase },
  { id: 'links',       label: 'Links',       icon: Globe    },
  { id: 'location',    label: 'Location',    icon: MapPin   },
];

const INDUSTRIES = [
  'Technology','Finance','Healthcare','Education','E-Commerce',
  'Media & Entertainment','Real Estate','Manufacturing','Consulting','Other'
];
const COMPANY_SIZES  = ['1-10','11-50','51-200','201-500','500+'];
const HIRING_PREFS   = ['Fixed Price','Hourly','Both'];
const COMM_PREFS     = ['Email','Chat','Video Call','Phone'];

export default function ClientEditProfile() {
  const [step,    setStep]    = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [error,   setError]   = useState('');

  const [form, setForm] = useState({
    phoneNumber: '', companyName: '', industry: '',
    companyWebsite: '', companySize: '', about: '',
    hiringPreference: '', preferredCommunication: '',
    languagesSpoken: '', preferredCurrency: '',
    linkedin: '', portfolioWebsite: '',
    country: '', state: '', city: '', timeZone: '',
    agreedToTerms: true,
  });

  /* ── load existing profile ── */
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/client/profile/me');
        if (res.data.success && res.data.profile) {
          const p = res.data.profile;
          setForm(prev => ({
            ...prev,
            phoneNumber:           p.phoneNumber || '',
            companyName:           p.companyName || '',
            industry:              p.industry || '',
            companyWebsite:        p.companyWebsite || '',
            companySize:           p.companySize || '',
            about:                 p.about || '',
            hiringPreference:      p.hiringPreference || '',
            preferredCommunication:p.preferredCommunication || '',
            languagesSpoken:       (p.languagesSpoken || []).join(', '),
            preferredCurrency:     p.preferredCurrency || '',
            linkedin:              p.linkedin || '',
            portfolioWebsite:      p.portfolioWebsite || '',
            country:               p.country || '',
            state:                 p.state || '',
            city:                  p.city || '',
            timeZone:              p.timeZone || '',
          }));
        }
      } catch { /* new profile */ }
      finally { setLoading(false); }
    })();
  }, []);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));
  const on  = key => e => set(key, e.target.value);

  const handleSave = async () => {
    setSaving(true); setError('');
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      fd.set('agreedToTerms', 'true');
      const res = await api.post('/client/profile', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) { setSaved(true); setTimeout(() => setSaved(false), 3000); }
    } catch (err) { setError(err.response?.data?.message || 'Failed to save profile.'); }
    finally { setSaving(false); }
  };

  const slide = { hidden: { opacity: 0, x: 40 }, visible: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -40 } };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 320, flexDirection: 'column', gap: 16 }}>
      <div className="spinner" />
      <p style={{ color: 'var(--text-faint)', fontFamily: 'var(--font-mono)', fontSize: 13 }}>Loading your profile…</p>
    </div>
  );

  return (
    <div className="dashboard-page">
      {/* Header */}
      <div className="dashboard-header-flex">
        <div>
          <h1 style={{ fontSize: 26, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Sparkles size={22} color="var(--cyan)" /> Edit Profile
          </h1>
          <p style={{ color: 'var(--text-dim)', marginTop: 6 }}>Keep your client profile complete to attract top freelancers</p>
        </div>
        <button onClick={handleSave} disabled={saving}
          style={{ padding: '12px 28px', borderRadius: 999, border: 'none', background: saving ? 'rgba(255,255,255,.06)' : 'linear-gradient(90deg,var(--cyan),var(--violet))', color: saving ? 'var(--text-faint)' : '#04070d', fontWeight: 700, fontSize: 14.5, cursor: saving ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 9, fontFamily: 'var(--font-body)', transition: 'box-shadow .25s', flexShrink: 0 }}
          onMouseOver={e => { if (!saving) e.currentTarget.style.boxShadow = '0 8px 28px -8px rgba(47,216,238,.6)'; }}
          onMouseOut={e => e.currentTarget.style.boxShadow = 'none'}
        >
          {saved ? <><CheckCircle size={16} /> Saved!</> : saving
            ? <><span style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid rgba(4,7,13,.3)', borderTopColor: '#04070d', animation: 'spin .7s linear infinite', display: 'inline-block' }} /> Saving…</>
            : <><Save size={16} /> Save Profile</>}
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {/* Saved toast */}
      <AnimatePresence>
        {saved && (
          <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
            style={{ position: 'fixed', top: 80, right: 28, zIndex: 999, padding: '12px 22px', borderRadius: 999, background: 'rgba(62,230,168,.12)', border: '1px solid rgba(62,230,168,.35)', color: 'var(--ok)', fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', gap: 9, boxShadow: '0 8px 28px -8px rgba(62,230,168,.5)' }}
          >
            <CheckCircle size={16} /> Profile saved successfully!
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 24, alignItems: 'start' }}>

        {/* Step sidebar */}
        <div className="dashboard-card" style={{ padding: '16px 12px', position: 'sticky', top: 90 }}>
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const isActive = i === step;
            return (
              <button key={s.id} onClick={() => setStep(i)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', borderRadius: 10, border: 'none', cursor: 'pointer', background: isActive ? 'rgba(47,216,238,.1)' : 'transparent', color: isActive ? 'var(--cyan)' : 'var(--text-dim)', fontWeight: isActive ? 700 : 400, fontSize: 14, fontFamily: 'var(--font-body)', transition: 'all .2s', marginBottom: 4, textAlign: 'left', position: 'relative' }}
                onMouseOver={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,.04)'; }}
                onMouseOut={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
              >
                {isActive && <div style={{ position: 'absolute', left: 0, top: '15%', bottom: '15%', width: 3, borderRadius: 3, background: 'var(--cyan)', boxShadow: '0 0 8px var(--cyan)' }} />}
                <Icon size={16} style={{ flexShrink: 0 }} />
                {s.label}
              </button>
            );
          })}

          {/* Progress */}
          <div style={{ marginTop: 16, padding: '0 14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 11, color: 'var(--text-faint)', fontFamily: 'var(--font-mono)' }}>PROGRESS</span>
              <span style={{ fontSize: 11, color: 'var(--cyan)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{Math.round(((step + 1) / STEPS.length) * 100)}%</span>
            </div>
            <div style={{ height: 4, borderRadius: 99, background: 'rgba(255,255,255,.06)' }}>
              <motion.div animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }} transition={{ ease: [.16,.84,.44,1] }}
                style={{ height: '100%', borderRadius: 99, background: 'linear-gradient(90deg,var(--cyan),var(--violet))', boxShadow: '0 0 8px rgba(47,216,238,.4)' }} />
            </div>
          </div>
        </div>

        {/* Step content */}
        <div className="dashboard-card" style={{ padding: 32, overflow: 'hidden' }}>
          <AnimatePresence mode="wait">
            <motion.div key={step} variants={slide} initial="hidden" animate="visible" exit="exit" transition={{ duration: .28, ease: [.16,.84,.44,1] }}>

              {/* ── STEP 0: Company ── */}
              {step === 0 && (
                <div>
                  <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(47,216,238,.1)', border: '1px solid rgba(47,216,238,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Building size={16} color="var(--cyan)" /></div>
                    Company Info
                  </h2>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                    <Field>
                      <Label>Phone Number</Label>
                      <div style={{ position: 'relative' }}>
                        <Phone size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)', pointerEvents: 'none' }} />
                        <input style={{ ...inp, paddingLeft: 40 }} value={form.phoneNumber} onChange={on('phoneNumber')} onFocus={focusIn} onBlur={focusOut} placeholder="+91 98765 43210" />
                      </div>
                    </Field>
                    <Field>
                      <Label>Company Name</Label>
                      <input style={inp} value={form.companyName} onChange={on('companyName')} onFocus={focusIn} onBlur={focusOut} placeholder="Acme Corp" />
                    </Field>
                    <Field>
                      <Label required>Industry</Label>
                      <LuminaSelect name="industry" value={form.industry} onChange={e => set('industry', e.target.value)} placeholder="Select industry" options={INDUSTRIES} />
                    </Field>
                    <Field>
                      <Label>Company Size</Label>
                      <LuminaSelect name="companySize" value={form.companySize} onChange={e => set('companySize', e.target.value)} placeholder="Select size" options={COMPANY_SIZES} />
                    </Field>
                    <Field span={2}>
                      <Label>About / Bio</Label>
                      <textarea rows={5} style={{ ...inp, resize: 'vertical', lineHeight: 1.65 }} value={form.about} onChange={on('about')} onFocus={focusIn} onBlur={focusOut} placeholder="Tell freelancers about your company and what you're looking to build…" />
                    </Field>
                    <Field span={2}>
                      <Label>Languages Spoken <span style={{ color: 'var(--text-faint)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(comma separated)</span></Label>
                      <input style={inp} value={form.languagesSpoken} onChange={on('languagesSpoken')} onFocus={focusIn} onBlur={focusOut} placeholder="English, Hindi, Tamil" />
                      {form.languagesSpoken && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginTop: 10 }}>
                          {form.languagesSpoken.split(',').map(s => s.trim()).filter(Boolean).map(s => (
                            <span key={s} style={{ padding: '4px 12px', borderRadius: 99, fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--cyan)', background: 'rgba(47,216,238,.08)', border: '1px solid rgba(47,216,238,.2)' }}>{s}</span>
                          ))}
                        </div>
                      )}
                    </Field>
                  </div>
                </div>
              )}

              {/* ── STEP 1: Preferences ── */}
              {step === 1 && (
                <div>
                  <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(139,107,245,.1)', border: '1px solid rgba(139,107,245,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Briefcase size={16} color="var(--violet)" /></div>
                    Hiring Preferences
                  </h2>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                    <Field>
                      <Label>Hiring Preference</Label>
                      <LuminaSelect name="hiringPreference" value={form.hiringPreference} onChange={e => set('hiringPreference', e.target.value)} placeholder="Select preference" options={HIRING_PREFS} />
                    </Field>
                    <Field>
                      <Label>Preferred Currency</Label>
                      <div style={{ position: 'relative' }}>
                        <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)', fontSize: 15, fontFamily: 'var(--font-mono)', pointerEvents: 'none' }}>₹</span>
                        <input style={{ ...inp, paddingLeft: 38 }} disabled value="INR" />
                      </div>
                    </Field>
                    <Field span={2}>
                      <Label>Preferred Communication</Label>
                      <LuminaSelect name="preferredCommunication" value={form.preferredCommunication} onChange={e => set('preferredCommunication', e.target.value)} placeholder="Select method" options={COMM_PREFS} />
                    </Field>
                  </div>
                </div>
              )}

              {/* ── STEP 2: Links ── */}
              {step === 2 && (
                <div>
                  <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(245,185,92,.1)', border: '1px solid rgba(245,185,92,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Globe size={16} color="var(--warn)" /></div>
                    Links
                  </h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {[
                      { key: 'companyWebsite', label: 'Company Website',  placeholder: 'https://mycompany.com' },
                      { key: 'linkedin',        label: 'LinkedIn Profile', placeholder: 'https://linkedin.com/company/acme' },
                      { key: 'portfolioWebsite',label: 'Portfolio / Other',placeholder: 'https://...' },
                    ].map(({ key, label, placeholder }) => (
                      <div key={key}>
                        <Label>{label}</Label>
                        <div style={{ position: 'relative' }}>
                          <Globe size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)', pointerEvents: 'none' }} />
                          <input style={{ ...inp, paddingLeft: 40 }} type="url" value={form[key]} onChange={on(key)} onFocus={focusIn} onBlur={focusOut} placeholder={placeholder} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── STEP 3: Location ── */}
              {step === 3 && (
                <div>
                  <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(240,98,176,.1)', border: '1px solid rgba(240,98,176,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><MapPin size={16} color="#f062b0" /></div>
                    Location
                  </h2>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                    <Field><Label>Country</Label><input style={inp} value={form.country} onChange={on('country')} onFocus={focusIn} onBlur={focusOut} placeholder="India" /></Field>
                    <Field><Label>State</Label><input style={inp} value={form.state} onChange={on('state')} onFocus={focusIn} onBlur={focusOut} placeholder="Karnataka" /></Field>
                    <Field><Label>City</Label><input style={inp} value={form.city} onChange={on('city')} onFocus={focusIn} onBlur={focusOut} placeholder="Bengaluru" /></Field>
                    <Field><Label>Time Zone</Label><input style={inp} value={form.timeZone} onChange={on('timeZone')} onFocus={focusIn} onBlur={focusOut} placeholder="IST (UTC+5:30)" /></Field>
                  </div>
                </div>
              )}

              {/* Step nav */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 36, paddingTop: 24, borderTop: '1px solid var(--border)' }}>
                <button type="button" onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}
                  style={{ padding: '10px 22px', borderRadius: 999, border: '1px solid var(--border-strong)', background: 'rgba(255,255,255,.03)', color: step === 0 ? 'var(--text-faint)' : 'var(--text-dim)', fontSize: 14, cursor: step === 0 ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-body)', display: 'flex', alignItems: 'center', gap: 7 }}>
                  <ChevronLeft size={15} /> Previous
                </button>
                {step < STEPS.length - 1 ? (
                  <button type="button" onClick={() => setStep(s => s + 1)}
                    style={{ padding: '10px 22px', borderRadius: 999, border: 'none', background: 'linear-gradient(90deg,var(--cyan),var(--violet))', color: '#04070d', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'var(--font-body)', display: 'flex', alignItems: 'center', gap: 7, transition: 'box-shadow .25s' }}
                    onMouseOver={e => e.currentTarget.style.boxShadow = '0 6px 22px -6px rgba(47,216,238,.6)'}
                    onMouseOut={e => e.currentTarget.style.boxShadow = 'none'}
                  >
                    Next <ChevronRight size={15} />
                  </button>
                ) : (
                  <button type="button" onClick={handleSave} disabled={saving}
                    style={{ padding: '10px 26px', borderRadius: 999, border: 'none', background: 'linear-gradient(90deg,var(--ok),var(--cyan))', color: '#04070d', fontWeight: 700, fontSize: 14, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-body)', display: 'flex', alignItems: 'center', gap: 7 }}>
                    <Save size={15} /> {saving ? 'Saving…' : 'Save Profile'}
                  </button>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
