export const STEPS = ["기본 정보", "운동 기구", "맵 배치", "락커"];

export const DAY_LABELS = {
  MONDAY:    "월요일",
  TUESDAY:   "화요일",
  WEDNESDAY: "수요일",
  THURSDAY:  "목요일",
  FRIDAY:    "금요일",
  SATURDAY:  "토요일",
  SUNDAY:    "일요일",
};

export const DEFAULT_OPERATING_HOURS = [
  { day: "MONDAY",    openAt: "06:00", closeAt: "22:00", closed: false },
  { day: "TUESDAY",   openAt: "06:00", closeAt: "22:00", closed: false },
  { day: "WEDNESDAY", openAt: "06:00", closeAt: "22:00", closed: false },
  { day: "THURSDAY",  openAt: "06:00", closeAt: "22:00", closed: false },
  { day: "FRIDAY",    openAt: "06:00", closeAt: "22:00", closed: false },
  { day: "SATURDAY",  openAt: "08:00", closeAt: "20:00", closed: false },
  { day: "SUNDAY",    openAt: "08:00", closeAt: "20:00", closed: true  },
];

export const EQUIP_TYPES = [
  { value: "CARDIO",      label: "유산소",     color: "#e91e63" },
  { value: "FREE_WEIGHT", label: "프리웨이트", color: "#f57c00" },
  { value: "MACHINE",     label: "머신",       color: "#1565c0" },
  { value: "STRETCHING",  label: "스트레칭",   color: "#2e7d32" },
];


export const LOCKER_SIZES = [
  { value: "SMALL",  label: "소형", color: "#1565c0", desc: "기본 사이즈 보관함" },
  { value: "MEDIUM", label: "중형", color: "#7b1fa2", desc: "중간 사이즈 보관함" },
  { value: "LARGE",  label: "대형", color: "#e65100", desc: "대형 사이즈 보관함" },
];

export function loadDaumPostcodeScript() {
  return new Promise((resolve) => {
    if (window.daum && window.daum.Postcode) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = "//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
    script.onload = resolve;
    document.head.appendChild(script);
  });
}
