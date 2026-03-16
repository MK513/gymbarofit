export default function MapContextMenu({ contextMenu, onRemove, onClose }) {
  if (!contextMenu) return null;

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
        minWidth: 130,
      }}
      onMouseLeave={onClose}
    >
      <div
        onClick={() => onRemove(contextMenu.item.id)}
        style={{ padding: "8px 14px", cursor: "pointer", fontSize: 13, color: "#ef4444" }}
        onMouseEnter={(e) => { e.currentTarget.style.background = "#fef2f2"; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = ""; }}
      >
        배치 제거
      </div>
    </div>
  );
}
