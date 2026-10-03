import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import LandingPage from "./pages/LandingPage";
import RoleSelect from "./pages/RoleSelect";

// Client
import ClientLayout from "./pages/client/ClientLayout";
import ClientRegister from "./pages/client/ClientRegister";
import ClientLogin from "./pages/client/ClientLogin";
import ClientCompleteProfile from "./pages/client/ClientCompleteProfile";
import ClientDashboard from "./pages/client/ClientDashboard";
import ClientProfile from "./pages/client/ClientProfile";
import ClientPostProject from "./pages/client/ClientPostProject";
import ClientMessages from "./pages/client/ClientMessages";
import ClientProjects from "./pages/client/ClientProjects";
import ClientProjectDetails from "./pages/client/ClientProjectDetails";
import ClientSearchFreelancers from "./pages/client/ClientSearchFreelancers";
import ClientEditProfile from "./pages/client/ClientEditProfile";

// Freelancer
import FreelancerLayout from "./pages/freelancer/FreelancerLayout";
import FreelancerRegister from "./pages/freelancer/FreelancerRegister";
import FreelancerLogin from "./pages/freelancer/FreelancerLogin";
import FreelancerCompleteProfile from "./pages/freelancer/FreelancerCompleteProfile";
import FreelancerDashboard from "./pages/freelancer/FreelancerDashboard";
import FreelancerBrowseProjects from "./pages/freelancer/FreelancerBrowseProjects";
import FreelancerBids from "./pages/freelancer/FreelancerBids";
import FreelancerMessages from "./pages/freelancer/FreelancerMessages";
import FreelancerEditProfile from "./pages/freelancer/FreelancerEditProfile";
import FreelancerContracts from "./pages/freelancer/FreelancerContracts";
import Subscriptions from "./pages/shared/Subscriptions";
import ForgotPassword from "./pages/shared/ForgotPassword";

// Aurora background — copied from base.css
function AuroraBackground() {
    return (
        <div className="aurora-bg" aria-hidden="true">
            <span />
        </div>
    );
}



function App() {
    return (
        <AuthProvider>
            <AuroraBackground />
            <div style={{ position: "relative", zIndex: 3 }}>
                <Routes>
                    {/* Home */}
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/RoleSelect" element={<RoleSelect />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />

                    {/* Client Authentication */}
                    <Route path="/client/register" element={<ClientRegister />} />
                    <Route path="/client/login" element={<ClientLogin />} />
                    <Route
                        path="/client/complete-profile"
                        element={
                            <ProtectedRoute role="CLIENT">
                                <ClientCompleteProfile />
                            </ProtectedRoute>
                        }
                    />

                    {/* Client Dashboard */}
                    <Route
                        path="/client"
                        element={
                            <ProtectedRoute role="CLIENT" requireProfileComplete>
                                <ClientLayout />
                            </ProtectedRoute>
                        }
                    >
                        <Route index element={<Navigate to="dashboard" replace />} />
                        <Route path="dashboard" element={<ClientDashboard />} />
                        <Route path="profile" element={<ClientProfile />} />
                        <Route path="post-project" element={<ClientPostProject />} />
                        <Route path="my-projects" element={<ClientProjects />} />
                        <Route path="project/:id" element={<ClientProjectDetails />} />
                        <Route path="search-freelancers" element={<ClientSearchFreelancers />} />
                        <Route path="messages" element={<ClientMessages />} />
                        <Route path="edit-profile" element={<ClientEditProfile />} />
                        <Route path="subscriptions" element={<Subscriptions />} />
                    </Route>
 
                    {/* Freelancer Authentication */}
                    <Route path="/freelancer/register" element={<FreelancerRegister />} />
                    <Route path="/freelancer/login" element={<FreelancerLogin />} />
                    <Route
                        path="/freelancer/complete-profile"
                        element={
                            <ProtectedRoute role="FREELANCER">
                                <FreelancerCompleteProfile />
                            </ProtectedRoute>
                        }
                    />
 
                    {/* Freelancer Dashboard */}
                    <Route
                        path="/freelancer"
                        element={
                            <ProtectedRoute role="FREELANCER" requireProfileComplete>
                                <FreelancerLayout />
                            </ProtectedRoute>
                        }
                    >
                        <Route index element={<Navigate to="dashboard" replace />} />
                        <Route path="dashboard" element={<FreelancerDashboard />} />
                        <Route path="browse-projects" element={<FreelancerBrowseProjects />} />
                        <Route path="bids" element={<FreelancerBids />} />
                        <Route path="messages" element={<FreelancerMessages />} />
                        <Route path="edit-profile" element={<FreelancerEditProfile />} />
                        <Route path="contracts" element={<FreelancerContracts />} />
                        <Route path="subscriptions" element={<Subscriptions />} />
                    </Route>

                    {/* Catch-all */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </div>
        </AuthProvider>
    );
}

export default App;