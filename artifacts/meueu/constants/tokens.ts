import { Platform } from "react-native";

export const spacing = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
} as const;

const nativeShadow = {
  card: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  soft: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
  strong: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 6,
  },
} as const;

const webShadow = {
  card: { boxShadow: "0 4px 12px rgba(0,0,0,0.08)" } as any,
  soft: { boxShadow: "0 2px 6px rgba(0,0,0,0.05)" } as any,
  strong: { boxShadow: "0 8px 24px rgba(0,0,0,0.12)" } as any,
};

export const shadow = Platform.OS === "web" ? webShadow : nativeShadow;
