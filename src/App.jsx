import Home from './pages/home/home.jsx';
import {BrowserRouter, Routes, Route} from "react-router-dom";
import MainLayout from './layouts/MainLayout.jsx';
import AdminLayout from './layouts/AdminLayout.jsx';
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
import AdminCompanyManagementPage from './features/company/pages/AdminCompanyManagementPage.jsx';
import AdminRecruiterUpgradeRequestsPage from './features/recruiterRequests/pages/AdminRecruiterUpgradeRequestsPage.jsx';
import ProfileViewPage from './features/user/pages/ProfileViewPage.jsx';
import EditProfilePage from './features/user/pages/EditProfilePage.jsx';
import UploadAvatarPage from './features/user/pages/UploadAvatarPage.jsx';
import ChangePasswordPage from './features/user/pages/ChangePasswordPage.jsx';
import CandidateRecruiterRequestPage from './features/recruiterRequests/pages/CandidateRecruiterRequestPage.jsx';
import RecruiterCompanyOnboardingPage from './features/recruiterRequests/pages/RecruiterCompanyOnboardingPage.jsx';
import ReviewerRecruiterRequestsPage from './features/recruiterRequests/pages/ReviewerRecruiterRequestsPage.jsx';
import CompanyListPage from './features/company/pages/CompanyListPage.jsx';
import CompanyDetailPage from './features/company/pages/CompanyDetailPage.jsx';
import CandidateResumesPage from './features/resume/pages/CandidateResumesPage.jsx';
import RecruiterCandidateResumePage from './features/resume/pages/RecruiterCandidateResumePage.jsx';
import AdminResumeManagementPage from './features/resume/pages/AdminResumeManagementPage.jsx';
import SkillDirectoryPage from './features/skill/pages/SkillDirectoryPage.jsx';
import AdminSkillManagementPage from './features/skill/pages/AdminSkillManagementPage.jsx';
import SubscriptionSettingsPage from './features/subscriber/pages/SubscriptionSettingsPage.jsx';
import AdminSubscriberManagementPage from './features/subscriber/pages/AdminSubscriberManagementPage.jsx';
import UnsubscribePage from './features/subscriber/pages/UnsubscribePage.jsx';
import AdminDashboardPage from './features/admin/pages/AdminDashboardPage.jsx';
import JobListPage from './features/job/pages/JobListPage.jsx';
import JobDetailPage from './features/job/pages/JobDetailPage.jsx';
import SavedJobsPage from './features/job/pages/SavedJobsPage.jsx';
import CandidateApplicationsPage from './features/job/pages/CandidateApplicationsPage.jsx';
import RecommendedJobsPage from './features/job/pages/RecommendedJobsPage.jsx';
import RecruiterJobsPage from './features/job/pages/RecruiterJobsPage.jsx';
import JobFormPage from './features/job/pages/JobFormPage.jsx';
import JobApplicationsPage from './features/job/pages/JobApplicationsPage.jsx';
import AdminJobManagementPage from './features/job/pages/AdminJobManagementPage.jsx';
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
                <Route element={<MainLayout/>}>
                    <Route path="/jobs" element={<JobListPage/>}/>
                    <Route path="/companies" element={<CompanyListPage/>}/>
                    <Route path="/companies/:id" element={<CompanyDetailPage/>}/>
                    <Route path="/skills" element={<SkillDirectoryPage/>}/>
                    <Route path="/unsubscribe" element={<UnsubscribePage/>}/>
                </Route>

                <Route element={<ProtectedRoute/>}>
                    <Route element={<MainLayout/>}>
                        <Route path="/" element={<Home/>}/>
                        <Route path="/profile" element={<ProfileViewPage/>}/>
                        <Route path="/profile/edit" element={<EditProfilePage/>}/>
                        <Route path="/profile/avatar" element={<UploadAvatarPage/>}/>
                        <Route path="/profile/change-password" element={<ChangePasswordPage/>}/>
                        <Route path="/settings/subscription" element={<SubscriptionSettingsPage/>}/>
                        <Route path="/jobs/:id" element={<JobDetailPage/>}/>
                    </Route>
                </Route>

                <Route element={<RoleBasedRoute allowedRoles={['ADMIN']}/>}>
                    <Route element={<AdminLayout/>}>
                        <Route path="/admin/dashboard" element={<AdminDashboardPage/>}/>
                        <Route path="/admin/users" element={<AdminUserManagementPage/>}/>
                        <Route path="/admin/companies" element={<AdminCompanyManagementPage/>}/>
                        <Route path="/admin/recruiter-requests" element={<AdminRecruiterUpgradeRequestsPage/>}/>
                        <Route path="/admin/company-join-requests" element={<ReviewerRecruiterRequestsPage reviewer="admin"/>}/>
                        <Route path="/admin/resumes" element={<AdminResumeManagementPage/>}/>
                        <Route path="/admin/skills" element={<AdminSkillManagementPage/>}/>
                        <Route path="/admin/subscribers" element={<AdminSubscriberManagementPage/>}/>
                        <Route path="/admin/jobs" element={<AdminJobManagementPage/>}/>
                        <Route path="/admin/jobs/:jobId/applications" element={<JobApplicationsPage/>}/>
                        <Route path="/admin/jobs/:jobId/candidates/:candidateId/resume" element={<RecruiterCandidateResumePage/>}/>
                    </Route>
                </Route>

                <Route element={<RoleBasedRoute allowedRoles={['RECRUITER']}/>}>
                    <Route element={<MainLayout/>}>
                        <Route path="/recruiter/dashboard" element={<RoleDashboard title="Recruiter Dashboard"/>}/>
                        <Route path="/recruiter/company" element={<RecruiterCompanyOnboardingPage/>}/>
                        <Route path="/recruiter/company/requests" element={<ReviewerRecruiterRequestsPage reviewer="company"/>}/>
                        <Route path="/recruiter/jobs" element={<RecruiterJobsPage/>}/>
                        <Route path="/recruiter/jobs/create" element={<JobFormPage/>}/>
                        <Route path="/recruiter/jobs/:id/edit" element={<JobFormPage/>}/>
                        <Route path="/recruiter/jobs/:jobId/applications" element={<JobApplicationsPage/>}/>
                        <Route path="/recruiter/jobs/:jobId/candidates/:candidateId/resume" element={<RecruiterCandidateResumePage/>}/>
                    </Route>
                </Route>

                <Route element={<RoleBasedRoute allowedRoles={['CANDIDATE']}/>}>
                    <Route element={<MainLayout/>}>
                        <Route path="/candidate/dashboard" element={<RoleDashboard title="Candidate Dashboard"/>}/>
                        <Route path="/candidate/become-recruiter" element={<CandidateRecruiterRequestPage/>}/>
                        <Route path="/candidate/resumes" element={<CandidateResumesPage/>}/>
                        <Route path="/saved-jobs" element={<SavedJobsPage/>}/>
                        <Route path="/applications" element={<CandidateApplicationsPage/>}/>
                        <Route path="/candidate/jobs/recommended" element={<RecommendedJobsPage/>}/>
                    </Route>
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
