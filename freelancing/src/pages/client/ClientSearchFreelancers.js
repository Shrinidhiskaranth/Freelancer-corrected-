import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, MapPin, Clock,
    Briefcase, Globe, ExternalLink, Users, X,
    MessageSquare, Send, CheckCircle, ChevronDown
} from 'lucide-react';
import api from '../../api/axiosInstance';
import '../../styles/dashboard.css';

const CATEGORIES = [
    'All', 'Web Development', 'Mobile Development', 'Design',
    'Writing', 'Marketing', 'Data Science', 'Video & Animation', 'Other'
];

/* ── Shared input style ───────────────────────── */
const inp = {
    width: '100%', padding: '13px 16px', borderRadius: 'var(--r-sm)',
    border: '1px solid var(--border-strong)', background: 'rgba(255,255,255,.025)',
    color: 'var(--text)', fontSize: 14.5, fontFamily: 'var(--font-body)',
    outline: 'none', boxSizing: 'border-box', transition: 'border-color .25s, box-shadow .25s',
};
const onFocus = e => { e.target.style.borderColor = 'var(--cyan)'; e.target.style.boxShadow = '0 0 0 4px rgba(47,216,238,.1)'; };
const onBlur  = e => { e.target.style.borderColor = 'var(--border-strong)'; e.target.style.boxShadow = 'none'; };

/* ── Star Badge (inline rating display) ─────── */
const StarBadge = ({ avg, total }) => {
    if (!avg) {
        // No reviews yet — show 5 empty blue stars
        return (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
                {[1,2,3,4,5].map(n => (
                    <span key={n} style={{ fontSize: 13, color: 'var(--cyan)', lineHeight: 1 }}>☆</span>
                ))}
                <span style={{ fontSize: 10, color: 'var(--text-faint)', fontFamily: 'var(--font-mono)', marginLeft: 4 }}>New</span>
            </span>
        );
    }
    return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 99, background: 'rgba(245,185,92,.1)', border: '1px solid rgba(245,185,92,.25)', fontSize: 11.5, fontWeight: 700, color: '#f5b93c', fontFamily: 'var(--font-mono)' }}>
            <span style={{ color: '#f5b93c', fontSize: 11 }}>★</span>
            {avg} <span style={{ color: 'var(--text-faint)', fontWeight: 400 }}>({total})</span>
        </span>
    );
};

/* ── Message Modal ───────────────────────────── */
function MessageModal({ freelancer, onClose }) {
    const [text,      setText]      = useState('');
    const [projects,  setProjects]  = useState([]);
    const [projectId, setProjectId] = useState('');
    const [open,      setOpen]      = useState(false);
    const [sending,   setSending]   = useState(false);
    const [sent,      setSent]      = useState(false);
    const [error,     setError]     = useState('');
    const [loadingP,  setLoadingP]  = useState(true);

    const name    = freelancer.user?.fullName || 'Freelancer';
    const initial = name[0]?.toUpperCase() || 'F';

    // Fetch client's projects to pick from
    useEffect(() => {
        (async () => {
            try {
                const res = await api.get('/projects/client/my-projects');
                if (res.data.success) setProjects(res.data.projects || []);
            } catch { /* ignore */ }
            finally { setLoadingP(false); }
        })();
    }, []);

    // Close on Escape
    useEffect(() => {
        const h = e => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', h);
        return () => window.removeEventListener('keydown', h);
    }, [onClose]);

    const selectedProject = projects.find(p => p._id === projectId);

    const handleSend = async e => {
        e.preventDefault();
        if (!text.trim() || !projectId) return;
        setSending(true); setError('');
        try {
            const res = await api.post('/messages/send', {
                receiverId: freelancer.user?._id,
                projectId,
                content: text.trim(),
            });
            if (res.data.success) { setSent(true); setTimeout(onClose, 1800); }
        } catch (err) { setError(err.response?.data?.message || 'Failed to send message.'); }
        finally { setSending(false); }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
        >
            <motion.div initial={{ opacity: 0, scale: .92, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: .92, y: 20 }}
                transition={{ ease: [.16,.84,.44,1], duration: .3 }}
                onClick={e => e.stopPropagation()}
                style={{ width: '100%', maxWidth: 520, background: 'linear-gradient(135deg,rgba(13,17,32,.99),rgba(8,11,20,1))', borderRadius: 'var(--r-xl)', border: '1px solid var(--border-strong)', boxShadow: '0 32px 80px rgba(0,0,0,.85), 0 0 0 1px rgba(47,216,238,.12)', overflow: 'hidden', position: 'relative' }}
            >
                {/* Top sheen */}
                <div style={{ position: 'absolute', top: 0, left: '15%', right: '15%', height: 1, background: 'linear-gradient(90deg,transparent,rgba(47,216,238,.45),transparent)', pointerEvents: 'none' }} />

                {/* Header */}
                <div style={{ padding: '24px 28px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{ width: 46, height: 46, borderRadius: '50%', background: 'linear-gradient(135deg,var(--cyan),var(--violet))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 19, color: '#04070d', fontFamily: 'var(--font-mono)', boxShadow: '0 0 18px rgba(47,216,238,.35)', flexShrink: 0 }}>{initial}</div>
                        <div>
                            <p style={{ fontWeight: 700, fontSize: 15.5, margin: 0, letterSpacing: '-.02em' }}>{name}</p>
                            <p style={{ color: 'var(--cyan)', fontSize: 12.5, margin: 0, fontFamily: 'var(--font-mono)' }}>
                                {freelancer.professionalTitle || 'Freelancer'}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} style={{ background: 'rgba(255,255,255,.05)', border: '1px solid var(--border-strong)', color: 'var(--text-dim)', borderRadius: '50%', width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background .2s' }}
                        onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,.1)'}
                        onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,.05)'}
                    >
                        <X size={15} />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSend} style={{ padding: '24px 28px' }}>
                    {sent ? (
                        <motion.div initial={{ opacity: 0, scale: .9 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center', padding: '28px 0' }}>
                            <div style={{ width: 58, height: 58, borderRadius: '50%', background: 'rgba(62,230,168,.1)', border: '1px solid rgba(62,230,168,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 0 28px -8px rgba(62,230,168,.6)' }}>
                                <CheckCircle size={27} color="var(--ok)" />
                            </div>
                            <p style={{ fontWeight: 700, fontSize: 16, marginBottom: 7 }}>Message Sent!</p>
                            <p style={{ color: 'var(--text-dim)', fontSize: 14 }}>Open Messages to continue the conversation.</p>
                        </motion.div>
                    ) : (
                        <>
                            {error && <div className="error-banner" style={{ marginBottom: 16 }}>{error}</div>}

                            {/* Project selector */}
                            <label style={{ display: 'block', fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 10 }}>
                                Select Project *
                            </label>

                            {loadingP ? (
                                <div style={{ padding: '14px 16px', borderRadius: 'var(--r-sm)', border: '1px solid var(--border-strong)', background: 'rgba(255,255,255,.025)', color: 'var(--text-faint)', fontSize: 14, marginBottom: 18 }}>
                                    Loading your projects…
                                </div>
                            ) : projects.length === 0 ? (
                                <div style={{ padding: '14px 16px', borderRadius: 'var(--r-sm)', border: '1px solid rgba(244,123,123,.3)', background: 'rgba(244,123,123,.06)', color: 'var(--danger)', fontSize: 13.5, marginBottom: 18 }}>
                                    ⚠ You have no active projects. Post a project first.
                                </div>
                            ) : (
                                /* Custom dropdown */
                                <div style={{ position: 'relative', marginBottom: 18 }}>
                                    <div onClick={() => setOpen(o => !o)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 16px', borderRadius: 'var(--r-sm)', border: `1px solid ${open ? 'var(--cyan)' : 'var(--border-strong)'}`, background: 'rgba(255,255,255,.025)', cursor: 'pointer', boxShadow: open ? '0 0 0 4px rgba(47,216,238,.1)' : 'none', transition: 'border-color .25s, box-shadow .25s' }}>
                                        <span style={{ color: selectedProject ? 'var(--text)' : 'var(--text-faint)', fontSize: 14.5 }}>
                                            {selectedProject ? selectedProject.title : 'Choose a project…'}
                                        </span>
                                        <ChevronDown size={15} style={{ color: 'var(--text-faint)', transition: 'transform .25s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }} />
                                    </div>
                                    {open && (
                                        <div style={{ position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0, background: 'linear-gradient(135deg,rgba(13,17,32,.99),rgba(8,11,20,1))', border: '1px solid var(--border-strong)', borderRadius: 'var(--r-md)', boxShadow: '0 20px 48px rgba(0,0,0,.7)', zIndex: 10, overflow: 'hidden', backdropFilter: 'blur(20px)' }}>
                                            <div style={{ padding: 6 }}>
                                                {projects.map(p => (
                                                    <div key={p._id} onClick={() => { setProjectId(p._id); setOpen(false); }}
                                                        style={{ padding: '10px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 14, color: p._id === projectId ? 'var(--cyan)' : 'var(--text-dim)', background: p._id === projectId ? 'rgba(47,216,238,.1)' : 'transparent', fontWeight: p._id === projectId ? 600 : 400, transition: 'background .15s' }}
                                                        onMouseOver={e => { if (p._id !== projectId) e.currentTarget.style.background = 'rgba(255,255,255,.04)'; }}
                                                        onMouseOut={e => { if (p._id !== projectId) e.currentTarget.style.background = 'transparent'; }}
                                                    >
                                                        {p.title}
                                                        <span style={{ marginLeft: 8, fontSize: 11, color: 'var(--text-faint)', fontFamily: 'var(--font-mono)' }}>#{p.status}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Message textarea */}
                            <label style={{ display: 'block', fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 10 }}>
                                Message *
                            </label>
                            <textarea rows={5}
                                placeholder={`Hi ${name.split(' ')[0]}, I'd love to work with you on my project…`}
                                value={text} onChange={e => setText(e.target.value)}
                                style={{ ...inp, resize: 'vertical', lineHeight: 1.65 }}
                                onFocus={onFocus} onBlur={onBlur}
                                autoFocus
                            />

                            {/* Actions */}
                            <div style={{ display: 'flex', gap: 12, marginTop: 20, justifyContent: 'flex-end' }}>
                                <button type="button" onClick={onClose} style={{ padding: '11px 22px', borderRadius: 999, border: '1px solid var(--border-strong)', background: 'rgba(255,255,255,.03)', color: 'var(--text-dim)', fontSize: 14, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
                                    Cancel
                                </button>
                                <button type="submit" disabled={!text.trim() || !projectId || sending}
                                    style={{ padding: '11px 26px', borderRadius: 999, border: 'none', background: text.trim() && projectId && !sending ? 'linear-gradient(90deg,var(--cyan),var(--violet))' : 'rgba(255,255,255,.06)', color: text.trim() && projectId && !sending ? '#04070d' : 'var(--text-faint)', fontWeight: 700, fontSize: 14, cursor: text.trim() && projectId && !sending ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-body)', transition: 'box-shadow .25s' }}
                                    onMouseOver={e => { if (text.trim() && projectId && !sending) e.currentTarget.style.boxShadow = '0 6px 24px -6px rgba(47,216,238,.6)'; }}
                                    onMouseOut={e => e.currentTarget.style.boxShadow = 'none'}
                                >
                                    {sending
                                        ? <><span style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid rgba(4,7,13,.3)', borderTopColor: '#04070d', animation: 'spin .7s linear infinite', display: 'inline-block' }} /> Sending…</>
                                        : <><Send size={14} /> Send Message</>
                                    }
                                </button>
                            </div>
                        </>
                    )}
                </form>
            </motion.div>
        </motion.div>
    );
}

/* ── Freelancer Card ─────────────────────────── */
function FreelancerCard({ freelancer: f, index, onMessage, ratings = {} }) {
    const name    = f.user?.fullName || 'Freelancer';
    const initial = name[0].toUpperCase();
    const skills  = f.skills?.slice(0, 4) || [];
    const extra   = (f.skills?.length || 0) - 4;
    const rating  = ratings[f.user?._id] || null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * .06, ease: [.16,.84,.44,1] }}
            style={{ position: 'relative', overflow: 'hidden', background: 'linear-gradient(135deg,rgba(13,17,32,.95),rgba(8,11,20,.98))', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '26px 28px', transition: 'border-color .3s, box-shadow .3s', cursor: 'default' }}
            whileHover={{ y: -5, borderColor: 'rgba(47,216,238,.32)', boxShadow: '0 20px 50px -20px rgba(47,216,238,.35)' }}
        >
            {/* Glow spot */}
            <div style={{ position: 'absolute', top: 0, right: 0, width: 140, height: 140, borderRadius: '50%', background: 'radial-gradient(circle,rgba(139,107,245,.07),transparent 70%)', pointerEvents: 'none' }} />

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 16 }}>
                <div style={{ width: 52, height: 52, borderRadius: '50%', flexShrink: 0, background: 'linear-gradient(135deg,var(--cyan),var(--violet))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: 20, color: '#04070d', boxShadow: '0 0 16px rgba(47,216,238,.3)' }}>
                    {initial}
                </div>
                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <p style={{ fontWeight: 700, fontSize: 16, margin: 0, letterSpacing: '-.02em' }}>{name}</p>
                        <StarBadge avg={rating?.avg} total={rating?.total} />
                    </div>
                    <p style={{ color: 'var(--cyan)', fontSize: 13, margin: '4px 0', fontWeight: 500 }}>{f.professionalTitle || 'Freelancer'}</p>
                    {(f.city || f.country) && (
                        <p style={{ color: 'var(--text-faint)', fontSize: 12, margin: 0, display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'var(--font-mono)' }}>
                            <MapPin size={11} /> {[f.city, f.country].filter(Boolean).join(', ')}
                        </p>
                    )}
                </div>
                {f.hourlyRate > 0 && (
                    <div style={{ padding: '6px 14px', borderRadius: 99, flexShrink: 0, background: 'rgba(47,216,238,.08)', border: '1px solid rgba(47,216,238,.2)', color: 'var(--cyan)', fontSize: 13, fontFamily: 'var(--font-mono)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ fontFamily: 'var(--font-mono)' }}>₹</span>{f.hourlyRate}/hr
                    </div>
                )}
            </div>

            {/* Summary */}
            {f.professionalSummary && (
                <p style={{ color: 'var(--text-dim)', fontSize: 13.5, lineHeight: 1.65, marginBottom: 16, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {f.professionalSummary}
                </p>
            )}

            {/* Skills */}
            {skills.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 18 }}>
                    {skills.map(sk => (
                        <span key={sk} style={{ padding: '4px 11px', borderRadius: 99, fontSize: 11.5, fontFamily: 'var(--font-mono)', fontWeight: 500, color: 'var(--text-dim)', background: 'rgba(255,255,255,.04)', border: '1px solid var(--border-strong)' }}>{sk}</span>
                    ))}
                    {extra > 0 && (
                        <span style={{ padding: '4px 11px', borderRadius: 99, fontSize: 11.5, color: 'var(--violet)', background: 'rgba(139,107,245,.08)', border: '1px solid rgba(139,107,245,.2)', fontFamily: 'var(--font-mono)' }}>+{extra} more</span>
                    )}
                </div>
            )}

            {/* Footer */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 16, borderTop: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                    {f.yearsOfExperience > 0 && (
                        <span style={{ color: 'var(--text-faint)', fontSize: 12, display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'var(--font-mono)' }}>
                            <Briefcase size={12} /> {f.yearsOfExperience}yr exp
                        </span>
                    )}
                    {f.availability && (
                        <span style={{ color: 'var(--text-faint)', fontSize: 12, display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'var(--font-mono)' }}>
                            <Clock size={12} /> {f.availability}
                        </span>
                    )}
                    {f.category && <span style={{ color: 'var(--text-faint)', fontSize: 12, fontFamily: 'var(--font-mono)' }}>{f.category}</span>}
                </div>

                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    {/* Social links */}
                    {f.github && <a href={f.github} target="_blank" rel="noreferrer" title="GitHub" style={{ color: 'var(--text-faint)', transition: 'color .2s' }} onMouseOver={e => e.currentTarget.style.color = 'var(--cyan)'} onMouseOut={e => e.currentTarget.style.color = 'var(--text-faint)'}><ExternalLink size={14} /></a>}
                    {f.linkedin && <a href={f.linkedin} target="_blank" rel="noreferrer" title="LinkedIn" style={{ color: 'var(--text-faint)', transition: 'color .2s' }} onMouseOver={e => e.currentTarget.style.color = 'var(--violet)'} onMouseOut={e => e.currentTarget.style.color = 'var(--text-faint)'}><ExternalLink size={14} /></a>}
                    {f.portfolioWebsite && <a href={f.portfolioWebsite} target="_blank" rel="noreferrer" title="Portfolio" style={{ color: 'var(--text-faint)', transition: 'color .2s' }} onMouseOver={e => e.currentTarget.style.color = 'var(--ok)'} onMouseOut={e => e.currentTarget.style.color = 'var(--text-faint)'}><Globe size={14} /></a>}

                    {/* Message button */}
                    <button onClick={() => onMessage(f)}
                        style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 16px', borderRadius: 999, border: '1px solid rgba(47,216,238,.35)', background: 'rgba(47,216,238,.08)', color: 'var(--cyan)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)', transition: 'background .2s, box-shadow .2s' }}
                        onMouseOver={e => { e.currentTarget.style.background = 'rgba(47,216,238,.15)'; e.currentTarget.style.boxShadow = '0 4px 18px -6px rgba(47,216,238,.5)'; }}
                        onMouseOut={e => { e.currentTarget.style.background = 'rgba(47,216,238,.08)'; e.currentTarget.style.boxShadow = 'none'; }}
                    >
                        <MessageSquare size={13} /> Message
                    </button>
                </div>
            </div>
        </motion.div>
    );
}

/* ── Main Page ───────────────────────────────── */
function ClientSearchFreelancers() {
    const [freelancers, setFreelancers] = useState([]);
    const [filtered,    setFiltered]    = useState([]);
    const [loading,     setLoading]     = useState(true);
    const [error,       setError]       = useState('');
    const [search,      setSearch]      = useState('');
    const [category,    setCategory]    = useState('All');
    const [msgTarget,   setMsgTarget]   = useState(null);
    const [ratings,     setRatings]     = useState({});

    useEffect(() => {
        (async () => {
            try {
                const res = await api.get('/freelancer/search');
                if (res.data.success) { 
                    const list = res.data.freelancers;
                    setFreelancers(list); 
                    setFiltered(list); 
                    
                    // Fetch ratings in parallel
                    const userIds = list.map(f => f.user?._id).filter(Boolean);
                    const ratingResults = await Promise.all(
                        userIds.map(uid => api.get(`/reviews/user/${uid}`).catch(() => null))
                    );
                    const ratingMap = {};
                    userIds.forEach((uid, idx) => {
                        const data = ratingResults[idx]?.data;
                        if (data?.averageRating) ratingMap[uid] = { avg: data.averageRating, total: data.totalReviews };
                    });
                    setRatings(ratingMap);
                }
            } catch (err) { setError(err.response?.data?.message || 'Failed to load freelancers.'); }
            finally { setLoading(false); }
        })();
    }, []);

    useEffect(() => {
        let result = freelancers;
        if (category !== 'All') result = result.filter(f => f.category === category);
        if (search.trim()) {
            const re = new RegExp(search.trim(), 'i');
            result = result.filter(f =>
                re.test(f.user?.fullName) || re.test(f.professionalTitle) ||
                re.test(f.professionalSummary) || (f.skills || []).some(s => re.test(s))
            );
        }
        setFiltered(result);
    }, [search, category, freelancers]);

    return (
        <>
        <div className="dashboard-page">
            {/* Header */}
            <div className="dashboard-header-flex">
                <div>
                    <h1 style={{ fontSize: 28 }}>Find Freelancers</h1>
                    <p style={{ color: 'var(--text-dim)', marginTop: 6 }}>Browse {freelancers.length} freelancer{freelancers.length !== 1 ? 's' : ''} on Lumina</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 99, background: 'rgba(47,216,238,.08)', border: '1px solid rgba(47,216,238,.2)', color: 'var(--cyan)', fontSize: 13, fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                    <Users size={14} /> {filtered.length} results
                </div>
            </div>

            {/* Search bar */}
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ flex: 1, minWidth: 240, display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,.025)', border: '1px solid var(--border)', borderRadius: 999, padding: '12px 18px', transition: 'border-color .25s, box-shadow .25s' }}
                    onFocus={e => { e.currentTarget.style.borderColor = 'rgba(47,216,238,.45)'; e.currentTarget.style.boxShadow = '0 0 0 4px rgba(47,216,238,.1)'; }}
                    onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                    <Search size={15} style={{ color: 'var(--text-faint)', flexShrink: 0 }} />
                    <input type="text" placeholder="Search by name, skill, title…" value={search} onChange={e => setSearch(e.target.value)}
                        style={{ background: 'transparent', border: 'none', outline: 'none', color: 'var(--text)', fontSize: 14, width: '100%' }} />
                    {search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', color: 'var(--text-faint)', cursor: 'pointer', padding: 0, display: 'flex' }}><X size={14} /></button>}
                </div>
            </div>

            {/* Category tabs */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {CATEGORIES.map(cat => (
                    <button key={cat} onClick={() => setCategory(cat)} style={{ padding: '7px 16px', borderRadius: 99, fontSize: 13, fontFamily: 'var(--font-mono)', fontWeight: 500, cursor: 'pointer', border: category === cat ? '1px solid rgba(47,216,238,.4)' : '1px solid var(--border-strong)', background: category === cat ? 'rgba(47,216,238,.1)' : 'rgba(255,255,255,.025)', color: category === cat ? 'var(--cyan)' : 'var(--text-dim)', transition: 'all .2s' }}>
                        {cat}
                    </button>
                ))}
            </div>

            {error && <div className="error-banner">{error}</div>}

            {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 280, gap: 16 }}>
                    <div className="spinner" />
                    <p style={{ color: 'var(--text-faint)', fontFamily: 'var(--font-mono)', fontSize: 13 }}>Finding freelancers…</p>
                </div>
            ) : filtered.length === 0 ? (
                <div className="dashboard-card" style={{ padding: '72px 24px', textAlign: 'center' }}>
                    <div className="empty-icon" style={{ margin: '0 auto 20px' }}><Users size={26} /></div>
                    <h4>No freelancers found</h4>
                    <p style={{ color: 'var(--text-dim)', fontSize: 14, marginTop: 8 }}>
                        {search || category !== 'All' ? 'Try adjusting your search or category.' : 'No freelancers have completed their profiles yet.'}
                    </p>
                    {(search || category !== 'All') && (
                        <button onClick={() => { setSearch(''); setCategory('All'); }} style={{ marginTop: 20, padding: '10px 24px', borderRadius: 999, border: '1px solid rgba(47,216,238,.35)', background: 'rgba(47,216,238,.08)', color: 'var(--cyan)', cursor: 'pointer', fontSize: 13.5, fontFamily: 'var(--font-body)', display: 'inline-flex', alignItems: 'center', gap: 7 }}>
                            <X size={14} /> Clear filters
                        </button>
                    )}
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
                    <AnimatePresence>
                        {filtered.map((f, i) => (
                            <FreelancerCard key={f._id} freelancer={f} index={i} onMessage={setMsgTarget} ratings={ratings} />
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>

        {/* Message Modal */}
        <AnimatePresence>
            {msgTarget && <MessageModal freelancer={msgTarget} onClose={() => setMsgTarget(null)} />}
        </AnimatePresence>
        </>
    );
}

export default ClientSearchFreelancers;
