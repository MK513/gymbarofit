const STATUS_META = {
  OK:          { label: "정상",   color: "#2e7d32", bg: "#e8f5e9" },
  MAINTENANCE: { label: "점검중", color: "#e65100", bg: "#fff3e0" },
  BROKEN:      { label: "고장",   color: "#c62828", bg: "#ffebee" },
  RETIRED:     { label: "폐기",   color: "#616161", bg: "#f5f5f5" },
};

const STATUS_OPTIONS = ["OK", "MAINTENANCE", "BROKEN", "RETIRED"];

export default function MapContextMenu({ contextMenu, onRemove, onStatusChange, onClose }) {
  if (!contextMenu) return null;

  const currentStatus = contextMenu.item.apiStatus ?? "OK";

  return (
    <div
      style={{
        position: "fixed",
        top: contextMenu.y,
        left: contextMenu.x,
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: 8,
        boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
        zIndex: 9999,
        minWidth: 150,
        overflow: "hidden",
      }}
      onMouseLeave={onClose}
      onClick={(e) => e.stopPropagation()}
    >
      {/* 기구 이름 헤더 */}
      <div style={{
        padding: "8px 14px 6px",
        fontSize: 11,
        color: "#6b7280",
        fontWeight: 600,
        borderBottom: "1px solid #f3f4f6",
        userSelect: "none",
      }}>
        {contextMenu.item.name ?? "기구"}
      </div>

      {/* 상태 변경 옵션 */}
      <div style={{ padding: "4px 0" }}>
        <div style={{ padding: "3px 14px 2px", fontSize: 10, color: "#9ca3af", userSelect: "none" }}>
          상태 변경
        </div>
        {STATUS_OPTIONS.map((s) => {
          const sm = STATUS_META[s];
          const isCurrent = s === currentStatus;
          return (
            <div
              key={s}
              onClick={() => {
                if (!isCurrent) onStatusChange?.(contextMenu.item.equipmentId, s);
                onClose();
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "7px 14px",
                cursor: isCurrent ? "default" : "pointer",
                fontSize: 13,
                fontWeight: isCurrent ? 700 : 400,
                color: isCurrent ? sm.color : "#374151",
                background: isCurrent ? sm.bg : "transparent",
                transition: "background 0.1s",
              }}
              onMouseEnter={(e) => {
                if (!isCurrent) e.currentTarget.style.background = "#f9fafb";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = isCurrent ? sm.bg : "transparent";
              }}
            >
              <span style={{
                width: 8, height: 8,
                borderRadius: "50%",
                background: sm.color,
                flexShrink: 0,
              }} />
              {sm.label}
              {isCurrent && (
                <span style={{ marginLeft: "auto", fontSize: 11, color: sm.color }}>✓</span>
              )}
            </div>
          );
        })}
      </div>

      {/* 구분선 */}
      <div style={{ borderTop: "1px solid #f3f4f6" }} />

      {/* 배치 제거 */}
      <div
        onClick={() => { onRemove(contextMenu.item.id); onClose(); }}
        style={{ padding: "8px 14px", cursor: "pointer", fontSize: 13, color: "#ef4444" }}
        onMouseEnter={(e) => { e.currentTarget.style.background = "#fef2f2"; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = ""; }}
      >
        맵에서 제거
      </div>
    </div>
  );
}
