import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Briefcase, GraduationCap, Globe, MapPin,
  Plus, Trash2, CheckCircle, Save,
  ChevronRight, ChevronLeft, Sparkles, Clock, Code, CreditCard
} from 'lucide-react';
import api from '../../api/axiosInstance';
import LuminaSelect from '../../components/ui/LuminaSelect';
import '../../styles/dashboard.css';
import '../../styles/auth.css';

/* ── shared field styles ─────────────────────── */
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
  { id: 'personal',    label: 'Personal',    icon: User        },
  { id: 'professional',label: 'Professional', icon: Briefcase   },
  { id: 'education',   label: 'Education',   icon: GraduationCap},
  { id: 'links',       label: 'Links',       icon: Globe       },
  { id: 'location',    label: 'Location',    icon: MapPin      },
  { id: 'payout',      label: 'Payout / Bank', icon: CreditCard },
];

const CATEGORIES  = ['Web Development','Mobile Development','Design','Writing','Marketing','Data Science','Video & Animation','Other'];
const AVAILABILITY = ['Full-time','Part-time','Freelance','Contract','Not Available'];
const GENDERS      = ['Male','Female','Non-binary','Prefer not to say'];

export default function FreelancerEditProfile() {
  const [step,    setStep]    = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [error,   setError]   = useState('');

  const [form, setForm] = useState({
    phoneNumber: '', dateOfBirth: '', gender: '',
    professionalTitle: '', yearsOfExperience: '', category: '',
    skills: '', hourlyRate: '', availability: '',
    professionalSummary: '', careerObjective: '',
    highestQualification: '', collegeOrUniversity: '', graduationYear: '',
    portfolioWebsite: '', github: '', linkedin: '',
    country: '', state: '', city: '', timeZone: '',
    bankName: '', accountHolderName: '', accountNumber: '', ifscCode: '',
    workExperience: [],
    languages: [],
    agreedToTerms: true,
  });

  /* ── load existing profile ── */
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/freelancer/profile/me');
        if (res.data.success && res.data.profile) {
          const p = res.data.profile;
          setForm(prev => ({
            ...prev,
            phoneNumber:          p.phoneNumber || '',
            dateOfBirth:          p.dateOfBirth || '',
            gender:               p.gender || '',
            professionalTitle:    p.professionalTitle || '',
            yearsOfExperience:    p.yearsOfExperience?.toString() || '',
            category:             p.category || '',
            skills:               (p.skills || []).join(', '),
            hourlyRate:           p.hourlyRate?.toString() || '',
            availability:         p.availability || '',
            professionalSummary:  p.professionalSummary || '',
            careerObjective:      p.careerObjective || '',
            highestQualification: p.highestQualification || '',
            collegeOrUniversity:  p.collegeOrUniversity || '',
            graduationYear:       p.graduationYear || '',
            portfolioWebsite:     p.portfolioWebsite || '',
            github:               p.github || '',
            linkedin:             p.linkedin || '',
            country:              p.country || '',
            state:                p.state || '',
            city:                 p.city || '',
            timeZone:             p.timeZone || '',
            bankName:             p.bankName || '',
            accountHolderName:    p.accountHolderName || '',
            accountNumber:        p.accountNumber || '',
            ifscCode:             p.ifscCode || '',
            workExperience:       p.workExperience || [],
            languages:            p.languages || [],
            agreedToTerms:        true,
          }));
        }
      } catch { /* ignore — new profile */ }
      finally { setLoading(false); }
    })();
  }, []);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));
  const on  = key => e => set(key, e.target.value);

  /* ── work experience helpers ── */
  const addExp   = () => setForm(f => ({ ...f, workExperience: [...f.workExperience, { companyName: '', jobTitle: '', startDate: '', endDate: '', description: '' }] }));
  const removeExp = i  => setForm(f => ({ ...f, workExperience: f.workExperience.filter((_, idx) => idx !== i) }));
  const setExp   = (i, key, val) => setForm(f => ({ ...f, workExperience: f.workExperience.map((e, idx) => idx === i ? { ...e, [key]: val } : e) }));

  /* ── language helpers ── */
  const addLang    = ()        => setForm(f => ({ ...f, languages: [...f.languages, { language: '', proficiency: '' }] }));
  const removeLang = i         => setForm(f => ({ ...f, languages: f.languages.filter((_, idx) => idx !== i) }));
  const setLang    = (i,k,v)   => setForm(f => ({ ...f, languages: f.languages.map((l, idx) => idx === i ? { ...l, [k]: v } : l) }));

  /* ── submit ── */
  const handleSave = async () => {
    setSaving(true); setError('');
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k === 'workExperience' || k === 'languages' || k === 'certifications') {
          fd.append(k, JSON.stringify(v));
        } else {
          fd.append(k, v);
        }
      });
      fd.set('agreedToTerms', 'true');

      const res = await api.post('/freelancer/profile', fd, {
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
          <p style={{ color: 'var(--text-dim)', marginTop: 6 }}>Keep your profile up to date to attract the best clients</p>
        </div>
        {/* Save button */}
        <button onClick={handleSave} disabled={saving}
          style={{ padding: '12px 28px', borderRadius: 999, border: 'none', background: saving ? 'rgba(255,255,255,.06)' : 'linear-gradient(90deg,var(--cyan),var(--violet))', color: saving ? 'var(--text-faint)' : '#04070d', fontWeight: 700, fontSize: 14.5, cursor: saving ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 9, fontFamily: 'var(--font-body)', transition: 'box-shadow .25s', flexShrink: 0 }}
          onMouseOver={e => { if (!saving) e.currentTarget.style.boxShadow = '0 8px 28px -8px rgba(47,216,238,.6)'; }}
          onMouseOut={e => e.currentTarget.style.boxShadow = 'none'}
        >
          {saved ? <><CheckCircle size={16} /> Saved!</> : saving ? <><span style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid rgba(4,7,13,.3)', borderTopColor: '#04070d', animation: 'spin .7s linear infinite', display: 'inline-block' }} /> Saving…</> : <><Save size={16} /> Save Profile</>}
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
            const Icon    = s.icon;
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

              {/* ── STEP 0: Personal ── */}
              {step === 0 && (
                <div>
                  <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(47,216,238,.1)', border: '1px solid rgba(47,216,238,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><User size={16} color="var(--cyan)" /></div>
                    Personal Info
                  </h2>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                    <Field>
                      <Label>Phone Number</Label>
                      <input style={inp} value={form.phoneNumber} onChange={on('phoneNumber')} onFocus={focusIn} onBlur={focusOut} placeholder="+91 98765 43210" />
                    </Field>
                    <Field>
                      <Label>Date of Birth</Label>
                      <input style={inp} type="date" value={form.dateOfBirth} onChange={on('dateOfBirth')} onFocus={focusIn} onBlur={focusOut} />
                    </Field>
                    <Field span={2}>
                      <Label>Gender</Label>
                      <LuminaSelect name="gender" value={form.gender} onChange={e => set('gender', e.target.value)} placeholder="Select gender" options={GENDERS} />
                    </Field>
                    <Field span={2}>
                      <Label>Professional Summary</Label>
                      <textarea rows={4} style={{ ...inp, resize: 'vertical', lineHeight: 1.65 }} value={form.professionalSummary} onChange={on('professionalSummary')} onFocus={focusIn} onBlur={focusOut} placeholder="A brief overview of who you are and what you do..." />
                    </Field>
                    <Field span={2}>
                      <Label>Career Objective</Label>
                      <textarea rows={3} style={{ ...inp, resize: 'vertical', lineHeight: 1.65 }} value={form.careerObjective} onChange={on('careerObjective')} onFocus={focusIn} onBlur={focusOut} placeholder="Your career goals..." />
                    </Field>
                  </div>
                </div>
              )}

              {/* ── STEP 1: Professional ── */}
              {step === 1 && (
                <div>
                  <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(139,107,245,.1)', border: '1px solid rgba(139,107,245,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Briefcase size={16} color="var(--violet)" /></div>
                    Professional Details
                  </h2>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                    <Field span={2}>
                      <Label required>Professional Title</Label>
                      <input style={inp} value={form.professionalTitle} onChange={on('professionalTitle')} onFocus={focusIn} onBlur={focusOut} placeholder="e.g. Full Stack Developer" />
                    </Field>
                    <Field>
                      <Label required>Category</Label>
                      <LuminaSelect name="category" value={form.category} onChange={e => set('category', e.target.value)} placeholder="Select category" options={CATEGORIES} />
                    </Field>
                    <Field>
                      <Label>Availability</Label>
                      <LuminaSelect name="availability" value={form.availability} onChange={e => set('availability', e.target.value)} placeholder="Select availability" icon={Clock} options={AVAILABILITY} />
                    </Field>
                    <Field>
                      <Label>Years of Experience</Label>
                      <input style={inp} type="number" min="0" max="50" value={form.yearsOfExperience} onChange={on('yearsOfExperience')} onFocus={focusIn} onBlur={focusOut} placeholder="e.g. 3" />
                    </Field>
                    <Field>
                      <Label>Hourly Rate (₹)</Label>
                      <div style={{ position: 'relative' }}>
                        <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)', fontSize: 15, fontFamily: 'var(--font-mono)', pointerEvents: 'none' }}>₹</span>
                        <input style={{ ...inp, paddingLeft: 38 }} type="number" min="0" value={form.hourlyRate} onChange={on('hourlyRate')} onFocus={focusIn} onBlur={focusOut} placeholder="500" />
                      </div>
                    </Field>
                    <Field span={2}>
                      <Label required>Skills <span style={{ color: 'var(--text-faint)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(comma separated)</span></Label>
                      <div style={{ position: 'relative' }}>
                        <Code size={15} style={{ position: 'absolute', left: 14, top: 16, color: 'var(--text-faint)', pointerEvents: 'none' }} />
                        <textarea rows={2} style={{ ...inp, paddingLeft: 38, resize: 'none' }} value={form.skills} onChange={on('skills')} onFocus={focusIn} onBlur={focusOut} placeholder="React, Node.js, Python, MongoDB…" />
                      </div>
                      {/* Tag preview */}
                      {form.skills && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginTop: 10 }}>
                          {form.skills.split(',').map(s => s.trim()).filter(Boolean).map(s => (
                            <span key={s} style={{ padding: '4px 12px', borderRadius: 99, fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--cyan)', background: 'rgba(47,216,238,.08)', border: '1px solid rgba(47,216,238,.2)' }}>{s}</span>
                          ))}
                        </div>
                      )}
                    </Field>

                    {/* Work Experience */}
                    <Field span={2}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <Label>Work Experience</Label>
                        <button type="button" onClick={addExp}
                          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 99, border: '1px solid rgba(47,216,238,.35)', background: 'rgba(47,216,238,.08)', color: 'var(--cyan)', fontSize: 12.5, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
                          <Plus size={13} /> Add
                        </button>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {form.workExperience.map((exp, i) => (
                          <div key={i} style={{ padding: '20px 22px', borderRadius: 'var(--r-md)', background: 'rgba(255,255,255,.025)', border: '1px solid var(--border)', position: 'relative' }}>
                            <button type="button" onClick={() => removeExp(i)} style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(244,123,123,.08)', border: '1px solid rgba(244,123,123,.3)', color: 'var(--danger)', borderRadius: '50%', width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                              <Trash2 size={12} />
                            </button>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                              <div><Label>Company</Label><input style={inp} value={exp.companyName} onChange={e => setExp(i,'companyName',e.target.value)} onFocus={focusIn} onBlur={focusOut} placeholder="Company name" /></div>
                              <div><Label>Job Title</Label><input style={inp} value={exp.jobTitle} onChange={e => setExp(i,'jobTitle',e.target.value)} onFocus={focusIn} onBlur={focusOut} placeholder="Your role" /></div>
                              <div><Label>Start Date</Label><input style={inp} type="date" value={exp.startDate} onChange={e => setExp(i,'startDate',e.target.value)} onFocus={focusIn} onBlur={focusOut} /></div>
                              <div><Label>End Date</Label><input style={inp} type="date" value={exp.endDate} onChange={e => setExp(i,'endDate',e.target.value)} onFocus={focusIn} onBlur={focusOut} /></div>
                              <div style={{ gridColumn: 'span 2' }}><Label>Description</Label><textarea rows={2} style={{ ...inp, resize: 'none' }} value={exp.description} onChange={e => setExp(i,'description',e.target.value)} onFocus={focusIn} onBlur={focusOut} placeholder="What did you work on?" /></div>
                            </div>
                          </div>
                        ))}
                        {form.workExperience.length === 0 && <p style={{ color: 'var(--text-faint)', fontSize: 13.5, textAlign: 'center', padding: '20px 0' }}>No experience added yet</p>}
                      </div>
                    </Field>
                  </div>
                </div>
              )}

              {/* ── STEP 2: Education ── */}
              {step === 2 && (
                <div>
                  <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(62,230,168,.1)', border: '1px solid rgba(62,230,168,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><GraduationCap size={16} color="var(--ok)" /></div>
                    Education
                  </h2>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                    <Field span={2}>
                      <Label>Highest Qualification</Label>
                      <input style={inp} value={form.highestQualification} onChange={on('highestQualification')} onFocus={focusIn} onBlur={focusOut} placeholder="e.g. Bachelor of Engineering" />
                    </Field>
                    <Field>
                      <Label>College / University</Label>
                      <input style={inp} value={form.collegeOrUniversity} onChange={on('collegeOrUniversity')} onFocus={focusIn} onBlur={focusOut} placeholder="Institution name" />
                    </Field>
                    <Field>
                      <Label>Graduation Year</Label>
                      <input style={inp} type="number" min="1950" max="2030" value={form.graduationYear} onChange={on('graduationYear')} onFocus={focusIn} onBlur={focusOut} placeholder="e.g. 2022" />
                    </Field>

                    {/* Languages */}
                    <Field span={2}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <Label>Languages</Label>
                        <button type="button" onClick={addLang}
                          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 99, border: '1px solid rgba(62,230,168,.35)', background: 'rgba(62,230,168,.08)', color: 'var(--ok)', fontSize: 12.5, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
                          <Plus size={13} /> Add Language
                        </button>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {form.languages.map((lang, i) => (
                          <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
                            <div style={{ flex: 1 }}><Label>Language</Label><input style={inp} value={lang.language} onChange={e => setLang(i,'language',e.target.value)} onFocus={focusIn} onBlur={focusOut} placeholder="e.g. English" /></div>
                            <div style={{ flex: 1 }}><Label>Proficiency</Label><input style={inp} value={lang.proficiency} onChange={e => setLang(i,'proficiency',e.target.value)} onFocus={focusIn} onBlur={focusOut} placeholder="e.g. Fluent" /></div>
                            <button type="button" onClick={() => removeLang(i)} style={{ background: 'rgba(244,123,123,.08)', border: '1px solid rgba(244,123,123,.3)', color: 'var(--danger)', borderRadius: 8, width: 40, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                        {form.languages.length === 0 && <p style={{ color: 'var(--text-faint)', fontSize: 13.5, textAlign: 'center', padding: '16px 0' }}>No languages added yet</p>}
                      </div>
                    </Field>
                  </div>
                </div>
              )}

              {/* ── STEP 3: Links ── */}
              {step === 3 && (
                <div>
                  <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(245,185,92,.1)', border: '1px solid rgba(245,185,92,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Globe size={16} color="var(--warn)" /></div>
                    Links & Portfolio
                  </h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {[
                      { key: 'portfolioWebsite', label: 'Portfolio Website', placeholder: 'https://myportfolio.com' },
                      { key: 'github',           label: 'GitHub Profile',    placeholder: 'https://github.com/username' },
                      { key: 'linkedin',         label: 'LinkedIn Profile',  placeholder: 'https://linkedin.com/in/username' },
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

              {/* ── STEP 4: Location ── */}
              {step === 4 && (
                <div>
                  <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(240,98,176,.1)', border: '1px solid rgba(240,98,176,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><MapPin size={16} color="var(--magenta, #f062b0)" /></div>
                    Location & Preferences
                  </h2>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                    <Field><Label>Country</Label><input style={inp} value={form.country} onChange={on('country')} onFocus={focusIn} onBlur={focusOut} placeholder="India" /></Field>
                    <Field><Label>State</Label><input style={inp} value={form.state} onChange={on('state')} onFocus={focusIn} onBlur={focusOut} placeholder="Karnataka" /></Field>
                    <Field><Label>City</Label><input style={inp} value={form.city} onChange={on('city')} onFocus={focusIn} onBlur={focusOut} placeholder="Bengaluru" /></Field>
                    <Field><Label>Time Zone</Label><input style={inp} value={form.timeZone} onChange={on('timeZone')} onFocus={focusIn} onBlur={focusOut} placeholder="IST (UTC+5:30)" /></Field>
                  </div>
                </div>
              )}

              {/* ── STEP 5: Payout ── */}
              {step === 5 && (
                <div>
                  <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(47,216,238,.1)', border: '1px solid rgba(47,216,238,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CreditCard size={16} color="var(--cyan)" /></div>
                    Payout & Bank Details
                  </h2>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                    <Field span={2}>
                      <Label>Account Holder Name</Label>
                      <input style={inp} value={form.accountHolderName} onChange={on('accountHolderName')} onFocus={focusIn} onBlur={focusOut} placeholder="e.g. Sudhanva S Bhat" />
                    </Field>
                    <Field>
                      <Label>Bank Name</Label>
                      <input style={inp} value={form.bankName} onChange={on('bankName')} onFocus={focusIn} onBlur={focusOut} placeholder="e.g. State Bank of India" />
                    </Field>
                    <Field>
                      <Label>IFSC / Routing Code</Label>
                      <input style={inp} value={form.ifscCode} onChange={on('ifscCode')} onFocus={focusIn} onBlur={focusOut} placeholder="e.g. SBIN0012345" />
                    </Field>
                    <Field span={2}>
                      <Label>Account Number</Label>
                      <input style={inp} type="password" value={form.accountNumber} onChange={on('accountNumber')} onFocus={focusIn} onBlur={focusOut} placeholder="e.g. 123456789012" />
                    </Field>
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
