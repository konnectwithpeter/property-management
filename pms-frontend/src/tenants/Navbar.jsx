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

const Navbar = ({ setActivePage, activePage }) => {
  const navigate = useNavigate();
  const { logoutUser, user } = useContext(AuthContext);
  const [isSheetOpen, setIsSheetOpen] = useState(false); // Manage sheet open state

  const handleLinkClick = (page) => {
    setActivePage(page); // Set the active page
    setIsSheetOpen(false); // Close the sheet after clicking a link
  };

  return (
    <header
      className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6"
      style={{ zIndex: 1000 }}
    >
      <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
        <Link
          to="#"
          onClick={(e) => {
            e.preventDefault();
            navigate("/");
          }}
          className="flex items-center gap-2 text-lg font-semibold md:text-base"
        >
          <Package2 className="h-6 w-6" />
          <span className="sr-only">Heri Homes</span>
        </Link>
        <Link
          to="#"
          onClick={(e) => {
            e.preventDefault();
            setActivePage("overview");
          }}
          className={
            activePage === "overview"
              ? "text-foreground transition-colors hover:text-foreground"
              : "text-muted-foreground transition-colors hover:text-foreground"
          }
        >
          Dashboard
        </Link>

        <Link
          to="#"
          onClick={(e) => {
            e.preventDefault();
            setActivePage("maintenance");
          }}
          className={
            activePage === "maintenace"
              ? "text-foreground transition-colors hover:text-foreground"
              : "text-muted-foreground transition-colors hover:text-foreground"
          }
        >
          Maintenance
        </Link>

        <Link
          to="#"
          onClick={(e) => {
            e.preventDefault();
            setActivePage("notifications");
          }}
          className={
            activePage === "notifications"
              ? "text-foreground transition-colors hover:text-foreground"
              : "text-muted-foreground transition-colors hover:text-foreground"
          }
        >
          Notifications
        </Link>
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
            <Link
              href="#"
              className="hover:text-foreground"
              onClick={(e) => {
                e.preventDefault();
                handleLinkClick("overview");
              }}
            >
              Dashboard
            </Link>
            <Link
              href="#"
              className="text-muted-foreground hover:text-foreground"
              onClick={(e) => {
                e.preventDefault();
                handleLinkClick("maintenance");
              }}
            >
              Maintenance
            </Link>
            <Link
              href="#"
              className="text-muted-foreground hover:text-foreground"
              onClick={(e) => {
                e.preventDefault();
                handleLinkClick("notifications");
              }}
            >
              Notifications
            </Link>
          </nav>
        </SheetContent>
      </Sheet>
      <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
        <div className="ml-auto flex-1 sm:flex-initial">
          <span className="text-muted-foreground">
            Hello, {user.first_name}
          </span>
        </div>
        <ModeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="icon" className="rounded-full">
              <Avatar>
                <AvatarImage
                  src={`http://127.0.0.1:8000${user.profile_picture}`}
                  alt="RC"
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
            <DropdownMenuItem onClick={() => setActivePage("vacate")}>
              Vacate
            </DropdownMenuItem>

            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => logoutUser()}>
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Navbar;
