import { useEffect, useRef, useState } from "react";
import { API_BASE_URL } from "../api-config";

export function useSseNotifications(userId) {
  const esRef = useRef(null);
  const [notifications, setNotifications] = useState([]);
  // 1. 장비 업데이트 상태 추가
  const [equipmentUpdate, setEquipmentUpdate] = useState(null);

  useEffect(() => {
    if (!userId) return;

    const url = `${API_BASE_URL}/sse/subscribe?userId=${userId}`;
    const es = new EventSource(url);
    esRef.current = es;

    es.onopen = () => {
      console.log("SSE connection opened");
    };

    es.addEventListener("connected", (e) => {
      console.log("SSE connected:", e.data);
    });

    // 2. 장비 업데이트 이벤트 수신 처리
    es.addEventListener("equipment-update", (e) => {
      try {
        const data = JSON.parse(e.data);
        console.log("update equipment:", data);
        setEquipmentUpdate(data); // 상태 업데이트
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

    es.onerror = (err) => {
      console.warn("SSE error", err);
    };

    return () => {
      es.close();
    };
  }, [userId]);

  // 3. equipmentUpdate를 반환 객체에 추가
  return { notifications, setNotifications, equipmentUpdate }; 
}