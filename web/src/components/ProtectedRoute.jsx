import { Navigate } from "react-router-dom";
import { getCurrentUser } from "../services/auth";

function ProtectedRoute({ children }) {
  const currentUser = getCurrentUser();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;