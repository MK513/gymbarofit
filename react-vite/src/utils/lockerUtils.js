
export const mapLockerSizeToGridType = (serverSize) => {
  switch (serverSize) {
    case "MEDIUM": return "1x2";
    case "LARGE": return "2x1";
    case "SMALL":
    default: return "1x1";
  }
};

export const getLockerSizeLabel = (size) => {
  const map = {
    SMALL: "소형",
    MEDIUM: "중형",
    LARGE: "대형"
  };
  return map[size] || size;
};