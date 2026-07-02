import { useState } from "react";

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
  depth?: number;
}

export default function FileTree({
  nodes,
  selected,
  onOpenFile,
  onRunTest,
  depth = 0,
}: Props) {
  return (
    <>
      {nodes.map((node) =>
        node.type === "folder" ? (
          <FolderNode
            key={node.path}
            node={node}
            selected={selected}
            onOpenFile={onOpenFile}
            onRunTest={onRunTest}
            depth={depth}
          />
        ) : (
          <div
            key={node.path}
            onClick={() => onOpenFile(node.path)}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "4px 8px",
              paddingLeft: 8 + depth * 14,
              borderRadius: 4,
              cursor: "pointer",
              background: selected === node.path ? "#333" : "transparent",
            }}
          >
            <span style={{ flex: 1 }}>{node.name}</span>

            {onRunTest && depth === 0 && node.name.endsWith(".spec.ts") && (
              <button
                title="Run this test"
                onClick={(e) => {
                  e.stopPropagation();
                  onRunTest(node.path);
                }}
              >
                ▶
              </button>
            )}
          </div>
        )
      )}
    </>
  );
}

interface FolderNodeProps {
  node: FileNode;
  selected: string | null;
  onOpenFile: (path: string) => void;
  onRunTest?: (path: string) => void;
  depth: number;
}

function FolderNode({
  node,
  selected,
  onOpenFile,
  onRunTest,
  depth,
}: FolderNodeProps) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div>
      <div
        onClick={() => setExpanded((prev) => !prev)}
        style={{
          padding: "4px 8px",
          paddingLeft: 8 + depth * 14,
          cursor: "pointer",
          userSelect: "none",
        }}
      >
        {expanded ? "▾" : "▸"} 📁 {node.name}
      </div>

      {expanded && node.children && (
        <FileTree
          nodes={node.children}
          selected={selected}
          onOpenFile={onOpenFile}
          onRunTest={onRunTest}
          depth={depth + 1}
        />
      )}
    </div>
  );
}
