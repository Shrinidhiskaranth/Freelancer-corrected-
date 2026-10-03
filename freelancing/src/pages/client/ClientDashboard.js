import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Briefcase, MessageSquare, Clock, FileCheck, Plus, Eye, Trash2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axiosInstance";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import { motion, AnimatePresence } from "framer-motion";
import "../../styles/dashboard.css";

function ClientDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    
    const [projects, setProjects] = useState([]);
    const [stats, setStats] = useState({ activeContracts: 0, pendingProposals: 0, unreadMessages: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch projects — this is the critical call
                const projectsRes = await api.get("/projects/client/my-projects");
                if (projectsRes.data.success) setProjects(projectsRes.data.projects);
            } catch (err) {
                setError(err.response?.data?.message || "Failed to load projects");
            } finally {
                setLoading(false);
            }

            // Fetch stats separately — a failure here won't break the dashboard
            try {
                const statsRes = await api.get("/client/stats");
                if (statsRes.data.success) setStats({
                    activeContracts: statsRes.data.activeContracts,
                    pendingProposals: statsRes.data.pendingProposals,
                    unreadMessages: statsRes.data.unreadMessages,
                });
            } catch {
                // Stats are non-critical — silently ignore if they fail
            }
        };

        fetchData();
    }, []);

    const getStatusBadgeVariant = (status) => {
        switch (status) {
            case "Open": return "primary";
            case "In Progress": return "warning";
            case "Completed": return "success";
            case "Cancelled": return "danger";
            default: return "neutral";
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this project?")) return;
        try {
            const res = await api.delete(`/projects/${id}`);
            if (res.data.success) {
                setProjects(projects.filter(p => p._id !== id));
            }
        } catch (err) {
            alert(err.response?.data?.message || "Failed to delete project");
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1, delayChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
    };

    return (
        <motion.div 
            className="dashboard-page"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
        >
            <motion.div className="dashboard-header-flex" variants={itemVariants}>
                <div>
                    <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>Welcome back, {user?.fullName}</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Here is what's happening with your projects today.</p>
                </div>
                <Button variant="primary" icon={<Plus size={18} />} onClick={() => navigate("/client/post-project")}>
                    Post New Project
                </Button>
            </motion.div>

            {error && <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="error-banner">{error}</motion.div>}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <motion.div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }} variants={containerVariants}>
                    <motion.div variants={itemVariants} whileHover={{ y: -5 }} transition={{ type: "spring", stiffness: 400 }}>
                    <Card hover padding="md" className="stat-widget">
                        <div className="neon-icon-wrapper cyan">
                            <Briefcase size={24} />
                        </div>
                        <h2 style={{ fontSize: '32px', margin: '0 0 4px 0' }}>{projects.length}</h2>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: '500' }}>Projects Posted</span>
                    </Card>
                    </motion.div>

                    <motion.div variants={itemVariants} whileHover={{ y: -5 }} transition={{ type: "spring", stiffness: 400 }}>
                    <Card hover padding="md" className="stat-widget">
                        <div className="neon-icon-wrapper yellow">
                            <Clock size={24} />
                        </div>
                        <h2 style={{ fontSize: '32px', margin: '0 0 4px 0' }}>{stats.pendingProposals}</h2>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: '500' }}>Pending Proposals</span>
                    </Card>
                    </motion.div>

                    <motion.div variants={itemVariants} whileHover={{ y: -5 }} transition={{ type: "spring", stiffness: 400 }}>
                    <Card hover padding="md" className="stat-widget">
                        <div className="neon-icon-wrapper green">
                            <FileCheck size={24} />
                        </div>
                        <h2 style={{ fontSize: '32px', margin: '0 0 4px 0' }}>{stats.activeContracts}</h2>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: '500' }}>Active Contracts</span>
                    </Card>
                    </motion.div>

                    <motion.div variants={itemVariants} whileHover={{ y: -5 }} transition={{ type: "spring", stiffness: 400 }}>
                    <Card hover padding="md" className="stat-widget">
                        <div className="neon-icon-wrapper purple">
                            <MessageSquare size={24} />
                        </div>
                        <h2 style={{ fontSize: '32px', margin: '0 0 4px 0' }}>{stats.unreadMessages}</h2>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: '500' }}>Unread Messages</span>
                    </Card>
                    </motion.div>
                </motion.div>

                <motion.div variants={itemVariants}>
                <Card className="dashboard-projects-section">
                    <div style={{ padding: '24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ fontSize: '18px', margin: 0 }}>Recent Projects</h3>
                        <Button variant="ghost" size="sm" onClick={() => navigate("/client/my-projects")}>View All</Button>
                    </div>

                    {loading ? (
                        <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
                            <div className="spinner" style={{ margin: '0 auto 16px auto', borderTopColor: 'var(--primary)' }}></div>
                            <p>Loading your projects...</p>
                        </div>
                    ) : projects.length === 0 ? (
                        <div style={{ padding: '64px 24px', textAlign: 'center' }}>
                            <div style={{ background: 'var(--bg-main)', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px auto' }}>
                                <Briefcase size={32} color="var(--text-muted)" />
                            </div>
                            <h3 style={{ marginBottom: '8px' }}>No projects yet</h3>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Get started by posting your first project to hire top talent.</p>
                            <Button variant="primary" icon={<Plus size={18} />} onClick={() => navigate("/client/post-project")}>
                                Post a Project
                            </Button>
                        </div>
                    ) : (
                        <div className="modern-table-container" style={{ overflowX: 'auto' }}>
                            <table className="modern-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead>
                                    <tr>
                                        <th style={{ padding: '16px 24px', textAlign: 'left', color: 'var(--text-muted)', fontSize: '13px', textTransform: 'uppercase' }}>Project Details</th>
                                        <th style={{ padding: '16px 24px', textAlign: 'left', color: 'var(--text-muted)', fontSize: '13px', textTransform: 'uppercase' }}>Budget</th>
                                        <th style={{ padding: '16px 24px', textAlign: 'left', color: 'var(--text-muted)', fontSize: '13px', textTransform: 'uppercase' }}>Status</th>
                                        <th style={{ padding: '16px 24px', textAlign: 'right', color: 'var(--text-muted)', fontSize: '13px', textTransform: 'uppercase' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <AnimatePresence>
                                    {projects.slice(0, 5).map(project => (
                                        <motion.tr key={project._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} layout>
                                            <td style={{ padding: '20px 24px' }}>
                                                <div style={{ fontWeight: '600', color: 'var(--text-primary)', marginBottom: '4px' }}>{project.title}</div>
                                                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Posted: {new Date(project.createdAt).toLocaleDateString()}</div>
                                            </td>
                                            <td style={{ padding: '20px 24px', fontWeight: '500' }}>
                                                {user?.currency === 'INR' ? '₹' : '$'}{project.budget.toLocaleString()}
                                            </td>
                                            <td style={{ padding: '20px 24px' }}>
                                                <Badge variant={getStatusBadgeVariant(project.status)}>{project.status}</Badge>
                                            </td>
                                            <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                    <Button variant="outline" size="sm" icon={<Eye size={16} />} onClick={() => navigate(`/client/project/${project._id}`)}>
                                                        View
                                                    </Button>
                                                    <Button variant="ghost" size="sm" onClick={() => handleDelete(project._id)} style={{ color: 'var(--accent)' }}>
                                                        <Trash2 size={16} />
                                                    </Button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                    </AnimatePresence>
                                </tbody>
                            </table>
                        </div>
                    )}
                </Card>
                </motion.div>
            </div>
        </motion.div>
    );
}

export default ClientDashboard;