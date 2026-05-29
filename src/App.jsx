import Home from './pages/home/home.jsx';
import Profile from "./pages/profile/profile.jsx";
import Edit_Profile from "./pages/profile/edit_profile/edit_profile.jsx";
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
import UserProfilePage from './features/user/pages/UserProfilePage.jsx';
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
                        <Route path="/profile" element={<UserProfilePage/>}/>
                        <Route path="/profile/:idFromAnother" element={<Profile/>}/>
                        <Route path="/edit_profile" element={<Edit_Profile/>}/>
                    </Route>
                </Route>

                <Route element={<RoleBasedRoute allowedRoles={['ADMIN']}/>}>
                    <Route element={<MainLayout/>}>
                        <Route path="/admin/dashboard" element={<RoleDashboard title="Admin Dashboard"/>}/>
                        <Route path="/admin/users" element={<AdminUserManagementPage/>}/>
                    </Route>
                </Route>

                <Route element={<RoleBasedRoute allowedRoles={['RECRUITER']}/>}>
                    <Route element={<MainLayout/>}>
                        <Route path="/recruiter/dashboard" element={<RoleDashboard title="Recruiter Dashboard"/>}/>
                    </Route>
                </Route>

                <Route element={<RoleBasedRoute allowedRoles={['CANDIDATE']}/>}>
                    <Route element={<MainLayout/>}>
                        <Route path="/candidate/dashboard" element={<RoleDashboard title="Candidate Dashboard"/>}/>
                        <Route path="/candidate/profile" element={<UserProfilePage/>}/>
                    </Route>
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
