import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axiosInstance";

export default function FreelancerProfile() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    professionalTitle: "",
    yearsOfExperience: "",
    category: "",
    skills: "",
    hourlyRate: "",
    portfolioWebsite: "",
    github: "",
    linkedin: "",
    professionalSummary: "",
    country: "",
    city: "",
    agreedToTerms: true
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/freelancer/profile/me");
        if (res.data.success && res.data.profile) {
          const p = res.data.profile;
          setFormData({
            professionalTitle: p.professionalTitle || "",
            yearsOfExperience: p.yearsOfExperience || "",
            category: p.category || "",
            skills: p.skills ? p.skills.join(", ") : "",
            hourlyRate: p.hourlyRate || "",
            portfolioWebsite: p.portfolioWebsite || "",
            github: p.github || "",
            linkedin: p.linkedin || "",
            professionalSummary: p.professionalSummary || "",
            country: p.country || "",
            city: p.city || "",
            agreedToTerms: true
          });
        }
      } catch (err) {
        setError("Failed to load profile data.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        data.append(key, formData[key]);
      });

      const res = await api.post("/freelancer/profile", data, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      if (res.data.success) {
        setSuccess("Profile updated successfully!");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading profile...</div>;

  return (
    <div className="dashboard-content" style={{ padding: 0 }}>
      <div style={{ maxWidth: '800px' }}>
        <h2 style={{ marginBottom: '8px' }}>My Freelancer Profile</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
          Manage your skills, rates, and portfolio to attract more clients.
        </p>

        {error && <div className="error-banner">{error}</div>}
        {success && (
          <div style={{ background: '#ecfdf5', color: '#065f46', border: '1px solid #10b981', padding: '12px 16px', borderRadius: 'var(--radius-md)', marginBottom: '20px' }}>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="dashboard-card">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            
            <div style={{ gridColumn: '1 / -1' }}>
              <h3>Personal Information</h3>
              <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '12px 0 20px 0' }} />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Full Name</label>
              <input type="text" value={user?.fullName || ""} disabled style={{ backgroundColor: '#f9fafb', color: '#6b7280', cursor: 'not-allowed' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Email Address</label>
              <input type="email" value={user?.email || ""} disabled style={{ backgroundColor: '#f9fafb', color: '#6b7280', cursor: 'not-allowed' }} />
            </div>

            <div style={{ gridColumn: '1 / -1', marginTop: '20px' }}>
              <h3>Professional Details</h3>
              <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '12px 0 20px 0' }} />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Professional Title</label>
              <input type="text" name="professionalTitle" value={formData.professionalTitle} onChange={handleChange} placeholder="e.g. Senior React Developer" required />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Category</label>
              <select name="category" value={formData.category} onChange={handleChange} required>
                <option value="">Select Category</option>
                <option value="Web Development">Web Development</option>
                <option value="Mobile Development">Mobile Development</option>
                <option value="Design">Design</option>
                <option value="Writing">Writing</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Years of Experience</label>
              <input type="number" name="yearsOfExperience" value={formData.yearsOfExperience} onChange={handleChange} min="0" required />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Hourly Rate (₹)</label>
              <input type="number" name="hourlyRate" value={formData.hourlyRate} onChange={handleChange} min="0" required />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Skills (comma separated)</label>
              <input type="text" name="skills" value={formData.skills} onChange={handleChange} placeholder="e.g. React, Node.js, CSS" required />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Professional Summary</label>
              <textarea name="professionalSummary" value={formData.professionalSummary} onChange={handleChange} rows="4" placeholder="Briefly describe your expertise..." required></textarea>
            </div>

            <div style={{ gridColumn: '1 / -1', marginTop: '20px' }}>
              <h3>Links & Location</h3>
              <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '12px 0 20px 0' }} />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Portfolio Website</label>
              <input type="url" name="portfolioWebsite" value={formData.portfolioWebsite} onChange={handleChange} placeholder="https://..." />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>GitHub Profile</label>
              <input type="url" name="github" value={formData.github} onChange={handleChange} placeholder="https://github.com/..." />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>LinkedIn Profile</label>
              <input type="url" name="linkedin" value={formData.linkedin || ""} onChange={handleChange} placeholder="https://linkedin.com/in/..." />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Phone Number</label>
              <input type="tel" name="phoneNumber" value={formData.phoneNumber || ""} onChange={handleChange} placeholder="+1 234 567 890" />
            </div>

            <div style={{ gridColumn: '1 / -1', marginTop: '20px' }}>
              <h3>Education</h3>
              <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '12px 0 20px 0' }} />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Highest Qualification</label>
              <input type="text" name="highestQualification" value={formData.highestQualification || ""} onChange={handleChange} placeholder="e.g. B.Sc Computer Science" />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>College / University</label>
              <input type="text" name="collegeOrUniversity" value={formData.collegeOrUniversity || ""} onChange={handleChange} placeholder="University Name" />
            </div>

            <div style={{ gridColumn: '1 / -1', marginTop: '20px' }}>
              <h3>Location</h3>
              <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '12px 0 20px 0' }} />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Country</label>
              <input type="text" name="country" value={formData.country} onChange={handleChange} required />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>City</label>
              <input type="text" name="city" value={formData.city} onChange={handleChange} required />
            </div>

            <div style={{ gridColumn: '1 / -1', marginTop: '16px' }}>
              <button type="submit" className="primary-btn" disabled={saving} style={{ width: '100%', padding: '14px' }}>
                {saving ? "Saving..." : "Save Profile"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
