import { Navigate } from "react-router-dom";
import { isAuthenticated, isOwner } from "../services/auth";

function OwnerRoute({ children }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (!isOwner()) {
    return <Navigate to="/profile" replace />;
  }

  return children;
}

export default OwnerRoute;