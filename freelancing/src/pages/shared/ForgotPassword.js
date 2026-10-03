import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/axiosInstance";
import emailjs from '@emailjs/browser';
import "../../styles/auth.css";

function ForgotPassword() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [otpCode, setOtpCode] = useState(null);
    const [enteredOtp, setEnteredOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [step, setStep] = useState(1); // 1: Email, 2: Verify & Reset
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    // Send OTP verification to email
    const handleSendOtp = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        if (!email) return setError("Please enter your email address");

        setLoading(true);
        try {
            // Check if the user exists
            const checkRes = await api.post("/auth/check-exists", {
                email: email,
                username: "non_existent_placeholder_to_force_only_email_match"
            }).catch(err => {
                // If it returns 409 conflict, it means the email IS already registered!
                if (err.response && err.response.status === 409 && err.response.data.message.includes("Email")) {
                    return { data: { success: false, exists: true } };
                }
                throw err;
            });

            // If check-exists returned success (meaning details are available), the email is NOT in use
            if (checkRes && checkRes.data && checkRes.data.success) {
                setError("No account found with this email address.");
                setLoading(false);
                return;
            }

            // Generate 6-digit OTP code
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            setOtpCode(otp);

            // EmailJS credentials
            const serviceId = "service_fpqnxup";
            const templateId = "template_mbvkn0e";
            const publicKey = "TXq7iMmNYF2AMLPH1";

            // Send OTP email
            await emailjs.send(
                serviceId,
                templateId,
                {
                    to_name: "Lumina Member",
                    to_email: email,
                    otp_code: otp,
                },
                publicKey
            );

            console.log("Password reset OTP sent successfully!");
            setSuccess("Verification code sent to your email!");
            setStep(2);
        } catch (err) {
            console.error("Failed to send OTP", err);
            setError("Error sending verification code. Please check your credentials.");
        } finally {
            setLoading(false);
        }
    };

    // Verify OTP and Save New Password
    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (enteredOtp !== otpCode) {
            return setError("Invalid OTP code. Please check your email.");
        }
        if (newPassword.length < 8) {
            return setError("Password must be at least 8 characters long");
        }
        if (newPassword !== confirmPassword) {
            return setError("Passwords do not match");
        }

        setLoading(true);
        try {
            const res = await api.post("/auth/reset-password", {
                email: email,
                password: newPassword
            });

            if (res.data.success) {
                setSuccess("Password reset successfully! Redirecting to login...");
                setTimeout(() => navigate("/"), 2000);
            } else {
                setError(res.data.message);
            }
        } catch (err) {
            setError(err.response?.data?.message || "Failed to reset password.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card" style={{ maxWidth: 450, width: "100%" }}>
                <h2 className="auth-title">Reset Password</h2>
                <p className="auth-subtitle" style={{ marginBottom: 24 }}>
                    {step === 1 
                        ? "Enter your registered email to receive a security verification code." 
                        : "Enter the code sent to your email and your new password."
                    }
                </p>

                {error && <div className="error-banner">{error}</div>}
                {success && <div className="success-banner">{success}</div>}

                {step === 1 ? (
                    <form onSubmit={handleSendOtp}>
                        <div className="form-group">
                            <label className="form-label">Email Address</label>
                            <input
                                type="email"
                                className="form-input"
                                placeholder="name@domain.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>
                        <button type="submit" className="auth-submit" disabled={loading}>
                            {loading ? "Sending..." : "Send Verification Code"}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleResetPassword}>
                        <div className="form-group">
                            <label className="form-label">Verification OTP</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Enter 6-digit code"
                                value={enteredOtp}
                                onChange={(e) => setEnteredOtp(e.target.value)}
                                maxLength={6}
                                required
                                disabled={loading}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">New Password</label>
                            <input
                                type="password"
                                className="form-input"
                                placeholder="Min 8 characters"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Confirm New Password</label>
                            <input
                                type="password"
                                className="form-input"
                                placeholder="Re-enter new password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>
                        <button type="submit" className="auth-submit" disabled={loading}>
                            {loading ? "Resetting..." : "Save New Password"}
                        </button>
                    </form>
                )}

                <div className="auth-footer" style={{ marginTop: 24 }}>
                    <Link to="/" style={{ color: "var(--cyan)", textDecoration: "none", fontSize: 13.5 }}>
                        ← Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default ForgotPassword;
