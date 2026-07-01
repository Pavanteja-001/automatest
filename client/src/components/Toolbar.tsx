interface Props {
  onRecord: () => void;
  onRun: () => void;
}

export default function Toolbar({
  onRecord,
  onRun,
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
    </div>
  );
}