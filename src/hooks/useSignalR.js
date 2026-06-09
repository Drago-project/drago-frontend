import { useState, useEffect, useRef } from "react";
import * as signalR from "@microsoft/signalr";

export function useSignalR({ doctorId, studentId, onMessage }) {
  const [connection, setConnection] = useState(null);
  const [status, setStatus] = useState("disconnected");
  const latestOnMessage = useRef(onMessage);

  // تحديث الدالة دايماً عشان تقرأ أحدث State
  useEffect(() => {
    latestOnMessage.current = onMessage;
  }, [onMessage]);

  // 1. فتح الاتصال (بيحصل مرة واحدة بس في البداية)
  useEffect(() => {
    if (!doctorId && !studentId) return;

    const backendUrl = import.meta.env.VITE_API_URL || "";
    const token = localStorage.getItem("authToken");

    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${backendUrl}/chatHub`, {
        accessTokenFactory: () => token,
      })
      .withAutomaticReconnect()
      .build();

    setConnection(newConnection);

    return () => {
      newConnection.stop();
    };
  }, []); // 👈 قوسين فاضيين عشان ميفصلش ويعيد الاتصال كل ما الطالب يتغير

  // 2. تشغيل الاتصال والاستماع
  useEffect(() => {
    if (!connection) return;

    const startConnection = async () => {
      try {
        if (connection.state === signalR.HubConnectionState.Disconnected) {
          setStatus("connecting");
          await connection.start();
          setStatus("connected");
        }

        connection.on("ReceiveMessage", (message) => {
          if (latestOnMessage.current) latestOnMessage.current(message);
        });

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

    return () => {
      connection.off("ReceiveMessage");
      connection.off("ReceiveNotification");
    };
  }, [connection]);

  // 3. الدخول للغرفة الصحيحة كل ما الدكتور يختار طالب مختلف
  useEffect(() => {
    if (connection && status === "connected" && doctorId && studentId) {
      const roomName = `chat-${doctorId}-${studentId}`;
      connection
        .invoke("JoinRoom", roomName)
        .catch((err) => console.error("JoinRoom Error:", err));
    }
  }, [connection, status, doctorId, studentId]);

  return { status, connection };
}
