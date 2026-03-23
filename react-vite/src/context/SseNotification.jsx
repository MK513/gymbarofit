import { useEffect, useRef, useState } from "react";
import { API_BASE_URL } from "../api-config";

const MAX_RETRIES = 10;

export function useSseNotifications(userId) {
  const [notifications, setNotifications] = useState([]);
  const [equipmentUpdate, setEquipmentUpdate] = useState(null);
  const [connectionFailed, setConnectionFailed] = useState(false);

  const retryDelayRef = useRef(3000);
  const retryCountRef = useRef(0);
  const retryTimerRef = useRef(null);
  const esRef = useRef(null);
  const connectRef = useRef(null);

  useEffect(() => {
    if (!userId) return;

    function connect() {
      const url = `${API_BASE_URL}/sse/subscribe?userId=${userId}`;
      const es = new EventSource(url);
      esRef.current = es;

      es.onopen = () => {
        retryDelayRef.current = 3000;
        retryCountRef.current = 0;
        setConnectionFailed(false);
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
        es.close();
        retryCountRef.current += 1;

        if (retryCountRef.current >= MAX_RETRIES) {
          console.warn("SSE: 최대 재시도 횟수 초과, 연결 실패");
          setConnectionFailed(true);
          return;
        }

        console.warn(
          `SSE error — reconnecting in ${retryDelayRef.current}ms (${retryCountRef.current}/${MAX_RETRIES})`
        );
        retryTimerRef.current = setTimeout(() => {
          retryDelayRef.current = Math.min(retryDelayRef.current * 2, 30000);
          connect();
        }, retryDelayRef.current);
      };
    }

    connectRef.current = connect;
    connect();

    return () => {
      clearTimeout(retryTimerRef.current);
      esRef.current?.close();
    };
  }, [userId]);

  function reconnect() {
    clearTimeout(retryTimerRef.current);
    esRef.current?.close();
    retryCountRef.current = 0;
    retryDelayRef.current = 3000;
    setConnectionFailed(false);
    connectRef.current?.();
  }

  return { notifications, setNotifications, equipmentUpdate, connectionFailed, reconnect };
}
