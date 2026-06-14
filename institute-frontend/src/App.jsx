import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Auth Pages
import Login from './pages/auth/Login';
import Unauthorized from './pages/auth/Unauthorized';

// Student Portal Pages
import StudentDashboard from './pages/student/StudentDashboard';
import Timetable from './pages/student/Timetable';
import Materials from './pages/student/Materials';
import Videos from './pages/student/Videos';
import Ide from './pages/student/Ide';
import OnlineClass from './pages/student/OnlineClass';
import Feedback from './pages/student/Feedback';
import Assignments from './pages/student/Assignments';
import Certificates from './pages/student/Certificates';

// Faculty Portal Pages
import FacultyDashboard from './pages/faculty/FacultyDashboard';
import ManageLectures from './pages/faculty/ManageLectures';
import UploadMaterials from './pages/faculty/UploadMaterials';
import UploadVideos from './pages/faculty/UploadVideos';
import AssignmentsDesk from './pages/faculty/AssignmentsDesk';
import ScheduleClass from './pages/faculty/ScheduleClass';
import Broadcaster from './pages/faculty/Broadcaster';

// Admin Portal Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageStudents from './pages/admin/ManageStudents';
import ManageFaculty from './pages/admin/ManageFaculty';
import ManageBatches from './pages/admin/ManageBatches';
import Mapping from './pages/admin/Mapping';
import CertificatesCenter from './pages/admin/CertificatesCenter';
import AdminBroadcaster from './pages/admin/AdminBroadcaster';

// Admission Portal Pages - REMOVED

// Super Admin Portal Pages
import SuperAdminDashboard from './pages/superadmin/SuperAdminDashboard';
import StaffManagement from './pages/superadmin/StaffManagement';
import AttendanceWorkingHoursReport from './pages/superadmin/AttendanceWorkingHoursReport';

// Shared Protected Portals
import ComplaintLeavePortal from './pages/shared/ComplaintLeavePortal';
import AiAssistantInterface from './pages/shared/AiAssistantInterface';
import DynamicFormsManager from './pages/shared/DynamicFormsManager';
import QuizSystem from './pages/shared/QuizSystem';
import EnhancedBroadcaster from './pages/shared/EnhancedBroadcaster';
import MeetingSessionRoom from './pages/shared/MeetingSessionRoom';

// Helper redirect component for base route /
const HomeRedirect = () => {
    const { user, loading } = useAuth();
    if (loading) return null;
    if (!user) return <Navigate to="/login" replace />;

    switch (user.role) {
        case 'ROLE_STUDENT': return <Navigate to="/student" replace />;
        case 'ROLE_FACULTY': return <Navigate to="/faculty" replace />;
        case 'ROLE_ADMIN': return <Navigate to="/admin" replace />;
        case 'ROLE_SUPER_ADMIN': return <Navigate to="/superadmin" replace />;
        default: return <Navigate to="/login" replace />;
    }
};

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    {/* Publicly white-listed routes */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/unauthorized" element={<Unauthorized />} />

                    {/* Base Route Redirection */}
                    <Route path="/" element={<HomeRedirect />} />

                    {/* Student Protected Portals */}
                    <Route path="/student" element={<ProtectedRoute allowedRoles={['ROLE_STUDENT']}><StudentDashboard /></ProtectedRoute>} />
                    <Route path="/student/timetable" element={<ProtectedRoute allowedRoles={['ROLE_STUDENT']}><Timetable /></ProtectedRoute>} />
                    <Route path="/student/materials" element={<ProtectedRoute allowedRoles={['ROLE_STUDENT']}><Materials /></ProtectedRoute>} />
                    <Route path="/student/videos" element={<ProtectedRoute allowedRoles={['ROLE_STUDENT']}><Videos /></ProtectedRoute>} />
                    <Route path="/student/ide" element={<ProtectedRoute allowedRoles={['ROLE_STUDENT']}><Ide /></ProtectedRoute>} />
                    <Route path="/student/online-class" element={<ProtectedRoute allowedRoles={['ROLE_STUDENT']}><OnlineClass /></ProtectedRoute>} />
                    <Route path="/student/feedback" element={<ProtectedRoute allowedRoles={['ROLE_STUDENT']}><Feedback /></ProtectedRoute>} />
                    <Route path="/student/assignments" element={<ProtectedRoute allowedRoles={['ROLE_STUDENT']}><Assignments /></ProtectedRoute>} />
                    <Route path="/student/certificates" element={<ProtectedRoute allowedRoles={['ROLE_STUDENT']}><Certificates /></ProtectedRoute>} />

                    {/* Faculty Protected Portals */}
                    <Route path="/faculty" element={<ProtectedRoute allowedRoles={['ROLE_FACULTY']}><FacultyDashboard /></ProtectedRoute>} />
                    <Route path="/faculty/lectures" element={<ProtectedRoute allowedRoles={['ROLE_FACULTY']}><ManageLectures /></ProtectedRoute>} />
                    <Route path="/faculty/materials" element={<ProtectedRoute allowedRoles={['ROLE_FACULTY']}><UploadMaterials /></ProtectedRoute>} />
                    <Route path="/faculty/videos" element={<ProtectedRoute allowedRoles={['ROLE_FACULTY']}><UploadVideos /></ProtectedRoute>} />
                    <Route path="/faculty/assignments" element={<ProtectedRoute allowedRoles={['ROLE_FACULTY']}><AssignmentsDesk /></ProtectedRoute>} />
                    <Route path="/faculty/online-classes" element={<ProtectedRoute allowedRoles={['ROLE_FACULTY']}><ScheduleClass /></ProtectedRoute>} />
                    <Route path="/faculty/notifications" element={<ProtectedRoute allowedRoles={['ROLE_FACULTY']}><Broadcaster /></ProtectedRoute>} />

                    {/* Admin Protected Portals */}
                    <Route path="/admin" element={<ProtectedRoute allowedRoles={['ROLE_ADMIN', 'ROLE_SUPER_ADMIN']}><AdminDashboard /></ProtectedRoute>} />
                    <Route path="/admin/students" element={<ProtectedRoute allowedRoles={['ROLE_ADMIN', 'ROLE_SUPER_ADMIN']}><ManageStudents /></ProtectedRoute>} />
                    <Route path="/admin/faculty" element={<ProtectedRoute allowedRoles={['ROLE_ADMIN', 'ROLE_SUPER_ADMIN']}><ManageFaculty /></ProtectedRoute>} />
                    <Route path="/admin/batches" element={<ProtectedRoute allowedRoles={['ROLE_ADMIN', 'ROLE_SUPER_ADMIN']}><ManageBatches /></ProtectedRoute>} />
                    <Route path="/admin/mapping" element={<ProtectedRoute allowedRoles={['ROLE_ADMIN', 'ROLE_SUPER_ADMIN']}><Mapping /></ProtectedRoute>} />
                    <Route path="/admin/certificates" element={<ProtectedRoute allowedRoles={['ROLE_ADMIN', 'ROLE_SUPER_ADMIN']}><CertificatesCenter /></ProtectedRoute>} />
                    <Route path="/admin/notifications" element={<ProtectedRoute allowedRoles={['ROLE_ADMIN', 'ROLE_SUPER_ADMIN']}><AdminBroadcaster /></ProtectedRoute>} />

                    {/* Super Admin Protected Portals */}
                    <Route path="/superadmin" element={<ProtectedRoute allowedRoles={['ROLE_SUPER_ADMIN']}><SuperAdminDashboard /></ProtectedRoute>} />
                    <Route path="/superadmin/staff" element={<ProtectedRoute allowedRoles={['ROLE_SUPER_ADMIN']}><StaffManagement /></ProtectedRoute>} />
                    <Route path="/superadmin/batch-chart" element={<ProtectedRoute allowedRoles={['ROLE_SUPER_ADMIN']}><SuperAdminDashboard /></ProtectedRoute>} />
                    <Route path="/superadmin/attendance-reports" element={<ProtectedRoute allowedRoles={['ROLE_SUPER_ADMIN', 'ROLE_ADMIN']}><AttendanceWorkingHoursReport /></ProtectedRoute>} />

                    {/* Shared Portals for multiple roles */}
                    <Route path="/shared/complaints-leaves" element={<ProtectedRoute allowedRoles={['ROLE_STUDENT', 'ROLE_FACULTY', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN']}><ComplaintLeavePortal /></ProtectedRoute>} />
                    <Route path="/shared/ai-assistant" element={<ProtectedRoute allowedRoles={['ROLE_FACULTY', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN']}><AiAssistantInterface /></ProtectedRoute>} />
                    <Route path="/shared/dynamic-forms" element={<ProtectedRoute allowedRoles={['ROLE_STUDENT', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN']}><DynamicFormsManager /></ProtectedRoute>} />
                    <Route path="/shared/quizzes" element={<ProtectedRoute allowedRoles={['ROLE_STUDENT', 'ROLE_FACULTY', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN']}><QuizSystem /></ProtectedRoute>} />
                    <Route path="/shared/broadcaster" element={<ProtectedRoute allowedRoles={['ROLE_STUDENT', 'ROLE_FACULTY', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN']}><EnhancedBroadcaster /></ProtectedRoute>} />
                    <Route path="/shared/online-classroom" element={<ProtectedRoute allowedRoles={['ROLE_STUDENT', 'ROLE_FACULTY', 'ROLE_SUPER_ADMIN']}><MeetingSessionRoom /></ProtectedRoute>} />

                    {/* Fallback */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
