import React, { useContext, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import axios from "axios";
import AuthContext from "../context/AuthContext";
import ReactTimeAgo from "react-time-ago";
import moment from "moment";

const TenantNotifications = () => {
  // Notifications state with sender and avatar
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "Rent Payment Reminder",
      message:
        "Your monthly rent is due on the 1st of September. Please ensure payment to avoid late fees.",
      date: "2024-09-01",
      status: "Unread",
      type: "Reminder",
      sender: "Property Management",
      avatar:
        "https://images.pexels.com/photos/1933873/pexels-photo-1933873.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    },
    {
      id: 2,
      title: "Maintenance Request Update",
      message:
        "Your maintenance request for plumbing has been approved and scheduled for 5th September.",
      date: "2024-08-28",
      status: "Read",
      type: "Info",
      sender: "Maintenance Team",
      avatar:
        "https://images.pexels.com/photos/1933873/pexels-photo-1933873.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    },
    {
      id: 3,
      title: "Late Rent Payment Warning",
      message:
        "Your rent payment is overdue by 7 days. Please pay immediately to avoid legal action.",
      date: "2024-08-15",
      status: "Unread",
      type: "Warning",
      sender: "Finance Department",
      avatar:
        "https://images.pexels.com/photos/1933873/pexels-photo-1933873.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    },
  ]);

  // State to handle the active tab
  const [activeTab, setActiveTab] = useState("All");

  // Function to filter notifications based on the selected tab
  const filterNotifications = () => {
    const today = new Date();
    const startOfWeek = new Date(
      today.setDate(today.getDate() - today.getDay())
    );
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    return notifications.filter((notification) => {
      const notificationDate = new Date(notification.date);

      switch (activeTab) {
        case "This Week":
          return notificationDate >= startOfWeek;
        case "This Month":
          return notificationDate >= startOfMonth;
        default:
          return true; // "All" notifications
      }
    });
  };

  // Handle notification click (set status to 'Read')
  const handleNotificationClick = (id) => {
    setNotifications((prevNotifications) =>
      prevNotifications.map((notification) =>
        notification.id === id
          ? { ...notification, status: "Read" }
          : notification
      )
    );
  };

  const [notices, setNotices] = useState([]);

  let { authTokens } = useContext(AuthContext);

  let axiosConfig = {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: "Bearer " + String(authTokens.access),
    },
  };

  const fetchNotifications = async () => {
    await axios
      .get(`http://127.0.0.1:8000/api/notifications/`, axiosConfig)
      .then((response) => {
        setNotices(response.data.results);
        console.log(response.data.results);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const readNotification = async (notification) => {
    await axios
      .patch(
        `/api/notifications/${notification}/`,
        axiosConfig
      )
      .then((response) => {
        console.log(response);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const formatTimestamp = (timestamp) => moment(timestamp).fromNow();

  return (
    <main
      className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 align-center justify-center"
      style={{ minWidth: "98.5vw", width: "100%", padding: "1rem" }}
    >
      <Card
        className="shadow-xl rounded-xl overflow-hidden"
        style={{ maxWidth: "40rem", margin: "auto" }}
      >
        <CardHeader>
          <CardTitle className="text-3xl font-bold p-4">
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="mb-4 flex  border-gray-200 gap-4">
            {["All", "This Week", "This Month"].map((tab) => (
              <button
                key={tab}
                className={`px-4 py-2 font-semibold text-sm ${
                  activeTab === tab
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600"
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
          {notices.length > 0 ? (
            notices.map((notification) => (
              <div
                key={notification.id}
                className={`flex items-start p-4 mb-4 rounded-lg cursor-pointer transition-transform transform hover:scale-105 ${
                  notification.status === "Unread" &&
                  "bg-blue-50 border border-blue-200"
                } shadow-md`}
                onClick={() => readNotification(notification.id)}
              >
                <div className="relative flex-shrink-0">
                  <img
                    src={notification.sender.profile_picture}
                    alt={`${notification.sender}'s avatar`}
                    className="w-14 h-14 rounded-full border-2 border-gray-300 shadow-lg object-cover"
                  />
                </div>
                <div className="ml-4 flex-1">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center space-x-2">
                      <h3
                        className={`text-xl font-semibold ${
                          notification.read === false
                            ? "text-blue-800"
                            : "text-gray-800"
                        }`}
                      >
                        {notification.title}
                      </h3>
                      <Badge
                        className={`${
                          notification.status === false
                            ? "text-white bg-blue-600"
                            : "text-gray-600 bg-gray-200"
                        }`}
                      >
                        {notification.read ? "read" : "Unread"}
                      </Badge>
                    </div>
                    <span className="text-sm font-semibold text-gray-600">
                      {notification.sender.first_name}{" "}
                      {notification.sender.last_name}
                    </span>
                  </div>
                  <p className="text-gray-700 mb-2">{notification.message}</p>
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <Badge
                      variant="outline"
                      className={`${
                        notification.notification_type === "Warning"
                          ? "text-red-600 border-red-600"
                          : notification.notification_type === "Reminder"
                          ? "text-yellow-600 border-yellow-600"
                          : "text-green-600 border-green-600"
                      }`}
                    >
                      {notification.notification_type}
                    </Badge>
                    <span>{formatTimestamp(notification.date)}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-600">
              You have no notifications at this time.
            </p>
          )}
        </CardContent>
      </Card>
    </main>
  );
};

export default TenantNotifications;
