import { Menu, Package2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ModeToggle } from "../components/ModeToggle";
import AuthContext from "../context/AuthContext";
import APIContext from "../context/APIContext";

const Navbar = ({ setActivePage, activePage }) => {
  const navigate = useNavigate();
  const { logoutUser, user } = useContext(AuthContext);
  const [isSheetOpen, setIsSheetOpen] = useState(false); // Manage sheet open state
  const {API_URL} = useContext(APIContext);

  const handleLinkClick = (page) => {
    setActivePage(page); // Set the active page
    setIsSheetOpen(false); // Close the sheet after clicking a link
  };
  {
    console.log(user);
  }

  return (
    <header
      className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 shadow-md"
      style={{ zIndex: 1000 }}
    >
      <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
        <Link
          to="#"
          onClick={(e) => {
            e.preventDefault();
            navigate("/");
          }}
          className="flex items-center gap-2 text-lg font-semibold transition-colors hover:text-blue-600"
        >
          <Package2 className="h-6 w-6" />
          <span className="sr-only">Heri Homes</span>
        </Link>
        {["overview", "properties", "maintenance", "notifications"].map(
          (page) => (
            <Link
              key={page}
              to="#"
              onClick={(e) => {
                e.preventDefault();
                setActivePage(page);
              }}
              className={`${
                activePage === page
                  ? "text-blue-600 font-bold"
                  : "text-gray-600 hover:text-blue-600"
              } transition-colors`}
            >
              {page.charAt(0).toUpperCase() + page.slice(1)}
            </Link>
          )
        )}
      </nav>
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="small" className="shrink-0 md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
          <nav className="grid gap-6 text-lg font-medium">
            <Link
              href="#"
              className="flex items-center gap-2 text-lg font-semibold"
              onClick={(e) => {
                e.preventDefault();
                handleLinkClick("overview");
              }}
            >
              <Package2 className="h-6 w-6" />
              <span className="sr-only">Heri Homes</span>
            </Link>
            {["overview", "maintenance", "notifications"].map((page) => (
              <Link
                key={page}
                href="#"
                className={`text-gray-600 hover:text-blue-600`}
                onClick={(e) => {
                  e.preventDefault();
                  handleLinkClick(page);
                }}
              >
                {page.charAt(0).toUpperCase() + page.slice(1)}
              </Link>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
      <div className="ml-auto flex items-center gap-4">
        <span className="text-muted-foreground">Hello, {user.first_name}</span>
        <ModeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="icon" className="rounded-full">
              <Avatar>
                <AvatarImage
                  src={`${API_URL}${user.profile_picture}`}
                  alt={`${user.first_name} ${user.last_name}`}
                />
                <AvatarFallback>
                  {user.first_name[0]}
                  {user.last_name[0]}
                </AvatarFallback>
              </Avatar>
              <span className="sr-only">Toggle user menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {user.tenant_profile === null ? (
              <DropdownMenuItem onClick={() => setActivePage("properties")}>
                Properties
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onClick={() => setActivePage("overview")}>
                Overview
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => setActivePage("notifications")}>
              Notifications
            </DropdownMenuItem>

            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logoutUser}>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Navbar;
