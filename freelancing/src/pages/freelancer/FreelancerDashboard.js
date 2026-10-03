import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Briefcase, DollarSign, Star, MessageSquare, Search } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axiosInstance";
import Button from "../../components/ui/Button";
import { motion } from "framer-motion";
import "../../styles/dashboard.css";

const fade = {
    hidden: { opacity: 0, y: 20 },
    visible: (i = 0) => ({
        opacity: 1, y: 0,
        transition: { delay: i * 0.08, type: "spring", stiffness: 300, damping: 24 }
    })
};

function StatCard({ icon: Icon, value, label, color, delay }) {
    const colorMap = {
        cyan:    { bg: "rgba(47,216,238,0.12)",  color: "#2fd8ee" },
        green:   { bg: "rgba(62,230,168,0.12)",  color: "#3ee6a8" },
        violet:  { bg: "rgba(139,107,245,0.12)", color: "#8b6bf5" },
        magenta: { bg: "rgba(240,98,176,0.12)",  color: "#f062b0" },
    };
    const c = colorMap[color] || colorMap.cyan;

    return (
        <motion.div
            custom={delay}
            variants={fade}
            initial="hidden"
            animate="visible"
            whileHover={{ y: -4, borderColor: c.color + "55" }}
            style={{
                background: "linear-gradient(180deg, #101526, #0a0d18)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 14,
                padding: 22,
                transition: "border-color .3s",
                cursor: "default",
            }}
        >
            <div style={{
                width: 38, height: 38, borderRadius: 10,
                background: c.bg, color: c.color,
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: 18
            }}>
                <Icon size={18} />
            </div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 26, fontWeight: 600, color: "var(--text)" }}>
                {value}
            </div>
            <div style={{ fontSize: 13, color: "var(--text-dim)", marginTop: 4 }}>{label}</div>
        </motion.div>
    );
}

function FreelancerDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        activeBids: 0,
        totalEarnings: 0,
        activeContracts: 0,
        unreadMessages: 0
    });

    useEffect(() => {
        api.get("/freelancer/dashboard")
            .then(res => {
                if (res.data.success && res.data.stats) {
                    setStats(res.data.stats);
                }
            })
            .catch(console.error);
    }, []);

    return (
        <div style={{ padding: "0" }}>
            {/* Welcome */}
            <motion.div variants={fade} custom={0} initial="hidden" animate="visible"
                style={{ marginBottom: 36 }}
            >
                <h1 style={{ fontSize: 26, fontWeight: 600, marginBottom: 8 }}>
                    Welcome, {user?.fullName || "there"}
                </h1>
                <p style={{ color: "var(--text-dim)", fontSize: 14.5, marginBottom: 20 }}>
                    Find work, manage contracts, and track your earnings.
                </p>
                <Button variant="primary" onClick={() => navigate("/freelancer/browse-projects")}>
                    Find Work
                </Button>
            </motion.div>

            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 18, marginBottom: 34 }}>
                <StatCard icon={Briefcase}    value={stats.activeBids}  label="Active Bids"       color="cyan"    delay={1} />
                <StatCard icon={DollarSign}   value={`₹${stats.totalEarnings}`} label="Total Earnings"    color="green"   delay={2} />
                <StatCard icon={Star}         value={stats.activeContracts}  label="Active Contracts"  color="violet"  delay={3} />
                <StatCard icon={MessageSquare} value={stats.unreadMessages} label="Unread Messages"   color="magenta" delay={4} />
            </div>

            {/* Panel */}
            <motion.div variants={fade} custom={5} initial="hidden" animate="visible"
                style={{
                    background: "linear-gradient(180deg, #101526, #0a0d18)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 22,
                    overflow: "hidden"
                }}
            >
                <div style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "20px 28px", borderBottom: "1px solid rgba(255,255,255,0.08)"
                }}>
                    <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>Recommended Jobs</h3>
                    <button
                        onClick={() => navigate("/freelancer/browse-projects")}
                        style={{ fontSize: 13.5, color: "var(--cyan)", background: "none", border: "none", cursor: "pointer" }}
                    >
                        View All
                    </button>
                </div>

                <div style={{ textAlign: "center", padding: "60px 24px" }}>
                    <div style={{
                        width: 56, height: 56, borderRadius: "50%",
                        background: "rgba(47,216,238,0.08)",
                        border: "1px solid rgba(47,216,238,0.25)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        margin: "0 auto 20px",
                        animation: "breathe 2.6s ease-in-out infinite"
                    }}>
                        <Search size={22} color="#2fd8ee" />
                    </div>
                    <h4 style={{ fontSize: 17, fontWeight: 600, marginBottom: 8 }}>Start your journey</h4>
                    <p style={{ color: "var(--text-dim)", fontSize: 14, maxWidth: 340, margin: "0 auto 22px", lineHeight: 1.6 }}>
                        Browse the marketplace to find projects matching your skills.
                    </p>
                    <button
                        onClick={() => navigate("/freelancer/browse-projects")}
                        style={{
                            display: "inline-flex", alignItems: "center", gap: 8,
                            padding: "10px 22px", borderRadius: 999,
                            color: "#2fd8ee", background: "transparent",
                            border: "1px solid rgba(47,216,238,0.4)",
                            fontWeight: 600, fontSize: 14, cursor: "pointer"
                        }}
                    >
                        Browse Projects → 
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

export default FreelancerDashboard;
