import React, { useState, useEffect } from "react";
import api from "../../api/axiosInstance";

export default function BidReview() {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProposals = async () => {
      try {
        const res = await api.get("/proposals/my-proposals");
        if (res.data.success) {
          setProposals(res.data.proposals);
        }
      } catch (err) {
        setError("Failed to load proposals");
      } finally {
        setLoading(false);
      }
    };
    fetchProposals();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted': return '#10b981'; // Green
      case 'rejected': return '#ef4444'; // Red
      case 'pending': default: return '#f59e0b'; // Yellow
    }
  };

  if (loading) return <div>Loading your proposals...</div>;

  return (
    <div>
      <h2 style={{ marginBottom: '8px' }}>Bid Review</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
        Track the status of your submitted proposals.
      </p>

      {error && <div className="error-banner">{error}</div>}

      {proposals.length === 0 ? (
        <div className="page-placeholder">
          You haven't submitted any proposals yet.
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {proposals.map(proposal => (
            <div key={proposal._id} className="dashboard-card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ borderBottom: 'none', paddingBottom: '0', marginBottom: '8px', fontSize: '18px' }}>
                    {proposal.project?.title || 'Unknown Project'}
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '16px' }}>
                    Submitted on {new Date(proposal.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
                    Bid: ₹{proposal.bidAmount}
                  </div>
                  <span style={{ 
                    display: 'inline-block',
                    marginTop: '8px',
                    padding: '4px 12px',
                    borderRadius: '100px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    backgroundColor: `${getStatusColor(proposal.status)}20`,
                    color: getStatusColor(proposal.status)
                  }}>
                    {proposal.status}
                  </span>
                </div>
              </div>
              
              <div style={{ background: '#f9fafb', padding: '16px', borderRadius: '8px', marginTop: '16px' }}>
                <strong>Cover Letter:</strong>
                <p style={{ marginTop: '8px', color: '#4b5563', lineHeight: '1.5' }}>
                  {proposal.coverLetter}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
