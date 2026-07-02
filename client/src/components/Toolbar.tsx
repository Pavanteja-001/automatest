interface Props {
  onRecord: () => void;
  onRun: () => void;
  onSave: () => void;
  onAddTime: () => void;
  slowMotion: boolean;
  onToggleSlowMotion: () => void;
  headed: boolean;
  onToggleHeaded: () => void;
  autoLogin: boolean;
  onToggleAutoLogin: () => void;
}

export default function Toolbar({
  onRecord,
  onRun,
  onSave,
  onAddTime,
  slowMotion,
  onToggleSlowMotion,
  headed,
  onToggleHeaded,
  autoLogin,
  onToggleAutoLogin,
}: Props) {
  return (
    <div
      style={{
        display: "flex",
        gap: 10,
        padding: 10,
        borderBottom: "1px solid #444",
        background: "#202124",
      }}
    >
      <button onClick={onRecord}>
        🎥 Record
      </button>

      <button onClick={onRun}>
        ▶ Run
      </button>

      <button onClick={onSave}>
        💾 Save
      </button>

      <button onClick={onAddTime}>
        ⏱ addTime
      </button>

      <button
        title="Slow down test execution by 3x"
        onClick={onToggleSlowMotion}
        style={{
          background: slowMotion ? "#c2410c" : undefined,
          color: slowMotion ? "white" : undefined,
          fontWeight: slowMotion ? "bold" : "normal",
        }}
      >
        🐢 -3x
      </button>

      <button
        title={
          headed
            ? "Headed: running tests opens a visible browser window"
            : "Headless: running tests stays in the background, results in the terminal"
        }
        onClick={onToggleHeaded}
        style={{
          background: headed ? "#2563eb" : undefined,
          color: headed ? "white" : undefined,
          fontWeight: headed ? "bold" : "normal",
        }}
      >
        🖥 Headed
      </button>

      <button
        title={
          autoLogin
            ? "Auto Login is ON: the token from login.config.json will be injected before every run"
            : "Auto Login is OFF: tests run exactly as written, no token is used"
        }
        onClick={onToggleAutoLogin}
        style={{
          background: autoLogin ? "#15803d" : undefined,
          color: autoLogin ? "white" : undefined,
          fontWeight: autoLogin ? "bold" : "normal",
        }}
      >
        🔐 Auto Login
      </button>
    </div>
  );
}
