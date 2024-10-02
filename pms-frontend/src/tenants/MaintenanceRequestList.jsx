import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import AuthContext from "../context/AuthContext";
import BufferPage from "../pages/BufferPage";

const MaintenanceRequestList = ({
  fetchMaintenanceRequests,
  requests,
  loading,
}) => {
  // Fetch maintenance requests from the API
  useEffect(() => {
    fetchMaintenanceRequests();
  }, []);

  // Display status with corresponding badges
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


  return (
    <>
      {requests.length < 1 ? (
        <div
          className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm h-full"
          style={{ minHeight: "60vh" }}
        >
          <div className="flex flex-col items-center gap-1 text-center">
            <h3 className="text-2xl font-bold tracking-tight">
              You have no maintenance request
            </h3>
            <p className="text-sm text-muted-foreground">
              Maintenance requests will be listed here.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 h-full">
          {requests.map((request) => (
            <Card key={request.id} className="p-2 h-full max-h-fit">
              <CardContent className="flex flex-col h-full">
                <div className="flex justify-between">
                  <p className="text-lg font-bold">Maintenance Request</p>
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

                {/* Images Section */}
                <div className="mt-2">
                  <strong>Images:</strong>
                  <div className="flex gap-2 mt-2">
                    {request.image1 && (
                      <img
                        src={`http://127.0.0.1:8000${request.image1}`}
                        alt={`Maintenance request image 1`}
                        className="w-20 h-20 object-cover"
                      />
                    )}
                    {request.image2 && (
                      <img
                        src={`http://127.0.0.1:8000${request.image2}`}
                        alt={`Maintenance request image 2`}
                        className="w-20 h-20 object-cover"
                      />
                    )}
                    {request.image3 && (
                      <img
                        src={`http://127.0.0.1:8000${request.image3}`}
                        alt={`Maintenance request image 3`}
                        className="w-20 h-20 object-cover "
                      />
                    )}
                  </div>{" "}
                  {request.video !== null && (
                    <div className="mt-2">
                      <strong>Video:</strong>
                      <video
                        width="160"
                        height="120"
                        className="rounded-md"
                        controls
                      >
                        <source
                          src={`http://127.0.0.1:8000${request.video}`}
                          type="video/mp4"
                        />
                        Your browser does not support the video tag.
                      </video>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
};

export default MaintenanceRequestList;
