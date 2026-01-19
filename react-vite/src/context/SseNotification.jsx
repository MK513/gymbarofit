import { useEffect, useRef, useState } from "react";
import { API_BASE_URL } from "../api-config";

export function useSseNotifications(userId) {
  const esRef = useRef(null);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!userId) return;

    const url = `${API_BASE_URL}/sse/subscribe?userId=${userId}`;
    const es = new EventSource(url);
    esRef.current = es;

    es.addEventListener("connected", (e) => {
      console.log("SSE connected:", e.data);
    });

    es.addEventListener("notification", (e) => {
      const data = JSON.parse(e.data);
      setNotifications((prev) => [data, ...prev]);

      // 예: 즉시 토스트/모달 띄우기 트리거 가능
      console.log("NOTI:", data);
    });

    es.onerror = (err) => {
      console.warn("SSE error", err);
      // 브라우저가 자동 재연결 시도하긴 하는데,
      // 서버/네트워크 이슈에 따라 UI 안내를 띄워도 좋음.
    };

    return () => {
      es.close();
    };
  }, [userId]);

  return { notifications, setNotifications }; 
}
