import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Briefcase, ArrowLeft, CheckCircle, XCircle,
    DollarSign, Calendar, Star, Users, Clock,
    MessageSquare, Send, X, ExternalLink, Activity
} from "lucide-react";
import api from "../../api/axiosInstance";
import { motion, AnimatePresence } from "framer-motion";
import "../../styles/dashboard.css";

/* ── helpers ─────────────────────────────────── */
const statusColor = {
    Open:          { color: "var(--cyan)",    bg: "rgba(47,216,238,.1)",  border: "rgba(47,216,238,.3)"  },
    "In Progress": { color: "var(--warn)",    bg: "rgba(245,185,92,.1)",  border: "rgba(245,185,92,.3)"  },
    Completed:     { color: "var(--ok)",      bg: "rgba(62,230,168,.1)",  border: "rgba(62,230,168,.3)"  },
    Cancelled:     { color: "var(--danger)",  bg: "rgba(244,123,123,.1)", border: "rgba(244,123,123,.3)" },
};
const proposalColor = {
    accepted: { color: "var(--ok)",     bg: "rgba(62,230,168,.1)",  border: "rgba(62,230,168,.3)"  },
    rejected: { color: "var(--danger)", bg: "rgba(244,123,123,.1)", border: "rgba(244,123,123,.3)" },
    pending:  { color: "var(--warn)",   bg: "rgba(245,185,92,.1)",  border: "rgba(245,185,92,.3)"  },
};

/* ── Star Badge (inline rating display) ─────── */
const StarBadge = ({ avg, total }) => {
    if (!avg) {
        // No reviews yet — show 5 empty blue stars
        return (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
                {[1,2,3,4,5].map(n => (
                    <Star key={n} size={13} fill="none" color="var(--cyan)" strokeWidth={1.5} />
                ))}
                <span style={{ fontSize: 11, color: 'var(--text-faint)', fontFamily: 'var(--font-mono)', marginLeft: 4 }}>New</span>
            </span>
        );
    }
    return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 9px', borderRadius: 99, background: 'rgba(245,185,92,.1)', border: '1px solid rgba(245,185,92,.25)', fontSize: 12, fontWeight: 700, color: '#f5b93c', fontFamily: 'var(--font-mono)' }}>
            <Star size={11} fill="#f5b93c" color="#f5b93c" />
            {avg} <span style={{ color: 'var(--text-faint)', fontWeight: 400 }}>({total})</span>
        </span>
    );
};


const StatusBadge = ({ label, map }) => {
    const c = (map[label] || map["pending"]);
    return (
        <span style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "5px 13px", borderRadius: 99,
            fontSize: 11, fontWeight: 700, letterSpacing: ".06em",
            fontFamily: "var(--font-mono)", textTransform: "uppercase",
            color: c.color, background: c.bg, border: `1px solid ${c.border}`,
        }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: c.color, display: "inline-block", animation: "breathe 2s infinite" }} />
            {label}
        </span>
    );
};


const MetaStat = ({ icon: Icon, label, value, accent }) => (
    <div style={{
        display: "flex", flexDirection: "column", gap: 6,
        padding: "16px 20px", borderRadius: "var(--r-md)",
        background: "rgba(255,255,255,.025)", border: "1px solid var(--border)", flex: 1,
    }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7, color: "var(--text-faint)", fontSize: 12, fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: ".06em" }}>
            <Icon size={13} /> {label}
        </div>
        <span style={{ fontSize: 18, fontWeight: 700, color: accent || "var(--text)", fontFamily: "var(--font-mono)" }}>{value}</span>
    </div>
);

/* ── Message Modal ───────────────────────────── */
function MessageModal({ project, freelancer, onClose }) {
    const [text,     setText]     = useState("");
    const [sending,  setSending]  = useState(false);
    const [sent,     setSent]     = useState(false);
    const [error,    setError]    = useState("");
    const inputRef = useRef(null);

    useEffect(() => { inputRef.current?.focus(); }, []);

    // Close on Escape
    useEffect(() => {
        const handler = (e) => { if (e.key === "Escape") onClose(); };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [onClose]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!text.trim()) return;
        setSending(true); setError("");
        try {
            const res = await api.post("/messages/send", {
                receiverId: freelancer.userId,
                projectId:  project._id,
                content:    text.trim(),
            });
            if (res.data.success) {
                setSent(true);
                setTimeout(onClose, 1600);
            }
        } catch (err) {
            setError(err.response?.data?.message || "Failed to send message.");
        } finally { setSending(false); }
    };

    const name    = freelancer.fullName || "Freelancer";
    const initial = name[0].toUpperCase();

    return (
        /* Backdrop */
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
                position: "fixed", inset: 0, zIndex: 1000,
                background: "rgba(0,0,0,.75)", backdropFilter: "blur(8px)",
                display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
            }}
        >
            {/* Modal panel */}
            <motion.div
                initial={{ opacity: 0, scale: .92, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: .92, y: 20 }}
                transition={{ ease: [.16,.84,.44,1], duration: .3 }}
                onClick={e => e.stopPropagation()}
                style={{
                    width: "100%", maxWidth: 520,
                    background: "linear-gradient(135deg,rgba(13,17,32,.98),rgba(8,11,20,1))",
                    borderRadius: "var(--r-xl)",
                    border: "1px solid var(--border-strong)",
                    boxShadow: "0 32px 80px rgba(0,0,0,.8), 0 0 0 1px rgba(47,216,238,.12)",
                    overflow: "hidden",
                    position: "relative",
                }}
            >
                {/* Top sheen */}
                <div style={{ position: "absolute", top: 0, left: "15%", right: "15%", height: 1, background: "linear-gradient(90deg,transparent,rgba(47,216,238,.4),transparent)", pointerEvents: "none" }} />

                {/* Header */}
                <div style={{ padding: "24px 28px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                        {/* Avatar */}
                        <div style={{
                            width: 44, height: 44, borderRadius: "50%", flexShrink: 0,
                            background: "linear-gradient(135deg,var(--cyan),var(--violet))",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontFamily: "var(--font-mono)", fontWeight: 800, fontSize: 18, color: "#04070d",
                            boxShadow: "0 0 16px rgba(47,216,238,.3)",
                        }}>{initial}</div>
                        <div>
                            <p style={{ fontWeight: 700, fontSize: 15, margin: 0, letterSpacing: "-.02em" }}>{name}</p>
                            <p style={{ color: "var(--cyan)", fontSize: 12, margin: 0, fontFamily: "var(--font-mono)" }}>
                                re: {project.title}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} style={{ background: "rgba(255,255,255,.05)", border: "1px solid var(--border-strong)", color: "var(--text-dim)", borderRadius: "50%", width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "background .2s" }}
                        onMouseOver={e => e.currentTarget.style.background = "rgba(255,255,255,.1)"}
                        onMouseOut={e => e.currentTarget.style.background = "rgba(255,255,255,.05)"}
                    >
                        <X size={15} />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSend} style={{ padding: "24px 28px" }}>
                    {sent ? (
                        <motion.div
                            initial={{ opacity: 0, scale: .9 }} animate={{ opacity: 1, scale: 1 }}
                            style={{ textAlign: "center", padding: "24px 0" }}
                        >
                            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(62,230,168,.1)", border: "1px solid rgba(62,230,168,.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", boxShadow: "0 0 24px -8px rgba(62,230,168,.5)" }}>
                                <CheckCircle size={26} color="var(--ok)" />
                            </div>
                            <p style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>Message Sent!</p>
                            <p style={{ color: "var(--text-dim)", fontSize: 14 }}>Check Messages to continue the conversation.</p>
                        </motion.div>
                    ) : (
                        <>
                            {error && <div className="error-banner" style={{ marginBottom: 16 }}>{error}</div>}

                            <label style={{ display: "block", fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 10 }}>
                                Your Message
                            </label>
                            <textarea
                                ref={inputRef}
                                rows={5}
                                placeholder={`Hi ${name.split(' ')[0]}, I'd like to discuss the project…`}
                                value={text}
                                onChange={e => setText(e.target.value)}
                                style={{
                                    width: "100%", padding: "14px 16px",
                                    borderRadius: "var(--r-md)",
                                    border: "1px solid var(--border-strong)",
                                    background: "rgba(255,255,255,.025)",
                                    color: "var(--text)", fontSize: 14.5,
                                    fontFamily: "var(--font-body)", lineHeight: 1.65,
                                    resize: "vertical", outline: "none", boxSizing: "border-box",
                                    transition: "border-color .25s, box-shadow .25s",
                                }}
                                onFocus={e => { e.target.style.borderColor = "var(--cyan)"; e.target.style.boxShadow = "0 0 0 4px rgba(47,216,238,.1)"; }}
                                onBlur={e => { e.target.style.borderColor = "var(--border-strong)"; e.target.style.boxShadow = "none"; }}
                            />

                            <div style={{ display: "flex", gap: 12, marginTop: 20, justifyContent: "flex-end" }}>
                                <button type="button" onClick={onClose} style={{
                                    padding: "11px 22px", borderRadius: 999,
                                    border: "1px solid var(--border-strong)",
                                    background: "rgba(255,255,255,.03)",
                                    color: "var(--text-dim)", fontSize: 14, cursor: "pointer",
                                    fontFamily: "var(--font-body)", transition: "background .2s",
                                }}>Cancel</button>
                                <button type="submit" disabled={!text.trim() || sending} style={{
                                    padding: "11px 26px", borderRadius: 999, border: "none",
                                    background: text.trim() && !sending
                                        ? "linear-gradient(90deg,var(--cyan),var(--violet))"
                                        : "rgba(255,255,255,.06)",
                                    color: text.trim() && !sending ? "#04070d" : "var(--text-faint)",
                                    fontWeight: 700, fontSize: 14, cursor: text.trim() && !sending ? "pointer" : "not-allowed",
                                    display: "flex", alignItems: "center", gap: 8,
                                    fontFamily: "var(--font-body)",
                                    transition: "box-shadow .25s, transform .2s",
                                }}
                                    onMouseOver={e => { if (text.trim() && !sending) e.currentTarget.style.boxShadow = "0 6px 24px -6px rgba(47,216,238,.6)"; }}
                                    onMouseOut={e => e.currentTarget.style.boxShadow = "none"}
                                >
                                    {sending
                                        ? <><span style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid rgba(4,7,13,.3)", borderTopColor: "#04070d", animation: "spin .7s linear infinite", display: "inline-block" }} /> Sending…</>
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

/* ── Star Rating Input ───────────────────── */
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
                    <Star size={28}
                        fill={(hovered || value) >= n ? '#f5b93c' : 'none'}
                        color={(hovered || value) >= n ? '#f5b93c' : 'var(--border-strong)'}
                    />
                </button>
            ))}
        </div>
    );
}

/* ── Review Modal ───────────────────────── */
function ReviewModal({ project, onClose, onSubmitted }) {
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
            const res = await api.post('/reviews/submit', { projectId: project._id, rating, comment });
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
                <div style={{ position: 'absolute', top: 0, left: '15%', right: '15%', height: 1, background: 'linear-gradient(90deg,transparent,rgba(245,185,92,.4),transparent)', pointerEvents: 'none' }} />

                <div style={{ padding: '22px 26px 18px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                        <p style={{ fontWeight: 700, fontSize: 15, margin: 0 }}>Rate the Freelancer</p>
                        <p style={{ color: 'var(--warn)', fontSize: 12, margin: 0, fontFamily: 'var(--font-mono)' }}>{project.title}</p>
                    </div>
                    <button onClick={onClose} style={{ background: 'rgba(255,255,255,.05)', border: '1px solid var(--border-strong)', color: 'var(--text-dim)', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        <X size={14} />
                    </button>
                </div>

                <div style={{ padding: '26px 26px 22px' }}>
                    {done ? (
                        <motion.div initial={{ opacity: 0, scale: .9 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center', padding: '20px 0' }}>
                            <div style={{ fontSize: 48, marginBottom: 14 }}>⭐</div>
                            <p style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>Review Submitted!</p>
                            <p style={{ color: 'var(--text-dim)', fontSize: 14 }}>Thank you for your feedback.</p>
                            <button onClick={onClose} style={{ marginTop: 20, padding: '10px 24px', borderRadius: 999, border: 'none', background: 'linear-gradient(90deg,var(--warn),var(--cyan))', color: '#04070d', fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>Close</button>
                        </motion.div>
                    ) : (
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                            {error && <div className="error-banner">{error}</div>}

                            <div style={{ textAlign: 'center' }}>
                                <p style={{ color: 'var(--text-dim)', fontSize: 13.5, marginBottom: 14 }}>How was your experience with this freelancer?</p>
                                <StarRating value={rating} onChange={setRating} />
                                <p style={{ color: 'var(--warn)', fontSize: 13, marginTop: 10, fontWeight: 600 }}>
                                    {rating === 1 ? 'Poor' : rating === 2 ? 'Fair' : rating === 3 ? 'Good' : rating === 4 ? 'Very Good' : rating === 5 ? 'Excellent!' : ''}
                                </p>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 8 }}>Review (optional)</label>
                                <textarea rows={3} value={comment} onChange={e => setComment(e.target.value)}
                                    placeholder="Share your experience working with this freelancer…"
                                    style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid var(--border-strong)', background: 'rgba(255,255,255,.04)', color: 'var(--text)', fontSize: 14, resize: 'vertical', fontFamily: 'var(--font-body)', outline: 'none', boxSizing: 'border-box' }}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                                <button type="button" onClick={onClose} style={{ padding: '10px 20px', borderRadius: 999, border: '1px solid var(--border-strong)', background: 'rgba(255,255,255,.03)', color: 'var(--text-dim)', fontSize: 13.5, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>Cancel</button>
                                <button type="submit" disabled={saving || !rating} style={{ padding: '10px 22px', borderRadius: 999, border: 'none', background: rating ? 'linear-gradient(90deg,#f5b93c,var(--cyan))' : 'rgba(255,255,255,.06)', color: rating ? '#04070d' : 'var(--text-faint)', fontWeight: 700, fontSize: 13.5, cursor: rating && !saving ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', gap: 7, fontFamily: 'var(--font-body)' }}>
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
/* ── Stripe Payment Overlay Modal ─────────── */
function StripePaymentModal({ amount, freelancerName, contractId, onClose }) {
    const [gateway,      setGateway]     = useState('razorpay'); // default to razorpay for local Indian payments
    const [cardNo,    setCardNo]    = useState('');
    const [expiry,    setExpiry]    = useState('');
    const [cvc,       setCvc]       = useState('');
    const [processing,setProcessing]= useState(false);

    const formatCard = (val) => {
        const clear = val.replace(/\D/g, '');
        const match = clear.match(/(\d{1,4})/g);
        return match ? match.join(' ').substring(0, 19) : '';
    };

    const formatExpiry = (val) => {
        const clear = val.replace(/\D/g, '');
        if (clear.length >= 2) {
            return `${clear.substring(0, 2)}/${clear.substring(2, 4)}`;
        }
        return clear;
    };

    // Load Razorpay Script Helper
    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handlePay = async (e) => {
        e.preventDefault();
        setProcessing(true);

        if (gateway === 'stripe') {
            try {
                // Call API to create Stripe Checkout session URL
                const res = await api.post('/payments/create-checkout-session', { proposalId: contractId });
                if (res.data.success && res.data.url) {
                    window.location.href = res.data.url;
                } else {
                    alert('Could not initiate Stripe checkout session.');
                    setProcessing(false);
                }
            } catch (err) {
                console.error(err);
                alert(err.response?.data?.message || 'Error redirecting to Stripe payment checkout.');
                setProcessing(false);
            }
        } else {
            // Razorpay payment integration flow
            try {
                const isScriptLoaded = await loadRazorpayScript();
                if (!isScriptLoaded) {
                    alert('Failed to load Razorpay checkout script. Please check your internet connection.');
                    setProcessing(false);
                    return;
                }

                // 1. Create order on backend
                const res = await api.post('/payments/razorpay-order', { proposalId: contractId });
                if (!res.data.success) {
                    alert('Failed to create Razorpay payment order.');
                    setProcessing(false);
                    return;
                }

                const { orderId, amount: rzpAmount, currency, keyId, projectId } = res.data;

                // 2. Open Razorpay Checkout overlay options modal
                const rzpOptions = {
                    key: keyId,
                    amount: rzpAmount,
                    currency: currency,
                    name: 'Lumina Escrow',
                    description: `Escrow payment to freelancer ${freelancerName}`,
                    order_id: orderId,
                    handler: async (response) => {
                        setProcessing(true);
                        try {
                            // 3. Verify signature on backend
                            const verifyRes = await api.post('/payments/razorpay-confirm', {
                                proposalId: contractId,
                                projectId,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_signature: response.razorpay_signature
                            });

                            if (verifyRes.data.success) {
                                alert('Payment verified successfully!');
                                window.location.reload();
                            } else {
                                alert('Payment verification failed.');
                            }
                        } catch (err) {
                            alert(err.response?.data?.message || 'Verification error occurred.');
                        } finally {
                            setProcessing(false);
                        }
                    },
                    prefill: {
                        name: '',
                        email: '',
                        contact: ''
                    },
                    theme: {
                        color: '#635bff'
                    },
                    modal: {
                        ondismiss: () => {
                            setProcessing(false);
                        }
                    }
                };

                const rzpObj = new window.Razorpay(rzpOptions);
                rzpObj.on('payment.failed', function (response) {
                    alert(`Payment Failed: ${response.error.description || 'Transaction declined'}`);
                    setProcessing(false);
                });
                rzpObj.open();
            } catch (err) {
                console.error(err);
                alert(err.response?.data?.message || 'Error initializing Razorpay payment.');
                setProcessing(false);
            }
        }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: 'fixed', inset: 0, zIndex: 1100, background: 'rgba(0,0,0,.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
        >
            <motion.div initial={{ opacity: 0, scale: .93, y: 15 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: .93, y: 15 }}
                onClick={e => e.stopPropagation()}
                style={{ width: '100%', maxWidth: 440, background: '#0a0d1a', borderRadius: 'var(--r-xl)', border: '1px solid var(--border-strong)', boxShadow: '0 24px 60px rgba(0,0,0,.7)', overflow: 'hidden' }}
            >
                {/* Header banner */}
                <div style={{ background: 'linear-gradient(90deg,#635bff,#00e5ff)', height: 6 }} />
                
                <div style={{ padding: '24px 28px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#635bff', fontWeight: 800, fontSize: 13, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '.08em' }}>
                            <span style={{ fontSize: 16 }}>💳</span> Lumina Escrow Secure
                        </div>
                        <p style={{ margin: '4px 0 0 0', color: 'var(--text-dim)', fontSize: 12.5 }}>Secure Payment Escrow Setup</p>
                    </div>
                    <button onClick={onClose} style={{ background: 'rgba(255,255,255,.04)', border: '1px solid var(--border-strong)', color: 'var(--text-dim)', borderRadius: '50%', width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><X size={13} /></button>
                </div>

                <div style={{ padding: '24px 28px' }}>
                    {/* Gateway Selector tabs */}
                    <div style={{ display: 'flex', gap: 8, padding: 4, background: 'rgba(255,255,255,.03)', border: '1px solid var(--border-strong)', borderRadius: 99, marginBottom: 20 }}>
                        <button type="button" onClick={() => setGateway('razorpay')} style={{ flex: 1, padding: '8px 16px', borderRadius: 99, border: 'none', background: gateway === 'razorpay' ? 'linear-gradient(90deg,#635bff,var(--cyan))' : 'transparent', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
                            Razorpay (UPI / Cards)
                        </button>
                        <button type="button" onClick={() => setGateway('stripe')} style={{ flex: 1, padding: '8px 16px', borderRadius: 99, border: 'none', background: gateway === 'stripe' ? 'linear-gradient(90deg,#635bff,var(--cyan))' : 'transparent', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
                            Stripe Checkout
                        </button>
                    </div>

                    <form onSubmit={handlePay} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div style={{ padding: '16px 20px', background: 'rgba(99,91,255,.05)', border: '1px solid rgba(99,91,255,.15)', borderRadius: 8 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-dim)' }}>
                                    <span>Escrow Amount</span>
                                    <span style={{ color: 'var(--cyan)', fontWeight: 700 }}>${amount}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-faint)', marginTop: 4 }}>
                                    <span>Freelancer</span>
                                    <span>{freelancerName}</span>
                                </div>
                            </div>

                            {gateway === 'stripe' && (
                                <>
                                    <div>
                                        <label style={{ display: 'block', fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>Card Number</label>
                                        <input type="text" required placeholder="4242 4242 4242 4242" value={cardNo} onChange={e => setCardNo(formatCard(e.target.value))}
                                            style={{ width: '100%', padding: '11px 14px', borderRadius: 8, border: '1px solid var(--border-strong)', background: 'rgba(255,255,255,.02)', color: '#fff', fontSize: 14.5, outline: 'none' }}
                                        />
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>Expiry Date</label>
                                            <input type="text" required placeholder="MM/YY" value={expiry} onChange={e => setExpiry(formatExpiry(e.target.value))}
                                                style={{ width: '100%', padding: '11px 14px', borderRadius: 8, border: '1px solid var(--border-strong)', background: 'rgba(255,255,255,.02)', color: '#fff', fontSize: 14.5, outline: 'none' }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>CVC</label>
                                            <input type="text" required placeholder="123" maxLength={3} value={cvc} onChange={e => setCvc(e.target.value.replace(/\D/g, ''))}
                                                style={{ width: '100%', padding: '11px 14px', borderRadius: 8, border: '1px solid var(--border-strong)', background: 'rgba(255,255,255,.02)', color: '#fff', fontSize: 14.5, outline: 'none' }}
                                            />
                                        </div>
                                    </div>
                                </>
                            )}

                            {gateway === 'razorpay' && (
                                <div style={{ padding: '12px 14px', background: 'rgba(47,216,238,.03)', border: '1px solid rgba(47,216,238,.12)', borderRadius: 8, textAlign: 'center', fontSize: 13, color: 'var(--text-dim)' }}>
                                    📱 Clicking pay will launch the Razorpay Checkout popup supporting **UPI QR, Cards, and NetBanking**.
                                </div>
                            )}

                            <button type="submit" disabled={processing} style={{ padding: '12px 24px', borderRadius: 999, border: 'none', background: 'linear-gradient(90deg,#635bff,var(--cyan))', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'var(--font-body)', marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                                {processing ? (
                                    <>Escrowing payment...</>
                                ) : (
                                    <>Pay & Start Project</>
                                )}
                            </button>
                        </form>
                </div>
            </motion.div>
        </motion.div>
    );
}

/* ── Main Component ──────────────────────────── */
function ClientProjectDetails() {
    const { id }     = useParams();
    const navigate   = useNavigate();
    const [project,    setProject]    = useState(null);
    const [proposals,  setProposals]  = useState([]);
    const [loading,    setLoading]    = useState(true);
    const [error,      setError]      = useState("");
    const [actionId,   setActionId]   = useState(null);
    const [msgTarget,  setMsgTarget]  = useState(null);
    const [reviewOpen, setReviewOpen] = useState(false);
    const [hasReviewed, setHasReviewed] = useState(false);
    const [ratings, setRatings] = useState({}); // freelancerId → { avg, total }
    const [stripeTarget, setStripeTarget] = useState(null); // { proposalId, freelancerName, amount }
    const [aiMatches, setAiMatches] = useState([]);
    const [activeTab, setActiveTab] = useState("proposals");

    useEffect(() => {
        (async () => {
            try {
                // Check if returning from a successful Stripe payment redirect
                const params = new URLSearchParams(window.location.search);
                const isSuccess = params.get('payment_success');
                const proposalId = params.get('proposal_id');
                
                if (isSuccess && proposalId) {
                    setLoading(true);
                    // Confirm payment direct to update DB state securely
                    await api.post('/payments/confirm-direct', { proposalId, projectId: id });
                    // Remove queries from URL
                    window.history.replaceState({}, document.title, window.location.pathname);
                }

                const [pRes, propRes, aiRes] = await Promise.all([
                    api.get(`/projects/${id}`),
                    api.get(`/proposals/project/${id}`),
                    api.get(`/ai/project/${id}/matches`).catch(() => ({ data: { success: false, matches: [] } }))
                ]);
                if (pRes.data.success)    setProject(pRes.data.project);
                if (propRes.data.success) {
                    const props = propRes.data.proposals;
                    setProposals(props);
                    // Fetch ratings for all freelancers in parallel
                    const freelancerIds = [...new Set(props.map(p => p.freelancer?._id).filter(Boolean))];
                    const ratingResults = await Promise.all(
                        freelancerIds.map(fid => api.get(`/reviews/user/${fid}`).catch(() => null))
                    );
                    const ratingMap = {};
                    freelancerIds.forEach((fid, idx) => {
                        const data = ratingResults[idx]?.data;
                        if (data?.averageRating) ratingMap[fid] = { avg: data.averageRating, total: data.totalReviews };
                    });
                    setRatings(ratingMap);
                }
                if (aiRes.data.success) {
                    setAiMatches(aiRes.data.matches);
                }
                // Check if already reviewed
                const revRes = await api.get(`/reviews/check/${id}`).catch(() => null);
                if (revRes?.data?.hasReviewed) setHasReviewed(true);
            } catch (err) { 
                console.error(err);
                setError("Failed to load project details."); 
            }
            finally  { setLoading(false); }
        })();
    }, [id]);

    const handleAction = async (proposalId, status) => {
        if (status === "accepted") {
            // Find proposal to get freelancer name and bid amount
            const prop = proposals.find(p => p._id === proposalId);
            setStripeTarget({
                proposalId,
                freelancerName: prop?.freelancer?.fullName || "Freelancer",
                amount: prop?.bidAmount || project.budget || 0
            });
            return;
        }
        executeProposalAction(proposalId, status);
    };

    const executeProposalAction = async (proposalId, status) => {
        setActionId(proposalId);
        try {
            const res = await api.put(`/proposals/${proposalId}/status`, { status });
            if (res.data.success) {
                setProposals(prev => prev.map(p => p._id === proposalId ? { ...p, status } : p));
                if (status === "accepted") setProject(p => ({ ...p, status: "In Progress", paymentStatus: "Escrow" }));
            }
        } catch (err) { alert(err.response?.data?.message || "Failed to update proposal."); }
        finally { setActionId(null); setStripeTarget(null); }
    };

    const handleCompleteProject = async () => {
        if (!window.confirm("Are you sure you want to complete this project? This will release the payment to the freelancer.")) return;
        
        try {
            const res = await api.post(`/projects/${project._id}/complete`);
            if (res.data.success) {
                setProject(p => ({ ...p, status: "Completed", paymentStatus: "Paid" }));
                alert("Project completed successfully and payment released!");
            }
        } catch (err) {
            alert(err.response?.data?.message || "Failed to complete project");
        }
    };

    if (loading) return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 320, flexDirection: "column", gap: 16 }}>
            <div className="spinner" />
            <p style={{ color: "var(--text-faint)", fontSize: 14, fontFamily: "var(--font-mono)" }}>Loading project…</p>
        </div>
    );
    if (error)    return <div className="error-banner">{error}</div>;
    if (!project) return <div className="page-placeholder">Project not found.</div>;

    const pending  = proposals.filter(p => p.status === "pending").length;
    const accepted = proposals.filter(p => p.status === "accepted").length;

    return (
        <>
            <motion.div
                className="dashboard-page"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: .4, ease: [.16,.84,.44,1] }}
            >
                {/* Back + Rate button row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <button onClick={() => navigate("/client/my-projects")} style={{
                        display: "inline-flex", alignItems: "center", gap: 8,
                        padding: "9px 18px", borderRadius: 999,
                        border: "1px solid var(--border-strong)",
                        background: "rgba(255,255,255,.03)",
                        color: "var(--text-dim)", fontSize: 13.5, cursor: "pointer",
                        fontFamily: "var(--font-body)", transition: "border-color .2s, color .2s",
                    }}
                        onMouseOver={e => { e.currentTarget.style.borderColor = "rgba(47,216,238,.4)"; e.currentTarget.style.color = "var(--cyan)"; }}
                        onMouseOut={e => { e.currentTarget.style.borderColor = "var(--border-strong)"; e.currentTarget.style.color = "var(--text-dim)"; }}
                    >
                        <ArrowLeft size={15} /> Back to Projects
                    </button>

                    {/* Rate Freelancer — only for completed projects */}
                    {project.status === 'Completed' && (
                        hasReviewed ? (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 18px', borderRadius: 999, background: 'rgba(245,185,92,.08)', border: '1px solid rgba(245,185,92,.25)', color: 'var(--warn)', fontSize: 13.5, fontFamily: 'var(--font-body)' }}>
                                <Star size={14} fill="#f5b93c" color="#f5b93c" /> Reviewed ✓
                            </span>
                        ) : (
                            <button onClick={() => setReviewOpen(true)} style={{
                                display: 'inline-flex', alignItems: 'center', gap: 8,
                                padding: '9px 20px', borderRadius: 999,
                                border: 'none', background: 'linear-gradient(90deg,#f5b93c,var(--cyan))',
                                color: '#fff !important', fontWeight: 700, fontSize: 13.5, cursor: 'pointer',
                                fontFamily: 'var(--font-body)', boxShadow: '0 4px 16px rgba(245,185,92,.3)',
                                transition: 'box-shadow .2s',
                            }}
                                onMouseOver={e => e.currentTarget.style.boxShadow = '0 8px 28px rgba(245,185,92,.5)'}
                                onMouseOut={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(245,185,92,.3)'}
                            >
                                <Star size={15} /> Rate Freelancer
                            </button>
                        )
                    )}
                </div>

                {/* Top row */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 24 }}>
                    {/* Project card */}
                    <div className="dashboard-card" style={{ padding: 32 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16, gap: 16 }}>
                            <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-.03em", margin: 0, background: "linear-gradient(135deg,#fff 60%,rgba(255,255,255,.55))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                                {project.title}
                            </h1>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
                                <StatusBadge label={project.status} map={statusColor} />
                                {project.paymentStatus && (
                                    <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 99, background: "rgba(255,255,255,.05)", border: "1px solid var(--border-strong)", color: "var(--text-dim)", textTransform: "uppercase" }}>
                                        Payment: {project.paymentStatus}
                                    </span>
                                )}
                            </div>
                        </div>
                        <p style={{ color: "var(--text-dim)", lineHeight: 1.7, marginBottom: 28, fontSize: 14.5 }}>{project.description}</p>
                        {project.requiredSkills?.length > 0 && (
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 28 }}>
                                {project.requiredSkills.map(sk => (
                                    <span key={sk} style={{ padding: "4px 12px", borderRadius: 99, fontSize: 12, fontFamily: "var(--font-mono)", fontWeight: 500, color: "var(--text-dim)", background: "rgba(255,255,255,.04)", border: "1px solid var(--border-strong)" }}>{sk}</span>
                                ))}
                            </div>
                        )}
                        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                            <MetaStat icon={DollarSign} label="Budget"   value={`₹${project.budget?.toLocaleString()}`} accent="var(--cyan)" />
                            <MetaStat icon={Calendar}   label="Deadline" value={new Date(project.deadline).toLocaleDateString()} />
                            <MetaStat icon={Star}       label="Level"    value={project.experienceLevel} />
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        <div className="dashboard-card" style={{ padding: 24 }}>
                            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 20, fontFamily: "var(--font-display)", letterSpacing: "-.01em" }}>Proposals Summary</h3>
                            {[
                                { label: "Total Received", value: proposals.length, color: "var(--text)" },
                                { label: "Pending",        value: pending,           color: "var(--warn)" },
                                { label: "Accepted",       value: accepted,          color: "var(--ok)"   },
                            ].map(({ label, value, color }) => (
                                <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
                                    <span style={{ color: "var(--text-dim)", fontSize: 13.5 }}>{label}</span>
                                    <span style={{ color, fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 20 }}>{value}</span>
                                </div>
                            ))}
                        </div>
                        <div className="dashboard-card" style={{ padding: 20 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--text-dim)", fontSize: 13 }}>
                                <Users size={15} style={{ color: "var(--violet)" }} />
                                <span>Posted {new Date(project.createdAt).toLocaleDateString()}</span>
                            </div>
                            {project.category && (
                                <div style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--text-dim)", fontSize: 13, marginTop: 12 }}>
                                    <Briefcase size={15} style={{ color: "var(--cyan)" }} />
                                    <span>{project.category}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Progress Updates (if any) */}
                {(project.progressUpdates?.length > 0 || project.status === "In Progress") && (
                    <div style={{ marginTop: 24, marginBottom: 24 }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                <h2 style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-.02em" }}>Progress Updates</h2>
                                <Activity size={18} style={{ color: "var(--cyan)" }} />
                            </div>
                            {project.status === "In Progress" && (
                                <button onClick={handleCompleteProject} style={{
                                    padding: "10px 20px", borderRadius: 999, border: "none",
                                    background: "linear-gradient(90deg,var(--ok),#2fd8ee)", color: "#04070d",
                                    fontWeight: 700, fontSize: 13.5, cursor: "pointer", display: "flex", alignItems: "center", gap: 7,
                                    fontFamily: "var(--font-body)", transition: "box-shadow .25s"
                                }}>
                                    <CheckCircle size={15} /> Complete Project & Release Payment
                                </button>
                            )}
                        </div>

                        {project.progressUpdates?.length === 0 ? (
                            <div className="dashboard-card" style={{ padding: "40px 24px", textAlign: "center" }}>
                                <p style={{ color: "var(--text-dim)", fontSize: 14 }}>No progress updates submitted by the freelancer yet.</p>
                            </div>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                                {project.progressUpdates?.map((update, i) => (
                                    <div key={i} className="dashboard-card" style={{ padding: "24px", display: "flex", gap: 20 }}>
                                        <div style={{ width: 2, background: "var(--cyan)", borderRadius: 2 }} />
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                                                <span style={{ color: "var(--text-dim)", fontSize: 13 }}>Update #{i + 1}</span>
                                                <span style={{ color: "var(--text-faint)", fontSize: 13, fontFamily: "var(--font-mono)" }}>
                                                    {new Date(update.date).toLocaleString()}
                                                </span>
                                            </div>
                                            <p style={{ margin: "0 0 16px 0", color: "var(--text)", lineHeight: 1.6 }}>{update.text}</p>
                                            {update.fileLink && (
                                                <a href={update.fileLink} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--cyan)", fontSize: 13, textDecoration: "none", padding: "6px 12px", background: "rgba(47,216,238,.08)", borderRadius: 99, border: "1px solid rgba(47,216,238,.2)" }}>
                                                    <ExternalLink size={14} /> View Deliverable
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Tabs Selector */}
                <div style={{ display: 'flex', gap: 16, borderBottom: '1px solid var(--border)', marginBottom: 24, paddingBottom: 1 }}>
                    <button 
                        onClick={() => setActiveTab("proposals")}
                        style={{
                            padding: '12px 8px', background: 'none', border: 'none',
                            borderBottom: activeTab === 'proposals' ? '2px solid var(--cyan)' : '2px solid transparent',
                            color: activeTab === 'proposals' ? 'var(--cyan)' : 'var(--text-dim)',
                            fontWeight: 700, fontSize: 15, cursor: 'pointer', fontFamily: 'var(--font-body)',
                            transition: 'all .25s', display: 'flex', alignItems: 'center', gap: 8
                        }}
                    >
                        Submitted Proposals 
                        {proposals.length > 0 && (
                            <span style={{ padding: '2px 8px', borderRadius: 99, background: activeTab === 'proposals' ? 'rgba(47,216,238,.12)' : 'rgba(255,255,255,.05)', fontSize: 11, fontFamily: 'var(--font-mono)' }}>
                                {proposals.length}
                            </span>
                        )}
                    </button>
                    <button 
                        onClick={() => setActiveTab("aiMatches")}
                        style={{
                            padding: '12px 8px', background: 'none', border: 'none',
                            borderBottom: activeTab === 'aiMatches' ? '2px solid var(--cyan)' : '2px solid transparent',
                            color: activeTab === 'aiMatches' ? 'var(--cyan)' : 'var(--text-dim)',
                            fontWeight: 700, fontSize: 15, cursor: 'pointer', fontFamily: 'var(--font-body)',
                            transition: 'all .25s', display: 'flex', alignItems: 'center', gap: 8
                        }}
                    >
                        ✨ AI Talent Matching
                        {aiMatches.length > 0 && (
                            <span style={{ padding: '2px 8px', borderRadius: 99, background: 'rgba(99,91,255,.15)', color: 'var(--violet)', fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                                {aiMatches.length} Found
                            </span>
                        )}
                    </button>
                </div>

                {activeTab === "proposals" ? (
                    <div>
                        {proposals.length === 0 ? (
                            <div className="dashboard-card" style={{ padding: "64px 24px", textAlign: "center" }}>
                                <div className="empty-icon" style={{ margin: "0 auto 20px" }}><Briefcase size={26} /></div>
                                <h4>No proposals yet</h4>
                                <p style={{ color: "var(--text-dim)", fontSize: 14, marginTop: 8 }}>Freelancers haven't submitted any bids yet.</p>
                            </div>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                                <AnimatePresence>
                                    {proposals.map((proposal, i) => {
                                        const isActioning = actionId === proposal._id;
                                        const name    = proposal.freelancer?.fullName || "Freelancer";
                                        const initial = name[0].toUpperCase();
                                        return (
                                            <motion.div
                                                key={proposal._id}
                                                initial={{ opacity: 0, y: 12 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: i * .07, ease: [.16,.84,.44,1] }}
                                                className="dashboard-card"
                                                style={{ padding: "24px 28px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 24 }}
                                            >
                                                {/* Left */}
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                                                        <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg,var(--cyan),var(--violet))", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 15, color: "#04070d", flexShrink: 0, boxShadow: "0 0 12px rgba(47,216,238,.3)" }}>
                                                            {initial}
                                                        </div>
                                                        <div>
                                                            <p style={{ fontWeight: 700, margin: 0, fontSize: 15, letterSpacing: "-.01em" }}>{name}</p>
                                                            {proposal.freelancer?.username && (
                                                                <p style={{ color: "var(--text-faint)", fontSize: 12, fontFamily: "var(--font-mono)", margin: 0 }}>@{proposal.freelancer.username}</p>
                                                            )}
                                                        </div>
                                                        <StatusBadge label={proposal.status} map={proposalColor} />
                                                        {/* Star rating */}
                                                        <StarBadge avg={ratings[proposal.freelancer?._id]?.avg} total={ratings[proposal.freelancer?._id]?.total} />
                                                    </div>
                                                    <p style={{ color: "var(--text-dim)", fontSize: 14, lineHeight: 1.7, marginBottom: 16 }}>{proposal.coverLetter}</p>
                                                    <div style={{ display: "flex", gap: 12 }}>
                                                        <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "7px 14px", borderRadius: 99, background: "rgba(47,216,238,.08)", border: "1px solid rgba(47,216,238,.2)", fontSize: 13, fontFamily: "var(--font-mono)", fontWeight: 600, color: "var(--cyan)" }}>
                                                            <span style={{ fontFamily: 'var(--font-mono)' }}>₹</span> {proposal.bidAmount}
                                                        </div>
                                                        <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "7px 14px", borderRadius: 99, background: "rgba(139,107,245,.08)", border: "1px solid rgba(139,107,245,.2)", fontSize: 13, fontFamily: "var(--font-mono)", fontWeight: 600, color: "var(--violet)" }}>
                                                            <Clock size={13} /> {proposal.estimatedTime}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Right — actions */}
                                                <div style={{ display: "flex", flexDirection: "column", gap: 10, flexShrink: 0 }}>
                                                    {/* Message button */}
                                                    {proposal.status === "accepted" && (
                                                        <button
                                                            onClick={() => setMsgTarget({ userId: proposal.freelancer?._id, fullName: name })}
                                                            style={{
                                                                padding: "10px 20px", borderRadius: 999,
                                                                border: "1px solid rgba(47,216,238,.35)",
                                                                background: "rgba(47,216,238,.08)",
                                                                color: "var(--cyan)", fontWeight: 600, fontSize: 13.5,
                                                                cursor: "pointer", display: "flex", alignItems: "center", gap: 7,
                                                                fontFamily: "var(--font-body)", transition: "background .2s, box-shadow .2s",
                                                            }}
                                                            onMouseOver={e => { e.currentTarget.style.background = "rgba(47,216,238,.14)"; e.currentTarget.style.boxShadow = "0 6px 24px -6px rgba(47,216,238,.4)"; }}
                                                            onMouseOut={e => { e.currentTarget.style.background = "rgba(47,216,238,.08)"; e.currentTarget.style.boxShadow = "none"; }}
                                                        >
                                                            <MessageSquare size={15} /> Message
                                                        </button>
                                                    )}

                                                    {/* Accept / Reject */}
                                                    {proposal.status === "pending" && project.status === "Open" && (
                                                        <>
                                                            <button disabled={isActioning} onClick={() => handleAction(proposal._id, "accepted")} style={{ padding: "10px 20px", borderRadius: 999, border: "none", background: "linear-gradient(90deg,var(--ok),#2fd8ee)", color: "#04070d", fontWeight: 700, fontSize: 13.5, cursor: isActioning ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 7, opacity: isActioning ? .6 : 1, transition: "box-shadow .25s", fontFamily: "var(--font-body)" }}
                                                                onMouseOver={e => { if (!isActioning) e.currentTarget.style.boxShadow = "0 6px 24px -6px rgba(62,230,168,.6)"; }}
                                                                onMouseOut={e => e.currentTarget.style.boxShadow = "none"}
                                                            >
                                                                <CheckCircle size={15} /> Accept
                                                            </button>
                                                            <button disabled={isActioning} onClick={() => handleAction(proposal._id, "rejected")} style={{ padding: "10px 20px", borderRadius: 999, border: "1px solid rgba(244,123,123,.35)", background: "rgba(244,123,123,.06)", color: "var(--danger)", fontWeight: 600, fontSize: 13.5, cursor: isActioning ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 7, opacity: isActioning ? .6 : 1, transition: "background .2s, box-shadow .2s", fontFamily: "var(--font-body)" }}
                                                                onMouseOver={e => { if (!isActioning) { e.currentTarget.style.background = "rgba(244,123,123,.12)"; e.currentTarget.style.boxShadow = "0 6px 24px -6px rgba(244,123,123,.4)"; } }}
                                                                onMouseOut={e => { e.currentTarget.style.background = "rgba(244,123,123,.06)"; e.currentTarget.style.boxShadow = "none"; }}
                                                            >
                                                                <XCircle size={15} /> Reject
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>
                ) : (
                    <div>
                        {aiMatches.length === 0 ? (
                            <div className="dashboard-card" style={{ padding: "64px 24px", textAlign: "center" }}>
                                <div className="empty-icon" style={{ margin: "0 auto 20px", background: 'rgba(99,91,255,.08)' }}><Users size={26} color="var(--violet)" /></div>
                                <h4>No matches found</h4>
                                <p style={{ color: "var(--text-dim)", fontSize: 14, marginTop: 8 }}>Register more freelancers matching this project's required skills to populate suggestions.</p>
                            </div>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                                <AnimatePresence>
                                    {aiMatches.map((candidate, i) => (
                                        <motion.div
                                            key={candidate.freelancerId}
                                            initial={{ opacity: 0, y: 12 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * .07, ease: [.16,.84,.44,1] }}
                                            className="dashboard-card"
                                            style={{ 
                                                padding: "24px 28px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 24,
                                                border: '1px solid rgba(99,91,255,.15)',
                                                background: 'linear-gradient(180deg, rgba(99,91,255,.02), rgba(0,0,0,0))'
                                            }}
                                        >
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                                                    <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg,var(--violet),var(--cyan))", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 15, color: "#fff", flexShrink: 0, boxShadow: "0 0 12px rgba(139,107,245,.3)" }}>
                                                        {candidate.fullName[0].toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                            <p style={{ fontWeight: 700, margin: 0, fontSize: 15, letterSpacing: "-.01em" }}>{candidate.fullName}</p>
                                                            <span style={{ padding: '3px 9px', borderRadius: 99, background: 'rgba(99,91,255,.12)', color: 'var(--violet)', fontSize: 10.5, fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
                                                                {candidate.matchPercentage}% MATCH
                                                            </span>
                                                        </div>
                                                        <p style={{ color: "var(--text-faint)", fontSize: 12, fontFamily: "var(--font-mono)", margin: 0 }}>@{candidate.username}</p>
                                                    </div>
                                                </div>

                                                <p style={{ fontWeight: 600, color: 'var(--text)', fontSize: 14.5, marginBottom: 6 }}>{candidate.professionalTitle}</p>

                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
                                                    {candidate.skills.map(skill => {
                                                        const isMatch = candidate.matchingSkills.some(s => s.toLowerCase() === skill.toLowerCase());
                                                        return (
                                                            <span
                                                                key={skill}
                                                                style={{
                                                                    padding: '4px 10px', borderRadius: 6, fontSize: 11,
                                                                    background: isMatch ? 'rgba(47,216,238,.12)' : 'rgba(255,255,255,.03)',
                                                                    border: isMatch ? '1px solid rgba(47,216,238,.35)' : '1px solid var(--border-strong)',
                                                                    color: isMatch ? 'var(--cyan)' : 'var(--text-dim)',
                                                                    fontWeight: isMatch ? 700 : 500
                                                                }}
                                                            >
                                                                {skill} {isMatch && '✓'}
                                                            </span>
                                                        );
                                                    })}
                                                </div>

                                                {/* Explainable recommendation breakdown */}
                                                {candidate.matchBreakdown && (
                                                    <div style={{ marginBottom: 16, padding: '14px 16px', borderRadius: 12, background: 'rgba(255,255,255,.025)', border: '1px solid var(--border)' }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                                                            <span style={{ fontSize: 11, color: 'var(--text-faint)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '.08em' }}>Why this freelancer?</span>
                                                            <span style={{ fontSize: 11, color: 'var(--violet)', fontFamily: 'var(--font-mono)' }}>Multi-factor match</span>
                                                        </div>
                                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 9 }}>
                                                            {[
                                                                ['Skills', candidate.matchBreakdown.skills],
                                                                ['Semantic', candidate.matchBreakdown.semantic],
                                                                ['Experience', candidate.matchBreakdown.experience],
                                                                ['Budget', candidate.matchBreakdown.budget],
                                                                ['Availability', candidate.matchBreakdown.availability],
                                                                ['Category', candidate.matchBreakdown.category]
                                                            ].map(([label, value]) => (
                                                                <div key={label} style={{ padding: '9px 10px', borderRadius: 9, background: 'rgba(255,255,255,.025)' }}>
                                                                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 5, marginBottom: 6 }}>
                                                                        <span style={{ color: 'var(--text-faint)', fontSize: 10.5 }}>{label}</span>
                                                                        <strong style={{ color: 'var(--text)', fontSize: 11, fontFamily: 'var(--font-mono)' }}>{value}%</strong>
                                                                    </div>
                                                                    <div style={{ height: 4, borderRadius: 99, background: 'rgba(255,255,255,.06)', overflow: 'hidden' }}>
                                                                        <div style={{ width: `${value}%`, height: '100%', borderRadius: 99, background: 'linear-gradient(90deg,var(--violet),var(--cyan))' }} />
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                        {candidate.explanation?.length > 0 && (
                                                            <p style={{ color: 'var(--text-dim)', fontSize: 12, lineHeight: 1.55, margin: '11px 0 0' }}>
                                                                {candidate.explanation.join(' • ')}.
                                                            </p>
                                                        )}
                                                    </div>
                                                )}

                                                <div style={{ display: "flex", gap: 12 }}>
                                                    <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "7px 14px", borderRadius: 99, background: "rgba(62,230,168,.08)", border: "1px solid rgba(62,230,168,.2)", fontSize: 13, fontFamily: "var(--font-mono)", fontWeight: 600, color: "var(--ok)" }}>
                                                        <span style={{ fontFamily: 'var(--font-mono)' }}>₹</span> {candidate.hourlyRate}/hr
                                                    </div>
                                                    {candidate.yearsOfExperience > 0 && (
                                                        <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "7px 14px", borderRadius: 99, background: "rgba(139,107,245,.08)", border: "1px solid rgba(139,107,245,.2)", fontSize: 13, fontFamily: "var(--font-mono)", fontWeight: 600, color: "var(--violet)" }}>
                                                            {candidate.yearsOfExperience} yrs experience
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div style={{ flexShrink: 0 }}>
                                                <button
                                                    onClick={() => setMsgTarget({ userId: candidate.freelancerId, fullName: candidate.fullName })}
                                                    style={{
                                                        padding: "10px 20px", borderRadius: 999,
                                                        border: "1px solid rgba(139,107,245,.35)",
                                                        background: "rgba(139,107,245,.08)",
                                                        color: "var(--violet)", fontWeight: 600, fontSize: 13.5,
                                                        cursor: "pointer", display: "flex", alignItems: "center", gap: 7,
                                                        fontFamily: "var(--font-body)", transition: "background .2s, box-shadow .2s",
                                                    }}
                                                    onMouseOver={e => { e.currentTarget.style.background = "rgba(139,107,245,.14)"; e.currentTarget.style.boxShadow = "0 6px 24px -6px rgba(139,107,245,.4)"; }}
                                                    onMouseOut={e => { e.currentTarget.style.background = "rgba(139,107,245,.08)"; e.currentTarget.style.boxShadow = "none"; }}
                                                >
                                                    <MessageSquare size={15} /> Message to Invite
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>
                )}
            </motion.div>

            {/* Message Modal */}
            <AnimatePresence>
                {msgTarget && (
                    <MessageModal
                        project={project}
                        freelancer={msgTarget}
                        onClose={() => setMsgTarget(null)}
                    />
                )}
            </AnimatePresence>

            {/* Review Modal */}
            <AnimatePresence>
                {reviewOpen && (
                    <ReviewModal
                        project={project}
                        onClose={() => setReviewOpen(false)}
                        onSubmitted={() => setHasReviewed(true)}
                    />
                )}
            </AnimatePresence>

            {/* Stripe Payment Escrow Modal */}
            <AnimatePresence>
                {stripeTarget && (
                    <StripePaymentModal
                        amount={stripeTarget.amount}
                        contractId={stripeTarget.proposalId}
                        freelancerName={stripeTarget.freelancerName}
                        onClose={() => setStripeTarget(null)}
                    />
                )}
            </AnimatePresence>
        </>
    );
}

export default ClientProjectDetails;
