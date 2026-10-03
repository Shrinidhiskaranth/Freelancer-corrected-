import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Layers, Calendar, Tag, Star, CheckCircle } from "lucide-react";
import api from "../../api/axiosInstance";
import LuminaSelect from "../../components/ui/LuminaSelect";
import "../../styles/dashboard.css";

const FIELD = ({ label, children }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
    <label style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</label>
    {children}
  </div>
);

const inputStyle = {
  width: "100%", padding: "13px 16px", borderRadius: "var(--radius-sm)",
  border: "1px solid var(--border-strong)", background: "rgba(255,255,255,0.02)",
  color: "var(--text)", fontSize: 14.5, fontFamily: "var(--font-body)",
  outline: "none", boxSizing: "border-box",
  transition: "border-color .25s, box-shadow .25s",
};




export default function ClientPostProject() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "", description: "", category: "",
    requiredSkills: "", budget: "", deadline: "",
    experienceLevel: "Intermediate"
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setSuccess(""); setLoading(true);
    try {
      const skillsArray = formData.requiredSkills.split(",").map(s => s.trim()).filter(Boolean);
      const res = await api.post("/projects", { ...formData, requiredSkills: skillsArray, budget: Number(formData.budget) });
      if (res.data.success) {
        setSuccess("Project posted successfully!");
        setTimeout(() => navigate("/client/dashboard"), 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to post project");
    } finally { setLoading(false); }
  };

  const focusStyle = (e) => { e.target.style.borderColor = "var(--cyan)"; e.target.style.boxShadow = "0 0 0 4px rgba(47,216,238,0.1)"; };
  const blurStyle  = (e) => { e.target.style.borderColor = "var(--border-strong)"; e.target.style.boxShadow = "none"; };

  return (
    <div className="dashboard-page">
      {/* Header */}
      <div className="dashboard-header-flex">
        <div>
          <h1 style={{ fontSize: 28 }}>Post a New Project</h1>
          <p style={{ color: "var(--text-dim)", marginTop: 6 }}>Fill in the details below to start receiving proposals from top freelancers.</p>
        </div>
      </div>

      {error   && <div className="error-banner">{error}</div>}
      {success && (
        <div style={{ background: "rgba(62,230,168,0.1)", border: "1px solid rgba(62,230,168,0.3)", color: "var(--ok)", padding: "14px 18px", borderRadius: "var(--radius-md)", display: "flex", alignItems: "center", gap: 10 }}>
          <CheckCircle size={16} /> {success}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="dashboard-card" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>

          {/* Title */}
          <div style={{ gridColumn: "1 / -1" }}>
            <FIELD label="Project Title">
              <div style={{ position: "relative" }}>
                <FileText size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-faint)" }} />
                <input type="text" name="title" placeholder="e.g. Build an E-commerce Website"
                  value={formData.title} onChange={handleChange} required
                  style={{ ...inputStyle, paddingLeft: 42 }}
                  onFocus={focusStyle} onBlur={blurStyle} />
              </div>
            </FIELD>
          </div>

          {/* Description */}
          <div style={{ gridColumn: "1 / -1" }}>
            <FIELD label="Description">
              <textarea name="description" placeholder="Describe your project requirements, goals, and any specific details…"
                rows={5} value={formData.description} onChange={handleChange} required
                style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }}
                onFocus={focusStyle} onBlur={blurStyle} />
            </FIELD>
          </div>

          {/* Category */}
          <FIELD label="Category">
            <LuminaSelect
              name="category"
              value={formData.category}
              onChange={handleChange}
              placeholder="Select category"
              icon={Layers}
              options={["Web Development","Mobile Development","Design","Writing","Marketing","Data Science","Video & Animation","Other"]}
            />
          </FIELD>

          {/* Experience Level */}
          <FIELD label="Experience Level">
            <LuminaSelect
              name="experienceLevel"
              value={formData.experienceLevel}
              onChange={handleChange}
              placeholder="Select level"
              icon={Star}
              options={["Beginner","Intermediate","Expert"]}
            />
          </FIELD>

          {/* Skills */}
          <FIELD label="Required Skills (comma separated)">
            <div style={{ position: "relative" }}>
              <Tag size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-faint)" }} />
              <input type="text" name="requiredSkills" placeholder="e.g. React, Node.js, MongoDB"
                value={formData.requiredSkills} onChange={handleChange}
                style={{ ...inputStyle, paddingLeft: 42 }}
                onFocus={focusStyle} onBlur={blurStyle} />
            </div>
          </FIELD>

          {/* Budget */}
          <FIELD label="Budget (₹)">
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "var(--text-faint)", fontSize: "16px", fontFamily: "var(--font-mono)", pointerEvents: "none" }}>₹</span>
              <input type="number" name="budget" placeholder="e.g. 50000" min="0"
                value={formData.budget} onChange={handleChange} required
                style={{ ...inputStyle, paddingLeft: 42 }}
                onFocus={focusStyle} onBlur={blurStyle} />
            </div>
          </FIELD>

          {/* Deadline */}
          <FIELD label="Deadline">
            <div style={{ position: "relative" }}>
              <Calendar size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-faint)" }} />
              <input type="date" name="deadline"
                value={formData.deadline} onChange={handleChange} required
                style={{ ...inputStyle, paddingLeft: 42, colorScheme: "dark" }}
                onFocus={focusStyle} onBlur={blurStyle} />
            </div>
          </FIELD>

          {/* Submit */}
          <div style={{ gridColumn: "1 / -1", marginTop: 8 }}>
            <button type="submit" disabled={loading} style={{
              width: "100%", padding: "15px 24px", borderRadius: 999, border: "none",
              background: loading ? "rgba(255,255,255,0.05)" : "linear-gradient(90deg,#2fd8ee,#8b6bf5)",
              color: loading ? "var(--text-faint)" : "#04070d",
              fontWeight: 700, fontSize: 16, cursor: loading ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              transition: "box-shadow .25s",
            }}
              onMouseOver={e => { if (!loading) e.currentTarget.style.boxShadow = "0 8px 30px -8px rgba(47,216,238,.55)"; }}
              onMouseOut={e => e.currentTarget.style.boxShadow = "none"}
            >
              {loading && <span style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid rgba(4,7,13,.3)", borderTopColor: "#04070d", animation: "spin .7s linear infinite", display: "inline-block" }} />}
              {loading ? "Posting Project…" : "Post Project"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}