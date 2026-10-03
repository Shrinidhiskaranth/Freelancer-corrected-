import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, ExternalLink, Send, X, MessageSquare, Star } from 'lucide-react';
import api from '../../api/axiosInstance';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
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

/* ── Star Rating Input ──────────────────── */
function StarRating({ value, onChange }) {
  const [hovered, setHovered] = useState(null);
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      {[1,2,3,4,5].map(n => (
        <button key={n} type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(null)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, transition: 'transform .15s' }}
          onMouseOver={e => e.currentTarget.style.transform = 'scale(1.2)'}
          onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          <Star size={28} fill={(hovered || value) >= n ? '#f5b93c' : 'none'} color={(hovered || value) >= n ? '#f5b93c' : 'var(--border-strong)'} />
        </button>
      ))}
    </div>
  );
}

/* ── Review Modal (Freelancer → Client) ───── */
function ReviewModal({ contract, onClose, onSubmitted }) {
  const [rating,  setRating]  = useState(0);
  const [comment, setComment] = useState('');
  const [saving,  setSaving]  = useState(false);
  const [done,    setDone]    = useState(false);
  const [error,   setError]   = useState('');

  useEffect(() => {
    const h = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  const handleSubmit = async e => {
    e.preventDefault();
    if (!rating) return setError('Please select a star rating.');
    setSaving(true); setError('');
    try {
      const res = await api.post('/reviews/submit', { projectId: contract.project._id, rating, comment });
      if (res.data.success) { setDone(true); onSubmitted && onSubmitted(); }
    } catch (err) { setError(err.response?.data?.message || 'Failed to submit.'); }
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
        style={{ width: '100%', maxWidth: 480, background: 'linear-gradient(135deg,rgba(13,17,32,.98),rgba(8,11,20,1))', borderRadius: 'var(--r-xl)', border: '1px solid var(--border-strong)', boxShadow: '0 32px 80px rgba(0,0,0,.8), 0 0 0 1px rgba(245,185,92,.1)', overflow: 'hidden' }}
      >
        <div style={{ padding: '22px 26px 18px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontWeight: 700, fontSize: 15, margin: 0 }}>Rate the Client</p>
            <p style={{ color: 'var(--warn)', fontSize: 12, margin: 0, fontFamily: 'var(--font-mono)' }}>{contract.project.title}</p>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,.05)', border: '1px solid var(--border-strong)', color: 'var(--text-dim)', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><X size={14} /></button>
        </div>
        <div style={{ padding: '26px 26px 22px' }}>
          {done ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: 48, marginBottom: 14 }}>⭐</div>
              <p style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>Review Submitted!</p>
              <p style={{ color: 'var(--text-dim)', fontSize: 14 }}>Thank you for your feedback.</p>
              <button onClick={onClose} style={{ marginTop: 20, padding: '10px 24px', borderRadius: 999, border: 'none', background: 'linear-gradient(90deg,var(--warn),var(--cyan))', color: '#04070d', fontWeight: 700, cursor: 'pointer' }}>Close</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {error && <div className="error-banner">{error}</div>}
              <div style={{ textAlign: 'center' }}>
                <p style={{ color: 'var(--text-dim)', fontSize: 13.5, marginBottom: 14 }}>How was working with this client?</p>
                <StarRating value={rating} onChange={setRating} />
                <p style={{ color: 'var(--warn)', fontSize: 13, marginTop: 10, fontWeight: 600 }}>
                  {rating === 1 ? 'Poor' : rating === 2 ? 'Fair' : rating === 3 ? 'Good' : rating === 4 ? 'Very Good' : rating === 5 ? 'Excellent!' : ''}
                </p>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 8 }}>Review (optional)</label>
                <textarea rows={3} value={comment} onChange={e => setComment(e.target.value)}
                  placeholder="Share your experience working with this client…"
                  style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid var(--border-strong)', background: 'rgba(255,255,255,.04)', color: 'var(--text)', fontSize: 14, resize: 'vertical', fontFamily: 'var(--font-body)', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" onClick={onClose} style={{ padding: '10px 20px', borderRadius: 999, border: '1px solid var(--border-strong)', background: 'rgba(255,255,255,.03)', color: 'var(--text-dim)', fontSize: 13.5, cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={saving || !rating} style={{ padding: '10px 22px', borderRadius: 999, border: 'none', background: rating ? 'linear-gradient(90deg,#f5b93c,var(--cyan))' : 'rgba(255,255,255,.06)', color: rating ? '#04070d' : 'var(--text-faint)', fontWeight: 700, fontSize: 13.5, cursor: rating && !saving ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', gap: 7 }}>
                  {saving ? 'Submitting…' : <><Star size={14} /> Submit Review</>}
                </button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function FreelancerContracts() {
    const navigate = useNavigate();
    const [contracts, setContracts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [selectedContract, setSelectedContract] = useState(null);
    const [updateText, setUpdateText] = useState('');
    const [fileLink, setFileLink] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [reviewTarget, setReviewTarget] = useState(null); // contract to review
    const [reviewedIds, setReviewedIds] = useState(new Set()); // project ids already reviewed

    useEffect(() => {
        fetchContracts();
    }, []);

    const fetchContracts = async () => {
        try {
            setLoading(true);
            const res = await api.get('/proposals/my-contracts');
            if (res.data.success) {
                setContracts(res.data.contracts);
            }
        } catch (err) {
            console.error(err);
            setError('Failed to load contracts.');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await api.post(`/projects/${selectedContract.project._id}/progress`, {
                text: updateText,
                fileLink
            });
            if (res.data.success) {
                // Refresh list
                await fetchContracts();
                setSelectedContract(null);
                setUpdateText('');
                setFileLink('');
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to submit update');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="dashboard-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
            <div className="spinner" />
        </div>
    );

    return (
        <div className="dashboard-page">
            <div className="dashboard-header-flex">
                <div>
                    <h1 style={{ fontSize: '28px', margin: '0 0 8px 0' }}>Active Contracts</h1>
                    <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Manage your ongoing projects and submit progress updates.</p>
                </div>
            </div>

            {error && <div className="error-banner">{error}</div>}

            <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {contracts.length === 0 ? (
                    <div style={{ padding: '60px 24px', textAlign: 'center', background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                            <Briefcase size={28} color="var(--text-muted)" />
                        </div>
                        <h3 style={{ margin: '0 0 8px 0' }}>No active contracts</h3>
                        <p style={{ color: 'var(--text-secondary)', margin: '0 0 24px 0' }}>When a client accepts your bid, it will appear here.</p>
                        <Button variant="primary" onClick={() => navigate('/freelancer/browse-projects')}>Find Work</Button>
                    </div>
                ) : (
                    contracts.map(contract => (
                        <Card key={contract._id} style={{ padding: '0', overflow: 'hidden' }}>
                            <div style={{ padding: '24px', borderBottom: '1px solid var(--border-color)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                    <div>
                                        <h3 style={{ fontSize: '20px', margin: '0 0 8px 0', color: 'var(--text)' }}>
                                            {contract.project.title}
                                        </h3>
                                        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', fontSize: '14px', color: 'var(--text-secondary)' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                Client: {contract.project.clientId?.fullName || 'Unknown'}
                                            </span>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
                                        <Badge variant={contract.project.status === 'Completed' ? 'success' : 'primary'}>
                                            {contract.project.status}
                                        </Badge>
                                        <Badge variant={contract.project.paymentStatus === 'Paid' ? 'success' : contract.project.paymentStatus === 'Escrow' ? 'warning' : 'neutral'}>
                                            Payment: {contract.project.paymentStatus || 'Unknown'}
                                        </Badge>
                                    </div>
                                </div>
                                
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
                                    <div>
                                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Agreed Amount</div>
                                        <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text)' }}>${contract.bidAmount}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Timeline</div>
                                        <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text)' }}>{contract.estimatedTime}</div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px' }}>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => navigate('/freelancer/messages', {
                                                state: {
                                                    initialActiveConv: {
                                                        projectId: contract.project._id,
                                                        projectTitle: contract.project.title,
                                                        otherUserId: contract.project.clientId?._id || contract.project.clientId,
                                                        otherUserName: contract.project.clientId?.fullName || 'Client'
                                                    }
                                                }
                                            })}
                                            style={{ borderColor: 'var(--border-strong)', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: 6 }}
                                        >
                                            <MessageSquare size={14} /> Message Client
                                        </Button>
                                        <Button 
                                            variant="outline" 
                                            size="sm" 
                                            disabled={contract.project.status === 'Completed'}
                                            onClick={() => setSelectedContract(contract)}
                                            style={{ borderColor: 'var(--cyan)', color: 'var(--cyan)' }}
                                        >
                                            <Send size={14} style={{ marginRight: 6 }} /> Add Update
                                        </Button>
                                        {/* Rate Client — only for completed projects */}
                                        {contract.project.status === 'Completed' && (
                                            reviewedIds.has(contract.project._id) ? (
                                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 14px', borderRadius: 999, background: 'rgba(245,185,92,.08)', border: '1px solid rgba(245,185,92,.25)', color: '#f5b93c', fontSize: 13, fontWeight: 600 }}>
                                                    <Star size={13} fill="#f5b93c" color="#f5b93c" /> Reviewed
                                                </span>
                                            ) : (
                                                <button onClick={() => setReviewTarget(contract)}
                                                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 16px', borderRadius: 999, border: 'none', background: 'linear-gradient(90deg,#f5b93c,var(--cyan))', color: '#fff !important', fontWeight: 700, fontSize: 13, cursor: 'pointer', boxShadow: '0 4px 14px rgba(245,185,92,.25)' }}
                                                >
                                                    <Star size={13} /> Rate Client
                                                </button>
                                            )
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))
                )}
            </div>

            {/* Update Modal */}
            <AnimatePresence>
                {selectedContract && (
                    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <motion.div 
                            initial={{ opacity: 0, y: 50, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.95 }}
                            style={{ background: 'linear-gradient(135deg,rgba(13,17,32,.99),rgba(8,11,20,1))', width: '100%', maxWidth: '600px', borderRadius: 'var(--r-xl)', border: '1px solid var(--border-strong)', boxShadow: '0 32px 80px rgba(0,0,0,.85), 0 0 0 1px rgba(47,216,238,.12)', overflow: 'hidden' }}
                        >
                            <div style={{ padding: '24px 28px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: 700 }}>Submit Progress Update</h3>
                                    <p style={{ margin: 0, color: 'var(--cyan)', fontSize: '13px', fontFamily: 'var(--font-mono)' }}>For: {selectedContract.project.title}</p>
                                </div>
                                <button onClick={() => setSelectedContract(null)} style={{ background: 'rgba(255,255,255,.05)', border: '1px solid var(--border-strong)', color: 'var(--text-dim)', borderRadius: '50%', width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background .2s' }}
                                    onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,.1)'}
                                    onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,.05)'}
                                >
                                    <X size={15} />
                                </button>
                            </div>
                            
                            <form onSubmit={handleUpdateSubmit} style={{ padding: '24px 28px' }}>
                                <div style={{ marginBottom: '24px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '.08em' }}>Update Details <span style={{ color: 'var(--cyan)', marginLeft: 4 }}>*</span></label>
                                    <textarea 
                                        required
                                        rows="4"
                                        value={updateText}
                                        onChange={(e) => setUpdateText(e.target.value)}
                                        style={{ ...inp, resize: 'vertical', lineHeight: 1.65 }}
                                        onFocus={focusIn} onBlur={focusOut}
                                        placeholder="What have you completed? E.g. Finished the home page design..."
                                    ></textarea>
                                </div>
                                <div style={{ marginBottom: '28px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '.08em' }}>Deliverable Link (Optional)</label>
                                    <div style={{ position: 'relative' }}>
                                        <ExternalLink size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)', pointerEvents: 'none' }} />
                                        <input 
                                            type="url" 
                                            value={fileLink}
                                            onChange={(e) => setFileLink(e.target.value)}
                                            style={{ ...inp, paddingLeft: 40 }}
                                            onFocus={focusIn} onBlur={focusOut}
                                            placeholder="Google Drive, Figma, GitHub, etc."
                                        />
                                    </div>
                                    <p style={{ margin: '8px 0 0', fontSize: '12px', color: 'var(--text-dim)' }}>Provide a sharable link to your project files or software management tool.</p>
                                </div>
                                
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                                    <Button variant="ghost" type="button" onClick={() => setSelectedContract(null)}>Cancel</Button>
                                    <Button variant="primary" type="submit" disabled={submitting} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        {submitting ? 'Submitting...' : 'Send Update'} <Send size={16} />
                                    </Button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Rate Client Modal */}
            <AnimatePresence>
                {reviewTarget && (
                    <ReviewModal
                        contract={reviewTarget}
                        onClose={() => setReviewTarget(null)}
                        onSubmitted={() => {
                            setReviewedIds(prev => new Set([...prev, reviewTarget.project._id]));
                            setReviewTarget(null);
                        }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
