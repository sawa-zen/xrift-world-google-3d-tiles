// 3D Tiles API トークン（.env の VITE_GOOGLE_API_TOKEN に設定）
export const GOOGLE_API_TOKEN = import.meta.env.VITE_GOOGLE_API_TOKEN ?? "";

// 表示座標（.env で変更可能、デフォルトは名古屋・鶴舞駅）
export const TILES_LAT = Number(import.meta.env.VITE_TILES_LAT) || 35.1572;
export const TILES_LON = Number(import.meta.env.VITE_TILES_LON) || 136.9215;
// 透明な床の高さ（.env で変更可能）
export const FLOOR_HEIGHT = Number(import.meta.env.VITE_FLOOR_HEIGHT) || 109.99;
