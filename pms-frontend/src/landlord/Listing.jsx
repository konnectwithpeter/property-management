import { Link } from "react-router-dom";
import {
  CheckCheck,
  File,
  Home,
  LineChart,
  ListFilter,
  MapPin,
  MoreHorizontal,
  Package,
  Package2,
  PanelLeft,
  PlusCircle,
  Search,
  Settings,
  ShoppingCart,
  Users2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
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
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Applicants from "./Applicants";
import { useState } from "react";
import Maintenance from "./Maintenance";

export default function Listing({ setActivePage, properties, fetchData }) {
  // Function to get the maintenance request with the highest severity
  const getMostSevereMaintenance = (maintenanceRequests) => {
    if (!maintenanceRequests || maintenanceRequests.length === 0) return null;

    // Severity levels for sorting (Assuming 'Severe' > 'Medium' > 'Low')
    const severityLevels = { Severe: 3, Medium: 2, Low: 1 };

    // Find the maintenance with the highest severity
    return maintenanceRequests.reduce((prev, curr) =>
      severityLevels[curr.severity] > severityLevels[prev.severity]
        ? curr
        : prev
    );
  };

  const [openApplications, setOpenApplications] = useState(false);
  const [openMaintenance, setOpenMaintenance] = useState(false);

  return (
    <main
      className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8"
      style={{ width: "100%", minWidth: "94.5vw" }}
    >
      <Tabs defaultValue="all">
        <div className="flex items-center">
          <TabsList className="gap-3">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="active">Occupied</TabsTrigger>
            <TabsTrigger value="draft">Vacant</TabsTrigger>
          </TabsList>
          <div className="ml-auto flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-7 gap-1">
                  <ListFilter className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Filter
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem checked>
                  Active
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem>Draft</DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem>Archived</DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button size="sm" variant="outline" className="h-7 gap-1">
              <File className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Export
              </span>
            </Button>
            <Button
              size="sm"
              className="h-7 gap-1"
              onClick={() => setActivePage("newProperty")}
            >
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Add Property
              </span>
            </Button>
          </div>
        </div>
        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>My Listed Property</CardTitle>
              <CardDescription>
                Manage your products and view their sales performance.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="hidden w-[100px] sm:table-cell">
                      <span className="sr-only">Image</span>
                    </TableHead>
                    <TableHead>Property</TableHead>
                    <TableHead>Tenant</TableHead>
                    <TableHead>Maintenance</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>
                      <span className="sr-only">Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {properties.map((property, index) => {
                    // Get the most severe maintenance request
                    const severeMaintenance = getMostSevereMaintenance(
                      property.maintenance_requests
                    );
                    return (
                      <TableRow key={index}>
                        <TableCell className="hidden sm:table-cell">
                          <img
                            alt="Property image"
                            className="aspect-square rounded-md object-cover"
                            height="64"
                            src={property.property.image1}
                            width="64"
                          />
                        </TableCell>
                        <TableCell className="font-medium">
                          <div className="grid gap-1">
                            <p className="text-sm font-medium leading-none">
                              {property.property.title}
                            </p>
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <MapPin /> {property.property.address}
                            </p>
                          </div>
                        </TableCell>

                        {property.tenant_profile === null ? (
                          <TableCell className="flex flex-col align-center justify-left">
                            <Badge
                              variant="outline"
                              style={{ maxWidth: "fit-content" }}
                            >
                              Vacant
                            </Badge>
                            <div className=" font-medium">
                              {property.applications.length} Applicants
                            </div>
                          </TableCell>
                        ) : (
                          <TableCell>
                            <div className="flex items-center gap-4">
                              <Avatar className="hidden h-9 w-9 sm:flex">
                                <AvatarImage
                                  src={
                                    property.tenant_profile?.user
                                      .profile_picture
                                  }
                                  alt="Avatar"
                                />
                                <AvatarFallback>
                                  {property.tenant_profile?.user.first_name[0]}
                                  {property.tenant_profile?.user.last_name[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div className="grid gap-1">
                                <p className="text-sm font-medium leading-none">
                                  {property.tenant_profile?.user.first_name}{" "}
                                  {property.tenant_profile?.user.last_name}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {property.tenant_profile?.user.email}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                        )}

                        <TableCell>
                          {severeMaintenance ? (
                            <div className="grid gap-1">
                              <Badge
                                variant="outline"
                                style={{ maxWidth: "fit-content" }}
                              >
                                {severeMaintenance.severity}
                              </Badge>
                              <div className=" font-medium">
                                {severeMaintenance.type}
                              </div>
                            </div>
                          ) : (
                            <span>
                              <CheckCheck />
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="grid gap-1">
                            {property.tenant_profile !== null && (
                              <Badge
                                variant="outline"
                                style={{ maxWidth: "fit-content" }}
                              >
                                {property.tenant_profile.paid ==
                                property.tenant_profile.billed
                                  ? "Paid"
                                  : "Pending"}
                              </Badge>
                            )}

                            <div className="font-medium">
                              ${property.property.rent_price}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="p-2 text-gray-500 hover:text-gray-700"
                              >
                                <MoreHorizontal className="h-5 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {property.tenant_profile == null && (
                                <Dialog
                                  open={openApplications}
                                  onOpenChange={setOpenApplications}
                                >
                                  <DialogTrigger asChild>
                                    <DropdownMenuItem
                                      onClick={(e) => {
                                        e.stopPropagation(); // Stop event bubbling
                                        e.preventDefault();
                                        setOpenApplications(true);
                                      }}
                                    >
                                      Applicants
                                    </DropdownMenuItem>
                                  </DialogTrigger>
                                  <DialogContent className="sm:max-w-[425px]">
                                    <DialogHeader className="mt-4">
                                      <DialogTitle>
                                        Applications Sent
                                      </DialogTitle>
                                      <DialogDescription>
                                        List of applying tenants who want to be
                                        occupant of {property.property.title}.
                                      </DialogDescription>
                                    </DialogHeader>
                                    <Applicants
                                      applications={property.applications}
                                      fetchData={fetchData}
                                      setOpenApplications={setOpenApplications}
                                    />
                                  </DialogContent>
                                </Dialog>
                              )}
                              {property.maintenance_requests.length > 0 && (
                                <DropdownMenuItem
                                  onClick={() => {
                                    setActivePage("maintenance");
                                  }}
                                >
                                  Maintenance
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem>Edit</DropdownMenuItem>
                              <DropdownMenuItem>Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter>
              <div className="text-xs text-muted-foreground">
                Showing <strong>1-10</strong> of <strong>32</strong> properties
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
}
