import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { AuthCallback } from "./pages/AuthCallback";

const router = createBrowserRouter([
  { path: "/login", element: <Login /> },
  { path: "/dashboard", element: <Dashboard /> },
  { path: "/auth/callback", element: <AuthCallback /> },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
