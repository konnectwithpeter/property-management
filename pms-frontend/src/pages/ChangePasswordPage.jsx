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
import { Eye, EyeOff } from "lucide-react";
import AuthContext from "../context/AuthContext";
import APIContext from "@/context/APIContext";
import axios from "axios";

// Password strength meter function
const getPasswordStrength = (password) => {
  if (password.length < 6) return "Weak";
  if (password.match(/(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*\W)/)) return "Strong";
  return "Medium";
};

export default function ResetPassword() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    pass1: "",
    pass2: "",
  });
  const [passwordStrength, setPasswordStrength] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const { API_URL, BASE_URL } = useContext(APIContext);

  let url = location.pathname;
  let reset_uuid = url.substring(
    url.lastIndexOf("64=") + 3,
    url.lastIndexOf("/")
  );
  let reset_token = url.slice(url.lastIndexOf("en=") + 3);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [id]: value }));

    // Update password strength if typing in the password field
    if (id === "pass1") {
      setPasswordStrength(getPasswordStrength(value));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { pass1, pass2 } = formData;

    // Check if passwords match
    if (pass1 !== pass2) {
      setErrors({ password: "Passwords do not match" });
      return;
    }

    // Check if password is strong enough
    if (passwordStrength === "Weak") {
      setErrors({ password: "Password is too weak" });
      return;
    }

    // Clear errors and log the password
    setErrors({});

    await axios.patch(`${API_URL}api/password-reset-complete`, {
      password: pass1,
      token: reset_token,
      uidb64: reset_uuid,
    });
    navigate("/login", { replace: true });

    // Here you can perform the actual password reset request
    // (example: await axios.post("/api/reset-password", { password: pass1 }))
  };

  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Password Reset</CardTitle>
        <CardDescription>
          Enter your new password and confirm it
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="pass1">Password</Label>
              <div className="relative">
                <Input
                  id="pass1"
                  type={showPassword ? "text" : "password"}
                  value={formData.pass1}
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
              {/* Password strength meter */}
              {formData.pass1 && (
                <div className={`text-sm ${passwordStrength.toLowerCase()}`}>
                  Password strength: {passwordStrength}
                </div>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="pass2">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="pass2"
                  type={showPassword ? "text" : "password"}
                  value={formData.pass2}
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
            </div>

            {/* Display errors if any */}
            {errors.password && (
              <div className="text-red-600 text-sm">{errors.password}</div>
            )}

            <Button type="submit" className="w-full">
              Reset Password
            </Button>
          </div>
        </form>

        <div className="mt-4 text-center text-sm">
          Don&apos;t have a link?{" "}
          <Link
            onClick={(e) => {
              e.preventDefault();
              navigate("/login");
            }}
            className="underline"
          >
            New Link
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
