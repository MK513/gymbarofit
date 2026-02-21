import { useEffect, useRef, useState } from "react";
import { API_BASE_URL } from "../api-config";

export function useSseNotifications(userId) {
  const [notifications, setNotifications] = useState([]);
  const [equipmentUpdate, setEquipmentUpdate] = useState(null);

  const retryDelayRef = useRef(3000);
  const retryTimerRef = useRef(null);
  const esRef = useRef(null);

  useEffect(() => {
    if (!userId) return;

    function connect() {
      const url = `${API_BASE_URL}/sse/subscribe?userId=${userId}`;
      const es = new EventSource(url);
      esRef.current = es;

      es.onopen = () => {
        retryDelayRef.current = 3000; // 연결 성공 시 대기 시간 초기화
        console.log("SSE connection opened");
      };

      es.addEventListener("connected", (e) => {
        console.log("SSE connected:", e.data);
      });

      es.addEventListener("equipment-update", (e) => {
        try {
          const data = JSON.parse(e.data);
          console.log("update equipment:", data);
          setEquipmentUpdate(data);
        } catch (err) {
          console.error("Failed to parse equipment data:", err);
        }
      });

      es.addEventListener("notification", (e) => {
        try {
          const data = JSON.parse(e.data);
          setNotifications((prev) => [data, ...prev]);
          console.log("NOTI:", data);
        } catch (err) {
          console.error("Failed to parse notification data:", err);
        }
      });

      es.onerror = () => {
        console.warn("SSE error — reconnecting in", retryDelayRef.current, "ms");
        es.close();
        retryTimerRef.current = setTimeout(() => {
          retryDelayRef.current = Math.min(retryDelayRef.current * 2, 30000);
          connect();
        }, retryDelayRef.current);
      };
    }

    connect();

    return () => {
      clearTimeout(retryTimerRef.current);
      esRef.current?.close();
    };
  }, [userId]);

  return { notifications, setNotifications, equipmentUpdate };
}
