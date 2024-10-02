import React, { useContext, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import axios from "axios";
import AuthContext from "../context/AuthContext";
import moment from "moment";
import { Button } from "@/components/ui/button";

const TenantNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState("All");
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
        `http://127.0.0.1:8000/api/notifications-edit/`,
        { notification },
        axiosConfig
      )
      .then((response) => {
        fetchNotifications();
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const formatTimestamp = (timestamp) => moment(timestamp).fromNow();

  return (
    <>
      <Card className=" overflow-hidden w-full md:w-3/4 mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl font-bold p-4">Notifications</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="mb-4 flex border-gray-200 gap-4">
            {["All", "This Week", "This Month"].map((tab) => (
              <Button
              variant="outline"
                className={`px-4 py-2 font-semibold text-sm ${
                  activeTab === tab
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600"
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </Button>
            ))}
          </div>
          {notices.length > 0 ? (
            notices.map((notification) => (
              <div
                key={notification.id}
                className={`flex items-start p-4 mb-4 rounded-lg cursor-pointer transition-transform transform hover:scale-105 ${
                  notification.read === true &&
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
                          notification.read === false
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
    </>
  );
};

export default TenantNotifications;
