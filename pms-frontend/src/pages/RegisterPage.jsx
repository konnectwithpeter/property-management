import { useContext, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Eye, EyeOff } from "lucide-react";
import APIContext from "../context/APIContext";

export default function RegisterForm() {
  const navigate = useNavigate();
  const {API_URL} = useContext(APIContext)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    userType: "",
  });
  const [agreed, setAgreed] = useState(false); // State for T&C agreement
  const [errors, setErrors] = useState({}); // State for form validation errors
  const [processing, setProcessing] = useState(false); // State for processing registration
  const [showPassword, setShowPassword] = useState(false); // State for password visibility

  // Validation function
  const validateForm = () => {
    const newErrors = {};
    if (!formData.firstName) newErrors.firstName = "First name is required";
    if (!formData.lastName) newErrors.lastName = "Last name is required";
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.password) newErrors.password = "Password is required";
    if (!formData.userType) newErrors.userType = "User type is required";
    if (!agreed)
      newErrors.agreed = "You must agree to the terms and conditions";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // Return true if no errors
  };

  // Handle form data change
  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [id]: value }));
  };

  // Create FormData object
  const data = new FormData();
  data.append("email", formData.email);
  data.append("password", formData.password);
  data.append("first_name", formData.firstName);
  data.append("last_name", formData.lastName);
  data.append("user_type", formData.userType);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      setProcessing(true);
      try {
        // Send registration data to backend
        const response = await axios.post(
          `${API_URL}/api/register/`,
          data,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        navigate("/login"); // Navigate to success page after registration
      } catch (error) {
        if (error.response && error.response.data) {
          // Handle backend errors
          setErrors({
            ...error.response.data,
            agreed: errors.agreed, // Preserve the T&C agreement error if any
          });
        } else {
          console.error("Registration error:", error);
        }
      } finally {
        setProcessing(false);
      }
    }
  };

  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle className="text-xl">Sign Up</CardTitle>
        <CardDescription>
          Enter your information to create an account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="firstName">First name</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Max"
                  required
                />
                {errors.firstName && (
                  <p className="text-red-600 text-sm">{errors.firstName}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="lastName">Last name</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Robinson"
                  required
                />
                {errors.lastName && (
                  <p className="text-red-600 text-sm">{errors.lastName}</p>
                )}
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="m@example.com"
                required
              />
              {errors.email && (
                <p className="text-red-600 text-sm">{errors.email}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center "
                  style={{ backgroundColor: "transparent" }}
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>

              {errors.password && (
                <p className="text-red-600 text-sm">{errors.password}</p>
              )}
            </div>

            {/* Styled Select Dropdown for userType */}
            <div className="grid gap-2">
              <Label htmlFor="userType">User Type</Label>
              <div className="relative">
                <select
                  id="userType"
                  value={formData.userType}
                  onChange={handleChange}
                  className="border rounded-md p-2 w-full focus:outline-none focus:ring-1 focus:ring-green-500"
                  required
                >
                  <option value="" disabled>
                    Select user type
                  </option>
                  <option value="landlord">Landlord</option>
                  <option value="tenant">Tenant</option>
                </select>
              </div>
              {errors.userType && (
                <p className="text-red-600 text-sm">{errors.userType}</p>
              )}
            </div>

            {/* Checkbox for agreeing to terms */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="terms"
                checked={agreed}
                onChange={() => setAgreed(!agreed)}
                className="form-checkbox h-4 w-4 text-blue-600"
              />
              <Label htmlFor="terms">
                I agree to the{" "}
                <Link to="/terms" className="underline">
                  terms and conditions
                </Link>
              </Label>
            </div>
            {errors.agreed && (
              <p className="text-red-600 text-sm">{errors.agreed}</p>
            )}

            <Button type="submit" className="w-full" disabled={processing}>
              {processing ? "Creating account..." : "Create an account"}
            </Button>
          </div>
        </form>

        <div className="mt-4 text-center text-sm">
          Already have an account?{" "}
          <Link
            onClick={(e) => {
              e.preventDefault();
              navigate("/login");
            }}
            className="underline"
          >
            Sign in
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
