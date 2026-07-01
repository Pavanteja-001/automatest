interface Props {
  tests: string[];
  selected: string | null;
  onSelectDraft: () => void;
  onSelectTest: (name: string) => void;
  onRunTest: (name: string) => void;
}

export default function Sidebar({
  tests,
  selected,
  onSelectDraft,
  onSelectTest,
  onRunTest,
}: Props) {
  return (
    <div
      style={{
        width: 220,
        borderRight: "1px solid #444",
        background: "#1e1e1e",
        color: "white",
        padding: 10,
      }}
    >
      <h3>Tests</h3>

      <div
        onClick={onSelectDraft}
        style={{
          padding: "6px 8px",
          borderRadius: 4,
          cursor: "pointer",
          background: selected === null ? "#333" : "transparent",
        }}
      >
        current.spec.ts (draft)
      </div>

      {tests.length === 0 && (
        <p style={{ opacity: 0.6, fontSize: 13 }}>No saved tests yet.</p>
      )}

      {tests.map((name) => (
        <div
          key={name}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "6px 8px",
            borderRadius: 4,
            background: selected === name ? "#333" : "transparent",
          }}
        >
          <span
            onClick={() => onSelectTest(name)}
            style={{ cursor: "pointer", flex: 1 }}
          >
            {name}
          </span>

          <button
            title="Run this test"
            onClick={(e) => {
              e.stopPropagation();
              onRunTest(name);
            }}
          >
            ▶
          </button>
        </div>
      ))}
    </div>
  );
}
