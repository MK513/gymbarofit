import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import {
  Box, Typography, Container, Paper, List, ListItem,
  IconButton, Stack, Chip, ButtonBase, Avatar,
  CircularProgress, Tabs, Tab
} from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";

import { getWorkoutHistory } from "../../api/member";
import { useNotification } from "../../context/NotificationContext";

// 이번 주 월~일 Date 배열 반환
function getThisWeekDays() {
  const d = new Date();
  const day = d.getDay(); // 0=일, 1=월 ...
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const monday = new Date(d);
  monday.setDate(d.getDate() + mondayOffset);
  monday.setHours(0, 0, 0, 0);
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    return date;
  });
}

const WEEK_LABELS = ['월', '화', '수', '목', '금', '토', '일'];

export default function WorkoutHistory() {
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const todayDate = new Date();
  const [view, setView] = useState("weekly"); // "monthly" | "weekly"
  const [year, setYear] = useState(todayDate.getFullYear());
  const [month, setMonth] = useState(todayDate.getMonth() + 1);
  const [selectedDate, setSelectedDate] = useState(todayDate.getDate());
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState(null);

  const fetchHistory = useCallback(async (y, m) => {
    setLoading(true);
    try {
      const res = await getWorkoutHistory({ year: y, month: m });
      setHistory(res);
    } catch (err) {
      showNotification(err?.message || "운동 기록을 불러오지 못했습니다.", "error");
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  useEffect(() => {
    fetchHistory(year, month);
  }, [year, month, fetchHistory]);

  // 주간 탭으로 전환 시 현재 월 데이터 보장
  const handleViewChange = (_, newView) => {
    setView(newView);
    if (newView === "weekly") {
      const now = new Date();
      const nowYear = now.getFullYear();
      const nowMonth = now.getMonth() + 1;
      if (year !== nowYear || month !== nowMonth) {
        setYear(nowYear);
        setMonth(nowMonth);
      }
      setSelectedDate(now.getDate());
    }
  };

  const handlePrevMonth = () => {
    if (month === 1) { setYear(y => y - 1); setMonth(12); }
    else { setMonth(m => m - 1); }
    setSelectedDate(1);
  };

  const handleNextMonth = () => {
    const now = new Date();
    if (year === now.getFullYear() && month === now.getMonth() + 1) return;
    if (month === 12) { setYear(y => y + 1); setMonth(1); }
    else { setMonth(m => m + 1); }
    setSelectedDate(1);
  };

  // dailyRecords → { day: workouts[] } 맵
  const workoutMap = history
    ? Object.fromEntries((history.dailyRecords || []).map(g => [g.day, g.workouts]))
    : {};

  // ─── 주간 계산 ───────────────────────────────────────────
  const thisWeekDays = getThisWeekDays();

  // 이번 주 중 현재 로드된 월에 속하는 날만 workoutMap에서 추출
  const weekWorkoutMap = {};
  thisWeekDays.forEach(d => {
    if (d.getFullYear() === year && d.getMonth() + 1 === month) {
      const day = d.getDate();
      if (workoutMap[day]) weekWorkoutMap[day] = workoutMap[day];
    }
  });

  const weeklyWorkouts = Object.values(weekWorkoutMap).flat();
  const weeklyMinutes = weeklyWorkouts.reduce((s, w) => s + w.minutes, 0);
  const weeklyCalories = Math.round(weeklyWorkouts.reduce((s, w) => s + w.calories, 0) * 10) / 10;
  const weeklyActiveDays = Object.keys(weekWorkoutMap).length;

  // 주간 헤더 날짜 문자열 (예: 2월 17일 ~ 2월 23일)
  const weekStart = thisWeekDays[0];
  const weekEnd = thisWeekDays[6];
  const weekRangeLabel = `${weekStart.getMonth() + 1}월 ${weekStart.getDate()}일 ~ ${weekEnd.getMonth() + 1}월 ${weekEnd.getDate()}일`;

  // ─── 월간 계산 ───────────────────────────────────────────
  const daysInMonth = new Date(year, month, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const isToday = (day) =>
    todayDate.getFullYear() === year &&
    todayDate.getMonth() + 1 === month &&
    todayDate.getDate() === day;

  return (
    <Container maxWidth="sm" sx={{ py: 4, bgcolor: '#f8f9fa', minHeight: '100vh' }}>
      {/* 헤더 */}
      <Box display="flex" alignItems="center" mb={2}>
        <IconButton sx={{ mr: 1, bgcolor: 'white' }} size="small" onClick={() => navigate(-1)}>
          <ArrowBackIcon fontSize="small" />
        </IconButton>
        <Typography variant="h6" fontWeight="900">운동 히스토리</Typography>
      </Box>

      {/* 탭 */}
      <Paper elevation={0} sx={{ borderRadius: 3, mb: 3, overflow: 'hidden', border: '1px solid #eee' }}>
        <Tabs
          value={view}
          onChange={handleViewChange}
          variant="fullWidth"
          sx={{
            '& .MuiTab-root': { fontWeight: 800, fontSize: '0.9rem' },
            '& .MuiTabs-indicator': { height: 3, borderRadius: 2 },
          }}
        >
          <Tab label="월간" value="monthly" />
          <Tab label="이번 주" value="weekly" />
        </Tabs>
      </Paper>

      {/* ─────────────── 월간 뷰 ─────────────── */}
      {view === "monthly" && (
        <>
          {/* 월간 요약 카드 */}
          <ActivityReportCard
            title={`${year}년 ${month}월 총 활동 리포트`}
            loading={loading}
            days={history?.totalDays ?? 0}
            minutes={history?.totalUsageMinutes ?? 0}
            calories={history?.totalCalories ?? 0}
          />

          {/* AI 운동 분석 */}
          <AiWorkoutSummary view="monthly" days={history?.totalDays ?? 0} minutes={history?.totalUsageMinutes ?? 0} calories={history?.totalCalories ?? 0} />

          {/* 달력 */}
          <Paper sx={{ p: 3, mb: 3, borderRadius: 4, border: '1px solid #eee' }} elevation={0}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="subtitle1" fontWeight="800">{year}년 {month}월</Typography>
              <Stack direction="row" spacing={1}>
                <IconButton size="small" sx={{ border: '1px solid #eee' }} onClick={handlePrevMonth}>
                  <ChevronLeftIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" sx={{ border: '1px solid #eee' }} onClick={handleNextMonth}>
                  <ChevronRightIcon fontSize="small" />
                </IconButton>
              </Stack>
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1, textAlign: 'center' }}>
              {['일', '월', '화', '수', '목', '금', '토'].map((d, i) => (
                <Typography
                  key={d}
                  variant="caption"
                  fontWeight="900"
                  sx={{ mb: 1, color: i === 0 || i === 6 ? 'error.light' : 'text.disabled' }}
                >
                  {d}
                </Typography>
              ))}
              {days.map(day => {
                const hasWorkout = !!workoutMap[day];
                const isSelected = selectedDate === day;
                const today = isToday(day);
                return (
                  <ButtonBase
                    key={day}
                    onClick={() => setSelectedDate(day)}
                    sx={{
                      flexDirection: 'column', py: 1.5, borderRadius: 3,
                      bgcolor: isSelected ? 'primary.light' : 'transparent',
                      color: isSelected ? 'primary.main' : today ? 'primary.main' : 'text.primary',
                      transition: '0.2s',
                      '&:hover': { bgcolor: '#f0f7ff' }
                    }}
                  >
                    <Typography
                      variant="body2"
                      fontWeight={isSelected || today ? "900" : "600"}
                      sx={{ textDecoration: today && !isSelected ? 'underline' : 'none' }}
                    >
                      {day}
                    </Typography>
                    {hasWorkout && (
                      <Box sx={{ width: 5, height: 5, bgcolor: isSelected ? 'primary.main' : '#bcccdc', borderRadius: '50%', mt: 0.5 }} />
                    )}
                  </ButtonBase>
                );
              })}
            </Box>
          </Paper>

          {/* 날짜 상세 */}
          <DayDetail
            label={`${selectedDate}일의 기록`}
            workouts={workoutMap[selectedDate]}
            loading={loading}
          />
        </>
      )}

      {/* ─────────────── 주간 뷰 ─────────────── */}
      {view === "weekly" && (
        <>
          {/* 주간 요약 카드 */}
          <ActivityReportCard
            title="이번 주 활동 리포트"
            subtitle={weekRangeLabel}
            loading={loading}
            days={weeklyActiveDays}
            minutes={weeklyMinutes}
            calories={weeklyCalories}
          />

          {/* AI 운동 분석 */}
          <AiWorkoutSummary view="weekly" days={weeklyActiveDays} minutes={weeklyMinutes} calories={weeklyCalories} />

          {/* 이번 주 7일 스트립 */}
          <Paper sx={{ p: 3, mb: 3, borderRadius: 4, border: '1px solid #eee' }} elevation={0}>
            <Typography variant="subtitle1" fontWeight="800" mb={2}>이번 주</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1, textAlign: 'center' }}>
              {thisWeekDays.map((d, i) => {
                const day = d.getDate();
                const sameMonth = d.getFullYear() === year && d.getMonth() + 1 === month;
                const hasWorkout = sameMonth && !!weekWorkoutMap[day];
                const isSelected = sameMonth && selectedDate === day;
                const isThisDay =
                  d.getFullYear() === todayDate.getFullYear() &&
                  d.getMonth() === todayDate.getMonth() &&
                  d.getDate() === todayDate.getDate();

                return (
                  <Box key={i} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                    <Typography
                      variant="caption"
                      color={i >= 5 ? 'error.light' : 'text.disabled'}
                      fontWeight="900"
                    >
                      {WEEK_LABELS[i]}
                    </Typography>
                    <ButtonBase
                      onClick={() => sameMonth && setSelectedDate(day)}
                      disabled={!sameMonth}
                      sx={{
                        flexDirection: 'column',
                        width: 40, height: 48,
                        borderRadius: 3,
                        bgcolor: isSelected ? 'primary.light' : isThisDay ? '#e3f2fd' : 'transparent',
                        color: isSelected ? 'primary.main' : sameMonth ? 'text.primary' : 'text.disabled',
                        border: isThisDay && !isSelected ? '1.5px solid' : 'none',
                        borderColor: 'primary.main',
                        transition: '0.2s',
                        '&:hover': { bgcolor: sameMonth ? '#f0f7ff' : 'transparent' },
                      }}
                    >
                      <Typography
                        variant="body2"
                        fontWeight={isSelected || isThisDay ? "900" : "600"}
                      >
                        {day}
                      </Typography>
                      {hasWorkout && (
                        <Box sx={{ width: 5, height: 5, bgcolor: isSelected ? 'primary.main' : '#90caf9', borderRadius: '50%', mt: 0.3 }} />
                      )}
                    </ButtonBase>
                    <Typography variant="caption" color="text.disabled" fontWeight="700">
                      {d.getMonth() + 1}/{day}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          </Paper>

          {/* 선택 날짜 상세 */}
          {(() => {
            const sameMonth =
              thisWeekDays.some(
                d => d.getDate() === selectedDate &&
                  d.getFullYear() === year &&
                  d.getMonth() + 1 === month
              );
            return (
              <DayDetail
                label={`${month}월 ${selectedDate}일의 기록`}
                workouts={sameMonth ? weekWorkoutMap[selectedDate] : undefined}
                loading={loading}
              />
            );
          })()}
        </>
      )}
    </Container>
  );
}

// ─── 날짜 상세 공통 컴포넌트 ────────────────────────────────
function DayDetail({ label, workouts, loading }) {
  return (
    <Box px={1}>
      <Typography variant="subtitle1" fontWeight="900" mb={2}>{label}</Typography>
      {loading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      ) : workouts?.length > 0 ? (
        <List disablePadding>
          {workouts.map((log) => (
            <HistoryDetailItem key={log.id} log={log} />
          ))}
        </List>
      ) : (
        <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', borderRadius: 4, borderStyle: 'dashed', bgcolor: 'transparent' }}>
          <Typography variant="body2" color="text.disabled" fontWeight="bold">
            운동 기록이 없는 날입니다.
          </Typography>
        </Paper>
      )}
    </Box>
  );
}

// ─── 활동 리포트 카드 (월간·주간 공통) ──────────────────────
function ActivityReportCard({ title, subtitle, loading, days, minutes, calories }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3, mb: 3, borderRadius: 3,
        bgcolor: 'white',
        border: '1px solid #eef2f6',
      }}
    >
      <Typography variant="subtitle2" fontWeight="bold" color="text.secondary">{title}</Typography>
      {subtitle && (
        <Typography variant="caption" color="text.disabled" fontWeight="bold">{subtitle}</Typography>
      )}
      {loading ? (
        <Box display="flex" justifyContent="center" mt={3}>
          <CircularProgress size={24} />
        </Box>
      ) : (
        <Stack direction="row" justifyContent="space-between" mt={2.5}>
          {[
            { label: '운동 횟수', value: days, unit: '일' },
            { label: '누적 시간', value: minutes, unit: '분' },
            { label: '소모 칼로리', value: calories, unit: 'kcal' },
          ].map(({ label, value, unit }) => (
            <Box key={label}>
              <Typography variant="h5" fontWeight="900" color="primary.main">{value}</Typography>
              <Typography variant="caption" color="text.secondary" fontWeight="bold">{label} ({unit})</Typography>
            </Box>
          ))}
        </Stack>
      )}
    </Paper>
  );
}

// ─── AI 운동 분석 카드 (mock) ────────────────────────────────
const MOCK_ANALYSIS = {
  weekly: {
    grade: "B+",
    headline: "꾸준한 주간 루틴을 유지하고 있어요!",
    feedback: [
      "유산소 운동 비중이 높습니다. 근력 운동을 균형 있게 추가해보세요.",
      "연속 운동 패턴이 감지됐어요. 근육 회복을 위한 휴식일을 확보하세요.",
      "이번 주 목표 칼로리의 78%를 달성했습니다. 한 번 더 운동하면 목표를 채울 수 있어요.",
    ],
    tag: "주간 분석",
  },
  monthly: {
    grade: "A",
    headline: "이번 달 운동 습관이 잘 정착되고 있어요!",
    feedback: [
      "이번 달 평균 주 3회 이상 운동하고 있습니다. 훌륭한 루틴입니다.",
      "근력 운동과 유산소 운동의 비율이 이상적으로 유지되고 있어요.",
      "지난 달 대비 총 운동 시간이 15% 증가했습니다. 이 추세를 유지해보세요.",
    ],
    tag: "월간 분석",
  },
};

function AiWorkoutSummary({ view }) {
  const data = MOCK_ANALYSIS[view];

  return (
    <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 4, border: '1px solid #ede7f6', bgcolor: '#faf8ff' }}>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Box display="flex" alignItems="center" gap={1}>
          <AutoAwesomeIcon sx={{ color: '#7c4dff', fontSize: 20 }} />
          <Typography variant="subtitle1" fontWeight="900" sx={{ color: '#4a148c' }}>AI 운동 분석</Typography>
        </Box>
        <Chip label={data.tag} size="small" sx={{ bgcolor: '#ede7f6', color: '#7c4dff', fontWeight: 'bold', fontSize: '0.7rem' }} />
      </Box>

      <Box display="flex" alignItems="center" gap={2} mb={2.5} p={2} bgcolor="white" borderRadius={3} sx={{ border: '1px solid #ede7f6' }}>
        <Typography variant="h3" fontWeight="900" sx={{ color: '#7c4dff', lineHeight: 1 }}>{data.grade}</Typography>
        <Box>
          <Typography variant="body2" fontWeight="800">{data.headline}</Typography>
          <Typography variant="caption" color="text.secondary">AI가 운동 패턴을 분석했어요</Typography>
        </Box>
      </Box>

      <Stack spacing={1.5}>
        {data.feedback.map((text, i) => (
          <Box key={i} display="flex" alignItems="flex-start" gap={1}>
            <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#7c4dff', mt: 0.8, flexShrink: 0 }} />
            <Typography variant="body2" color="text.secondary" fontWeight="600">{text}</Typography>
          </Box>
        ))}
      </Stack>

      <Typography variant="caption" color="text.disabled" sx={{ mt: 2, display: 'block', fontStyle: 'italic' }}>
        * 실제 AI 연동 전 목업 데이터입니다
      </Typography>
    </Paper>
  );
}

// ─── 상세 아이템 ─────────────────────────────────────────────
function HistoryDetailItem({ log }) {
  return (
    <Paper elevation={0} sx={{ mb: 2, borderRadius: 4, border: '1px solid #f1f3f5', p: 0.5 }}>
      <ListItem>
        <Avatar sx={{ bgcolor: '#f8f9fa', mr: 2, width: 48, height: 48 }}>
          <FitnessCenterIcon sx={{ color: 'primary.main' }} />
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Typography variant="body1" fontWeight="800">{log.title}</Typography>
          <Stack direction="row" spacing={1.5} mt={0.5}>
            <Box display="flex" alignItems="center">
              <AccessTimeIcon sx={{ fontSize: 14, mr: 0.3, color: 'text.secondary' }} />
              <Typography variant="caption" fontWeight="bold">{log.minutes}분</Typography>
            </Box>
            <Box display="flex" alignItems="center">
              <LocalFireDepartmentIcon sx={{ fontSize: 14, mr: 0.3, color: 'error.light' }} />
              <Typography variant="caption" fontWeight="bold">{log.calories}kcal</Typography>
            </Box>
          </Stack>
        </Box>
        <Chip label={log.type} size="small" sx={{ fontWeight: 'bold', bgcolor: '#eef2f6', color: '#455a64' }} />
      </ListItem>
    </Paper>
  );
}
