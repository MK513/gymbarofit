import { useEffect, useRef, useState } from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import MapIcon from "@mui/icons-material/Map";

const KAKAO_APP_KEY = import.meta.env.VITE_KAKAO_MAP_KEY;

/**
 * 카카오맵 컴포넌트
 * - address: 표시할 주소 문자열 (Geocoder로 좌표 변환)
 * - name: 마커 InfoWindow에 표시할 이름
 *
 * 환경 변수: VITE_KAKAO_MAP_KEY (카카오 JavaScript 앱 키)
 */
export default function KakaoMap({ address, name }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const infoRef = useRef(null);
  const [ready, setReady] = useState(false);

  // ── 스크립트 로드 ─────────────────────────────────────────
  useEffect(() => {
    if (!KAKAO_APP_KEY) return;

    // 이미 로드 완료
    if (window.kakao?.maps) {
      setReady(true);
      return;
    }

    // 스크립트 태그 중복 방지
    const existing = document.querySelector("script[data-kakao-map]");
    if (existing) {
      const timer = setInterval(() => {
        if (window.kakao?.maps) {
          setReady(true);
          clearInterval(timer);
        }
      }, 100);
      return () => clearInterval(timer);
    }

    const script = document.createElement("script");
    script.dataset.kakaoMap = "true";
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_APP_KEY}&autoload=false&libraries=services`;
    script.onload = () => window.kakao.maps.load(() => setReady(true));
    document.head.appendChild(script);
  }, []);

  // ── 지도 초기화 ───────────────────────────────────────────
  useEffect(() => {
    if (!ready || !containerRef.current || mapRef.current) return;

    mapRef.current = new window.kakao.maps.Map(containerRef.current, {
      center: new window.kakao.maps.LatLng(37.5665, 126.978),
      level: 5,
    });
  }, [ready]);

  // ── 주소 → 좌표 변환 및 마커 업데이트 ─────────────────────
  useEffect(() => {
    if (!ready || !mapRef.current) return;

    // 주소 없으면 마커/InfoWindow 제거 후 서울 기본 뷰로 복귀
    if (!address) {
      if (markerRef.current) {
        markerRef.current.setMap(null);
        markerRef.current = null;
      }
      if (infoRef.current) {
        infoRef.current.close();
        infoRef.current = null;
      }
      mapRef.current.setCenter(new window.kakao.maps.LatLng(37.5665, 126.978));
      mapRef.current.setLevel(5);
      return;
    }

    const geocoder = new window.kakao.maps.services.Geocoder();
    geocoder.addressSearch(address, (results, status) => {
      if (status !== window.kakao.maps.services.Status.OK) return;

      const { x: lng, y: lat } = results[0];
      const position = new window.kakao.maps.LatLng(lat, lng);

      mapRef.current.panTo(position);
      mapRef.current.setLevel(3);

      // 기존 마커/InfoWindow 제거
      if (markerRef.current) markerRef.current.setMap(null);
      if (infoRef.current) infoRef.current.close();

      // 새 마커
      markerRef.current = new window.kakao.maps.Marker({ position });
      markerRef.current.setMap(mapRef.current);

      // InfoWindow
      if (name) {
        infoRef.current = new window.kakao.maps.InfoWindow({
          content: `<div style="padding:6px 10px;font-size:12px;font-weight:700;white-space:nowrap">${name}</div>`,
        });
        infoRef.current.open(mapRef.current, markerRef.current);
      }
    });
  }, [ready, address, name]);

  // ── 렌더 ─────────────────────────────────────────────────
  if (!KAKAO_APP_KEY) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100%" color="text.secondary">
        <MapIcon sx={{ fontSize: 36, mb: 1, opacity: 0.4 }} />
        <Typography variant="caption" textAlign="center">
          .env 파일에 VITE_KAKAO_MAP_KEY를 설정해주세요
        </Typography>
      </Box>
    );
  }

  if (!ready) {
    return (
      <Box display="flex" alignItems="center" justifyContent="center" height="100%">
        <CircularProgress size={24} />
      </Box>
    );
  }

  return <Box ref={containerRef} sx={{ width: "100%", height: "100%" }} />;
}
