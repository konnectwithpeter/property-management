import {
  Home,
  LineChart,
  Package,
  Package2,
  PanelLeft,
  Search,
  ShoppingCart,
  Users2,
} from "lucide-react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AsideNav from "./AsideNav";
import Listing from "./Listing";
import Maintenance from "./Maintenance";
import Overview from "./Overview";
import Transactions from "./Transactions";
import { ModeToggle } from "../components/ModeToggle";
import AuthContext from "../context/AuthContext";
import axios from "axios";
import Navbar from "./Navbar";
import APIContext from "../context/APIContext";

const LandlordPage = () => {
  const [properties, setProperties] = useState([]);

  let { authTokens, logoutUser } = useContext(AuthContext);
  const {API_URL} = useContext(APIContext)

  let axiosConfig = {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: "Bearer " + String(authTokens.access),
    },
  };

  const fetchData = async () => {
    await axios
      .get(`${API_URL}/api/landlord/`, axiosConfig)
      .then((response) => {
        setProperties(response.data.properties);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const [allData, setAllData] = useState([]);
  const fetchAllData = async () => {
    await axios
      .get(`${API_URL}/api/admin/properties/`, axiosConfig)
      .then((response) => {
        setAllData(response.data);
        console.log(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  };
  useEffect(() => {
    fetchData();
    fetchAllData();
  }, []);

  const [maintenanceRequests, setMaintenanceRequests] = useState([]);

  useEffect(() => {
    const allMaintenanceRequests = properties.reduce((acc, property) => {
      // For each property, push all maintenance requests into the accumulator
      property.maintenance_requests.forEach((request) => {
        acc.push(request);
      });
      return acc; // Return the accumulated array
    }, []); // Initialize with an empty array
    setMaintenanceRequests(allMaintenanceRequests);
  }, [properties]);

  const [activePage, setActivePage] = useState("overview");

  const renderContent = () => {
    switch (activePage) {
      case "overview":
        return <Overview />;
      case "properties":
        return (
          <Listing
            setActivePage={setActivePage}
            properties={properties}
            fetchData={fetchData}
            data={allData}
          />
        );

      case "maintenance":
        return (
          <Maintenance
            maintenanceRequests={maintenanceRequests}
            axiosConfig={axiosConfig}
          />
        );
      case "transactions":
        return <Transactions />;

      default:
        return <Overview />;
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
    </div>
  );
};

export default LandlordPage;
