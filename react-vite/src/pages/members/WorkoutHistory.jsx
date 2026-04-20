import { useState, useEffect, useCallback, useRef } from "react";
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

import ReactMarkdown from "react-markdown";
import { getWorkoutHistory } from "../../api/member";
import { useNotification } from "../../context/NotificationContext";
import { API_BASE_URL } from "../../api-config";
import { tokenService } from "../../utils/tokenService";

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
          <AiWorkoutSummary year={year} month={month} />

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

// ─── AI 운동 분석 카드 (실시간 스트리밍) ─────────────────────
function AiWorkoutSummary({ year, month }) {
  const [status, setStatus] = useState('idle'); // idle | loading | streaming | done | error
  const [text, setText] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const abortRef = useRef(null);
  const textBoxRef = useRef(null);

  // year/month 바뀌면 초기화
  useEffect(() => {
    abortRef.current?.abort();
    setStatus('idle');
    setText('');
    setErrorMsg('');
  }, [year, month]);

  // 컴포넌트 언마운트 시 스트림 중단
  useEffect(() => () => abortRef.current?.abort(), []);

  // 새 토큰 올 때마다 스크롤 하단
  useEffect(() => {
    if (textBoxRef.current) {
      textBoxRef.current.scrollTop = textBoxRef.current.scrollHeight;
    }
  }, [text]);

  const startAnalysis = async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setText('');
    setErrorMsg('');
    setStatus('loading');

    try {
      const token = tokenService.getToken();
      const url = `${API_BASE_URL}/members/history/analyze?year=${year}&month=${month}`;
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
        signal: controller.signal,
      });

      if (response.status === 401) {
        window.dispatchEvent(new CustomEvent('auth:unauthorized'));
        return;
      }
      if (!response.ok) {
        setErrorMsg(`서버 오류가 발생했습니다. (HTTP ${response.status})`);
        setStatus('error');
        return;
      }

      setStatus('streaming');
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let currentEvent = '';
      let currentDataLines = [];

      const dispatchEvent = () => {
        if (!currentEvent && currentDataLines.length === 0) return;
        const payload = currentDataLines.join('\n');
        if (currentEvent === 'done' || payload.trim() === '[DONE]') { setStatus('done'); return true; }
        if (currentEvent === 'error') { setErrorMsg(payload.trim()); setStatus('error'); return true; }
        if (currentEvent === 'token') { setText(prev => prev + payload); }
        currentEvent = '';
        currentDataLines = [];
        return false;
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split('\n');
        buffer = lines.pop();

        for (const line of lines) {
          if (line === '') {
            if (dispatchEvent()) return;
          } else if (line.startsWith('event:')) {
            currentEvent = line.slice(6).trim();
          } else if (line.startsWith('data:')) {
            currentDataLines.push(line.replace(/^data: ?/, ''));
          }
        }
      }
      setStatus('done');
    } catch (e) {
      if (e.name !== 'AbortError') {
        setErrorMsg('AI 서비스에 연결할 수 없습니다.');
        setStatus('error');
      } else {
        setStatus('idle');
      }
    }
  };

  const isRunning = status === 'loading' || status === 'streaming';

  return (
    <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 4, border: '1px solid #ede7f6', bgcolor: '#faf8ff' }}>
      {/* 헤더 */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Box display="flex" alignItems="center" gap={1}>
          <AutoAwesomeIcon sx={{ color: '#7c4dff', fontSize: 20 }} />
          <Typography variant="subtitle1" fontWeight="900" sx={{ color: '#4a148c' }}>AI 운동 분석</Typography>
        </Box>
        <Chip
          label={`${month}월 분석`}
          size="small"
          sx={{ bgcolor: '#ede7f6', color: '#7c4dff', fontWeight: 'bold', fontSize: '0.7rem' }}
        />
      </Box>

      {/* idle: 분석 시작 버튼 */}
      {status === 'idle' && (
        <Box
          sx={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            gap: 1.5, py: 3, px: 2, bgcolor: 'white', borderRadius: 3,
            border: '1px dashed #d1c4e9', cursor: 'pointer',
            transition: '0.2s', '&:hover': { bgcolor: '#f3e5f5' }
          }}
          onClick={startAnalysis}
        >
          <AutoAwesomeIcon sx={{ color: '#7c4dff', fontSize: 32 }} />
          <Typography variant="body2" fontWeight="800" sx={{ color: '#4a148c' }}>
            이번 달 운동 AI 분석 받기
          </Typography>
          <Typography variant="caption" color="text.disabled">
            Gemma AI가 운동 패턴을 분석하고 맞춤 피드백을 드려요
          </Typography>
        </Box>
      )}

      {/* loading: 연결 중 */}
      {status === 'loading' && (
        <Box display="flex" alignItems="center" gap={2} py={3} px={2} bgcolor="white" borderRadius={3} sx={{ border: '1px solid #ede7f6' }}>
          <CircularProgress size={20} sx={{ color: '#7c4dff' }} />
          <Typography variant="body2" fontWeight="700" color="text.secondary">AI 분석 중...</Typography>
        </Box>
      )}

      {/* streaming / done: 텍스트 출력 */}
      {(status === 'streaming' || status === 'done') && (
        <Box
          ref={textBoxRef}
          sx={{
            bgcolor: 'white', borderRadius: 3, p: 2,
            border: '1px solid #ede7f6',
            maxHeight: 320, overflowY: 'auto',
            '& p': { m: 0, mb: 1, fontSize: '0.875rem', fontWeight: 600, lineHeight: 1.8, color: 'text.primary' },
            '& strong': { fontWeight: 900 },
            '& ul, & ol': { pl: 2.5, mb: 1 },
            '& li': { fontSize: '0.875rem', fontWeight: 600, lineHeight: 1.8 },
          }}
        >
          <ReactMarkdown>{text.replace(/\n(?!\n)/g, '\n\n')}</ReactMarkdown>
          {status === 'streaming' && (
            <Box component="span" sx={{
              display: 'inline-block', width: 2, height: '1em',
              bgcolor: '#7c4dff', ml: 0.3, verticalAlign: 'text-bottom',
              animation: 'blink 1s step-end infinite',
              '@keyframes blink': { '0%,100%': { opacity: 1 }, '50%': { opacity: 0 } },
            }} />
          )}
        </Box>
      )}

      {/* error */}
      {status === 'error' && (
        <Box py={2} px={2} bgcolor="white" borderRadius={3} sx={{ border: '1px solid #ffcdd2' }}>
          <Typography variant="body2" fontWeight="700" color="error.main">{errorMsg}</Typography>
        </Box>
      )}

      {/* done / error: 다시 분석 버튼 */}
      {(status === 'done' || status === 'error') && (
        <Box
          mt={1.5} display="flex" alignItems="center" gap={0.5}
          sx={{ cursor: 'pointer', width: 'fit-content' }}
          onClick={startAnalysis}
        >
          <AutoAwesomeIcon sx={{ color: '#9e9e9e', fontSize: 14 }} />
          <Typography variant="caption" color="text.disabled" fontWeight="bold">
            다시 분석하기
          </Typography>
        </Box>
      )}

      {/* 중단 버튼 */}
      {isRunning && (
        <Box
          mt={1.5} display="flex" alignItems="center" gap={0.5}
          sx={{ cursor: 'pointer', width: 'fit-content' }}
          onClick={() => { abortRef.current?.abort(); setStatus('idle'); setText(''); }}
        >
          <Typography variant="caption" color="text.disabled" fontWeight="bold">중단</Typography>
        </Box>
      )}
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
