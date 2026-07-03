import type { CSSProperties } from "react";

interface Props {
  openTabs: string[];
  selected: string | null;
  onSelectTab: (path: string) => void;
  onSelectDraft: () => void;
  onCloseTab: (path: string) => void;
}

export default function Tabs({
  openTabs,
  selected,
  onSelectTab,
  onSelectDraft,
  onCloseTab,
}: Props) {
  return (
    <div style={barStyle}>
      <TabItem
        label="current.spec.ts (draft)"
        active={selected === null}
        onClick={onSelectDraft}
      />

      {openTabs.map((path) => (
        <TabItem
          key={path}
          label={path.split("/").pop() ?? path}
          fullPath={path}
          active={selected === path}
          onClick={() => onSelectTab(path)}
          onClose={() => onCloseTab(path)}
        />
      ))}
    </div>
  );
}

interface TabItemProps {
  label: string;
  fullPath?: string;
  active: boolean;
  onClick: () => void;
  onClose?: () => void;
}

function TabItem({ label, fullPath, active, onClick, onClose }: TabItemProps) {
  return (
    <div
      onClick={onClick}
      title={fullPath ?? label}
      style={{
        ...tabStyle,
        background: active ? "#1e1e1e" : "transparent",
        color: active ? "#ffffff" : "#9d9d9d",
        borderBottom: active ? "2px solid #007acc" : "2px solid transparent",
      }}
    >
      {onClose && (
        <button
          title="Close tab"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          style={closeButtonStyle}
        >
          &#10005;
        </button>
      )}

      <span style={labelStyle}>{label}</span>
    </div>
  );
}

const barStyle: CSSProperties = {
  display: "flex",
  alignItems: "stretch",
  background: "#252526",
  borderBottom: "1px solid #3c3c3c",
  overflowX: "auto",
  flexShrink: 0,
};

const tabStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  padding: "6px 12px",
  fontSize: 13,
  cursor: "pointer",
  whiteSpace: "nowrap",
  borderRight: "1px solid #3c3c3c",
  flexShrink: 0,
};

const labelStyle: CSSProperties = {
  overflow: "hidden",
  textOverflow: "ellipsis",
  maxWidth: 200,
};

const closeButtonStyle: CSSProperties = {
  background: "transparent",
  border: "none",
  color: "inherit",
  cursor: "pointer",
  fontSize: 11,
  lineHeight: 1,
  padding: 2,
  opacity: 0.7,
  flexShrink: 0,
};
