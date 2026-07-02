import { useState, type CSSProperties } from "react";

export interface FileNode {
  name: string;
  path: string;
  type: "file" | "folder";
  children?: FileNode[];
}

interface Props {
  nodes: FileNode[];
  selected: string | null;
  onOpenFile: (path: string) => void;
  onRunTest?: (path: string) => void;
  onDeleteNode?: (node: FileNode) => void;
  onAddFile?: (node: FileNode) => void;
  depth?: number;
}

export default function FileTree({
  nodes,
  selected,
  onOpenFile,
  onRunTest,
  onDeleteNode,
  onAddFile,
  depth = 0,
}: Props) {
  return (
    <>
      {nodes.map((node) => (
        <TreeRow
          key={node.path}
          node={node}
          selected={selected}
          onOpenFile={onOpenFile}
          onRunTest={onRunTest}
          onDeleteNode={onDeleteNode}
          onAddFile={onAddFile}
          depth={depth}
        />
      ))}
    </>
  );
}

interface TreeRowProps {
  node: FileNode;
  selected: string | null;
  onOpenFile: (path: string) => void;
  onRunTest?: (path: string) => void;
  onDeleteNode?: (node: FileNode) => void;
  onAddFile?: (node: FileNode) => void;
  depth: number;
}

function TreeRow({
  node,
  selected,
  onOpenFile,
  onRunTest,
  onDeleteNode,
  onAddFile,
  depth,
}: TreeRowProps) {
  const [expanded, setExpanded] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const isFolder = node.type === "folder";
  const isRunnable = isFolder || node.name.endsWith(".ts");
  const isSelected = !isFolder && selected === node.path;

  function handleRowClick() {
    if (isFolder) {
      setExpanded((prev) => !prev);
    } else {
      onOpenFile(node.path);
    }
  }

  return (
    <div style={{ position: "relative" }}>
      <div
        onClick={handleRowClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "5px 8px",
          paddingLeft: 6 + depth * 16,
          borderRadius: 4,
          cursor: "pointer",
          background: isSelected ? "#37373d" : hovered ? "#2a2d2e" : "transparent",
        }}
      >
        <span style={caretStyle}>
          {isFolder ? (expanded ? "▾" : "▸") : ""}
        </span>

        <span style={iconStyle}>{isFolder ? (expanded ? "📂" : "📁") : "📄"}</span>

        <span style={nameStyle} title={node.name}>
          {node.name}
        </span>

        {onRunTest && isRunnable && (hovered || menuOpen) && (
          <button
            title={isFolder ? "Run all tests in this folder" : "Run this test"}
            onClick={(e) => {
              e.stopPropagation();
              onRunTest(node.path);
            }}
            style={actionButtonStyle}
          >
            &#9654;
          </button>
        )}

        {(onDeleteNode || onAddFile) && (hovered || menuOpen) && (
          <button
            title="More options"
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen((prev) => !prev);
            }}
            style={actionButtonStyle}
          >
            &#8942;
          </button>
        )}

        {menuOpen && (
          <div
            onClick={(e) => e.stopPropagation()}
            style={menuStyle}
          >
            {isFolder && onAddFile && (
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onAddFile(node);
                }}
                style={menuItemStyle}
              >
                &#128196; Add File
              </button>
            )}

            {onDeleteNode && (
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onDeleteNode(node);
                }}
                style={{ ...menuItemStyle, color: "#f87171" }}
              >
                &#128465; Delete
              </button>
            )}
          </div>
        )}
      </div>

      {menuOpen && (
        <div
          onClick={() => setMenuOpen(false)}
          style={{ position: "fixed", inset: 0, zIndex: 10 }}
        />
      )}

      {isFolder && expanded && node.children && (
        <FileTree
          nodes={node.children}
          selected={selected}
          onOpenFile={onOpenFile}
          onRunTest={onRunTest}
          onDeleteNode={onDeleteNode}
          onAddFile={onAddFile}
          depth={depth + 1}
        />
      )}
    </div>
  );
}

const caretStyle: CSSProperties = {
  width: 12,
  flexShrink: 0,
  textAlign: "center",
  fontSize: 11,
  opacity: 0.6,
};

const iconStyle: CSSProperties = {
  flexShrink: 0,
  fontSize: 14,
  lineHeight: 1,
};

const nameStyle: CSSProperties = {
  flex: 1,
  fontSize: 13,
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};

const actionButtonStyle: CSSProperties = {
  flexShrink: 0,
  background: "transparent",
  border: "none",
  color: "inherit",
  cursor: "pointer",
  fontSize: 12,
  lineHeight: 1,
  padding: "3px 5px",
  borderRadius: 4,
  opacity: 0.85,
};

const menuStyle: CSSProperties = {
  position: "absolute",
  top: "100%",
  right: 8,
  background: "#2b2b2b",
  border: "1px solid #454545",
  borderRadius: 6,
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.45)",
  zIndex: 20,
  minWidth: 130,
  overflow: "hidden",
  padding: 4,
};

const menuItemStyle: CSSProperties = {
  display: "block",
  width: "100%",
  textAlign: "left",
  padding: "6px 10px",
  background: "transparent",
  border: "none",
  borderRadius: 4,
  color: "#cccccc",
  cursor: "pointer",
  fontSize: 13,
};
