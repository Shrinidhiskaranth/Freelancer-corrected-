import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, Trash2, Plus, FolderOpen } from "lucide-react";
import api from "../../api/axiosInstance";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import { motion, AnimatePresence } from "framer-motion";
import "../../styles/dashboard.css";

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
};
const rowVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

function ClientProjects() {
    const navigate = useNavigate();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        api.get("/projects/client/my-projects")
            .then(res => { if (res.data.success) setProjects(res.data.projects); })
            .catch(err => setError(err.response?.data?.message || "Failed to load projects"))
            .finally(() => setLoading(false));
    }, []);

    const getStatusVariant = (status) => ({ Open: "primary", "In Progress": "warning", Completed: "success", Cancelled: "danger" }[status] || "neutral");

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this project? This cannot be undone.")) return;
        try {
            const res = await api.delete(`/projects/${id}`);
            if (res.data.success) setProjects(p => p.filter(x => x._id !== id));
        } catch (err) { alert(err.response?.data?.message || "Failed to delete"); }
    };

    return (
        <motion.div className="dashboard-page" initial="hidden" animate="visible" variants={containerVariants}>
            {/* Header */}
            <motion.div className="dashboard-header-flex" variants={rowVariants}>
                <div>
                    <h1 style={{ fontSize: 26, margin: 0 }}>My Projects</h1>
                    <p style={{ color: "var(--text-secondary)", marginTop: 4 }}>Manage your posted projects and review incoming bids.</p>
                </div>
                <Button variant="primary" icon={<Plus size={18} />} onClick={() => navigate("/client/post-project")}>
                    Post New Project
                </Button>
            </motion.div>

            {error && <motion.div className="error-banner" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{error}</motion.div>}

            <motion.div className="dashboard-card" style={{ padding: 0, overflow: "hidden" }} variants={rowVariants}>
                {loading ? (
                    <div style={{ padding: "64px", textAlign: "center", color: "var(--text-muted)" }}>
                        <div className="spinner" style={{ margin: "0 auto 16px", borderTopColor: "var(--primary)" }} />
                        <p>Loading your projects...</p>
                    </div>
                ) : projects.length === 0 ? (
                    <div style={{ padding: "80px 24px", textAlign: "center" }}>
                        <div style={{ width: 72, height: 72, borderRadius: "50%", background: "rgba(0,229,255,0.06)", border: "1px solid var(--border-color)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
                            <FolderOpen size={32} color="var(--text-muted)" />
                        </div>
                        <h3 style={{ marginBottom: 8 }}>No projects yet</h3>
                        <p style={{ color: "var(--text-secondary)", marginBottom: 24 }}>Post your first project to start hiring top freelancers.</p>
                        <Button variant="primary" onClick={() => navigate("/client/post-project")}>Post a Project</Button>
                    </div>
                ) : (
                    <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                            <thead>
                                <tr style={{ borderBottom: "1px solid var(--border-color)", background: "rgba(255,255,255,0.02)" }}>
                                    {["Project", "Budget", "Deadline", "Status", "Actions"].map(col => (
                                        <th key={col} style={{ padding: "14px 24px", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)", fontWeight: 600, textAlign: col === "Actions" ? "right" : "left" }}>{col}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                <AnimatePresence>
                                    {projects.map(project => (
                                        <motion.tr
                                            key={project._id}
                                            variants={rowVariants}
                                            initial="hidden" animate="visible" exit={{ opacity: 0 }}
                                            style={{ borderBottom: "1px solid var(--border-color)", cursor: "pointer" }}
                                            onMouseOver={e => e.currentTarget.style.background = "rgba(255,255,255,0.03)"}
                                            onMouseOut={e => e.currentTarget.style.background = "transparent"}
                                        >
                                            <td style={{ padding: "18px 24px" }}>
                                                <p style={{ fontWeight: 600, margin: "0 0 4px", color: "var(--text-primary)" }}>{project.title}</p>
                                                <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0 }}>Posted {new Date(project.createdAt).toLocaleDateString()}</p>
                                            </td>
                                            <td style={{ padding: "18px 24px", fontWeight: 600, color: "var(--primary)" }}>${project.budget?.toLocaleString()}</td>
                                            <td style={{ padding: "18px 24px", color: "var(--text-secondary)", fontSize: 14 }}>{new Date(project.deadline).toLocaleDateString()}</td>
                                            <td style={{ padding: "18px 24px" }}><Badge variant={getStatusVariant(project.status)}>{project.status}</Badge></td>
                                            <td style={{ padding: "18px 24px", textAlign: "right" }}>
                                                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                                                    <Button variant="outline" size="sm" icon={<Eye size={14} />} onClick={() => navigate(`/client/project/${project._id}`)}>View Bids</Button>
                                                    <Button variant="ghost" size="sm" onClick={() => handleDelete(project._id)} style={{ color: "var(--danger)" }}><Trash2 size={16} /></Button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
}

export default ClientProjects;
