import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axiosInstance";

export default function ClientProfile() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    phoneNumber: "",
    companyName: "",
    industry: "",
    companyWebsite: "",
    companySize: "",
    country: "",
    state: "",
    city: "",
    timeZone: "",
    about: "",
    hiringPreference: "",
    preferredCommunication: "",
    languagesSpoken: "",
    preferredCurrency: "",
    linkedin: "",
    portfolioWebsite: "",
    agreedToTerms: true,
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/client/profile/me");
        if (res.data.success && res.data.profile) {
          const p = res.data.profile;
          setFormData({
            phoneNumber: p.phoneNumber || "",
            companyName: p.companyName || "",
            industry: p.industry || "",
            companyWebsite: p.companyWebsite || "",
            companySize: p.companySize || "",
            country: p.country || "",
            state: p.state || "",
            city: p.city || "",
            timeZone: p.timeZone || "",
            about: p.about || "",
            hiringPreference: p.hiringPreference || "",
            preferredCommunication: p.preferredCommunication || "",
            languagesSpoken: p.languagesSpoken ? p.languagesSpoken.join(", ") : "",
            preferredCurrency: p.preferredCurrency || "",
            linkedin: p.linkedin || "",
            portfolioWebsite: p.portfolioWebsite || "",
            agreedToTerms: true,
          });
        }
      } catch (err) {
        setError("Failed to load profile data. " + (err.response?.data?.message || ""));
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

      const res = await api.post("/client/profile", data, {
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

  if (loading) {
    return <div className="dashboard-content"><p>Loading profile...</p></div>;
  }

  return (
    <div className="dashboard-content">
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ marginBottom: '8px' }}>My Profile</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
          Manage your personal and company information.
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
              <h3>Company Information</h3>
              <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '12px 0 20px 0' }} />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Company Name</label>
              <input type="text" name="companyName" value={formData.companyName} onChange={handleChange} placeholder="e.g. Acme Corp" />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Industry</label>
              <input type="text" name="industry" value={formData.industry} onChange={handleChange} placeholder="e.g. Software" />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Company Website</label>
              <input type="url" name="companyWebsite" value={formData.companyWebsite} onChange={handleChange} placeholder="https://example.com" />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Company Size</label>
              <select name="companySize" value={formData.companySize} onChange={handleChange}>
                <option value="">Select size</option>
                <option value="1-10">1-10 employees</option>
                <option value="11-50">11-50 employees</option>
                <option value="51-200">51-200 employees</option>
                <option value="200+">200+ employees</option>
              </select>
            </div>

            <div style={{ gridColumn: '1 / -1', marginTop: '20px' }}>
              <h3>Location & Contact</h3>
              <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '12px 0 20px 0' }} />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Country</label>
              <input type="text" name="country" value={formData.country} onChange={handleChange} />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>City</label>
              <input type="text" name="city" value={formData.city} onChange={handleChange} />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Phone Number</label>
              <input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Time Zone</label>
              <input type="text" name="timeZone" value={formData.timeZone} onChange={handleChange} placeholder="e.g. IST, PST" />
            </div>

            <div style={{ gridColumn: '1 / -1', marginTop: '20px' }}>
              <h3>Additional Information</h3>
              <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '12px 0 20px 0' }} />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>About Company</label>
              <textarea name="about" value={formData.about} onChange={handleChange} rows="4" placeholder="Brief description of what your company does..."></textarea>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Languages Spoken</label>
              <input type="text" name="languagesSpoken" value={formData.languagesSpoken} onChange={handleChange} placeholder="e.g. English, Hindi" />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>LinkedIn Profile</label>
              <input type="url" name="linkedin" value={formData.linkedin} onChange={handleChange} placeholder="https://linkedin.com/..." />
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