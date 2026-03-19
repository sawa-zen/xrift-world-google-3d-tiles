// 3D Tiles API トークン（.env の VITE_GOOGLE_API_TOKEN に設定）
export const GOOGLE_API_TOKEN = import.meta.env.VITE_GOOGLE_API_TOKEN ?? "";

export const WORLD_CONFIG = {
  size: 20,
  wallHeight: 5,
  wallThickness: 0.5,
} as const;

export const COLORS = {
  ground: "#90EE90",
  wall: "#8B4513",
  decorations: {
    box: "#FFFF00",
    cylinder: "#4169E1",
    sphere: "#FFD700",
  },
  lightPost: "#696969",
} as const;
