import { BrowserRouter as Router, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import "@fontsource/inter"; // Sans-serif
import "@fontsource/dm-serif-display"; // Serif

import { getRoutes } from "./routes";

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <RoutesWithAuth />
      </Router>
    </AuthProvider>
  );
}

// Wrapper to access context
function RoutesWithAuth() {
  const { user } = useAuth();
  return <Routes>{getRoutes(user)}</Routes>;
}
