import { createBrowserRouter } from "react-router-dom";
import Home from "./pages/home";
import Auth from "./pages/auth";
import Signin from "./pages/signin";
import Signup from "./pages/signup";
import Dashboard from "./pages/dashboard";
import Protected from "./components/protected";
import Root from "./layouts/root";
import NotFound from "./pages/not-found";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "auth",
        element: <Auth />,
        children: [
          {
            index: true,
            element: <Signin />,
          },
          {
            path: "signup",
            element: <Signup />,
          },
        ],
      },
      {
        path: "dashboard",
        element: (
          <Protected>
            <Dashboard />
          </Protected>
        ),
      },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);
