import React, { useState, useEffect } from "react";
import api from "../../api/axiosInstance";
import SubmitProposalModal from "../../components/SubmitProposalModal";

export default function BrowseJobs() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  
  // Modal state
  const [selectedProject, setSelectedProject] = useState(null);
  
  // Filters
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [experienceFilter, setExperienceFilter] = useState("");

  useEffect(() => {
    const fetchOpenProjects = async () => {
      try {
        const res = await api.get("/projects/open");
        if (res.data.success) {
          setProjects(res.data.projects);
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load projects");
      } finally {
        setLoading(false);
      }
    };

    fetchOpenProjects();
  }, []);

  // Apply filters
  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter ? p.category === categoryFilter : true;
    const matchesExperience = experienceFilter ? p.experienceLevel === experienceFilter : true;
    return matchesSearch && matchesCategory && matchesExperience;
  });

  if (loading) return <div>Loading open projects...</div>;

  return (
    <div>
      <h2 style={{ marginBottom: '8px' }}>Browse Projects</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
        Find and apply for projects that match your skills.
      </p>

      {error && <div className="error-banner">{error}</div>}
      {successMsg && (
        <div style={{ background: '#ecfdf5', color: '#065f46', border: '1px solid #10b981', padding: '12px 16px', borderRadius: 'var(--radius-md)', marginBottom: '20px' }}>
          {successMsg}
        </div>
      )}

      {/* Filters Section */}
      <div className="dashboard-card" style={{ padding: '20px', marginBottom: '24px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        <input 
          type="text" 
          placeholder="Search by keyword..." 
          value={search} 
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: '1', minWidth: '200px' }}
        />
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} style={{ minWidth: '150px' }}>
          <option value="">All Categories</option>
          <option value="Web Development">Web Development</option>
          <option value="Mobile Development">Mobile Development</option>
          <option value="Design">Design</option>
          <option value="Writing">Writing</option>
          <option value="Marketing">Marketing</option>
        </select>
        <select value={experienceFilter} onChange={(e) => setExperienceFilter(e.target.value)} style={{ minWidth: '150px' }}>
          <option value="">All Experience Levels</option>
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Expert">Expert</option>
        </select>
      </div>

      {/* Projects List */}
      <div>
        {filteredProjects.length === 0 ? (
          <div className="page-placeholder">No projects found matching your criteria.</div>
        ) : (
          <div style={{ display: 'grid', gap: '16px' }}>
            {filteredProjects.map(project => (
              <div key={project._id} className="dashboard-card" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ borderBottom: 'none', paddingBottom: '0', marginBottom: '8px', fontSize: '20px' }}>
                      {project.title}
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '16px' }}>
                      Posted by: {project.clientId?.fullName || "Client"} • {new Date(project.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--primary)' }}>
                      ₹{project.budget}
                    </div>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{project.experienceLevel}</span>
                  </div>
                </div>

                <p style={{ marginBottom: '20px', lineHeight: '1.6' }}>
                  {project.description.length > 200 ? project.description.substring(0, 200) + "..." : project.description}
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
                  {project.requiredSkills?.map((skill, index) => (
                    <span key={index} style={{ background: '#f3f4f6', padding: '4px 12px', borderRadius: '100px', fontSize: '12px', color: '#4b5563' }}>
                      {skill}
                    </span>
                  ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '14px', color: '#6b7280' }}>Category: {project.category}</span>
                  <button className="primary-btn" onClick={() => setSelectedProject(project)}>
                    View Details & Apply
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedProject && (
        <SubmitProposalModal 
          project={selectedProject} 
          onClose={() => setSelectedProject(null)} 
          onSubmitSuccess={() => {
            setSelectedProject(null);
            setSuccessMsg("Proposal submitted successfully!");
            setTimeout(() => setSuccessMsg(""), 5000);
          }} 
        />
      )}
    </div>
  );
}
