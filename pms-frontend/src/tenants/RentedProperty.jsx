import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const RentedProperty = () => {
  const property = {
    name: "Luxury Apartment",
    location: "Upper Hill, Nairobi",
    rent: 50000,
    bedrooms: 3,
    bathrooms: 2,
    parking: 2,
    images: [
      "https://via.placeholder.com/800x600?text=Property+Image+1",
      "https://via.placeholder.com/800x600?text=Property+Image+2",
      "https://via.placeholder.com/800x600?text=Property+Image+3",
    ],
  };

  const lease = {
    startDate: "2023-01-01",
    endDate: "2024-01-01",
    duration: 12,
    rentStatus: "Paid",
  };

  const paymentHistory = [
    { date: "2024-01-01", amount: 50000, status: "Paid" },
    { date: "2023-12-01", amount: 50000, status: "Paid" },
    { date: "2023-11-01", amount: 50000, status: "Paid" },
  ];

  const [selectedImage, setSelectedImage] = useState(property.images[0]);

  const handleImageSelect = (image) => {
    setSelectedImage(image);
  };

  return (
    <main className="flex flex-col gap-8 p-4 lg:p-6">
      {/* First Row: Property Image Carousel and Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Property Image Carousel */}
        <div className="relative">
          <div className="mb-4">
            {selectedImage ? (
              <img
                src={selectedImage}
                alt="Selected Property"
                className="w-full h-80 object-cover rounded-lg shadow-lg"
              />
            ) : (
              <Skeleton className="w-full h-80" />
            )}
          </div>
          <div className="flex space-x-3 overflow-x-auto">
            {property.images.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`Thumbnail ${index + 1}`}
                className={`w-24 h-24 object-cover rounded-md cursor-pointer border-2 transition-all duration-300 ease-in-out ${
                  selectedImage === image
                    ? "border-blue-500"
                    : "border-gray-300"
                }`}
                onClick={() => handleImageSelect(image)}
              />
            ))}
          </div>
        </div>

        {/* Property Details */}
        <div className="flex flex-col space-y-6">
          <h2 className="text-3xl font-bold">{property.name}</h2>
          <p className="text-lg text-gray-700">{property.location}</p>
          <div className="grid grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <span role="img" aria-label="bedroom">
                🛏
              </span>
              <p>{property.bedrooms} Bedrooms</p>
            </div>
            <div className="flex items-center space-x-2">
              <span role="img" aria-label="bathroom">
                🛁
              </span>
              <p>{property.bathrooms} Bathrooms</p>
            </div>
            <div className="flex items-center space-x-2">
              <span role="img" aria-label="parking">
                🚗
              </span>
              <p>{property.parking} Parking spots</p>
            </div>
          </div>

          <Card className="max-w-xs">
            <CardContent className="flex gap-4 p-4">
              <div className="grid items-center gap-2">
                <div className="grid flex-1 auto-rows-min gap-0.5">
                  <div className="text-sm text-muted-foreground">Move</div>
                  <div className="flex items-baseline gap-1 text-xl font-bold tabular-nums leading-none">
                    562/600
                    <span className="text-sm font-normal text-muted-foreground">
                      kcal
                    </span>
                  </div>
                </div>
                <div className="grid flex-1 auto-rows-min gap-0.5">
                  <div className="text-sm text-muted-foreground">Exercise</div>
                  <div className="flex items-baseline gap-1 text-xl font-bold tabular-nums leading-none">
                    73/120
                    <span className="text-sm font-normal text-muted-foreground">
                      min
                    </span>
                  </div>
                </div>
                <div className="grid flex-1 auto-rows-min gap-0.5">
                  <div className="text-sm text-muted-foreground">Stand</div>
                  <div className="flex items-baseline gap-1 text-xl font-bold tabular-nums leading-none">
                    8/12
                    <span className="text-sm font-normal text-muted-foreground">
                      hr
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Rent Status and Lease Information */}
      <Card className="shadow-lg rounded-lg">
        <CardContent>
          <div className="flex justify-between items-center mb-6">
            <p className="text-2xl font-semibold">
              Monthly Rent:{" "}
              <span className="font-bold">KES {property.rent}</span>
            </p>
            <Badge
              variant="outline"
              className={
                lease.rentStatus === "Paid"
                  ? "text-green-600 border-green-600"
                  : lease.rentStatus === "Overdue"
                  ? "text-red-600 border-red-600"
                  : "text-yellow-600 border-yellow-600"
              }
            >
              {lease.rentStatus}
            </Badge>
          </div>

          {/* Lease Information */}
          <div className="p-6 rounded-lg mb-6">
            <h4 className="text-lg font-semibold mb-4">Lease Information</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <p>Lease Start: {lease.startDate}</p>
              <p>Lease End: {lease.endDate}</p>
              <p>Duration: {lease.duration} months</p>
            </div>
          </div>

          {/* Payment History */}
          <div className="p-6 rounded-lg mb-6">
            <h4 className="text-lg font-semibold mb-4">Payment History</h4>
            <Table className="table-fixed w-full">
              <thead>
                <tr>
                  <th className="w-1/3 text-left">Date</th>
                  <th className="w-1/3 text-left">Amount</th>
                  <th className="w-1/3 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {paymentHistory.map((payment, index) => (
                  <TableRow key={index}>
                    <TableCell>{payment.date}</TableCell>
                    <TableCell>KES {payment.amount}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          payment.status === "Paid"
                            ? "text-green-600 border-green-600"
                            : "text-red-600 border-red-600"
                        }
                      >
                        {payment.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </tbody>
            </Table>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4 justify-center mt-6">
            <Button
              onClick={() => alert("Submitting maintenance request!")}
              className="w-full sm:w-auto px-8 py-3"
            >
              Submit Maintenance Request
            </Button>
            <Button
              variant="outline"
              onClick={() => alert("Contacting landlord!")}
              className="w-full sm:w-auto px-8 py-3 "
            >
              Contact Landlord
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
};

export default RentedProperty;
