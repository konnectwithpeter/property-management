import React, { useState } from "react";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Maintenance = ({ maintenanceRequests, axiosConfig }) => {
  // State to store budgets for each request (using request ID as key)
  const [budgets, setBudgets] = useState({});

  // Function to get status badge based on request status
  const getStatusBadge = (status) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500 text-white">Completed</Badge>;
      case "ongoing":
        return <Badge className="bg-yellow-500 text-white">Ongoing</Badge>;
      case "approved":
        return <Badge className="bg-blue-500 text-white">Approved</Badge>;
      case "pending":
      default:
        return <Badge className="bg-gray-500 text-white">Pending</Badge>;
    }
  };

  // Function to handle budget input change for each request
  const handleBudgetChange = (id, value) => {
    setBudgets((prevBudgets) => ({
      ...prevBudgets,
      [id]: value, // Update the specific budget by request ID
    }));
  };

  // Function to handle the approve action, sending the correct budget per request
  const handleApprove = async (property, tenant, budget) => {
    try {
      const res = await axios.patch(
        "http://127.0.0.1:8000/api/maintenance-requests/",
        { property, tenant, budget },
        axiosConfig
      );
      console.log(res);
    } catch (error) {
      console.error("Error approving maintenance request:", error);
    }
  };

  // Render the list of maintenance requests
  return (
    <main
      className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8"
      style={{ width: "100%", minWidth: "94.5vw" }}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 h-full">
        {maintenanceRequests.map((request,index) => (
          <Card key={request.id} className="p-2 h-full max-h-fit">
            <CardContent className="flex flex-col h-full">
              <div className="flex justify-between">
                <p className="text-lg font-bold">{request.property_name}</p>
                {getStatusBadge(request.status)}
              </div>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <p className="text-sm">
                  <strong>Type:</strong> {request.type}
                </p>
                <p className="text-sm">
                  <strong>Severity:</strong> {request.severity}
                </p>
              </div>
              <p className="text-sm mt-2">
                <strong>Description:</strong> {request.description}
              </p>
              <p className="text-sm mt-2">
                <strong>Submitted On:</strong>
                {new Date(request.created_at).toLocaleDateString()}
              </p>
              <div className="mt-2">
                <strong>Images:</strong>
                <div className="flex gap-2 mt-2">
                  {request.image1 && (
                    <img
                      src={request.image1}
                      alt="Maintenance request image 1"
                      className="w-20 h-20 object-cover"
                      loading="lazy"
                    />
                  )}
                  {request.image2 && (
                    <img
                      src={request.image2}
                      alt="Maintenance request image 2"
                      className="w-20 h-20 object-cover"
                      loading="lazy"
                    />
                  )}
                  {request.image3 && (
                    <img
                      src={request.image3}
                      alt="Maintenance request image 3"
                      className="w-20 h-20 object-cover"
                      loading="lazy"
                    />
                  )}
                </div>
                {request.video !== null && (
                  <div className="mt-2">
                    <strong>Video:</strong>
                    <video
                      width="160"
                      height="120"
                      className="rounded-md"
                      controls
                      preload="metadata"
                    >
                      <source src={request.video} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                )}
                <div className="flex align-center justify-between mt-2">
                  {/* Budget Input */}
                  <Input
                    type="number"
                    value={budgets[request.index] || ""} // Track budget specific to each request
                    onChange={(e) => handleBudgetChange(request.id, e.target.value)}
                    placeholder="Enter budget"
                  />
                </div>
                {/* Approve button */}
                <Button
                  onClick={() =>
                    handleApprove(request.property, request.tenant, budgets[request.id])
                  }
                  className="mt-4"
                >
                  Approve
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
};

export default Maintenance;
