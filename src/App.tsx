import React from "react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";

import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import Therapists from "./pages/Therapists";
import TherapistDetail from "./pages/TherapistDetail";
import Booking from "./pages/Booking";
import TherapistPosts from "./pages/TherapistPosts";

function App() {
  return (
    <ThemeProvider defaultTheme="system" enableSystem>
      <div className="min-h-screen bg-background font-sans">
        <RouterProvider
          router={createBrowserRouter([
            {
              path: "/",
              element: <Index />,
              errorElement: <NotFound />,
            },
            {
              path: "/login",
              element: <Login />,
            },
            {
              path: "/register",
              element: <Register />,
            },
            {
              path: "/therapists",
              element: <Therapists />,
            },
            {
              path: "/therapists/:id",
              element: <TherapistDetail />,
            },
            {
              path: "/therapist-posts/:id",
              element: <TherapistPosts />,
            },
            {
              path: "/book/:id",
              element: <Booking />,
            },
          ])}
        />
      </div>
      <Toaster />
    </ThemeProvider>
  );
}

export default App;
