import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Clock, CheckCircle, XCircle, AlertCircle, Send, X, Pencil, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosInstance';
import '../../styles/dashboard.css';

const fade = {
    hidden:  { opacity: 0, y: 18 },
    visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, type: 'spring', stiffness: 300, damping: 24 } })
};

const statusConfig = {
    pending:  { icon: AlertCircle, color: 'var(--warn)',   label: 'Pending',  bg: 'rgba(245,185,92,0.1)',  border: 'rgba(245,185,92,0.3)'  },
    accepted: { icon: CheckCircle, color: 'var(--ok)',     label: 'Accepted', bg: 'rgba(62,230,168,0.1)',  border: 'rgba(62,230,168,0.3)'  },
    rejected: { icon: XCircle,     color: 'var(--danger)', label: 'Rejected', bg: 'rgba(244,123,123,0.1)', border: 'rgba(244,123,123,0.3)' },
};

const inp = {
    width: '100%', padding: '13px 16px', borderRadius: 'var(--r-sm)',
    border: '1px solid var(--border-strong)', background: 'rgba(255,255,255,.025)',
    color: 'var(--text)', fontSize: 14.5, fontFamily: 'var(--font-body)',
    outline: 'none', boxSizing: 'border-box', transition: 'border-color .25s, box-shadow .25s',
};
const onFocus = e => { e.target.style.borderColor = 'var(--cyan)'; e.target.style.boxShadow = '0 0 0 4px rgba(47,216,238,.1)'; };
const onBlur  = e => { e.target.style.borderColor = 'var(--border-strong)'; e.target.style.boxShadow = 'none'; };


/* ── Edit Modal ──────────────────────────────── */
function EditModal({ proposal, onClose, onSaved }) {
    const [coverLetter,   setCoverLetter]   = useState(proposal.coverLetter || '');
    const [bidAmount,     setBidAmount]     = useState(proposal.bidAmount || '');
    const [estimatedTime, setEstimatedTime] = useState(proposal.estimatedTime || '');
    const [saving,  setSaving]  = useState(false);
    const [error,   setError]   = useState('');

    useEffect(() => {
        const handler = e => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [onClose]);

    const handleSave = async e => {
        e.preventDefault();
        setSaving(true); setError('');
        try {
            const res = await api.put(`/proposals/${proposal._id}/edit`, { coverLetter, bidAmount, estimatedTime });
            if (res.data.success) { onSaved(res.data.proposal); onClose(); }
        } catch (err) { setError(err.response?.data?.message || 'Failed to save.'); }
        finally { setSaving(false); }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
        >
            <motion.div initial={{ opacity: 0, scale: .92, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: .92, y: 20 }}
                transition={{ ease: [.16,.84,.44,1], duration: .3 }}
                onClick={e => e.stopPropagation()}
                style={{ width: '100%', maxWidth: 520, background: 'linear-gradient(135deg,rgba(13,17,32,.98),rgba(8,11,20,1))', borderRadius: 'var(--r-xl)', border: '1px solid var(--border-strong)', boxShadow: '0 32px 80px rgba(0,0,0,.8), 0 0 0 1px rgba(139,107,245,.12)', overflow: 'hidden' }}
            >
                <div style={{ padding: '22px 26px 18px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                        <p style={{ fontWeight: 700, fontSize: 15, margin: 0 }}>Edit Bid</p>
                        <p style={{ color: 'var(--violet)', fontSize: 12, margin: 0, fontFamily: 'var(--font-mono)' }}>{proposal.project?.title}</p>
                    </div>
                    <button onClick={onClose} style={{ background: 'rgba(255,255,255,.05)', border: '1px solid var(--border-strong)', color: 'var(--text-dim)', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        <X size={14} />
                    </button>
                </div>

                <form onSubmit={handleSave} style={{ padding: '22px 26px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {error && <div className="error-banner">{error}</div>}

                    <div>
                        <label style={{ display: 'block', fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 8 }}>Cover Letter</label>
                        <textarea rows={4} value={coverLetter} onChange={e => setCoverLetter(e.target.value)}
                            style={{ ...inp, resize: 'vertical', lineHeight: 1.65 }} onFocus={onFocus} onBlur={onBlur} />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div>
                            <label style={{ display: 'block', fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 8 }}>Bid Amount ($)</label>
                            <input type="number" value={bidAmount} onChange={e => setBidAmount(e.target.value)}
                                style={inp} onFocus={onFocus} onBlur={onBlur} />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 8 }}>Timeline</label>
                            <input type="text" placeholder="e.g. 2 weeks" value={estimatedTime} onChange={e => setEstimatedTime(e.target.value)}
                                style={inp} onFocus={onFocus} onBlur={onBlur} />
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
                        <button type="button" onClick={onClose} style={{ padding: '10px 20px', borderRadius: 999, border: '1px solid var(--border-strong)', background: 'rgba(255,255,255,.03)', color: 'var(--text-dim)', fontSize: 13.5, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>Cancel</button>
                        <button type="submit" disabled={saving} style={{ padding: '10px 22px', borderRadius: 999, border: 'none', background: 'linear-gradient(90deg,var(--violet),var(--cyan))', color: '#04070d', fontWeight: 700, fontSize: 13.5, cursor: saving ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 7, fontFamily: 'var(--font-body)' }}>
                            {saving ? 'Saving…' : <><Send size={13} /> Save Changes</>}
                        </button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
}

/* ── Main Page ───────────────────────────────── */
function FreelancerBids() {
    const [proposals,  setProposals]  = useState([]);
    const [loading,    setLoading]    = useState(true);
    const [error,      setError]      = useState(null);
    const [editTarget, setEditTarget] = useState(null);
    const navigate = useNavigate();

    useEffect(() => { fetchProposals(); }, []);

    const fetchProposals = async () => {
        try {
            setLoading(true); setError(null);
            const res = await api.get('/proposals/my-proposals');
            if (res.data.success) setProposals(res.data.proposals);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load your bids.');
        } finally { setLoading(false); }
    };

    return (
        <>
        <div>
            {/* Header */}
            <motion.div variants={fade} custom={0} initial="hidden" animate="visible" style={{ marginBottom: 28 }}>
                <div className="dashboard-header-flex">
                    <div>
                        <h1 style={{ fontSize: 26 }}>My Bids</h1>
                        <p style={{ color: 'var(--text-dim)', marginTop: 6, fontSize: 14.5 }}>Track every proposal you've sent and its current status.</p>
                    </div>
                </div>
            </motion.div>

            {error && <div className="error-banner">{error}</div>}

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '80px', gap: 16, color: 'var(--text-dim)' }}>
                    <div className="spinner" /> Loading your bids…
                </div>
            ) : proposals.length === 0 ? (
                <motion.div variants={fade} custom={1} initial="hidden" animate="visible" className="dashboard-card" style={{ padding: '64px 24px', textAlign: 'center' }}>
                    <div className="empty-icon" style={{ margin: '0 auto 20px' }}><FileText size={24} /></div>
                    <h4>No bids yet</h4>
                    <p style={{ color: 'var(--text-dim)', fontSize: 14, maxWidth: 340, margin: '12px auto 24px', lineHeight: 1.6 }}>
                        Submit a proposal from Browse Projects and it'll appear here with its status.
                    </p>
                    <button onClick={() => navigate('/freelancer/browse-projects')} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 22px', borderRadius: 999, color: 'var(--cyan)', background: 'rgba(47,216,238,.08)', border: '1px solid rgba(47,216,238,.35)', fontWeight: 600, fontSize: 14, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
                        Browse Projects →
                    </button>
                </motion.div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {proposals.map((proposal, i) => {
                        const s    = statusConfig[proposal.status] || statusConfig.pending;
                        const Icon = s.icon;
                        return (
                            <motion.div key={proposal._id} custom={i} variants={fade} initial="hidden" animate="visible"
                                whileHover={{ y: -4 }}
                                className="dashboard-card"
                                style={{ padding: '26px 28px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}
                            >
                                {/* Left neon bar */}
                                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: 'linear-gradient(180deg,var(--cyan),var(--violet))', borderRadius: '3px 0 0 3px' }} />

                                <div style={{ flex: 1, paddingLeft: 8 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10, flexWrap: 'wrap' }}>
                                        <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: 'var(--cyan)', letterSpacing: '-.02em' }}>
                                            {proposal.project?.title || 'Unknown Project'}
                                        </h3>
                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 12px', borderRadius: 99, fontSize: 11.5, fontWeight: 700, fontFamily: 'var(--font-mono)', background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
                                            <Icon size={12} /> {s.label}
                                        </span>
                                    </div>

                                    <p style={{ margin: '0 0 14px', color: 'var(--text-dim)', fontSize: 14, lineHeight: 1.65, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                        {proposal.coverLetter}
                                    </p>

                                    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '6px 13px', borderRadius: 99, background: 'rgba(47,216,238,.08)', border: '1px solid rgba(47,216,238,.2)', fontSize: 13, fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--cyan)' }}>
                                            <span style={{ fontFamily: 'var(--font-mono)' }}>₹</span> {proposal.bidAmount}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '6px 13px', borderRadius: 99, background: 'rgba(139,107,245,.08)', border: '1px solid rgba(139,107,245,.2)', fontSize: 13, fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--violet)' }}>
                                            <Clock size={13} /> {proposal.estimatedTime}
                                        </div>
                                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-faint)', display: 'flex', alignItems: 'center' }}>
                                            {new Date(proposal.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>

                                {/* Action Button Group */}
                                <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
                                    {/* Message Client button */}
                                    {(proposal.project?.clientId || proposal.project?.client) && (
                                        <button onClick={() => {
                                            const clientObj = proposal.project.clientId || proposal.project.client;
                                            navigate('/freelancer/messages', {
                                                state: {
                                                    initialActiveConv: {
                                                        projectId: proposal.project._id,
                                                        projectTitle: proposal.project.title,
                                                        otherUserId: clientObj._id || clientObj,
                                                        otherUserName: clientObj.fullName || 'Client'
                                                    }
                                                }
                                            });
                                        }}
                                            style={{ padding: '10px 20px', borderRadius: 999, border: '1px solid rgba(47,216,238,.35)', background: 'rgba(47,216,238,.08)', color: 'var(--cyan)', fontWeight: 600, fontSize: 13.5, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7, fontFamily: 'var(--font-body)', transition: 'background .2s' }}
                                            onMouseOver={e => e.currentTarget.style.background = 'rgba(47,216,238,.18)'}
                                            onMouseOut={e => e.currentTarget.style.background = 'rgba(47,216,238,.08)'}
                                        >
                                            <MessageSquare size={14} /> Message Client
                                        </button>
                                    )}

                                    {/* Edit button — for pending and rejected bids */}
                                    {(proposal.status === 'pending' || proposal.status === 'rejected') && (
                                        <button onClick={() => setEditTarget(proposal)}
                                            style={{ padding: '10px 20px', borderRadius: 999, border: '1px solid rgba(139,107,245,.35)', background: 'rgba(139,107,245,.08)', color: 'var(--violet)', fontWeight: 600, fontSize: 13.5, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7, fontFamily: 'var(--font-body)', transition: 'background .2s' }}
                                            onMouseOver={e => e.currentTarget.style.background = 'rgba(139,107,245,.18)'}
                                            onMouseOut={e => e.currentTarget.style.background = 'rgba(139,107,245,.08)'}
                                        >
                                            <Pencil size={14} /> Edit Bid
                                        </button>
                                    )}
                                </div>

                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>

        {/* Message Modal */}
        <AnimatePresence>
            {editTarget && (
                <EditModal
                    proposal={editTarget}
                    onClose={() => setEditTarget(null)}
                    onSaved={updated => setProposals(prev => prev.map(p => p._id === updated._id ? { ...p, ...updated } : p))}
                />
            )}
        </AnimatePresence>
        </>
    );
}

export default FreelancerBids;
