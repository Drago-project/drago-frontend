import { useState, useEffect, useRef } from "react";
import * as signalR from "@microsoft/signalr";

export function useSignalR({ doctorId, studentId, onMessage }) {
  const [connection, setConnection] = useState(null);
  const [status, setStatus] = useState("disconnected");
  const latestOnMessage = useRef(onMessage);

  // update the ref whenever onMessage changes
  useEffect(() => {
    latestOnMessage.current = onMessage;
  }, [onMessage]);

  // 1. initialize the SignalR connection when doctorId and studentId are available
  useEffect(() => {
    if (!doctorId || !studentId) return;

    const backendUrl = import.meta.env.VITE_API_URL || "";
    const token = localStorage.getItem("authToken");

    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${backendUrl}/chatHub`, {
        accessTokenFactory: () => token, // supply the token for authentication if needed
      })
      .withAutomaticReconnect()
      .build();

    setConnection(newConnection);
  }, [doctorId, studentId]);

  // 2. start the room and set up listeners
  useEffect(() => {
    if (!connection) return;

    const startConnection = async () => {
      try {
        setStatus("connecting");
        await connection.start();
        setStatus("connected");

        // room name convention: "chat-{doctorId}-{studentId}"
        const roomName = `chat-${doctorId}-${studentId}`;

        // join room request
        await connection.invoke("JoinRoom", roomName);

        // listen to new messages
        connection.on("ReceiveMessage", (message) => {
          if (latestOnMessage.current) latestOnMessage.current(message);
        });

        // listen to notfications
        connection.on("ReceiveNotification", (notif) => {
          console.log("Notification:", notif);
          window.dispatchEvent(
            new CustomEvent("drago-notification", { detail: notif }),
          );
        });
      } catch (err) {
        console.error("SignalR Connection Error: ", err);
        setStatus("error");
      }
    };

    startConnection();

    //  cleanup on unmount or when doctorId/studentId changes
    return () => {
      if (connection) {
        // الاستماع للإشعارات
        connection.on("ReceiveNotification", (notif) => {
          console.log("Notification:", notif);
          // ده السطر السحري اللي بيبعت إشارة لكل المشروع
          window.dispatchEvent(
            new CustomEvent("drago-notification", { detail: notif }),
          );
        });
        connection.off("ReceiveMessage");
        connection.off("ReceiveNotification");
        connection.stop();
      }
    };
  }, [connection, doctorId, studentId]);

  return { status, connection };
}
