import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

export default function Protected({ children }) {
  const user = useSelector((state) => state.user.uid);

  return user ? children : <Navigate to="/" replace />;
}
