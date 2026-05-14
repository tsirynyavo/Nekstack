// PrivateComponent.js
import { Navigate, Outlet } from "react-router-dom";

function PrivateComponent() {
  const user = localStorage.getItem("user");
  return user ? <Outlet /> : <Navigate to="/login" />;
}

export default PrivateComponent;
