import LandlordPage from "../landlord/LandlordPage";
import AuthContext from "../context/AuthContext";
import React, { useContext } from "react";
import TenantPage from "../tenants/TenantPage";

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  return user.user_type === "landlord" ? <LandlordPage /> : <TenantPage />;
};

export default Dashboard;
