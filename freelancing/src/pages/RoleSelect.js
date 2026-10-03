import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Check, Briefcase, User } from "lucide-react";
import "../styles/auth.css";

function RoleSelect() {
    const [selectedRole, setSelectedRole] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();

    const searchParams = new URLSearchParams(location.search);
    const mode = searchParams.get('mode') || 'register';
    const isLogin = mode === 'login';

    const handleProceed = () => {
        if (selectedRole) {
            navigate(`/${selectedRole}/${isLogin ? 'login' : 'register'}`);
        }
    };

    return (
        <div className="auth-shell">
            <div className="auth-card">
                <h2 className="auth-title">
                    {isLogin ? 'Log in to Lumina' : 'Join as a client or freelancer'}
                </h2>
                <p className="auth-sub">
                    {isLogin ? 'Select your account type to continue' : 'Choose how you want to use Lumina'}
                </p>

                <div className="role-grid">
                    {/* Client Card */}
                    <div
                        className={`role-card${selectedRole === 'client' ? ' selected' : ''}`}
                        onClick={() => setSelectedRole('client')}
                    >
                        <div className="radio-dot" />
                        <Briefcase className="role-icon" />
                        <h4>I'm a client,<br />hiring for a project</h4>
                        <ul className="role-check">
                            <li><Check size={14} /> Hire Verified Freelancers</li>
                            <li><Check size={14} /> Secure Payments</li>
                            <li><Check size={14} /> Project Tracking</li>
                            <li><Check size={14} /> Contract Management</li>
                        </ul>
                    </div>

                    {/* Freelancer Card */}
                    <div
                        className={`role-card${selectedRole === 'freelancer' ? ' selected' : ''}`}
                        onClick={() => setSelectedRole('freelancer')}
                    >
                        <div className="radio-dot" />
                        <User className="role-icon" />
                        <h4>I'm a freelancer,<br />looking for work</h4>
                        <ul className="role-check">
                            <li><Check size={14} /> Find High Paying Projects</li>
                            <li><Check size={14} /> Build Portfolio</li>
                            <li><Check size={14} /> Secure Earnings</li>
                            <li><Check size={14} /> Grow Reputation</li>
                        </ul>
                    </div>
                </div>

                <button
                    className="btn-block"
                    disabled={!selectedRole}
                    onClick={handleProceed}
                    style={{
                        borderRadius: 999,
                        border: "none",
                        background: selectedRole
                            ? "linear-gradient(90deg, #2fd8ee, #8b6bf5)"
                            : "rgba(255,255,255,0.05)",
                        color: selectedRole ? "#04070d" : "var(--text-faint)",
                        fontWeight: 700,
                        fontSize: 15,
                        padding: "14px 24px",
                        width: "100%",
                        cursor: selectedRole ? "pointer" : "not-allowed",
                        transition: "box-shadow .25s, transform .25s",
                    }}
                    onMouseOver={e => { if (selectedRole) e.currentTarget.style.boxShadow = "0 8px 30px -8px rgba(47,216,238,.55)"; }}
                    onMouseOut={e => e.currentTarget.style.boxShadow = "none"}
                >
                    {selectedRole
                        ? (isLogin
                            ? `Log In as ${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}`
                            : `Join as ${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}`)
                        : (isLogin ? 'Select a role to log in' : 'Select a role to continue')}
                </button>

                {isLogin ? (
                    <p className="auth-links">
                        Don't have an account? <Link to="/RoleSelect?mode=register">Sign Up</Link>
                    </p>
                ) : (
                    <p className="auth-links">
                        Already have an account? <Link to="/RoleSelect?mode=login">Log In</Link>
                    </p>
                )}
            </div>
        </div>
    );
}

export default RoleSelect;
