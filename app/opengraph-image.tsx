import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Careerora — Build your entire professional identity with AI";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background:
            "radial-gradient(circle at 20% 10%, rgba(124,58,237,0.5), transparent 50%), radial-gradient(circle at 80% 80%, rgba(236,72,153,0.5), transparent 50%), #070914",
          color: "white",
          fontFamily: "Inter, system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            fontSize: 34,
            fontWeight: 700,
            letterSpacing: "-0.01em",
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: "linear-gradient(135deg, #3B82F6, #7C3AED, #EC4899)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 32,
              fontWeight: 800,
            }}
          >
            C
          </div>
          <span
            style={{
              background: "linear-gradient(135deg, #60a5fa, #a78bfa, #f472b6)",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            Careerora
          </span>
        </div>

        <div
          style={{
            marginTop: 60,
            fontSize: 76,
            fontWeight: 700,
            lineHeight: 1.05,
            letterSpacing: "-0.025em",
            maxWidth: 1000,
            display: "flex",
            flexWrap: "wrap",
          }}
        >
          Build your entire{" "}
          <span
            style={{
              background: "linear-gradient(135deg, #60a5fa, #a78bfa, #f472b6)",
              backgroundClip: "text",
              color: "transparent",
              marginLeft: 16,
            }}
          >
            professional identity
          </span>
          <span style={{ marginLeft: 16 }}>with AI.</span>
        </div>

        <div
          style={{
            display: "flex",
            gap: 18,
            marginTop: 56,
            fontSize: 22,
            color: "rgba(255,255,255,0.7)",
          }}
        >
          <span>Resumes</span>
          <span>·</span>
          <span>Portfolios</span>
          <span>·</span>
          <span>LinkedIn</span>
          <span>·</span>
          <span>Case studies</span>
          <span>·</span>
          <span>Cover letters</span>
        </div>
      </div>
    ),
    size
  );
}
