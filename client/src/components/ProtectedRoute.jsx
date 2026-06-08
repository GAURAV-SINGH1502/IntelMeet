import { Navigate } from "react-router-dom";
import useMeetingStore from "../store/useMeetingStore";

function ProtectedRoute({ children }) {
  const { token } = useMeetingStore();

  if (!token) {
    return <Navigate to="/login" />;
  }

  return children;
}

export default ProtectedRoute;