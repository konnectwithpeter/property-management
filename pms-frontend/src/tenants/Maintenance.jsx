import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import axios from "axios";
import { TrashIcon } from "lucide-react";
import { useContext, useState } from "react";
import AuthContext from "../context/AuthContext";
import MaintenanceRequestList from "./MaintenanceRequestList";
import APIContext from "@/context/APIContext";

const Maintenance = ({ currentProperty }) => {
  const [description, setDescription] = useState("");
  const [images, setImages] = useState([]);
  const [video, setVideo] = useState(null);
  const [maintenanceType, setMaintenanceType] = useState("");
  const [severity, setSeverity] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [responseMessage, setResponseMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const { authTokens, user } = useContext(AuthContext);

  const {API_URL} = useContext(APIContext)
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length <= 3) {
      setImages((prevImages) => [...prevImages, ...files]);
    } else {
      alert("You can upload up to 3 images.");
    }
  };

  const handleRemoveImage = (index) => {
    setImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    setVideo(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!description || images.length === 0 || !maintenanceType || !severity) {
      setErrorMessage(
        "Please fill out all fields and upload at least one image."
      );
      return;
    }

    if (images.length !== 3) {
      setErrorMessage("You must upload exactly 3 images.");
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("description", description);
    formData.append("maintenance_type", maintenanceType);
    formData.append("severity", severity);
    formData.append("property_id", currentProperty.id);

    images.forEach((image, index) => {
      formData.append(`image_${index}`, image);
    });

    if (video) {
      formData.append("video", video);
    }

    try {
      const response = await axios.post(
          `${API_URL}/api/maintenance-requests/`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: "Bearer " + String(authTokens.access),
          },
        }
      );
      setResponseMessage("Request submitted successfully!");
      setImages([]); // Clear images after successful submission
      setVideo(null); // Clear video after successful submission
      setDescription("");
      setMaintenanceType("");
      setSeverity("");
      setErrorMessage(""); // Clear error message
      fetchMaintenanceRequests();
    } catch (error) {
      console.error("Error submitting request:", error);
      setResponseMessage("Failed to submit the request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  let axiosConfig = {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: "Bearer " + String(authTokens.access),
    },
  };
  const fetchMaintenanceRequests = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/maintenance-requests/`,
        axiosConfig
      );
      setRequests(response.data); // Access the 'results' array from the paginated response
    } catch (error) {
      console.error("Error fetching maintenance requests:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex ml-auto">
        <Dialog>
          <DialogTrigger asChild>
            <Button>Submit a Request</Button>
          </DialogTrigger>
          <DialogContent className="max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Submit a Maintenance Request</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <Label>Maintenance Type</Label>
              <Select onValueChange={(value) => setMaintenanceType(value)}>
                <SelectTrigger>
                  {maintenanceType || "Select maintenance type"}
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Plumbing">Plumbing</SelectItem>
                  <SelectItem value="Electrical">Electrical</SelectItem>
                  <SelectItem value="Structural">Structural</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>

              <Label className="mt-4">Severity</Label>
              <Select onValueChange={(value) => setSeverity(value)}>
                <SelectTrigger>{severity || "Select severity"}</SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                </SelectContent>
              </Select>

              <Label className="mt-4">Description</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the issue"
              />

              <Label className="mt-4">Upload Images (Max 3)</Label>
              <Input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
              />

              {images.length > 0 && (
                <div className="mt-4">
                  <strong>Image Previews:</strong>
                  <div className="flex gap-2">
                    {images.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`Preview ${index}`}
                          className="w-20 h-20"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="absolute top-0 right-0 bg-red-500 text-white"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Label className="mt-4">Upload Video (Optional)</Label>
              <Input
                type="file"
                accept="video/*"
                onChange={handleVideoChange}
              />
              {video && (
                <div className="mt-4">
                  <strong>Video Preview:</strong>
                  <video controls className="w-full">
                    <source
                      src={URL.createObjectURL(video)}
                      type={video.type}
                    />
                    Your browser does not support the video tag.
                  </video>
                </div>
              )}

              <Button type="submit" className="mt-6" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Request"}
              </Button>
            </form>
            {errorMessage && (
              <p className="mt-4 text-center text-red-500">{errorMessage}</p>
            )}
            {responseMessage && (
              <p className="mt-4 text-center">{responseMessage}</p>
            )}
          </DialogContent>
        </Dialog>
      </div>
      <div>
        <MaintenanceRequestList
          fetchMaintenanceRequests={fetchMaintenanceRequests}
          requests={requests}
          loading={loading}
        />
      </div>
    </>
  );
};

export default Maintenance;
