
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import axios from "axios";
import { useContext, useState, useEffect } from "react";
import AuthContext from "../../context/AuthContext";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";


const PropertyCard = ({ property, isLoading }) => {
  const [selectedImage, setSelectedImage] = useState(
    `http://127.0.0.1:8000${property.image1}`
  );
  const { user, authTokens } = useContext(AuthContext);

  // Handle image selection from thumbnails
  const handleImageSelect = (image) => {
    setSelectedImage(`http://127.0.0.1:8000${image}`);
  };

  const axiosConfig = {
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + String(authTokens.access),
    },
  };

  const sendApplication = async () => {
    try {
      const response = await axios.post(
        `http://127.0.0.1:8000/api/applications/`,
        {
          property: property.id, // Ensure this is the correct property ID
          status: "pending", // Example status; use an appropriate value based on your choices
          tenant: user.user_id,
        },
        axiosConfig
      );
      toast("Application sent successfully");
    } catch (error) {
      console.error(error.response && error.response.data);
      toast(error.response.data);
    }
  };

  return (
    <>
    <Card className="max-w-lg mx-auto shadow-md p-0 border-none">
      <CardContent className="p-0">
        {/* Image Carousel */}
        <div className="relative mb-2">
          {isLoading ? (
            <Skeleton className="w-full h-64" />
          ) : (
            <img
              src={selectedImage}
              alt="Selected Property"
              className="w-full h-64 object-cover "
              loading="lazy"
              link="preload"
            />
          )}
        </div>

        {/* Thumbnails */}
        <div className="flex justify-center space-x-2 mb-2">
          {isLoading ? (
            <>
              <Skeleton className="h-10 w-10" />
              <Skeleton className="h-10 w-10" />
              <Skeleton className="h-10 w-10" />
            </>
          ) : (
            <>
              <img
                src={`http://127.0.0.1:8000${property.image1}`}
                alt={`Thumbnail 1`}
                className={`h-10 w-10 object-cover rounded-md cursor-pointer ${
                  selectedImage === property.image1 ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => handleImageSelect(property.image1)}
              />
              {property.image2 && (
                <img
                  src={`http://127.0.0.1:8000${property.image2}`}
                  alt={`Thumbnail 2`}
                  className={`h-10 w-10 object-cover rounded-md cursor-pointer ${
                    selectedImage === property.image2 ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => handleImageSelect(property.image2)}
                />
              )}
              {property.image3 && (
                <img
                  src={`http://127.0.0.1:8000${property.image3}`}
                  alt={`Thumbnail 3`}
                  className={`h-10 w-10 object-cover rounded-md cursor-pointer ${
                    selectedImage === property.image3 ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => handleImageSelect(property.image3)}
                />
              )}
            </>
          )}
        </div>
        <div className="p-1">
          {/* Property Name and Location */}
          {isLoading ? (
            <>
              <Skeleton className="h-6 mb-1" />
              <Skeleton className="h-4 mb-2" />
            </>
          ) : (
            <>
              <h3
                className="text-xl font-semibold mb-1"
                style={{
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {property.title}
              </h3>
              <p
                className="text-sm mb-2"
                style={{
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {property.address}
              </p>
            </>
          )}
          {/* Details Row (Bedroom, Bathroom, Parking) */}
          <div className="flex justify-between items-center mb-2">
            {isLoading ? (
              <>
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-1/3" />
              </>
            ) : (
              <>
                <p className="text-sm">🛏 {property.bedrooms} Bedrooms</p>
                <p className="text-sm">🛁 {property.bathrooms} Bathrooms</p>
                <p className="text-sm">🚗 {property.parking} Parking</p>
              </>
            )}
          </div>
        </div>
      </CardContent>

      {/* Send Application Button */}
      <CardFooter className="flex justify-center">
        <Button className="w-full" onClick={() => sendApplication()} disabled={isLoading}>
          {isLoading ? <Skeleton className="h-6 w-full" /> : "Send Application"}
        </Button>
      </CardFooter>
    </Card>
    <Toaster/></>
  );
};

export default PropertyCard;

