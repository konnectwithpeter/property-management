import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Input } from "@/components/ui/input";
import { Pagination, PaginationContent } from "@/components/ui/pagination";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Download,
  Eye,
  HandCoins,
} from "lucide-react";
import { useContext, useEffect, useState } from "react";
import APIContext from "../context/APIContext";
import "./styles.css";

const Overviews = ({ tenant_profile, invoices, axiosConfig }) => {
  const [currentPage, setCurrentPage] = useState(1); // State for current page
  const itemsPerPage = 6; // Set the number of items per page
  const { API_URL } = useContext(APIContext);

  // Calculate the indices for slicing the invoices array
  const indexOfLastInvoice = currentPage * itemsPerPage;
  const indexOfFirstInvoice = indexOfLastInvoice - itemsPerPage;
  const currentInvoices =
    invoices?.slice(indexOfFirstInvoice, indexOfLastInvoice) || []; // Sliced invoices array

  const totalPages = Math.ceil(invoices?.length / itemsPerPage); // Calculate total pages

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  function formatExactTimestamp(timestamp) {
    const date = new Date(timestamp);
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    };
    return date.toLocaleString("en-US", options);
  }

  function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    const options = { year: "numeric", month: "long", day: "numeric" };
    return date.toLocaleDateString("en-US", options);
  }

  function formatMonthstamp(timestamp) {
    const date = new Date(timestamp);
    const options = { year: "numeric", month: "long" };
    return date.toLocaleDateString("en-US", options);
  }

  function getLastMonthFromDate(timestamp) {
    const date = new Date(timestamp);
    const lastMonth = new Date(date.setMonth(date.getMonth() - 1));
    const options = { year: "numeric", month: "long" };
    return lastMonth.toLocaleDateString("en-US", options);
  }

  function formatToKES(amount) {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
    }).format(amount);
  }

  const [viewedInvoice, setViewedInvoice] = useState([]);

  const property = tenant_profile?.property || {};

  // On component mount, find the latest unpaid or paid invoice
  useEffect(() => {
    setViewedInvoice(invoices?.length > 0 ? invoices[0] : []);
  }, [invoices]);

  const [phoneNumber, setPhoneNumber] = useState();

  const handleInitiatePayment = async (e) => {
    e.preventDefault();
    const data = {
      phone_number: phoneNumber,
      invoice_id: viewedInvoice.id,
      amount: viewedInvoice.total_amount,
    };
    let res = await fetch("http://127.0.0.1:8000/api/initiate-payment/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    console.log(res);
  };

  // Function to trigger file download
  const handleDownload = (file, filename) => {
    const fileUrl = `${API_URL}${file}`; // Complete file URL
    const link = document.createElement("a");
    link.href = fileUrl; // Set the href to the full file URL
    link.download = filename; // File name for saving the file
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link); // Clean up the DOM
  };
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 bg-transparent">
        <Card
          className="sm:col-span-2 card-gradient-1"
          x-chunk="dashboard-05-chunk-0"
        >
          <CardHeader className="pb-3">
            <CardTitle>Pending Payments</CardTitle>
            <CardDescription className="text-balance max-w-lg leading-relaxed">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Invoice</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">
                      {viewedInvoice.id}
                    </TableCell>
                    <TableCell>
                      {formatTimestamp(viewedInvoice.created_at)}
                    </TableCell>
                    <TableCell>
                      {viewedInvoice.paid ? (
                        <span>Paid</span>
                      ) : (
                        <span>Pending</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatToKES(viewedInvoice.total_amount)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardDescription>
          </CardHeader>
          <CardFooter>
            {viewedInvoice.paid ? (
              <Button>View Receipt</Button>
            ) : (
              <form
                onSubmit={(e) => handleInitiatePayment(e)}
                className="flex w-full max-w-sm items-center space-x-2"
              >
                <Input
                  required
                  type="text"
                  placeholder="Payment Number"
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
                <Button type="submit">Pay Now</Button>
              </form>
            )}
          </CardFooter>
        </Card>

        <Card className="card-gradient-2" x-chunk="dashboard-05-chunk-1">
          <CardHeader className="pb-2">
            <CardDescription>Water Bill</CardDescription>
            <CardTitle className="text-2xl">
              {formatToKES(viewedInvoice?.water_bill)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              Consumption of {viewedInvoice.water_consumption} unit @{" "}
              {viewedInvoice.price_per_unit}
            </div>
          </CardContent>
          <CardFooter>
            <Progress value={25} aria-label="25% increase" />
          </CardFooter>
        </Card>

        <Card className="card-gradient-3" x-chunk="dashboard-05-chunk-2">
          <CardHeader className="pb-2">
            <CardDescription>This Month</CardDescription>
            <CardTitle className="text-2xl">
              {formatToKES(viewedInvoice.total_amount)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              Monthly rent is {formatToKES(viewedInvoice.monthly_rent)}
            </div>
          </CardContent>
          <CardFooter>
            <Progress value={72} aria-label="12% increase" />
          </CardFooter>
        </Card>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3 overflow-hidden">
  <Card
    x-chunk="dashboard-05-chunk-3"
    className="sm:col-span-2 md:col-span-2 max-w-full overflow-hidden"
  >
    <CardHeader className="px-7">
      <CardTitle>Invoices</CardTitle>
      <CardDescription>Recent invoices for my property.</CardDescription>
    </CardHeader>
    <CardContent className="p-4">
      {currentInvoices?.map((invoice, index) => (
        <div
          key={index}
          className="mb-2 p-3 border rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 ease-in-out"
        >
          <Table className="w-full overflow-x-auto">
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead className="hidden sm:table-cell">Type</TableHead>
                <TableHead className="hidden md:table-cell">Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>
                  <div className="font-semibold text-lg">{invoice.id}</div>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  {invoice.paid ? (
                    <Badge className="text-xs" variant="secondary">
                      Paid ✅
                    </Badge>
                  ) : (
                    <Badge className="text-xs" variant="outline">
                      Unpaid
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {formatTimestamp(invoice.created_at)}
                </TableCell>
                <TableCell className="text-right text-md font-semibold">
                  {formatToKES(invoice.total_amount)}
                </TableCell>
                <TableCell className="flex justify-end items-center gap-2">
                  <Button
                    onClick={() => setViewedInvoice(invoice)}
                    variant="outline"
                    size="sm"
                    className="h-7 text-sm"
                  >
                    <Eye className="h-4 w-4" />
                    <span>View</span>
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" className="h-7 text-sm">
                        <Download className="h-3.5 w-3.5" />
                        <span className="sm:hidden">Download</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Download</DropdownMenuLabel>
                      <DropdownMenuItem
                        onClick={() =>
                          handleDownload(invoice.file, "invoice.pdf")
                        }
                      >
                        Invoice
                      </DropdownMenuItem>
                      <DropdownMenuItem>Receipt</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      ))}
    </CardContent>
    <CardFooter>
      <div className="flex items-center gap-4 w-full justify-between">
        <span className="pl-5 text-muted-foreground font-semibold">
          Page {currentPage} of {totalPages}
        </span>
        <div className="flex items-center gap-2">
          <Pagination>
            <PaginationContent>
              <Button
                variant="outline"
                size="sm"
                className="h-7 gap-1"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only">Previous</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="h-7 gap-1"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only">Next</span>
              </Button>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </CardFooter>
  </Card>

  <Card
    className="overflow-hidden sm:col-span-1 shadow-md hover:shadow-lg transition-shadow duration-300 ease-in-out max-w-full"
    x-chunk="dashboard-05-chunk-4"
  >
          <CardHeader className="flex flex-row items-start bg-muted/30 p-4 rounded-t-md">
            <div className="grid gap-1">
              <CardTitle className="group flex items-center gap-2 text-lg font-semibold text-gray-800">
                Invoice Details
              </CardTitle>
              <CardDescription className="text-gray-500">
                Date: {formatTimestamp(viewedInvoice.created_at)}
              </CardDescription>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Button size="sm" variant="outline" className="h-8 gap-1">
                <HandCoins className="h-3.5 w-3.5" />
                <span className="lg:sr-only xl:not-sr-only xl:whitespace-nowrap">
                  Pay Now
                </span>
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-6 text-sm">
            <div className="grid gap-4">
              {/* Water Bill Section */}
              <div className="font-semibold text-gray-800">Water Bill</div>
              <ul className="grid gap-3">
                <li className="flex items-center justify-between">
                  <span className="text-muted-foreground">
                    Previous Meter Reading
                  </span>
                  <span>{viewedInvoice.previous_water_reading}</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-muted-foreground">
                    Current Meter Reading
                  </span>
                  <span>{viewedInvoice.current_water_reading}</span>
                </li>
                <li className="flex items-center justify-between font-semibold">
                  <span className="text-muted-foreground">
                    Consumption ({viewedInvoice.water_consumption} units @{" "}
                    {formatToKES(viewedInvoice.price_per_unit)})
                  </span>
                  <span className="text-lg font-semibold text-gray-800">
                    {formatToKES(viewedInvoice.water_bill)}
                  </span>
                </li>
              </ul>
              <Separator className="my-2" />

              {/* Rent Payable Section */}
              <div className="font-semibold text-gray-800">Rent Payable</div>
              <ul className="grid gap-3">
                <li className="flex items-center justify-between font-semibold">
                  <span className="text-muted-foreground">
                    {formatMonthstamp(viewedInvoice.created_at)}
                  </span>
                  <span> {formatToKES(viewedInvoice.monthly_rent)}</span>
                </li>
              </ul>
              <Separator className="my-2" />

              {/* Arrears Section */}
              <div className="font-semibold text-gray-800">Arrears</div>
              <ul className="grid gap-3">
                <li className="flex items-center justify-between font-semibold">
                  <span className="text-muted-foreground">
                    {getLastMonthFromDate(viewedInvoice.created_at)}
                  </span>
                  <span>{formatToKES(viewedInvoice.arrears)}</span>
                </li>
              </ul>
              <Separator className="my-2" />

              {/* Total Section */}
              <ul>
                <li className="flex items-center justify-between font-semibold text-lg text-gray-800">
                  <span className="text-muted-foreground">Total</span>
                  <span>{formatToKES(viewedInvoice.total_amount)}</span>
                </li>
              </ul>

              <Separator className="my-4" />

              {/* Property Information Section */}
              <div className="grid gap-3">
                <div className="font-semibold text-gray-800">
                  Property Information
                </div>
                <ul className="grid gap-3">
                  <li className="flex items-center justify-between">
                    <span className="text-muted-foreground">Location</span>
                    <span>{property.location}</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="text-muted-foreground">Block</span>
                    <span>{property.block}</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="text-muted-foreground">House</span>
                    <span>{property.house}</span>
                  </li>
                </ul>
              </div>

              <Separator className="my-4" />

              {/* Payment Information Section */}
              <div className="grid gap-3">
                <div className="font-semibold text-gray-800">
                  Payment Information
                </div>
                <dl className="grid gap-3">
                  <div className="flex items-center justify-between">
                    <dt className="flex items-center gap-1 text-muted-foreground">
                      <CreditCard className="h-4 w-4" />
                      M-Pesa
                    </dt>
                    <dd>07 *** *** 532</dd>
                  </div>
                </dl>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-row items-center border-t bg-muted/30 px-6 py-3">
            <div className="text-xs text-muted-foreground">
              Updated{" "}
              <time dateTime="2023-11-23">
                {formatExactTimestamp(viewedInvoice.created_at)}
              </time>
            </div>
          </CardFooter>
        </Card>
      </div>
    </>
  );
};

export default Overviews;
