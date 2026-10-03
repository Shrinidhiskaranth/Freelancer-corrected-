import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/axiosInstance";
import { useAuth } from "../../context/AuthContext";
import "../../styles/auth.css";

function ClientLogin() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword]     = useState("");
    const [error, setError]           = useState("");
    const [loading, setLoading]       = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(""); setLoading(true);
        try {
            const res = await api.post("/auth/login/client", { identifier, password });
            if (res.data.success) {
                login(res.data.token, res.data.user);
                navigate(res.data.user.profileCompleted ? "/client/dashboard" : "/client/complete-profile");
            } else setError(res.data.message);
        } catch (err) {
            let serverError = err.response?.data?.error || err.response?.data?.message || "Login failed. Check your credentials.";
            if (typeof serverError === "object") {
                serverError = serverError.message || JSON.stringify(serverError);
            }
            setError(serverError);
        } finally { setLoading(false); }
    };

    return (
        <div className="auth-shell">
            <div className="auth-card">
                <h2 className="auth-title">Log in to Lumina</h2>
                <p className="auth-sub">Welcome back, client</p>

                {error && <div className="auth-error">{error}</div>}

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                    <div className="field">
                        <input
                            type="text"
                            placeholder="Email or Username"
                            value={identifier}
                            onChange={e => setIdentifier(e.target.value)}
                            required
                        />
                        <label>Email or Username</label>
                    </div>
                    <div className="field">
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                        />
                        <label>Password</label>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: "100%",
                            padding: "14px 24px",
                            borderRadius: 999,
                            border: "none",
                            background: "linear-gradient(90deg, #2fd8ee, #8b6bf5)",
                            backgroundSize: "180% 100%",
                            color: "#04070d",
                            fontWeight: 700,
                            fontSize: 15,
                            cursor: loading ? "not-allowed" : "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 10,
                            marginTop: 8,
                            opacity: loading ? 0.7 : 1,
                            transition: "box-shadow .25s, transform .25s",
                        }}
                        onMouseOver={e => { if(!loading) e.currentTarget.style.boxShadow = "0 8px 30px -8px rgba(47,216,238,.55)"; }}
                        onMouseOut={e => e.currentTarget.style.boxShadow = "none"}
                    >
                        {loading && (
                            <span style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid rgba(4,7,13,.3)", borderTopColor: "#04070d", animation: "spin .7s linear infinite", display: "inline-block" }} />
                        )}
                        {loading ? "Logging in..." : "Log In"}
                    </button>
                </form>

                 <p className="auth-links" style={{ display: "flex", justifyContent: "space-between", margin: "16px 0 8px 0" }}>
                    <span>Don't have an account? <Link to="/client/register">Sign up</Link></span>
                    <Link to="/forgot-password" style={{ color: "var(--cyan)" }}>Forgot Password?</Link>
                 </p>
                 <a className="back-link" href="/">← Back to home</a>
            </div>
        </div>
    );
}

export default ClientLogin;
