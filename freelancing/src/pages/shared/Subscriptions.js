import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Star, Shield, Zap, Sparkles, X, CreditCard } from 'lucide-react';
import api from '../../api/axiosInstance';
import { useAuth } from '../../context/AuthContext';
import '../../styles/dashboard.css';

export default function Subscriptions() {
    const { user } = useAuth();
    const isClient = user?.role === 'CLIENT';

    const [billingPeriod, setBillingPeriod] = useState('monthly'); // 'monthly' or 'annual'
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const plans = [
        {
            name: 'Basic',
            tagline: isClient ? 'Essential tools for hiring talent.' : 'Essential tools for getting started.',
            priceMonthly: 0,
            priceAnnual: 0,
            features: isClient ? [
                'Post up to 2 active projects/month',
                'Access standard candidate search',
                'Direct messaging with applicants',
                'Standard escrow security payments'
            ] : [
                'Submit up to 5 bids/month',
                'Basic profile customization',
                'Standard escrow security payments',
                'Direct messaging with clients'
            ],
            icon: Zap,
            color: 'var(--text-dim)'
        },
        {
            name: 'Professional',
            tagline: isClient ? 'Boost project reach & AI candidate matching.' : 'Maximize matches & unlock premium tools.',
            priceMonthly: 29,
            priceAnnual: 22,
            features: isClient ? [
                'Post up to 10 active projects/month',
                'Featured Job badge on all postings',
                'AI candidate matching recommendations',
                '1st Month Free Trial included',
                '24/7 dedicated support priority'
            ] : [
                'Unlimited bid submissions',
                'Verified Pro badge on profile',
                'Priority ranking in client searches',
                '1st Month Free Trial included',
                '24/7 dedicated support priority'
            ],
            icon: Star,
            color: 'var(--cyan)',
            popular: true,
            trial: '1st Month Free'
        },
        {
            name: 'Enterprise',
            tagline: isClient ? 'For high volume hiring & company teams.' : 'For agency power-users & high volumes.',
            priceMonthly: 69,
            priceAnnual: 55,
            features: isClient ? [
                'Unlimited active project postings',
                'Zero client transaction platform fees',
                'Custom company logo & header banner',
                'Dedicated hiring success manager',
                'Top placement on homepage jobs list'
            ] : [
                'All Professional features',
                'Custom statement descriptors',
                'Zero freelancer platform service fees',
                'Dedicated success manager assistance',
                'Featured placement on homepage'
            ],
            icon: Sparkles,
            color: 'var(--violet)'
        }
    ];

    const handleSubscribe = (plan) => {
        if (plan.priceMonthly === 0) {
            alert('You are already on the Basic Free Tier.');
            return;
        }
        setSelectedPlan(plan);
    };

    const handlePaymentSubmit = async (e) => {
        e.preventDefault();
        setProcessing(true);
        try {
            // Ping session or process activation
            await api.get('/auth/me').catch(() => {});
            setTimeout(() => {
                setSuccessMessage(`Subscription to ${selectedPlan.name} Plan activated successfully! Enjoy your 1st month free.`);
                setProcessing(false);
                setTimeout(() => {
                    setSelectedPlan(null);
                    setSuccessMessage('');
                }, 3000);
            }, 1200);
        } catch (err) {
            setProcessing(false);
            alert('Failed to activate subscription.');
        }
    };

    return (
        <div className="dashboard-page" style={{ maxWidth: 1100, margin: '0 auto', paddingBottom: 64 }}>
            {/* Header section */}
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <span style={{ padding: '6px 16px', borderRadius: 99, background: 'rgba(139,107,245,.08)', border: '1px solid rgba(139,107,245,.2)', color: 'var(--violet)', fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em' }}>
                        Subscription Plans
                    </span>
                    <h1 style={{ fontSize: 36, marginTop: 16, fontWeight: 800, letterSpacing: '-.02em' }}>
                        Supercharge Your Lumina Experience
                    </h1>
                    <p style={{ color: 'var(--text-dim)', fontSize: 16, marginTop: 12, maxWidth: 600, margin: '12px auto 0', lineHeight: 1.6 }}>
                        Choose the right plan to showcase your skills, bid on more projects, and maximize your revenue with direct escrow integrations.
                    </p>
                </motion.div>

                {/* Period selector */}
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, marginTop: 32, padding: 6, background: 'rgba(255,255,255,.02)', border: '1px solid var(--border)', borderRadius: 99 }}>
                    <button
                        onClick={() => setBillingPeriod('monthly')}
                        style={{ padding: '8px 20px', borderRadius: 99, border: 'none', background: billingPeriod === 'monthly' ? 'linear-gradient(90deg,var(--violet),var(--cyan))' : 'transparent', color: '#fff', fontSize: 13.5, fontWeight: 700, cursor: 'pointer', transition: 'all .25s' }}
                    >
                        Monthly
                    </button>
                    <button
                        onClick={() => setBillingPeriod('annual')}
                        style={{ padding: '8px 20px', borderRadius: 99, border: 'none', background: billingPeriod === 'annual' ? 'linear-gradient(90deg,var(--violet),var(--cyan))' : 'transparent', color: '#fff', fontSize: 13.5, fontWeight: 700, cursor: 'pointer', transition: 'all .25s' }}
                    >
                        Annual (Save 20%)
                    </button>
                </div>
            </div>

            {/* Plans list */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
                {plans.map((plan, idx) => {
                    const price = billingPeriod === 'monthly' ? plan.priceMonthly : plan.priceAnnual;
                    const PlanIcon = plan.icon;
                    return (
                        <motion.div
                            key={plan.name}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: idx * 0.1 }}
                            className="dashboard-card"
                            style={{
                                padding: '36px 32px',
                                display: 'flex',
                                flexDirection: 'column',
                                border: plan.popular ? '2px solid var(--cyan)' : '1px solid var(--border)',
                                position: 'relative',
                                overflow: 'visible',
                                background: plan.popular ? 'linear-gradient(180deg, rgba(47,216,238,.03), rgba(0,0,0,0))' : 'rgba(10,13,26,.6)',
                                boxShadow: plan.popular ? '0 20px 50px rgba(47,216,238,.12)' : 'none'
                            }}
                        >
                            {plan.popular && (
                                <div style={{ marginBottom: 14 }}>
                                    <span style={{ padding: '4px 14px', borderRadius: 99, background: 'linear-gradient(90deg,#635bff,var(--cyan))', color: '#fff', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.05em', boxShadow: '0 4px 12px rgba(47,216,238,.35)', display: 'inline-block' }}>
                                        Most Popular
                                    </span>
                                </div>
                            )}

                            {/* Plan meta */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                                <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(255,255,255,.02)', border: '1px solid var(--border-strong)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: plan.color }}>
                                    <PlanIcon size={20} />
                                </div>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>{plan.name}</h3>
                                    {plan.trial && (
                                        <span style={{ fontSize: 11, color: 'var(--cyan)', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                                            🔥 {plan.trial}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <p style={{ color: 'var(--text-dim)', fontSize: 14, margin: '0 0 24px 0', minHeight: 40 }}>
                                {plan.tagline}
                            </p>

                            {/* Price block */}
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 30 }}>
                                <span style={{ fontSize: 40, fontWeight: 800, color: '#fff' }}>${price}</span>
                                <span style={{ color: 'var(--text-faint)', fontSize: 14 }}>/ month</span>
                                {billingPeriod === 'annual' && price > 0 && (
                                    <span style={{ marginLeft: 8, fontSize: 12, color: 'var(--ok)', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                                        Billed annually
                                    </span>
                                )}
                            </div>

                            {/* Action Button */}
                            <button
                                onClick={() => handleSubscribe(plan)}
                                style={{
                                    width: '100%',
                                    padding: '14px 24px',
                                    borderRadius: 99,
                                    background: plan.popular ? 'linear-gradient(90deg,#635bff,var(--cyan))' : 'rgba(255,255,255,.05)',
                                    border: plan.popular ? 'none' : '1px solid var(--border-strong)',
                                    color: '#fff',
                                    fontSize: 14,
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    marginBottom: 32,
                                    transition: 'all .25s'
                                }}
                            >
                                {plan.priceMonthly === 0 ? 'Current Plan' : plan.trial ? `Start 1 Month Free Trial` : 'Subscribe Now'}
                            </button>

                            {/* Features list */}
                            <div style={{ marginTop: 'auto' }}>
                                <p style={{ fontSize: 11, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', color: 'var(--text-faint)', letterSpacing: '.06em', marginBottom: 16 }}>
                                    Features Included:
                                </p>
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    {plan.features.map(f => (
                                        <li key={f} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 13.5, color: 'var(--text-dim)', lineHeight: 1.4 }}>
                                            <span style={{ width: 18, height: 18, borderRadius: '50%', background: 'rgba(62,230,168,.08)', border: '1px solid rgba(62,230,168,.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ok)', flexShrink: 0, marginTop: 1 }}>
                                                <Check size={11} />
                                            </span>
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Custom Payment Overlay Modal */}
            <AnimatePresence>
                {selectedPlan && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={() => setSelectedPlan(null)}
                        style={{ position: 'fixed', inset: 0, zIndex: 1200, background: 'rgba(0,0,0,.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
                    >
                        <motion.div initial={{ opacity: 0, scale: .93, y: 15 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: .93, y: 15 }}
                            onClick={e => e.stopPropagation()}
                            style={{ width: '100%', maxWidth: 440, background: '#0a0d1a', borderRadius: 'var(--r-xl)', border: '1px solid var(--border-strong)', boxShadow: '0 24px 60px rgba(0,0,0,.7)', overflow: 'hidden' }}
                        >
                            <div style={{ background: 'linear-gradient(90deg,#635bff,var(--cyan))', height: 6 }} />
                            
                            <div style={{ padding: '24px 28px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#635bff', fontWeight: 800, fontSize: 13, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '.08em' }}>
                                        <Shield size={14} /> Subscription Setup
                                    </div>
                                    <p style={{ margin: '4px 0 0 0', color: 'var(--text-dim)', fontSize: 12.5 }}>Unlock premium features instantly</p>
                                </div>
                                <button onClick={() => setSelectedPlan(null)} style={{ background: 'rgba(255,255,255,.04)', border: '1px solid var(--border-strong)', color: 'var(--text-dim)', borderRadius: '50%', width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><X size={13} /></button>
                            </div>

                            <div style={{ padding: '24px 28px' }}>
                                {successMessage ? (
                                    <div style={{ padding: '20px 16px', background: 'rgba(62,230,168,.05)', border: '1px solid rgba(62,230,168,.2)', borderRadius: 8, color: 'var(--ok)', textAlign: 'center', fontSize: 14 }}>
                                        {successMessage}
                                    </div>
                                ) : (
                                    <form onSubmit={handlePaymentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                        <div style={{ padding: '16px 20px', background: 'rgba(99,91,255,.05)', border: '1px solid rgba(99,91,255,.15)', borderRadius: 8 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-dim)' }}>
                                                <span>Plan selected</span>
                                                <span style={{ color: 'var(--cyan)', fontWeight: 700 }}>{selectedPlan.name} Plan</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-faint)', marginTop: 4 }}>
                                                <span>Trial Offer</span>
                                                <span style={{ color: 'var(--ok)', fontWeight: 700 }}>1 Month Free Trial</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-faint)', marginTop: 4 }}>
                                                <span>Price after trial</span>
                                                <span>${billingPeriod === 'monthly' ? selectedPlan.priceMonthly : selectedPlan.priceAnnual}/mo</span>
                                            </div>
                                        </div>

                                        <div style={{ padding: '12px 14px', background: 'rgba(47,216,238,.03)', border: '1px solid rgba(47,216,238,.12)', borderRadius: 8, textAlign: 'center', fontSize: 12.5, color: 'var(--text-dim)', lineHeight: 1.5 }}>
                                            💳 This is a simulated checkout setup. Click start to authorize your 1st month free trial under test sandbox mode.
                                        </div>

                                        <button type="submit" disabled={processing} style={{ padding: '12px 24px', borderRadius: 999, border: 'none', background: 'linear-gradient(90deg,#635bff,var(--cyan))', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'var(--font-body)', marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                                            {processing ? (
                                                <>Processing free trial setup...</>
                                            ) : (
                                                <><CreditCard size={15} /> Start Free Trial</>
                                            )}
                                        </button>
                                    </form>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
