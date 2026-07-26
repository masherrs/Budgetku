import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 16,
        color: "#0b2537",
        background: "#34c995",
        fontSize: 28,
        fontWeight: 800,
      }}
    >
      B
    </div>,
    size,
  );
}
