import React, { useContext, useState } from "react";
import axios from "axios";

import AuthContext from "@/context/AuthContext";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import APIContext from "../context/APIContext";

const VacateNoticeForm = () => {
  const [vacateDate, setVacateDate] = useState("");
  const [reason, setReason] = useState("");
  const { authTokens } = useContext(AuthContext);
  const { API_URL } = useContext(APIContext);

  let axiosConfig = {
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + String(authTokens.access),
    },
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        `${API_URL}/api/vacate-notices/`,

        {
          vacate_date: vacateDate,
          reason: reason,
        },
        axiosConfig
      );
      alert("Vacate notice submitted successfully!");
      // Reset form
      setVacateDate("");
      setReason("");
    } catch (error) {
      console.error("Error submitting vacate notice:", error);
      alert("Failed to submit vacate notice.");
    }
  };

  return (
    <div className="w-full mx-auto p-6  rounded-lg   bg-white shadow-lg ">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="vacate_date">Vacate Date</Label>
          <Input
            type="date"
            value={vacateDate}
            onChange={(e) => setVacateDate(e.target.value)}
            required
          />
        </div>

        <div>
          <Label htmlFor="reason">Reason</Label>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Describe the reason to vacate"
            minrows={4}
          />
        </div>

        <Button
          type="submit"
          className="w-full bg-blue-600 text-white hover:bg-blue-700 transition duration-200"
        >
          Submit Vacate Notice
        </Button>
      </form>
    </div>
  );
};

export default VacateNoticeForm;
