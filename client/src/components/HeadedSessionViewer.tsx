interface Props {
  visible: boolean;
  recording: boolean;
  onStop: () => void;
}

const API_ORIGIN = (import.meta.env.VITE_API_URL || "http://localhost:3000/api").replace(/\/api\/?$/, "");

export default function HeadedSessionViewer({ visible, recording, onStop }: Props) {
  if (!visible) return null;

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        right: 0,
        bottom: 0,
        width: 800,
        borderLeft: "1px solid #444",
        background: "#1c1c1e",
        display: "flex",
        flexDirection: "column",
        zIndex: 10,
      }}
    >
      {/* Control Title Bar */}
      <div
        style={{
          height: 40,
          background: "#202124",
          borderBottom: "1px solid #444",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 15px",
          color: "#eee",
          fontSize: 13,
          fontWeight: 500,
        }}
      >
        <span>🖥️ Live Browser Session</span>
        {recording ? (
          <button
            onClick={onStop}
            style={{
              background: "#dc2626",
              color: "white",
              border: "none",
              padding: "4px 10px",
              borderRadius: 4,
              cursor: "pointer",
              fontSize: 11,
              fontWeight: 600,
            }}
          >
            ⏹️ Stop Recording
          </button>
        ) : (
          <button
            onClick={onStop}
            style={{
              background: "#4b5563",
              color: "white",
              border: "none",
              padding: "4px 10px",
              borderRadius: 4,
              cursor: "pointer",
              fontSize: 11,
              fontWeight: 600,
            }}
          >
            ❌ Close View
          </button>
        )}
      </div>

      <div style={{ flex: 1, position: "relative" }}>
        <iframe
          title="Headed browser session"
          src={`${API_ORIGIN}/vnc/vnc.html?autoconnect=true&path=vnc&resize=scale`}
          style={{ width: "100%", height: "100%", border: "none" }}
          allowFullScreen
          allow="fullscreen"
        />
      </div>
    </div>
  );
}
