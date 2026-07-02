import { Navigate, Route, Routes } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";
import SidebarLayout from "../layouts/SidebarLayout";

import AdminSidebar from "../components/Sidebar/AdminSidebar";
import TeacherSidebar from "../components/Sidebar/TeacherSidebar";
import StudentSidebar from "../components/Sidebar/StudentSidebar";

import { AdminOnly, TeacherOnly, StudentOnly } from "./middlewares/RoleOnly";

import AdminDashboardScreen from "../screens/App/Admin/Dashboard/AdminDashboardScreen";
import UsersMonitorScreen from "../screens/App/Admin/Monitor/UsersMonitorScreen";
import SubjectsMonitorScreen from "../screens/App/Admin/Monitor/SubjectsMonitorScreen";
import LiveClassesMonitorScreen from "../screens/App/Admin/Monitor/LiveClassesMonitorScreen";
import ContentMonitorScreen from "../screens/App/Admin/Monitor/ContentMonitorScreen";
import ActivityLogScreen from "../screens/App/Admin/ActivityLog/ActivityLogScreen";
import PayoutListScreen from "../screens/App/Admin/Payout/PayoutListScreen";
import PayoutDetailScreen from "../screens/App/Admin/Payout/PayoutDetailScreen";
import TeacherListScreen from "../screens/App/Admin/Teachers/TeacherListScreen";
import TeacherCreateScreen from "../screens/App/Admin/Teachers/TeacherCreateScreen";
import TeacherDetailScreen from "../screens/App/Admin/Teachers/TeacherDetailScreen";
import ProgramListScreen from "../screens/App/Admin/Catalog/ProgramListScreen";
import ProgramFormScreen from "../screens/App/Admin/Catalog/ProgramFormScreen";
import YearListScreen from "../screens/App/Admin/Catalog/YearListScreen";
import YearFormScreen from "../screens/App/Admin/Catalog/YearFormScreen";
import SubjectListScreen from "../screens/App/Admin/Catalog/SubjectListScreen";
import SubjectFormScreen from "../screens/App/Admin/Catalog/SubjectFormScreen";
import SubjectDetailScreen from "../screens/App/Admin/Catalog/SubjectDetailScreen";
import CouponListScreen from "../screens/App/Admin/Coupon/CouponListScreen";
import CouponFormScreen from "../screens/App/Admin/Coupon/CouponFormScreen";
import TeacherDashboardScreen from "../screens/App/Teacher/TeacherDashboardScreen";
import TeacherSubjectsScreen from "../screens/App/Teacher/TeacherSubjectsScreen";
import QuizListScreen from "../screens/App/Teacher/Quiz/QuizListScreen";
import QuizFormScreen from "../screens/App/Teacher/Quiz/QuizFormScreen";
import LiveClassListScreen from "../screens/App/Teacher/LiveClass/LiveClassListScreen";
import LiveClassFormScreen from "../screens/App/Teacher/LiveClass/LiveClassFormScreen";
import LiveClassDetailScreen from "../screens/App/Teacher/LiveClass/LiveClassDetailScreen";
import StudentCatalogScreen from "../screens/App/Student/StudentCatalogScreen";
import SubjectViewScreen from "../screens/App/Student/SubjectViewScreen";
import QuizScreen from "../screens/App/Student/QuizScreen";
import CertificatesScreen from "../screens/App/Student/CertificatesScreen";
import LiveClassesScreen from "../screens/App/Student/LiveClassesScreen";
import NotificationsScreen from "../screens/App/Student/NotificationsScreen";
import CheckoutScreen from "../screens/App/Student/CheckoutScreen";
import OrderDetailScreen from "../screens/App/Student/OrderDetailScreen";
import OrdersScreen from "../screens/App/Student/OrdersScreen";
import SubscriptionsScreen from "../screens/App/Student/SubscriptionsScreen";
import NotFoundScreen from "../screens/NotFoundScreen";

const SIDEBAR = { admin: AdminSidebar, teacher: TeacherSidebar, student: StudentSidebar };

const AppRouter = () => {
  const { role } = useAuth();
  const Sidebar = SIDEBAR[role] ?? null;

  return (
    <Routes>
      <Route element={<SidebarLayout sidebar={Sidebar} />}>
        <Route index element={<Navigate to={role ? `/app/${role}` : "/login"} replace />} />

        {/* Admin */}
        <Route path="admin" element={<AdminOnly><AdminDashboardScreen /></AdminOnly>} />
        <Route path="admin/teachers" element={<AdminOnly><TeacherListScreen /></AdminOnly>} />
        <Route path="admin/teachers/create" element={<AdminOnly><TeacherCreateScreen /></AdminOnly>} />
        <Route path="admin/teachers/:id" element={<AdminOnly><TeacherDetailScreen /></AdminOnly>} />
        <Route path="admin/quizzes" element={<AdminOnly><QuizListScreen /></AdminOnly>} />
        <Route path="admin/quizzes/create" element={<AdminOnly><QuizFormScreen /></AdminOnly>} />
        <Route path="admin/quizzes/:id/edit" element={<AdminOnly><QuizFormScreen /></AdminOnly>} />
        <Route path="admin/live-classes" element={<AdminOnly><LiveClassListScreen /></AdminOnly>} />
        <Route path="admin/live-classes/create" element={<AdminOnly><LiveClassFormScreen /></AdminOnly>} />
        <Route path="admin/live-classes/:id" element={<AdminOnly><LiveClassDetailScreen /></AdminOnly>} />
        <Route path="admin/live-classes/:id/edit" element={<AdminOnly><LiveClassFormScreen /></AdminOnly>} />
        <Route path="admin/notifications" element={<AdminOnly><NotificationsScreen /></AdminOnly>} />
        <Route path="admin/monitor/users" element={<AdminOnly><UsersMonitorScreen /></AdminOnly>} />
        <Route path="admin/monitor/subjects" element={<AdminOnly><SubjectsMonitorScreen /></AdminOnly>} />
        <Route path="admin/monitor/live" element={<AdminOnly><LiveClassesMonitorScreen /></AdminOnly>} />
        <Route path="admin/monitor/content" element={<AdminOnly><ContentMonitorScreen /></AdminOnly>} />
        <Route path="admin/activity-log" element={<AdminOnly><ActivityLogScreen /></AdminOnly>} />
        <Route path="admin/payouts" element={<AdminOnly><PayoutListScreen /></AdminOnly>} />
        <Route path="admin/payouts/:id" element={<AdminOnly><PayoutDetailScreen /></AdminOnly>} />
        {/* Catalog */}
        <Route path="admin/catalog/programs" element={<AdminOnly><ProgramListScreen /></AdminOnly>} />
        <Route path="admin/catalog/programs/create" element={<AdminOnly><ProgramFormScreen /></AdminOnly>} />
        <Route path="admin/catalog/programs/:id/edit" element={<AdminOnly><ProgramFormScreen /></AdminOnly>} />
        <Route path="admin/catalog/years" element={<AdminOnly><YearListScreen /></AdminOnly>} />
        <Route path="admin/catalog/years/create" element={<AdminOnly><YearFormScreen /></AdminOnly>} />
        <Route path="admin/catalog/years/:id/edit" element={<AdminOnly><YearFormScreen /></AdminOnly>} />
        <Route path="admin/catalog/subjects" element={<AdminOnly><SubjectListScreen /></AdminOnly>} />
        <Route path="admin/catalog/subjects/create" element={<AdminOnly><SubjectFormScreen /></AdminOnly>} />
        <Route path="admin/catalog/subjects/:id" element={<AdminOnly><SubjectDetailScreen /></AdminOnly>} />
        <Route path="admin/catalog/subjects/:id/edit" element={<AdminOnly><SubjectFormScreen /></AdminOnly>} />
        {/* Coupons */}
        <Route path="admin/coupons" element={<AdminOnly><CouponListScreen /></AdminOnly>} />
        <Route path="admin/coupons/create" element={<AdminOnly><CouponFormScreen /></AdminOnly>} />

        {/* Teacher */}
        <Route path="teacher" element={<TeacherOnly><TeacherDashboardScreen /></TeacherOnly>} />
        <Route path="teacher/subjects" element={<TeacherOnly><TeacherSubjectsScreen /></TeacherOnly>} />
        <Route path="teacher/subjects/:id" element={<TeacherOnly><SubjectDetailScreen /></TeacherOnly>} />
        <Route path="teacher/quizzes" element={<TeacherOnly><QuizListScreen /></TeacherOnly>} />
        <Route path="teacher/quizzes/create" element={<TeacherOnly><QuizFormScreen /></TeacherOnly>} />
        <Route path="teacher/quizzes/:id/edit" element={<TeacherOnly><QuizFormScreen /></TeacherOnly>} />
        <Route path="teacher/live-classes" element={<TeacherOnly><LiveClassListScreen /></TeacherOnly>} />
        <Route path="teacher/live-classes/create" element={<TeacherOnly><LiveClassFormScreen /></TeacherOnly>} />
        <Route path="teacher/live-classes/:id" element={<TeacherOnly><LiveClassDetailScreen /></TeacherOnly>} />
        <Route path="teacher/live-classes/:id/edit" element={<TeacherOnly><LiveClassFormScreen /></TeacherOnly>} />
        <Route path="teacher/notifications" element={<TeacherOnly><NotificationsScreen /></TeacherOnly>} />

        {/* Student */}
        <Route path="student" element={<StudentOnly><StudentCatalogScreen /></StudentOnly>} />
        <Route path="student/subjects/:id" element={<StudentOnly><SubjectViewScreen /></StudentOnly>} />
        <Route path="student/quizzes/:id" element={<StudentOnly><QuizScreen /></StudentOnly>} />
        <Route path="student/certificates" element={<StudentOnly><CertificatesScreen /></StudentOnly>} />
        <Route path="student/live-classes" element={<StudentOnly><LiveClassesScreen /></StudentOnly>} />
        <Route path="student/notifications" element={<StudentOnly><NotificationsScreen /></StudentOnly>} />
        <Route path="student/checkout" element={<StudentOnly><CheckoutScreen /></StudentOnly>} />
        <Route path="student/orders" element={<StudentOnly><OrdersScreen /></StudentOnly>} />
        <Route path="student/orders/:id" element={<StudentOnly><OrderDetailScreen /></StudentOnly>} />
        <Route path="student/subscriptions" element={<StudentOnly><SubscriptionsScreen /></StudentOnly>} />

        <Route path="*" element={<NotFoundScreen />} />
      </Route>
    </Routes>
  );
};

export default AppRouter;
