import { useContext, useEffect, useState } from "react";
import ListedProperties from "./ListedProperties";
import Maintenance from "./Maintenance";
import Navbar from "./Navbar";
import TenantNotifications from "./Notifications";
import Overviews from "./Overviews";
import RentedProperty from "./RentedProperty";
import { Transactions } from "./Transactions";
import AuthContext from "../context/AuthContext";
import Applications from "./Applications";

const TenantPage = () => {
  const [activePage, setActivePage] = useState("overview");

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const { authTokens } = useContext(AuthContext);

  let axiosConfig = {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: "Bearer " + String(authTokens.access),
    },
  };

  // Function to fetch properties from the Django API
  const fetchProperties = async () => {
    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/properties/",
        axiosConfig
      ); // Your Django API endpoint
      const data = await response.json();
      setProperties(data); // Store properties in state
      console.log(data)
    } catch (error) {
      console.error("Error fetching properties:", error);
    } finally {
      setLoading(false); // Stop loading
    }
  };

  // Fetch properties when the component loads
  useEffect(() => {
    fetchProperties();
  }, []);

  const renderContent = () => {
    switch (activePage) {
      case "overview":
        return <Overviews />;

      case "properties":
        return <ListedProperties properties={properties} />;
      case "maintenance":
        return <Maintenance />;
      case "applications":
        return <Applications />;
      case "info":
        return <RentedProperty />;
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
      {renderContent()}
    </div>
  );
};

export default TenantPage;
