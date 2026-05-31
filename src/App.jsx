import Home from './pages/home/home.jsx';
import {BrowserRouter, Routes, Route} from "react-router-dom";
import MainLayout from './layouts/MainLayout.jsx';
import ProtectedRoute from './routes/ProtectedRoute.jsx';
import RoleBasedRoute from './routes/RoleBasedRoute.jsx';
import UnauthorizedPage from './pages/unauthorized/UnauthorizedPage.jsx';
import LoginPage from './pages/auth/LoginPage.jsx';
import RegisterPage from './pages/auth/RegisterPage.jsx';
import OAuthCallbackPage from './pages/auth/OAuthCallbackPage.jsx';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage.jsx';
import VerifyOtpPage from './pages/auth/VerifyOtpPage.jsx';
import ResetPasswordPage from './pages/auth/ResetPasswordPage.jsx';
import RoleDashboard from './pages/dashboard/RoleDashboard.jsx';
import AdminUserManagementPage from './features/user/pages/AdminUserManagementPage.jsx';
import AdminCompanyManagementPage from './features/recruiterRequests/pages/AdminCompanyManagementPage.jsx';
import AdminRecruiterUpgradeRequestsPage from './features/recruiterRequests/pages/AdminRecruiterUpgradeRequestsPage.jsx';
import ProfileViewPage from './features/user/pages/ProfileViewPage.jsx';
import EditProfilePage from './features/user/pages/EditProfilePage.jsx';
import UploadAvatarPage from './features/user/pages/UploadAvatarPage.jsx';
import ChangePasswordPage from './features/user/pages/ChangePasswordPage.jsx';
import CandidateRecruiterRequestPage from './features/recruiterRequests/pages/CandidateRecruiterRequestPage.jsx';
import RecruiterCompanyOnboardingPage from './features/recruiterRequests/pages/RecruiterCompanyOnboardingPage.jsx';
import ReviewerRecruiterRequestsPage from './features/recruiterRequests/pages/ReviewerRecruiterRequestsPage.jsx';
import './App.module.css';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<LoginPage/>}/>
                <Route path="/register" element={<RegisterPage/>}/>
                <Route path="/forgot-password" element={<ForgotPasswordPage/>}/>
                <Route path="/verify-otp" element={<VerifyOtpPage/>}/>
                <Route path="/reset-password" element={<ResetPasswordPage/>}/>
                <Route path="/auth/oauth/callback" element={<OAuthCallbackPage/>}/>
                <Route path="/unauthorized" element={<UnauthorizedPage/>}/>

                <Route element={<ProtectedRoute/>}>
                    <Route element={<MainLayout/>}>
                        <Route path="/" element={<Home/>}/>
                        <Route path="/profile" element={<ProfileViewPage/>}/>
                        <Route path="/profile/edit" element={<EditProfilePage/>}/>
                        <Route path="/profile/avatar" element={<UploadAvatarPage/>}/>
                        <Route path="/profile/change-password" element={<ChangePasswordPage/>}/>
                    </Route>
                </Route>

                <Route element={<RoleBasedRoute allowedRoles={['ADMIN']}/>}>
                    <Route element={<MainLayout/>}>
                        <Route path="/admin/dashboard" element={<RoleDashboard title="Admin Dashboard"/>}/>
                        <Route path="/admin/users" element={<AdminUserManagementPage/>}/>
                        <Route path="/admin/companies" element={<AdminCompanyManagementPage/>}/>
                        <Route path="/admin/recruiter-requests" element={<AdminRecruiterUpgradeRequestsPage/>}/>
                        <Route path="/admin/company-join-requests" element={<ReviewerRecruiterRequestsPage reviewer="admin"/>}/>
                    </Route>
                </Route>

                <Route element={<RoleBasedRoute allowedRoles={['RECRUITER']}/>}>
                    <Route element={<MainLayout/>}>
                        <Route path="/recruiter/dashboard" element={<RoleDashboard title="Recruiter Dashboard"/>}/>
                        <Route path="/recruiter/company" element={<RecruiterCompanyOnboardingPage/>}/>
                        <Route path="/recruiter/company/requests" element={<ReviewerRecruiterRequestsPage reviewer="company"/>}/>
                    </Route>
                </Route>

                <Route element={<RoleBasedRoute allowedRoles={['CANDIDATE']}/>}>
                    <Route element={<MainLayout/>}>
                        <Route path="/candidate/dashboard" element={<RoleDashboard title="Candidate Dashboard"/>}/>
                        <Route path="/candidate/become-recruiter" element={<CandidateRecruiterRequestPage/>}/>
                    </Route>
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
