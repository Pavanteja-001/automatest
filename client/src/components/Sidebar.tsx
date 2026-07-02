import FileTree, { type FileNode } from "./FileTree";

interface Props {
  tree: FileNode[];
  selected: string | null;
  onSelectDraft: () => void;
  onOpenFile: (path: string) => void;
  onRunTest: (name: string) => void;
  onCreateFolder: (name: string) => void;
  onCreateFile: (name: string) => void;
  onDeleteNode: (path: string, type: "file" | "folder") => void;
}

export default function Sidebar({
  tree,
  selected,
  onSelectDraft,
  onOpenFile,
  onRunTest,
  onCreateFolder,
  onCreateFile,
  onDeleteNode,
}: Props) {
  function handleNewFolder() {
    const name = window.prompt("New folder name:");

    if (!name) return;

    onCreateFolder(name);
  }

  function handleNewFile() {
    const name = window.prompt("New file name:");

    if (!name) return;

    onCreateFile(name);
  }

  function handleDeleteNode(node: FileNode) {
    const kind = node.type === "folder" ? "folder" : "file";
    const confirmed = window.confirm(
      `Delete ${kind} "${node.name}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    onDeleteNode(node.path, node.type);
  }

  function handleAddFile(node: FileNode) {
    const name = window.prompt(`New file name in "${node.name}":`);

    if (!name) return;

    onCreateFile(`${node.path}/${name}`);
  }

  return (
    <div
      style={{
        width: 240,
        borderRight: "1px solid #3c3c3c",
        background: "#1e1e1e",
        color: "#cccccc",
        padding: "10px 8px",
        overflowY: "auto",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 4px 8px",
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: 0.5,
            textTransform: "uppercase",
            opacity: 0.75,
          }}
        >
          Explorer
        </h3>

        <div style={{ display: "flex", gap: 4 }}>
          <button
            title="New File"
            onClick={handleNewFile}
            style={headerButtonStyle}
          >
            + File
          </button>

          <button
            title="New Folder"
            onClick={handleNewFolder}
            style={headerButtonStyle}
          >
            + Folder
          </button>
        </div>
      </div>

      <div
        onClick={onSelectDraft}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "5px 8px",
          borderRadius: 4,
          cursor: "pointer",
          fontSize: 13,
          background: selected === null ? "#37373d" : "transparent",
        }}
      >
        <span style={{ fontSize: 14 }}>📄</span>
        current.spec.ts (draft)
      </div>

      {tree.length === 0 && (
        <p style={{ opacity: 0.6, fontSize: 13, padding: "6px 8px" }}>
          No saved tests yet.
        </p>
      )}

      <FileTree
        nodes={tree}
        selected={selected}
        onOpenFile={onOpenFile}
        onRunTest={onRunTest}
        onDeleteNode={handleDeleteNode}
        onAddFile={handleAddFile}
      />
    </div>
  );
}

const headerButtonStyle = {
  background: "transparent",
  border: "1px solid #3c3c3c",
  color: "#cccccc",
  borderRadius: 4,
  fontSize: 11,
  padding: "3px 6px",
  cursor: "pointer",
};
