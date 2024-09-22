"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AuthContext from "../context/AuthContext";
import axios from "axios";
import { useContext } from "react";

export default function Applicants({
  applications,
  fetchData,
  setOpenApplications,
}) {
  let { authTokens } = useContext(AuthContext);

  let axiosConfig = {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: "Bearer " + String(authTokens.access),
    },
  };

  const handleApproveApplication = async (tenant_email, property) => {
    const formData = new FormData();
    formData.append("tenant", tenant_email);
    formData.append("property", property);
    try {
      const response = await axios.patch(
        "http://127.0.0.1:8000/api/applications/",
        formData,
        axiosConfig
      );

      setOpenApplications(false);
      fetchData();
    } catch (error) {
      console.log(error);
    }
  };

  return applications.map((application, index) => (
    <div key={index} className="flex items-center gap-4">
      <Avatar className="hidden h-9 w-9 sm:flex">
        <AvatarImage src={application.profile_picture} alt="Avatar" />
        <AvatarFallback>
          {application?.first_name[0]}
          {application?.last_name[0]}
        </AvatarFallback>
      </Avatar>
      <div className="grid gap-1">
        <p className="text-sm font-medium leading-none">
          {application?.first_name} {application?.last_name}
        </p>
        <p className="text-sm text-muted-foreground">
          {application.tenant_email}
        </p>
      </div>
      <div className="ml-auto">
        <Button
          onClick={() =>
            handleApproveApplication(
              application.tenant_email,
              application.property
            )
          }
        >
          Approve
        </Button>
      </div>
    </div>
  ));
}
