import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputAdornment,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import PersonIcon from "@mui/icons-material/Person";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { useNotification } from "../../context/NotificationContext";
import { getGymMembers, deleteGymMember } from "../../api/owner";

const STATUS_LABEL = { ACTIVE: "활성", EXPIRED: "만료", SUSPENDED: "정지", PENDING: "대기" };
const STATUS_COLOR = { ACTIVE: "success", EXPIRED: "default", SUSPENDED: "error", PENDING: "warning" };

function stringAvatar(name) {
  return name?.charAt(0) ?? "?";
}

export default function GymMemberManage() {
  const { gymId } = useParams();
  const { showNotification } = useNotification();

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setLoading(true);
    getGymMembers({ gymId })
      .then((data) => setMembers(data ?? []))
      .catch(() => showNotification("회원 목록을 불러오지 못했습니다.", "error"))
      .finally(() => setLoading(false));
  }, [gymId]);

  const filtered = members.filter(
    (m) =>
      m.name?.includes(search) ||
      m.email?.includes(search) ||
      m.phoneNumber?.includes(search)
  );

  const handleDeleteConfirm = async () => {
    setDeleting(true);
    try {
      await deleteGymMember({ gymId, memberId: deleteTarget.memberId });
      setMembers((prev) => prev.filter((m) => m.memberId !== deleteTarget.memberId));
      showNotification(`${deleteTarget.name} 회원이 삭제되었습니다.`, "success");
      setDeleteTarget(null);
    } catch {
      showNotification("회원 삭제에 실패했습니다.", "error");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* 헤더 */}
      <Box display="flex" alignItems="center" gap={1.5} mb={3}>
        <PersonIcon sx={{ color: "primary.main", fontSize: 28 }} />
        <Box>
          <Typography variant="h6" fontWeight="bold">회원 관리</Typography>
          <Typography variant="caption" color="text.secondary">
            총 {members.length}명 · 검색 결과 {filtered.length}명
          </Typography>
        </Box>
      </Box>

      {/* 검색 */}
      <TextField
        size="small"
        placeholder="이름, 이메일, 전화번호 검색"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 2, width: 320 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" />
            </InputAdornment>
          ),
        }}
      />

      {/* 테이블 */}
      {loading ? (
        <Box display="flex" justifyContent="center" py={8}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: "#f8f9fa" }}>
                <TableCell sx={{ fontWeight: "bold" }}>회원</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>전화번호</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>가입일</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>만료일</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>상태</TableCell>
                <TableCell align="center" sx={{ fontWeight: "bold" }}>삭제</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6, color: "text.secondary" }}>
                    {search ? "검색 결과가 없습니다." : "등록된 회원이 없습니다."}
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((member) => (
                  <TableRow key={member.memberId} hover>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1.5}>
                        <Avatar sx={{ width: 32, height: 32, fontSize: 14, bgcolor: "primary.light" }}>
                          {stringAvatar(member.name)}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="bold">{member.name}</Typography>
                          <Typography variant="caption" color="text.secondary">{member.email}</Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{member.phoneNumber ?? "-"}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{member.joinedAt}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{member.expiredAt ?? "-"}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={STATUS_LABEL[member.status] ?? member.status}
                        color={STATUS_COLOR[member.status] ?? "default"}
                        size="small"
                        sx={{ fontWeight: "bold" }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Button
                        size="small"
                        color="error"
                        variant="outlined"
                        startIcon={<DeleteOutlineIcon fontSize="small" />}
                        onClick={() => setDeleteTarget(member)}
                        sx={{ borderRadius: 2, minWidth: 72 }}
                      >
                        삭제
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* 삭제 확인 다이얼로그 */}
      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
        <DialogTitle sx={{ fontWeight: "bold" }}>회원 삭제</DialogTitle>
        <DialogContent>
          <Typography>
            <strong>{deleteTarget?.name}</strong> 회원을 삭제하시겠습니까?
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={1}>
            삭제된 회원 정보는 복구할 수 없습니다.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteTarget(null)} variant="outlined" disabled={deleting}>취소</Button>
          <Button onClick={handleDeleteConfirm} variant="contained" color="error" disabled={deleting}
            startIcon={deleting ? <CircularProgress size={14} color="inherit" /> : null}>
            삭제
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
