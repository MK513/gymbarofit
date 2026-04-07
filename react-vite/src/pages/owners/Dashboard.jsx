import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import AddIcon from "@mui/icons-material/Add";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import BarChartIcon from "@mui/icons-material/BarChart";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import LockIcon from "@mui/icons-material/Lock";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import StorefrontIcon from "@mui/icons-material/Storefront";

import { getOwnerGym, getOwnerGymStats } from "../../api/owner";

/* ── 혼잡도 메타 ── */
const crowdMeta = {
  VERY_COMFORTABLE: { label: "여유",      color: "#2e7d32", bg: "#e8f5e9" },
  COMFORTABLE:      { label: "쾌적",      color: "#388e3c", bg: "#f1f8e9" },
  NORMAL:           { label: "보통",      color: "#f57c00", bg: "#fff3e0" },
  CROWDED:          { label: "혼잡",      color: "#d32f2f", bg: "#ffebee" },
  VERY_CROWDED:     { label: "매우 혼잡", color: "#b71c1c", bg: "#ffcdd2" },
};

/* ── 숫자 포맷 ── */
const pct = (a, b) => (b > 0 ? Math.round((a / b) * 100) : 0);

/* ── 시설 현황 카드 ── */
function StatCard({ icon, label, value, sub, color }) {
  return (
    <Paper elevation={0}
      sx={{ border: "1px solid #eef2f6", borderRadius: 2.5, p: 2, flex: 1, minWidth: 0 }}>
      <Box display="flex" alignItems="center" gap={1} mb={1}>
        <Box sx={{
          width: 36, height: 36, borderRadius: 2,
          bgcolor: color + "1a", display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {icon}
        </Box>
        <Typography variant="caption" color="text.secondary" fontWeight="bold">{label}</Typography>
      </Box>
      <Typography variant="h6" fontWeight="bold" lineHeight={1}>{value}</Typography>
      <Typography variant="caption" color="text.disabled" mt={0.5} display="block">{sub}</Typography>
    </Paper>
  );
}

/* ── 시간대별 방문 바 차트 ── */
function VisitBarChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <Typography variant="caption" color="text.disabled" textAlign="center" display="block" py={2}>
        방문 데이터가 없습니다.
      </Typography>
    );
  }
  const max = Math.max(...data.map((d) => d.count));
  const chartH = 90;

  return (
    <Box>
      <Box display="flex" alignItems="flex-end" gap={0.5} sx={{ height: chartH }}>
        {data.map((d) => {
          const barH = Math.max(4, Math.round((d.count / max) * chartH));
          const isPeak = d.count === max;
          return (
            <Box key={d.hour} flex={1} display="flex" flexDirection="column" alignItems="center" justifyContent="flex-end" gap={0.3}>
              <Typography sx={{ fontSize: "0.58rem", fontWeight: "bold", color: isPeak ? "primary.main" : "text.disabled" }}>
                {d.count}
              </Typography>
              <Box sx={{
                width: "100%",
                height: barH,
                bgcolor: isPeak ? "primary.main" : "#1976d228",
                borderRadius: "3px 3px 0 0",
              }} />
            </Box>
          );
        })}
      </Box>
      <Box display="flex" gap={0.5} mt={0.5}>
        {data.map((d) => (
          <Box key={d.hour} flex={1} textAlign="center">
            <Typography sx={{ fontSize: "0.55rem", color: "text.secondary" }}>{d.hour}시</Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

/* ── 기구 타입별 사용량 차트 ── */
const EQUIPMENT_TYPE_COLORS = {
  "러닝머신":     "#e53935",
  "사이클":       "#e53935",
  "랫풀다운":     "#00897b",
  "레그프레스":   "#00897b",
  "스미스머신":   "#00897b",
  "케이블 머신":  "#00897b",
  "벤치프레스":   "#1976d2",
  "바벨 스쿼트랙":"#1976d2",
};

function EquipmentUsageChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <Typography variant="caption" color="text.disabled" textAlign="center" display="block" py={2}>
        기구 데이터가 없습니다.
      </Typography>
    );
  }

  return (
    <Stack spacing={1.2}>
      {data.map((d) => {
        const usagePct = pct(d.inUseCount, d.totalCount);
        const barColor = EQUIPMENT_TYPE_COLORS[d.name] ?? "#757575";
        return (
          <Box key={d.name}>
            <Box display="flex" justifyContent="space-between" mb={0.4}>
              <Typography variant="caption" fontWeight="bold" color="text.secondary">
                {d.name}
              </Typography>
              <Typography variant="caption" fontWeight="bold"
                sx={{ color: d.inUseCount > 0 ? barColor : "text.disabled" }}>
                {d.inUseCount} / {d.totalCount}대
              </Typography>
            </Box>
            <Box sx={{ position: "relative", height: 8, borderRadius: 4, bgcolor: barColor + "20" }}>
              <Box sx={{
                position: "absolute", left: 0, top: 0,
                height: "100%",
                width: `${usagePct}%`,
                bgcolor: barColor,
                borderRadius: 4,
                transition: "width 0.4s ease",
              }} />
            </Box>
            <Typography variant="caption" color="text.disabled" sx={{ fontSize: "0.6rem" }}>
              {usagePct}% 사용 중
            </Typography>
          </Box>
        );
      })}
    </Stack>
  );
}

/* ── 락커 구역별 사용량 파이 차트 ── */
function ZonePieChart({ zone }) {
  const usagePct = pct(zone.rentedCount, zone.totalCount);
  const isFull = usagePct >= 90;
  const darkColor = isFull ? "#c62828" : "#7b1fa2";
  const lightColor = isFull ? "#ffcdd2" : "#e1bee7";
  const available = zone.totalCount - zone.rentedCount;

  const pieData = [
    { name: "사용중", value: zone.rentedCount },
    { name: "미사용", value: available },
  ];

  return (
    <Box display="flex" flexDirection="column" alignItems="center" minWidth={100}>
      <Box position="relative" width={90} height={90}>
        <PieChart width={90} height={90}>
          <Pie
            data={pieData}
            cx={40}
            cy={40}
            innerRadius={28}
            outerRadius={42}
            dataKey="value"
            startAngle={90}
            endAngle={-270}
            strokeWidth={0}
          >
            <Cell fill={darkColor} />
            <Cell fill={lightColor} />
          </Pie>
          <Tooltip formatter={(value, name) => [`${value}개`, name]} />
        </PieChart>
        {/* 도넛 중앙 텍스트 */}
        <Box position="absolute" top="50%" left="50%"
          sx={{ transform: "translate(-50%, -50%)", textAlign: "center", pointerEvents: "none" }}>
          <Typography sx={{ fontSize: "0.75rem", fontWeight: "bold", lineHeight: 1, color: darkColor }}>
            {usagePct}%
          </Typography>
        </Box>
      </Box>
      <Typography variant="caption" fontWeight="bold" color="text.secondary" textAlign="center" mt={0.5}>
        {zone.zoneName}
      </Typography>
      <Typography variant="caption" color="text.disabled" sx={{ fontSize: "0.6rem" }}>
        {zone.rentedCount} / {zone.totalCount}개
      </Typography>
      {isFull && (
        <Chip label="거의 만석" size="small"
          sx={{ mt: 0.5, height: 16, fontSize: "0.55rem", bgcolor: "#ffebee", color: "#d32f2f", fontWeight: "bold" }} />
      )}
    </Box>
  );
}

function LockerZoneChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <Typography variant="caption" color="text.disabled" textAlign="center" display="block" py={2}>
        락커 구역 데이터가 없습니다.
      </Typography>
    );
  }

  return (
    <Box>
      <Box display="flex" flexWrap="wrap" gap={2} justifyContent="center">
        {data.map((zone) => (
          <ZonePieChart key={zone.zoneName} zone={zone} />
        ))}
      </Box>
      <Box display="flex" alignItems="center" gap={2} justifyContent="center" mt={1.5}>
        <Box display="flex" alignItems="center" gap={0.5}>
          <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: "#7b1fa2" }} />
          <Typography variant="caption" color="text.secondary">사용중</Typography>
        </Box>
        <Box display="flex" alignItems="center" gap={0.5}>
          <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: "#e1bee7" }} />
          <Typography variant="caption" color="text.secondary">미사용</Typography>
        </Box>
      </Box>
    </Box>
  );
}

/* ── 이번달 기구 종목별 사용 시간 막대 그래프 ── */
const fmtMinutes = (min) => {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h > 0 ? `${h}시간 ${m}분` : `${m}분`;
};

function MonthlyEquipmentUsageChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <Typography variant="caption" color="text.disabled" textAlign="center" display="block" py={2}>
        이번 달 기구 사용 기록이 없습니다.
      </Typography>
    );
  }

  const CustomLabel = ({ x, y, width, value }) => {
    if (!value) return null;
    return (
      <text x={x + width / 2} y={y - 4} textAnchor="middle" fill="#00897b" fontSize={10} fontWeight="bold">
        {fmtMinutes(value)}
      </text>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 20, right: 8, left: -10, bottom: 40 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 11, fill: "#757575" }}
          angle={-30}
          textAnchor="end"
          interval={0}
        />
        <YAxis
          tickFormatter={(v) => `${Math.floor(v / 60)}h`}
          tick={{ fontSize: 10, fill: "#9e9e9e" }}
          allowDecimals={false}
        />
        <Tooltip formatter={(value) => [fmtMinutes(value), "사용 시간"]} />
        <Bar dataKey="totalMinutes" fill="#00897b" radius={[4, 4, 0, 0]} label={<CustomLabel />} />
      </BarChart>
    </ResponsiveContainer>
  );
}

/* ── 메인 대시보드 ── */
export default function OwnerDashboard() {
  const { gyms, selectedGymId, gymsLoading, handleGymRegister } = useOutletContext();

  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [liveGym, setLiveGym] = useState(null);

  const selectedGym = gyms.find((g) => g.id === selectedGymId) ?? null;
  const displayGym = liveGym ?? selectedGym;
  const crowd = crowdMeta[displayGym?.crowdLevel] ?? crowdMeta.NORMAL;

  const todayDay = ["MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY","SATURDAY","SUNDAY"][(new Date().getDay() + 6) % 7];
  const todayHour = (selectedGym?.operatingHours ?? []).find((h) => h.dayOfWeek === todayDay);

  /* gym 선택 시 stats + 실시간 인원 로드 */
  useEffect(() => {
    if (!selectedGymId) return;
    setLiveGym(null);
    setStatsLoading(true);
    getOwnerGym({ gymId: selectedGymId }).then(setLiveGym).catch(() => {});
    getOwnerGymStats({ gymId: selectedGymId })
      .then(setStats)
      .catch(() => setStats(null))
      .finally(() => setStatsLoading(false));
  }, [selectedGymId]);

  if (gymsLoading) {
    return (
      <Box display="flex" justifyContent="center" mt={10}>
        <CircularProgress />
      </Box>
    );
  }

  if (gyms.length === 0) {
    return (
      <Box
        display="flex" flexDirection="column" alignItems="center" justifyContent="center"
        sx={{ height: "calc(100vh - 64px)", color: "text.disabled" }}
      >
        <StorefrontIcon sx={{ fontSize: 56, opacity: 0.2, mb: 2 }} />
        <Typography variant="body1" fontWeight="bold" color="text.secondary" mb={0.5}>
          등록된 헬스장이 없습니다
        </Typography>
        <Typography variant="body2" color="text.disabled" mb={3}>
          상단 버튼으로 헬스장을 등록해보세요.
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleGymRegister}
          sx={{ borderRadius: 2, fontWeight: "bold" }}>
          헬스장 등록
        </Button>
      </Box>
    );
  }

  if (!selectedGym) return null;

  return (
    <Box sx={{ p: 3, maxWidth: 860, mx: "auto" }}>

      {/* ── 헬스장 헤더 ── */}
      <Box display="flex" alignItems="flex-start" mb={3}>
        <Box>
          <Box display="flex" alignItems="center" gap={1} mb={0.5}>
            <Typography variant="h6" fontWeight="bold">{selectedGym.name}</Typography>
            <Chip label={crowd.label} size="small"
              sx={{ bgcolor: crowd.bg, color: crowd.color, fontWeight: "bold", fontSize: "0.7rem", height: 22 }} />
          </Box>
          <Typography variant="body2" color="text.secondary">{selectedGym.address}</Typography>
          {todayHour && (
            <Typography variant="caption" color="text.disabled" mt={0.3} display="block">
              {todayHour.closed
                ? "오늘 휴무"
                : todayHour.openAt
                  ? `오늘 ${todayHour.openAt} ~ ${todayHour.closeAt}`
                  : "운영시간 미등록"}
            </Typography>
          )}
        </Box>
      </Box>

      {/* ── 시설 현황 ── */}
      <Typography variant="subtitle2" fontWeight="bold" color="text.secondary" mb={1.5}>
        시설 현황
      </Typography>
      <Box display="flex" gap={2} mb={3} flexWrap="wrap">
        <StatCard
          icon={<PeopleOutlinedIcon sx={{ fontSize: 20, color: "#1565c0" }} />}
          label="현재 인원"
          value={`${displayGym?.currentOccupancy ?? 0} / ${displayGym?.maxCapacity ?? 0}`}
          sub={`정원의 ${pct(displayGym?.currentOccupancy ?? 0, displayGym?.maxCapacity ?? 0)}% 사용 중`}
          color="#1565c0"
        />
        <StatCard
          icon={<FitnessCenterIcon sx={{ fontSize: 20, color: "#f57c00" }} />}
          label="기구 사용"
          value={`${displayGym?.activeEquipments ?? 0} / ${displayGym?.totalEquipments ?? 0}`}
          sub={`${pct(displayGym?.activeEquipments ?? 0, displayGym?.totalEquipments ?? 0)}% 사용 중`}
          color="#f57c00"
        />
        <StatCard
          icon={<LockIcon sx={{ fontSize: 20, color: "#8e24aa" }} />}
          label="보관함 임대"
          value={`${displayGym?.rentedLockers ?? 0} / ${displayGym?.totalLockers ?? 0}`}
          sub={`${pct(displayGym?.rentedLockers ?? 0, displayGym?.totalLockers ?? 0)}% 임대 중`}
          color="#8e24aa"
        />
      </Box>

      {/* ── 현황 분석 ── */}
      <Typography variant="subtitle2" fontWeight="bold" color="text.secondary" mb={1.5}>
        현황 분석
      </Typography>
      <Box display="flex" gap={2} flexWrap="wrap">

        {/* 좌상단: 시간대별 방문 트렌드 */}
        <Paper elevation={0} sx={{ border: "1px solid #eef2f6", borderRadius: 2.5, p: 2.5, flex: "1 1 calc(50% - 8px)", minWidth: 220 }}>
          <Box display="flex" alignItems="center" gap={0.8} mb={1}>
            <AccessTimeIcon sx={{ fontSize: 18, color: "#1976d2" }} />
            <Typography variant="subtitle2" fontWeight="bold">시간대별 방문 트렌드</Typography>
          </Box>
          {statsLoading ? (
            <Box display="flex" justifyContent="center" py={2}><CircularProgress size={20} /></Box>
          ) : (
            <VisitBarChart data={stats?.visitByHour ?? []} />
          )}
        </Paper>

        {/* 우상단: 락커 구역별 사용량 */}
        <Paper elevation={0} sx={{ border: "1px solid #eef2f6", borderRadius: 2.5, p: 2.5, flex: "1 1 calc(50% - 8px)", minWidth: 220 }}>
          <Box display="flex" alignItems="center" gap={0.8} mb={1.5}>
            <LockIcon sx={{ fontSize: 18, color: "#8e24aa" }} />
            <Typography variant="subtitle2" fontWeight="bold">락커 구역별 사용량</Typography>
          </Box>
          {statsLoading ? (
            <Box display="flex" justifyContent="center" py={2}><CircularProgress size={20} /></Box>
          ) : (
            <LockerZoneChart data={stats?.lockerZoneUsage ?? []} />
          )}
        </Paper>

        {/* 좌하단: 기구별 현재 사용량 */}
        <Paper elevation={0} sx={{ border: "1px solid #eef2f6", borderRadius: 2.5, p: 2.5, flex: "1 1 calc(50% - 8px)", minWidth: 220 }}>
          <Box display="flex" alignItems="center" gap={0.8} mb={1.5}>
            <FitnessCenterIcon sx={{ fontSize: 18, color: "#f57c00" }} />
            <Typography variant="subtitle2" fontWeight="bold">기구별 현재 사용량</Typography>
          </Box>
          {statsLoading ? (
            <Box display="flex" justifyContent="center" py={2}><CircularProgress size={20} /></Box>
          ) : (
            <EquipmentUsageChart data={stats?.equipmentUsage ?? []} />
          )}
        </Paper>

        {/* 우하단: 이번달 기구 종목별 사용 시간 */}
        <Paper elevation={0} sx={{ border: "1px solid #eef2f6", borderRadius: 2.5, p: 2.5, flex: "1 1 calc(50% - 8px)", minWidth: 220 }}>
          <Box display="flex" alignItems="center" gap={0.8} mb={1.5}>
            <BarChartIcon sx={{ fontSize: 18, color: "#00897b" }} />
            <Typography variant="subtitle2" fontWeight="bold">이번달 기구 종목별 사용 시간</Typography>
          </Box>
          {statsLoading ? (
            <Box display="flex" justifyContent="center" py={2}><CircularProgress size={20} /></Box>
          ) : (
            <MonthlyEquipmentUsageChart data={stats?.monthlyEquipmentUsage ?? []} />
          )}
        </Paper>

      </Box>

    </Box>
  );
}
