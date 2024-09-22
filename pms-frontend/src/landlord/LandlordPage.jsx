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
import NewProperty from "./NewProperty";
import { ModeToggle } from "../components/ModeToggle";
import AuthContext from "../context/AuthContext";
import axios from "axios";

const LandlordPage = () => {
  const [properties, setProperties] = useState([]);

  let { authTokens, logoutUser } = useContext(AuthContext);

  let axiosConfig = {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: "Bearer " + String(authTokens.access),
    },
  };

  const fetchData = async () => {
    await axios
      .get(`http://127.0.0.1:8000/api/landlord/`, axiosConfig)
      .then((response) => {
        console.log(response.data);
        setProperties(response.data.properties);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  useEffect(() => {
    fetchData();
    console.log(properties);
  }, []);

  const [maintenanceRequests, setMaintenanceRequests] = useState([]);

  useEffect(() => {
    const allMaintenanceRequests = properties.reduce((acc, property) => {
      // For each property, push all maintenance requests into the accumulator
      property.maintenance_requests.forEach((request) => {
        console.log(request);
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
          />
        );
      case "newProperty":
        return (
          <NewProperty
            axiosConfig={axiosConfig}
            fetchData={fetchData}
            setActivePage={setActivePage}
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
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <AsideNav activePage={activePage} setActivePage={setActivePage} />

      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <header
          className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6"
          style={{ zIndex: 10 }}
        >
          <Sheet>
            <SheetTrigger asChild>
              <Button size="icon" variant="outline" className="sm:hidden">
                <PanelLeft className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="sm:max-w-xs">
              <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
                <Link
                  href="#"
                  className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
                >
                  <Package2 className="h-5 w-5 transition-all group-hover:scale-110" />
                  <span className="sr-only">Acme Inc</span>
                </Link>
                <Link
                  href="#"
                  className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                >
                  <Home className="h-5 w-5" />
                  Dashboard
                </Link>
                <Link
                  href="#"
                  className="flex items-center gap-4 px-2.5 text-foreground"
                >
                  <ShoppingCart className="h-5 w-5" />
                  Orders
                </Link>
                <Link
                  href="#"
                  className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                >
                  <Package className="h-5 w-5" />
                  Products
                </Link>
                <Link
                  href="#"
                  className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                >
                  <Users2 className="h-5 w-5" />
                  Customers
                </Link>
                <Link
                  href="#"
                  className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                >
                  <LineChart className="h-5 w-5" />
                  Settings
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
          <Breadcrumb className="hidden md:flex">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="#">Dashboard</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="#">Orders</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Recent Orders</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="relative ml-auto flex-1 md:grow-0">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px]"
            />
          </div>
          <ModeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="overflow-hidden rounded-full"
              >
                <img
                  src="/placeholder-user.jpg"
                  width={36}
                  height={36}
                  alt="Avatar"
                  className="overflow-hidden rounded-full"
                />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem>Support</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logoutUser}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        <div className="flex min-h-screen w-full flex-col">
          <br />
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default LandlordPage;
