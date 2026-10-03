import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axiosInstance";
import { useAuth } from "../../context/AuthContext";
import "../../styles/profile.css";

const emptyWorkExperience = { companyName: "", jobTitle: "", startDate: "", endDate: "", description: "" };
const emptyCertification = { name: "", issuingOrganization: "" };
const emptyLanguage = { language: "", proficiency: "" };

function FreelancerCompleteProfile() {
    const navigate = useNavigate();
    const { user, updateUser } = useAuth();

    const [form, setForm] = useState({
        phoneNumber: "",
        dateOfBirth: "",
        gender: "",
        professionalTitle: "",
        yearsOfExperience: "",
        category: "",
        skills: "",
        hourlyRate: "",
        availability: "",
        professionalSummary: "",
        careerObjective: "",
        highestQualification: "",
        collegeOrUniversity: "",
        graduationYear: "",
        portfolioWebsite: "",
        github: "",
        linkedin: "",
        country: "",
        state: "",
        city: "",
        timeZone: "",
        preferredPaymentMethod: "",
        paymentDetails: "",
        identityVerified: false,
        emailVerified: false,
        phoneVerified: false,
        preferredJobType: "",
        remoteOrOnsite: "",
        agreedToTerms: false,
    });

    const [workExperience, setWorkExperience] = useState([{ ...emptyWorkExperience }]);
    const [certifications, setCertifications] = useState([{ ...emptyCertification }]);
    const [certificateFiles, setCertificateFiles] = useState([]);
    const [languages, setLanguages] = useState([{ ...emptyLanguage }]);

    const [profilePicture, setProfilePicture] = useState(null);
    const [resume, setResume] = useState(null);
    const [portfolioFiles, setPortfolioFiles] = useState([]);

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, type, value, checked } = e.target;
        setForm({ ...form, [name]: type === "checkbox" ? checked : value });
    };

    const updateListItem = (list, setList, index, field, value) => {
        const updated = [...list];
        updated[index] = { ...updated[index], [field]: value };
        setList(updated);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!form.agreedToTerms) {
            setError("You must agree to the Terms & Conditions");
            return;
        }

        const data = new FormData();
        Object.entries(form).forEach(([key, value]) => data.append(key, value));
        data.append("workExperience", JSON.stringify(workExperience));
        data.append("certifications", JSON.stringify(certifications));
        data.append("languages", JSON.stringify(languages));

        if (profilePicture) data.append("profilePicture", profilePicture);
        if (resume) data.append("resume", resume);
        portfolioFiles.forEach((file) => data.append("portfolioFiles", file));
        certificateFiles.forEach((file) => data.append("certificateFiles", file));

        setLoading(true);
        try {
            const res = await api.post("/freelancer/profile", data, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            if (res.data.success) {
                updateUser({ ...user, profileCompleted: true });
                navigate("/freelancer/dashboard");
            } else {
                setError(res.data.message);
            }
        } catch (err) {
            setError(err.response?.data?.message || "Failed to save profile");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="profile-page">
            <div className="profile-card">
                <h1>Complete Your Freelancer Profile</h1>
                {error && <div className="error-banner">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <section>
                        <h2>Personal Information</h2>
                        <label>Full Name</label>
                        <input type="text" value={user?.fullName || ""} disabled />
                        <label>Profile Picture</label>
                        <input type="file" accept="image/*" onChange={(e) => setProfilePicture(e.target.files[0])} />
                        <label>Username</label>
                        <input type="text" value={user?.username || ""} disabled />
                        <label>Email</label>
                        <input type="text" value={user?.email || ""} disabled />
                        <label>Phone Number</label>
                        <input name="phoneNumber" type="tel" value={form.phoneNumber} onChange={handleChange} />
                        <label>Date of Birth</label>
                        <input name="dateOfBirth" type="date" value={form.dateOfBirth} onChange={handleChange} />
                        <label>Gender</label>
                        <select name="gender" value={form.gender} onChange={handleChange}>
                            <option value="">Select</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                            <option value="Prefer not to say">Prefer not to say</option>
                        </select>
                    </section>

                    <section>
                        <h2>Professional Information</h2>
                        <label>Professional Title</label>
                        <input name="professionalTitle" type="text" value={form.professionalTitle} onChange={handleChange} placeholder="e.g. Full Stack Developer" />
                        <label>Years of Experience</label>
                        <input name="yearsOfExperience" type="number" min="0" value={form.yearsOfExperience} onChange={handleChange} />
                        <label>Category</label>
                        <input name="category" type="text" value={form.category} onChange={handleChange} placeholder="e.g. Web Development" />
                        <label>Skills (comma separated)</label>
                        <input name="skills" type="text" value={form.skills} onChange={handleChange} placeholder="React, Node.js, MongoDB" />
                        <label>Hourly Rate</label>
                        <input name="hourlyRate" type="number" min="0" value={form.hourlyRate} onChange={handleChange} />
                        <label>Availability</label>
                        <select name="availability" value={form.availability} onChange={handleChange}>
                            <option value="">Select</option>
                            <option value="Full-time">Full-time</option>
                            <option value="Part-time">Part-time</option>
                            <option value="Not available">Not available</option>
                        </select>
                    </section>

                    <section>
                        <h2>About</h2>
                        <label>Professional Summary</label>
                        <textarea name="professionalSummary" value={form.professionalSummary} onChange={handleChange} rows={3} />
                        <label>Career Objective</label>
                        <textarea name="careerObjective" value={form.careerObjective} onChange={handleChange} rows={2} />
                    </section>

                    <section>
                        <h2>Education</h2>
                        <label>Highest Qualification</label>
                        <input name="highestQualification" type="text" value={form.highestQualification} onChange={handleChange} />
                        <label>College / University</label>
                        <input name="collegeOrUniversity" type="text" value={form.collegeOrUniversity} onChange={handleChange} />
                        <label>Graduation Year</label>
                        <input name="graduationYear" type="text" value={form.graduationYear} onChange={handleChange} />
                    </section>

                    <section>
                        <h2>Work Experience</h2>
                        {workExperience.map((exp, i) => (
                            <div className="repeatable-block" key={i}>
                                <label>Company Name</label>
                                <input type="text" value={exp.companyName} onChange={(e) => updateListItem(workExperience, setWorkExperience, i, "companyName", e.target.value)} />
                                <label>Job Title</label>
                                <input type="text" value={exp.jobTitle} onChange={(e) => updateListItem(workExperience, setWorkExperience, i, "jobTitle", e.target.value)} />
                                <label>Start Date</label>
                                <input type="date" value={exp.startDate} onChange={(e) => updateListItem(workExperience, setWorkExperience, i, "startDate", e.target.value)} />
                                <label>End Date</label>
                                <input type="date" value={exp.endDate} onChange={(e) => updateListItem(workExperience, setWorkExperience, i, "endDate", e.target.value)} />
                                <label>Description</label>
                                <textarea rows={2} value={exp.description} onChange={(e) => updateListItem(workExperience, setWorkExperience, i, "description", e.target.value)} />
                                {workExperience.length > 1 && (
                                    <button type="button" className="remove-btn" onClick={() => setWorkExperience(workExperience.filter((_, idx) => idx !== i))}>Remove</button>
                                )}
                            </div>
                        ))}
                        <button type="button" className="add-btn" onClick={() => setWorkExperience([...workExperience, { ...emptyWorkExperience }])}>+ Add Work Experience</button>
                    </section>

                    <section>
                        <h2>Portfolio</h2>
                        <label>Portfolio Website</label>
                        <input name="portfolioWebsite" type="text" value={form.portfolioWebsite} onChange={handleChange} />
                        <label>GitHub</label>
                        <input name="github" type="text" value={form.github} onChange={handleChange} />
                        <label>LinkedIn</label>
                        <input name="linkedin" type="text" value={form.linkedin} onChange={handleChange} />
                        <label>Resume Upload</label>
                        <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => setResume(e.target.files[0])} />
                        <label>Portfolio Images / Files</label>
                        <input type="file" multiple onChange={(e) => setPortfolioFiles(Array.from(e.target.files))} />
                    </section>

                    <section>
                        <h2>Certifications</h2>
                        {certifications.map((cert, i) => (
                            <div className="repeatable-block" key={i}>
                                <label>Certification Name</label>
                                <input type="text" value={cert.name} onChange={(e) => updateListItem(certifications, setCertifications, i, "name", e.target.value)} />
                                <label>Issuing Organization</label>
                                <input type="text" value={cert.issuingOrganization} onChange={(e) => updateListItem(certifications, setCertifications, i, "issuingOrganization", e.target.value)} />
                                <label>Certificate Upload</label>
                                <input type="file" onChange={(e) => {
                                    const updated = [...certificateFiles];
                                    updated[i] = e.target.files[0];
                                    setCertificateFiles(updated);
                                }} />
                                {certifications.length > 1 && (
                                    <button type="button" className="remove-btn" onClick={() => setCertifications(certifications.filter((_, idx) => idx !== i))}>Remove</button>
                                )}
                            </div>
                        ))}
                        <button type="button" className="add-btn" onClick={() => setCertifications([...certifications, { ...emptyCertification }])}>+ Add Certification</button>
                    </section>

                    <section>
                        <h2>Languages</h2>
                        {languages.map((lang, i) => (
                            <div className="repeatable-block inline" key={i}>
                                <input type="text" placeholder="Language" value={lang.language} onChange={(e) => updateListItem(languages, setLanguages, i, "language", e.target.value)} />
                                <select value={lang.proficiency} onChange={(e) => updateListItem(languages, setLanguages, i, "proficiency", e.target.value)}>
                                    <option value="">Proficiency</option>
                                    <option value="Basic">Basic</option>
                                    <option value="Conversational">Conversational</option>
                                    <option value="Fluent">Fluent</option>
                                    <option value="Native">Native</option>
                                </select>
                                {languages.length > 1 && (
                                    <button type="button" className="remove-btn" onClick={() => setLanguages(languages.filter((_, idx) => idx !== i))}>Remove</button>
                                )}
                            </div>
                        ))}
                        <button type="button" className="add-btn" onClick={() => setLanguages([...languages, { ...emptyLanguage }])}>+ Add Language</button>
                    </section>

                    <section>
                        <h2>Location</h2>
                        <label>Country</label>
                        <input name="country" type="text" value={form.country} onChange={handleChange} />
                        <label>State</label>
                        <input name="state" type="text" value={form.state} onChange={handleChange} />
                        <label>City</label>
                        <input name="city" type="text" value={form.city} onChange={handleChange} />
                        <label>Time Zone</label>
                        <input name="timeZone" type="text" value={form.timeZone} onChange={handleChange} placeholder="e.g. GMT+5:30" />
                    </section>

                    <section>
                        <h2>Payment</h2>
                        <label>Preferred Payment Method</label>
                        <select name="preferredPaymentMethod" value={form.preferredPaymentMethod} onChange={handleChange}>
                            <option value="">Select</option>
                            <option value="Bank Transfer">Bank Transfer</option>
                            <option value="UPI">UPI</option>
                            <option value="PayPal">PayPal</option>
                        </select>
                        <label>Bank / UPI / PayPal details (optional)</label>
                        <input name="paymentDetails" type="text" value={form.paymentDetails} onChange={handleChange} />
                    </section>

                    <section>
                        <h2>Verification</h2>
                        <label className="checkbox-label">
                            <input name="identityVerified" type="checkbox" checked={form.identityVerified} onChange={handleChange} />
                            Identity Verification requested
                        </label>
                        <label className="checkbox-label">
                            <input name="emailVerified" type="checkbox" checked={form.emailVerified} onChange={handleChange} />
                            Email Verified
                        </label>
                        <label className="checkbox-label">
                            <input name="phoneVerified" type="checkbox" checked={form.phoneVerified} onChange={handleChange} />
                            Phone Verified
                        </label>
                    </section>

                    <section>
                        <h2>Preferences</h2>
                        <label>Preferred Job Type</label>
                        <select name="preferredJobType" value={form.preferredJobType} onChange={handleChange}>
                            <option value="">Select</option>
                            <option value="Fixed Price">Fixed Price</option>
                            <option value="Hourly">Hourly</option>
                            <option value="Both">Both</option>
                        </select>
                        <label>Remote / On-site Preference</label>
                        <select name="remoteOrOnsite" value={form.remoteOrOnsite} onChange={handleChange}>
                            <option value="">Select</option>
                            <option value="Remote">Remote</option>
                            <option value="On-site">On-site</option>
                            <option value="Hybrid">Hybrid</option>
                        </select>
                    </section>

                    <label className="checkbox-label agreement">
                        <input name="agreedToTerms" type="checkbox" checked={form.agreedToTerms} onChange={handleChange} />
                        I agree to the Terms & Conditions
                    </label>

                    <button type="submit" disabled={loading}>{loading ? "Saving..." : "Complete Profile"}</button>
                </form>
            </div>
        </div>
    );
}

export default FreelancerCompleteProfile;
