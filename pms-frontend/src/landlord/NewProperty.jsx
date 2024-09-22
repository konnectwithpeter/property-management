import React, { useContext, useState } from "react";
import axios from "axios";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ImageUp, Trash2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import AuthContext from "../context/AuthContext";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";

const NewProperty = ({ axiosConfig, fetchData, setActivePage }) => {
  const [images, setImages] = useState([null, null, null]); // Store up to 3 image files
  const [selectedImage, setSelectedImage] = useState(null);
  const [name, setName] = useState("");
  const [rentAmount, setRentAmount] = useState(0);
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [bedrooms, setBedrooms] = useState(0);
  const [bathrooms, setBathrooms] = useState(0);
  const [parking, setParking] = useState(0);
  const [files, setFiles] = useState([]);
  const [errors, setErrors] = useState({}); // State to store validation errors

  const { authTokens, user } = useContext(AuthContext);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const newImages = [...images];
      const nextAvailableIndex = newImages.findIndex((img) => img === null);

      if (nextAvailableIndex !== -1) {
        newImages[nextAvailableIndex] = file;
        setImages(newImages);
        setSelectedImage(URL.createObjectURL(file));
      } else {
        alert(
          "All image slots are filled. Remove an image to upload a new one."
        );
      }
    }
  };

  const handleThumbnailClick = (imageFile) => {
    const imageUrl = URL.createObjectURL(imageFile);
    setSelectedImage(imageUrl);
  };

  const handleImageRemove = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    const reorderedImages = [...newImages, null].slice(0, 3);
    setImages(reorderedImages);

    if (selectedImage === images[index]) {
      setSelectedImage(
        reorderedImages[0] ? URL.createObjectURL(reorderedImages[0]) : null
      );
    }
  };

  const handleFileUpload = (event) => {
    const uploadedFiles = Array.from(event.target.files);
    setFiles((prevFiles) => [...prevFiles, ...uploadedFiles]);
  };

  const handleFileDelete = (fileIndex) => {
    const newFiles = files.filter((_, index) => index !== fileIndex);
    setFiles(newFiles);
  };

  const handleSubmit = async () => {
    const newErrors = {};

    // Validate required fields
    if (!name) newErrors.name = "Name is required.";
    if (!rentAmount) newErrors.rentAmount = "Rent amount is required.";
    if (!location) newErrors.location = "Location is required.";
    if (!description) newErrors.description = "Description is required.";
    if (bedrooms <= 0) newErrors.bedrooms = "Bedrooms must be at least 1.";
    if (bathrooms <= 0) newErrors.bathrooms = "Bathrooms must be at least 1.";
    if (parking < 0) newErrors.parking = "Parking slots cannot be negative.";
    if (!images.some((image) => image))
      newErrors.images = "At least one image is required.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const formData = new FormData();
    formData.append("title", name);
    formData.append("rent_amount", rentAmount);
    formData.append("location", location);
    formData.append("description", description);
    formData.append("bedrooms", bedrooms);
    formData.append("bathrooms", bathrooms);
    formData.append("parking", parking);
    formData.append("landlord", user);

    images.forEach((image, index) => {
      if (image) {
        formData.append(`image_${index + 1}`, image);
      }
    });

    files.forEach((file) => {
      formData.append("files[]", file);
    });

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/properties/",
        formData,
        axiosConfig
      );

      toast("Property added successfully");
      setActivePage("properties");
      fetchData();
    } catch (error) {
      toast("Error adding property");
    }
  };

  return (
    <main
      className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6"
      style={{ width: "100%", minWidth: "94.5vw" }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Property Details</CardTitle>
          <CardDescription>
            Enter the details of the property below.
          </CardDescription>
          <Separator className="my-6" />
        </CardHeader>

        <CardContent>
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="grid gap-4">
              <div className="grid gap-3">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                {errors.name && <p className="text-red-500">{errors.name}</p>}
              </div>
              <div className="grid gap-3">
                <Label htmlFor="rentAmount">Rent Amount</Label>
                <Input
                  id="rentAmount"
                  type="number"
                  value={rentAmount}
                  onChange={(e) => setRentAmount(e.target.value)}
                />
                {errors.rentAmount && (
                  <p className="text-red-500">{errors.rentAmount}</p>
                )}
              </div>
              <div className="grid gap-3">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
                {errors.location && (
                  <p className="text-red-500">{errors.location}</p>
                )}
              </div>
              <div className="grid gap-3">
                <Label htmlFor="bedrooms">Bedrooms</Label>
                <Input
                  id="bedrooms"
                  type="number"
                  value={bedrooms}
                  onChange={(e) => setBedrooms(e.target.value)}
                />
                {errors.bedrooms && (
                  <p className="text-red-500">{errors.bedrooms}</p>
                )}
              </div>
              <div className="grid gap-3">
                <Label htmlFor="bathrooms">Bathrooms</Label>
                <Input
                  id="bathrooms"
                  type="number"
                  value={bathrooms}
                  onChange={(e) => setBathrooms(e.target.value)}
                />
                {errors.bathrooms && (
                  <p className="text-red-500">{errors.bathrooms}</p>
                )}
              </div>
              <div className="grid gap-3">
                <Label htmlFor="parking">Parking Slots</Label>
                <Input
                  id="parking"
                  type="number"
                  value={parking}
                  onChange={(e) => setParking(e.target.value)}
                />
                {errors.parking && (
                  <p className="text-red-500">{errors.parking}</p>
                )}
              </div>
              <div className="grid gap-3 col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
                {errors.description && (
                  <p className="text-red-500">{errors.description}</p>
                )}
              </div>
            </div>

            <div className="grid gap-4">
              <Card className="pt-4">
                <CardContent className="mb-4 h-75">
                  {selectedImage ? (
                    <img
                      src={selectedImage}
                      alt="Selected"
                      className="w-full h-full object-cover rounded-md"
                    />
                  ) : (
                    <Skeleton
                      className="w-full h-full"
                      style={{ minHeight: "200px" }}
                    />
                  )}
                </CardContent>

                <CardContent className="flex justify-start gap-3">
                  {images.map((image, index) => (
                    <div
                      key={index}
                      className="relative w-14 h-14 bg-gray-300 rounded-md cursor-pointer"
                    >
                      {image ? (
                        <>
                          <img
                            src={URL.createObjectURL(image)} // Use object URL for preview
                            alt={`Thumbnail ${index + 1}`}
                            className="w-full h-full object-cover rounded-md"
                            onClick={() => handleThumbnailClick(image)}
                          />
                          <Button
                            onClick={() => handleImageRemove(index)}
                            className="absolute top-0 right-0 bg-red-500 hover:bg-red-600 text-white w-5 h-5 p-0 rounded-full"
                          >
                            &times;
                          </Button>
                        </>
                      ) : (
                        <Skeleton className="w-full h-full" />
                      )}
                    </div>
                  ))}
                  <label className="w-14 h-14 flex items-center justify-center bg-green-500 text-white rounded-md cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <ImageUp className="h-6 w-6" />
                  </label>
                </CardContent>
                {errors.images && (
                  <CardFooter>
                    <p className="text-red-500">{errors.images}</p>
                  </CardFooter>
                )}
              </Card>

              <Card>
                <CardContent>
                  <Label htmlFor="additionalFiles">Additional Files</Label>
                  <Input
                    id="file-upload"
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                  />
                  <div className="flex flex-wrap gap-2">
                    {files.map((file, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <span>{file.name}</span>
                        <Button
                          variant="destructive"
                          onClick={() => handleFileDelete(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-end">
          <Button onClick={handleSubmit}>Submit</Button>
        </CardFooter>
      </Card>
      <Toaster />
    </main>
  );
};

export default NewProperty;
