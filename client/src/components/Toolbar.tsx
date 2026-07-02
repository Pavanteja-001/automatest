interface Props {
  onRecord: () => void;
  onRun: () => void;
  onSave: () => void;
  onAddTime: () => void;
  slowMotion: boolean;
  onToggleSlowMotion: () => void;
}

export default function Toolbar({
  onRecord,
  onRun,
  onSave,
  onAddTime,
  slowMotion,
  onToggleSlowMotion,
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
    </div>
  );
}
