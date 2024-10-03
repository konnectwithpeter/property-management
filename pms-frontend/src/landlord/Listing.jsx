import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { MapPin } from "lucide-react"; // Import MapPin from lucide-react
import {Skeleton} from "@/components/ui/skeleton"; // Import your Skeleton component
import { useContext } from "react";
import APIContext from "../context/APIContext";

export default function Listing({ data }) {
  const isLoading = !data || data.length === 0; // Determine if loading based on data availability
 const {API_URL} = useContext(APIContext)
  return (
    <Card className="gap-4 w-full">
      <CardHeader>
        <CardTitle>My Listed Property</CardTitle>
        <CardDescription>
          Manage your properties and view their sales performance.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {isLoading ? (
            // Skeleton Loader
            <div className="flex flex-col gap-4">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="mb-5">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
          ) : (
            data.map((property) => (
              <AccordionItem
                key={property.id}
                value={`item-${property.id}`}
                className="mb-5"
              >
                {/* Enhanced Accordion Trigger */}
                <AccordionTrigger className="flex justify-between items-center p-2 border rounded-lg bg-gray-100 transition-transform active:scale-95 w-full hover:bg-gray-100 hover:border-gray-100">
                  <div className="flex flex-col gap-2 w-full">
                    <Table className="w-full rounded-lg">
                      <TableBody className="rounded-lg">
                        <TableRow className="rounded-lg justify-left">
                          <TableCell className="hidden sm:table-cell">
                            <img
                              alt="Property image"
                              className="aspect-square rounded-md object-cover"
                              height="64"
                              src={`${API_URL}${property.image1}`}
                              width="64"
                            />
                          </TableCell>
                          <TableCell className="font-medium">
                            <div className="grid gap-1">
                              <p className="text-sm font-medium leading-none">
                                {property.location}
                              </p>
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <MapPin /> {property.block}, {property.house}
                              </p>
                            </div>
                          </TableCell>

                          {property.tenants.length < 1 ? (
                            <TableCell className="flex flex-col align-center justify-left">
                              <Badge
                                variant="outline"
                                style={{ maxWidth: "fit-content" }}
                              >
                                Vacant
                              </Badge>
                            </TableCell>
                          ) : (
                            <TableCell>
                              <div className="flex items-center gap-4">
                                <Avatar className="hidden h-9 w-9 sm:flex">
                                  <AvatarImage
                                    src={`${API_URL}${property.tenants[0].user.profile_picture}`}
                                    alt="Avatar"
                                  />
                                  <AvatarFallback>
                                    {property.tenants[0].user.first_name[0]}
                                    {property.tenants[0].user.last_name[0]}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="grid gap-1">
                                  <p className="text-sm font-medium leading-none">
                                    {property.tenants[0].user.first_name}{" "}
                                    {property.tenants[0].user.last_name}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {property.tenants[0].user.email}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                          )}
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </AccordionTrigger>

                {/* Accordion Content */}
                <AccordionContent>
                  <div className="p-4">
                    <table className="w-full border border-gray-300">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="p-2 text-left border">Image</th>
                          <th className="p-2 text-left border">Property</th>
                          <th className="p-2 text-left border">Block</th>
                          <th className="p-2 text-left border">House</th>
                          <th className="p-2 text-left border">Tenant</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="p-2 border">
                            <img
                              src={`${API_URL}${property.image1}`}
                              alt="Property"
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                          </td>
                          <td className="p-2 border">{property.house}</td>
                          <td className="p-2 border">{property.block}</td>
                          <td className="p-2 border">{property.house}</td>
                          <td className="p-2 border">
                            {property.tenants.length > 0
                              ? `${property.tenants[0].user.first_name} ${property.tenants[0].user.last_name}`
                              : "Vacant"}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))
          )}
        </Accordion>
      </CardContent>
    </Card>
  );
}
