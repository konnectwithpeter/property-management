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
import AuthContext from "../context/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import APIContext from "@/context/APIContext";

export default function LoginForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [processing, setProcessing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [notification, setNotification] = useState(""); // Notification state

  const { loginUser, loginError } = useContext(AuthContext);
  const { API_URL } = useContext(APIContext);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [id]: value }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.password) newErrors.password = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      setProcessing(true);
      try {
        await loginUser(formData);
        // Handle successful login here, e.g., navigate to dashboard
      } catch (error) {
        if (error.response && error.response.data) {
          console.log(error.response.data);
          setErrors(error.response.data);
          setNotification(
            "Invalid credentials. Please check your email and password and try again."
          );
        } else {
          console.error("Login error:", error);
        }
      } finally {
        setProcessing(false);
      }
    }
  };

  const handleRequestPassword = async (e) => {
    e.preventDefault();
    e.stopPropagation(); // Prevents event bubbling that might affect other forms
    try {
      await axios.post(`${API_URL}api/request-reset-email/`, {
        email: resetEmail,
        redirect_url: `${API_URL}reset-password/`,
      });
      setResetDialogOpen(false); // Close dialog
      setNotification(
        "Please check your email for instructions to reset your password."
      );
    } catch (err) {
      console.log(err);
      setResetDialogOpen(false); // Close dialog
      setNotification("Failed to send reset email. Please try again.");
    }
  };

  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Login</CardTitle>
        <CardDescription>
          Enter your email below to login to your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4">
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
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
                  <DialogTrigger asChild>
                    <Link className="ml-auto inline-block text-sm underline">
                      Forgot your password?
                    </Link>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader className="py-4">
                      <DialogTitle>Reset Password</DialogTitle>
                      <DialogDescription>
                        An email with instructions to reset your password will
                        be sent to this email.
                      </DialogDescription>
                    </DialogHeader>
                    <form
                      className="grid gap-4"
                      onSubmit={handleRequestPassword}
                    >
                      <div className="flex flex-col items-right gap-4">
                        <Input
                          id="reset-email"
                          type="email"
                          value={resetEmail}
                          onChange={(e) => setResetEmail(e.target.value)}
                          placeholder="m@example.com"
                          required
                        />
                      </div>
                      <Button type="submit">Reset Password</Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
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
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  style={{ backgroundColor: "transparent" }}
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-600 text-sm">{errors.password}</p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={processing}>
              {processing ? "Logging in..." : "Login"}
            </Button>
          </div>
        </form>
        {notification && (
          <div className="mt-4 text-center text-sm text-green-600">
            {notification}
          </div>
        )}
        <div className="mt-4 text-center text-sm">
          Don&apos;t have an account?{" "}
          <Link
            onClick={(e) => {
              e.preventDefault();
              navigate("/register");
            }}
            className="underline"
          >
            Sign up
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
