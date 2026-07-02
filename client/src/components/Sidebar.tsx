import FileTree, { type FileNode } from "./FileTree";

interface Props {
  tree: FileNode[];
  selected: string | null;
  onSelectDraft: () => void;
  onOpenFile: (path: string) => void;
  onRunTest: (name: string) => void;
  onCreateFolder: (name: string) => void;
  onCreateFile: (name: string) => void;
}

export default function Sidebar({
  tree,
  selected,
  onSelectDraft,
  onOpenFile,
  onRunTest,
  onCreateFolder,
  onCreateFile,
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

  return (
    <div
      style={{
        width: 220,
        borderRight: "1px solid #444",
        background: "#1e1e1e",
        color: "white",
        padding: 10,
        overflowY: "auto",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <h3>Explorer</h3>

        <div style={{ display: "flex", gap: 6 }}>
          <button title="New File" onClick={handleNewFile}>
            + File
          </button>

          <button title="New Folder" onClick={handleNewFolder}>
            + Folder
          </button>
        </div>
      </div>

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

      {tree.length === 0 && (
        <p style={{ opacity: 0.6, fontSize: 13 }}>No saved tests yet.</p>
      )}

      <FileTree
        nodes={tree}
        selected={selected}
        onOpenFile={onOpenFile}
        onRunTest={onRunTest}
      />
    </div>
  );
}
