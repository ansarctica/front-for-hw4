import { createBrowserRouter, Navigate, Outlet } from "react-router";
import { RouterProvider } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { LoginPage } from "./pages/login/page";
import { RegisterPage } from "./pages/register/page";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import { StudentsPage } from "./pages/dashboard/students/page";
import { SchedulesPage } from "./pages/dashboard/schedules/page";
import { AttendancePage } from "./pages/dashboard/attendance/page";
import { AddStudentPage } from "./pages/dashboard/students/add/page";
import { GradesPage } from "./pages/dashboard/grades/page";
const ProtectedLayout = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <div>Loading...</div>;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/login" replace />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    element: <ProtectedLayout />,
    children: [
      {
        path: "/dashboard",
        element: <DashboardLayout />,
        children: [
          {
            index: true,
            element: <Navigate to="/dashboard/students" replace />,
          },
          {
            path: "students",
            element: <StudentsPage />,
          },
          {
            path: "students/add",
            element: <AddStudentPage />,
          },
          {
            path: "schedules",
            element: <SchedulesPage />,
          },
          {
            path: "attendance",
            element: <AttendancePage />,
          },
          {
             path: "grades",
             element: <GradesPage />,
          },
        ],
      },
    ],
  },
]);

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;