import React, { useState } from "react";
import api from "../api/axiosInstance";

export default function SubmitProposalModal({ project, onClose, onSubmitSuccess }) {
  const [coverLetter, setCoverLetter] = useState("");
  const [bidAmount, setBidAmount] = useState("");
  const [estimatedTime, setEstimatedTime] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await api.post("/proposals/submit", {
        projectId: project._id,
        coverLetter,
        bidAmount: Number(bidAmount),
        estimatedTime,
      });

      if (res.data.success) {
        onSubmitSuccess();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit proposal");
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
      backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, 
      display: 'flex', justifyContent: 'center', alignItems: 'center'
    }}>
      <div className="dashboard-card" style={{ width: '100%', maxWidth: '600px', padding: '24px', margin: '20px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <h2 style={{ marginBottom: 0 }}>Submit Proposal</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>&times;</button>
        </div>

        <div style={{ marginBottom: '20px', padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
          <h4 style={{ margin: '0 0 8px 0' }}>{project.title}</h4>
          <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>Budget: ₹{project.budget}</p>
        </div>

        {error && <div className="error-banner">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Bid Amount (₹)</label>
            <input 
              type="number" 
              value={bidAmount} 
              onChange={(e) => setBidAmount(e.target.value)} 
              placeholder="e.g. 5000" 
              required 
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db' }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Estimated Time</label>
            <input 
              type="text" 
              value={estimatedTime} 
              onChange={(e) => setEstimatedTime(e.target.value)} 
              placeholder="e.g. 2 weeks, 5 days..." 
              required 
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db' }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Cover Letter</label>
            <textarea 
              value={coverLetter} 
              onChange={(e) => setCoverLetter(e.target.value)} 
              rows="6" 
              placeholder="Why are you the best fit for this project?" 
              required 
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button type="button" onClick={onClose} style={{ padding: '10px 16px', background: 'none', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer' }}>
              Cancel
            </button>
            <button type="submit" className="primary-btn" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Proposal"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
