import { useContext, useEffect, useState } from "react";
import AuthContext from "../context/AuthContext";
import Maintenance from "./Maintenance";
import Navbar from "./Navbar";
import TenantNotifications from "./Notifications";
import Overviews from "./Overviews";
import VacateNoticeForm from "./VacateNotice";
import APIContext from "../context/APIContext";

const TenantPage = () => {
  const [activePage, setActivePage] = useState("overview");
  const {API_URL} = useContext(APIContext)
  const [tenantInfo, setTenantInfo] = useState([]);
  const [loading, setLoading] = useState(true);
  const { authTokens } = useContext(AuthContext);

  let axiosConfig = {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: "Bearer " + String(authTokens.access),
    },
  };

  // Function to fetch properties from the Django API
  const fetchTenantInfo = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/tenant-info/`,
        axiosConfig
      ); // Your Django API endpoint
      const data = await response.json();
      setTenantInfo(data); // Store properties in state
    } catch (error) {
      console.error("Error fetching properties:", error);
    } finally {
      setLoading(false); // Stop loading
    }
  };

  // Fetch properties when the component loads
  useEffect(() => {
    fetchTenantInfo();
  }, []);

  const renderContent = () => {
    switch (activePage) {
      case "overview":
        return (
          <Overviews
            tenant_profile={tenantInfo?.tenant_profile}
            invoices={tenantInfo?.invoices}
            axiosConfig={axiosConfig}
          />
        );

      case "maintenance":
        return (
          <Maintenance currentProperty={tenantInfo?.tenant_profile.property} />
        );
      case "vacate":
        return (
          <VacateNoticeForm
            currentProperty={tenantInfo?.tenant_profile.property}
          />
        );

      case "notifications":
        return <TenantNotifications />;
      default:
        return <Overviews />;
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Navbar activePage={activePage} setActivePage={setActivePage} />
      <br />
      <main
        className="flex flex-col gap-5 w-full pb-5"
        style={{ minWidth: "98.5vw", width: "100%", padding: "1rem" }}
      >
        {renderContent()}
      </main>

      {console.log(tenantInfo)}
    </div>
  );
};

export default TenantPage;
