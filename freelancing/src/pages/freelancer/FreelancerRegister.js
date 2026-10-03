import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/axiosInstance";
import "../../styles/auth.css";

import emailjs from '@emailjs/browser';

function FreelancerRegister() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        fullName: "", email: "", username: "",
        password: "", confirmPassword: "", identityNumber: "",
    });
    const [error, setError]   = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);
    
    // OTP Flow states
    const [generatedOtp, setGeneratedOtp] = useState(null);
    const [enteredOtp, setEnteredOtp]     = useState("");
    const [otpModalOpen, setOtpModalOpen] = useState(false);
    const [verifying, setVerifying]       = useState(false);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    // Handle sending the OTP email
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        if (form.password !== form.confirmPassword) return setError("Passwords do not match");
        if (form.password.length < 8) return setError("Password must be at least 8 characters");
        
        setLoading(true);
        
        try {
            // First check if the email/username already exists on the backend
            const existsCheck = await api.post("/auth/check-exists", {
                email: form.email,
                username: form.username
            });
            if (!existsCheck.data.success) {
                setError(existsCheck.data.message);
                setLoading(false);
                return;
            }

            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            setGeneratedOtp(otp);

            // EmailJS send template details
            const serviceId = "service_fpqnxup";
            const templateId = "template_mbvkn0e";
            const publicKey = "TXq7iMmNYF2AMLPH1";

            // Attempt EmailJS dispatch
            await emailjs.send(
                serviceId,
                templateId,
                {
                    to_name: form.fullName,
                    to_email: form.email,
                    otp_code: otp,
                },
                publicKey
            );
            console.log("EmailJS verification code sent successfully!");
            setOtpModalOpen(true);
        } catch (err) {
            if (err.response && err.response.status === 409) {
                setError(err.response.data.message || "Email or Username already in use");
            } else {
                console.warn("EmailJS credentials not set. Falling back to local OTP verification simulation.", err);
                const fallbackOtp = Math.floor(100000 + Math.random() * 900000).toString();
                setGeneratedOtp(fallbackOtp);
                alert(`[TESTING OTP CODE]: Your verification code is: ${fallbackOtp}`);
                setOtpModalOpen(true);
            }
        } finally {
            setLoading(false);
        }
    };

    // Verify OTP and complete account creation
    const handleVerifyAndRegister = async (e) => {
        e.preventDefault();
        setError("");
        if (enteredOtp !== generatedOtp) {
            return setError("Invalid OTP code. Please check your email.");
        }

        setVerifying(true);
        try {
            const res = await api.post("/auth/register/freelancer", form);
            if (res.data.success) {
                setOtpModalOpen(false);
                setSuccess("Account verified and created successfully! Redirecting to login…");
                setTimeout(() => navigate("/freelancer/login"), 1500);
            } else {
                setError(res.data.message);
            }
        } catch (err) {
            let serverError = err.response?.data?.error || err.response?.data?.message || "Registration failed";
            if (typeof serverError === "object") {
                serverError = serverError.message || JSON.stringify(serverError);
            }
            setError(serverError);
        } finally {
            setVerifying(false);
        }
    };

    const GradientBtn = ({ children, disabled, onClick }) => (
        <button
            type={onClick ? "button" : "submit"}
            onClick={onClick}
            disabled={disabled}
            style={{
                width: "100%", padding: "14px 24px", borderRadius: 999, border: "none",
                background: disabled ? "rgba(255,255,255,0.05)" : "linear-gradient(90deg,#2fd8ee,#8b6bf5)",
                color: disabled ? "var(--text-faint)" : "#04070d",
                fontWeight: 700, fontSize: 15, cursor: disabled ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                marginTop: 8, transition: "box-shadow .25s, transform .25s",
            }}
            onMouseOver={e => { if (!disabled) e.currentTarget.style.boxShadow = "0 8px 30px -8px rgba(47,216,238,.55)"; }}
            onMouseOut={e => e.currentTarget.style.boxShadow = "none"}
        >{children}</button>
    );

    return (
        <div className="auth-shell">
            <div className="auth-card" style={{ maxWidth: 520 }}>
                <h2 className="auth-title">Create Freelancer Account</h2>
                <p className="auth-sub">Join Lumina and start finding great projects</p>

                {error   && <div className="auth-error">{error}</div>}
                {success && <div className="auth-success">{success}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="field">
                        <input name="fullName" type="text" placeholder="Full Name"
                            value={form.fullName} onChange={handleChange} required />
                        <label>Full Name</label>
                    </div>
                    <div className="field">
                        <input name="email" type="email" placeholder="Email Address"
                            value={form.email} onChange={handleChange} required />
                        <label>Email Address</label>
                    </div>
                    <div className="field">
                        <input name="username" type="text" placeholder="Username"
                            value={form.username} onChange={handleChange} required />
                        <label>Username</label>
                    </div>
                    <div className="field">
                        <input name="identityNumber" type="text" placeholder="Govt ID / Freelancer ID"
                            pattern="[a-zA-Z0-9]+" title="Alphanumeric only" minLength={6}
                            value={form.identityNumber} onChange={handleChange} required />
                        <label>Identity Number</label>
                    </div>
                    <div className="field">
                        <input name="password" type="password" placeholder="Password (min 8 chars)"
                            value={form.password} onChange={handleChange} required />
                        <label>Password</label>
                    </div>
                    <div className="field">
                        <input name="confirmPassword" type="password" placeholder="Confirm Password"
                            value={form.confirmPassword} onChange={handleChange} required />
                        <label>Confirm Password</label>
                    </div>
                    <GradientBtn disabled={loading}>
                        {loading && <span style={{ width:16, height:16, borderRadius:"50%", border:"2px solid rgba(4,7,13,.3)", borderTopColor:"#04070d", animation:"spin .7s linear infinite", display:"inline-block" }} />}
                        {loading ? "Creating Account…" : "Create Account"}
                    </GradientBtn>
                </form>

                <p className="auth-links">Already have an account? <Link to="/freelancer/login">Log in</Link></p>
                <a className="back-link" href="/">← Back to home</a>
            </div>

            {/* OTP Verification Modal */}
            {otpModalOpen && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,.75)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
                    <div style={{ width: '100%', maxWidth: 420, background: '#0a0d1a', borderRadius: 16, border: '1px solid var(--border-strong)', padding: 32, textAlign: 'center', boxShadow: '0 24px 60px rgba(0,0,0,.6)' }}>
                        <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Verify Your Email</h3>
                        <p style={{ color: 'var(--text-dim)', fontSize: 14, marginBottom: 24 }}>We've sent a 6-digit verification code to <br/><strong style={{ color: 'var(--cyan)' }}>{form.email}</strong></p>
                        
                        <form onSubmit={handleVerifyAndRegister} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                            <input 
                                type="text"
                                maxLength={6}
                                required
                                value={enteredOtp}
                                onChange={e => setEnteredOtp(e.target.value.replace(/\D/g, ''))}
                                placeholder="Enter 6-digit Code"
                                style={{ width: '100%', padding: '14px 18px', borderRadius: 8, border: '1px solid var(--border-strong)', background: 'rgba(255,255,255,.02)', color: '#fff', fontSize: 18, textAlign: 'center', letterSpacing: 4, fontFamily: 'var(--font-mono)', outline: 'none' }}
                            />
                            {error && <div style={{ color: 'var(--danger)', fontSize: 13, fontWeight: 600 }}>{error}</div>}
                            
                            <div style={{ display: 'flex', gap: 12 }}>
                                <button type="button" onClick={() => setOtpModalOpen(false)} style={{ flex: 1, padding: '12px 20px', borderRadius: 999, border: '1px solid var(--border-strong)', background: 'transparent', color: 'var(--text-dim)', fontSize: 14, cursor: 'pointer' }}>Cancel</button>
                                <button type="submit" disabled={verifying || enteredOtp.length !== 6} style={{ flex: 1, padding: '12px 20px', borderRadius: 999, border: 'none', background: enteredOtp.length === 6 && !verifying ? 'linear-gradient(90deg,#2fd8ee,#8b6bf5)' : 'rgba(255,255,255,.05)', color: enteredOtp.length === 6 && !verifying ? '#04070d' : 'var(--text-faint)', fontWeight: 700, fontSize: 14, cursor: enteredOtp.length === 6 && !verifying ? 'pointer' : 'not-allowed' }}>
                                    {verifying ? 'Verifying…' : 'Verify & Sign Up'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default FreelancerRegister;
