import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axiosInstance";
import { useAuth } from "../../context/AuthContext";
import "../../styles/profile.css";

function ClientCompleteProfile() {
    const navigate = useNavigate();
    const { user, updateUser } = useAuth();

    const [form, setForm] = useState({
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
        identityVerified: false,
        paymentMethodAdded: false,
        linkedin: "",
        portfolioWebsite: "",
        agreedToTerms: false,
    });
    const [profilePicture, setProfilePicture] = useState(null);
    const [companyLogo, setCompanyLogo] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, type, value, checked } = e.target;
        setForm({ ...form, [name]: type === "checkbox" ? checked : value });
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
        if (profilePicture) data.append("profilePicture", profilePicture);
        if (companyLogo) data.append("companyLogo", companyLogo);

        setLoading(true);
        try {
            const res = await api.post("/client/profile", data, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            if (res.data.success) {
                updateUser({ ...user, profileCompleted: true });
                navigate("/client/dashboard");
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
                <h1>Complete Your Client Profile</h1>
                {error && <div className="error-banner">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <section>
                        <h2>Basic Information</h2>
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
                    </section>

                    <section>
                        <h2>Company Information</h2>
                        <label>Company Name</label>
                        <input name="companyName" type="text" value={form.companyName} onChange={handleChange} />
                        <label>Company Logo</label>
                        <input type="file" accept="image/*" onChange={(e) => setCompanyLogo(e.target.files[0])} />
                        <label>Industry</label>
                        <input name="industry" type="text" value={form.industry} onChange={handleChange} />
                        <label>Company Website</label>
                        <input name="companyWebsite" type="text" value={form.companyWebsite} onChange={handleChange} />
                        <label>Company Size</label>
                        <select name="companySize" value={form.companySize} onChange={handleChange}>
                            <option value="">Select</option>
                            <option value="1-10">1-10</option>
                            <option value="11-50">11-50</option>
                            <option value="51-200">51-200</option>
                            <option value="200+">200+</option>
                        </select>
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
                        <h2>About</h2>
                        <label>About Me / Company Description</label>
                        <textarea name="about" value={form.about} onChange={handleChange} rows={3} />
                        <label>What kind of freelancers do you usually hire?</label>
                        <textarea name="hiringPreference" value={form.hiringPreference} onChange={handleChange} rows={2} />
                    </section>

                    <section>
                        <h2>Preferences</h2>
                        <label>Preferred Communication</label>
                        <select name="preferredCommunication" value={form.preferredCommunication} onChange={handleChange}>
                            <option value="">Select</option>
                            <option value="Email">Email</option>
                            <option value="Chat">Chat</option>
                            <option value="Video Call">Video Call</option>
                        </select>
                        <label>Languages Spoken (comma separated)</label>
                        <input name="languagesSpoken" type="text" value={form.languagesSpoken} onChange={handleChange} placeholder="English, Hindi" />
                        <label>Preferred Currency</label>
                        <input name="preferredCurrency" type="text" value={form.preferredCurrency} onChange={handleChange} placeholder="USD" />
                    </section>

                    <section>
                        <h2>Verification (optional)</h2>
                        <label className="checkbox-label">
                            <input name="identityVerified" type="checkbox" checked={form.identityVerified} onChange={handleChange} />
                            Identity Verification requested
                        </label>
                        <label className="checkbox-label">
                            <input name="paymentMethodAdded" type="checkbox" checked={form.paymentMethodAdded} onChange={handleChange} />
                            Payment method added
                        </label>
                    </section>

                    <section>
                        <h2>Social Links</h2>
                        <label>LinkedIn</label>
                        <input name="linkedin" type="text" value={form.linkedin} onChange={handleChange} />
                        <label>Portfolio / Website</label>
                        <input name="portfolioWebsite" type="text" value={form.portfolioWebsite} onChange={handleChange} />
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

export default ClientCompleteProfile;
