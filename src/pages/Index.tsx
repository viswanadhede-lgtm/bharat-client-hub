import { Navigate } from "react-router-dom";
import { isAuthenticated } from "@/utils/auth";

const Index = () => {
  return <Navigate to={isAuthenticated() ? "/dashboard" : "/login"} replace />;
};

export default Index;
