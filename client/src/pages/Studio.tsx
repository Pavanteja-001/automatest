import { useEffect, useRef, useState } from "react";

import api from "../services/api";
import socket from "../services/socket";

import Toolbar from "../components/Toolbar";
import Sidebar from "../components/Sidebar";
import Terminal from "../components/Terminal";
import CodeEditor, { type CodeEditorHandle } from "../components/CodeEditor";
import { writeTerminal } from "../services/terminal";
import type { FileNode } from "../components/FileTree";

const SLOW_MOTION_MS = 1000;
const AUTO_SAVE_DELAY_MS = 500;

export default function Studio() {
  const [code, setCode] = useState("");
  const [tree, setTree] = useState<FileNode[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [slowMotion, setSlowMotion] = useState(false);
  const [headed, setHeaded] = useState(false);
  const [autoLogin, setAutoLogin] = useState(false);
  const [terminalOpen, setTerminalOpen] = useState(true);
  const [testRunning, setTestRunning] = useState(false);
  const editorRef = useRef<CodeEditorHandle>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingSaveRef = useRef<{ path: string; code: string } | null>(null);

  useEffect(() => {
    function handleToggleTerminal(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.code === "Backquote") {
        e.preventDefault();
        e.stopPropagation();
        setTerminalOpen((prev) => !prev);
      }
    }

    window.addEventListener("keydown", handleToggleTerminal, true);

    return () => {
      window.removeEventListener("keydown", handleToggleTerminal, true);
    };
  }, []);

  useEffect(() => {
    loadTree();
    syncTestStatus();

    socket.on("connect", () => {
      syncTestStatus();
    });

    socket.on("terminal", (message) => {
      writeTerminal(message);
    });

    socket.on("recording-complete", (data) => {
      setCode(data.code);
      setSelected(null);
    });

    socket.on("test-started", (data) => {
      setTestRunning(true);
      writeTerminal("");
      writeTerminal(`\x1b[36m\x1b[1m▶ Running ${data?.name ?? "test"}...\x1b[0m`);
    });

    socket.on("test-complete", ({ exitCode }) => {
      setTestRunning(false);
      const passed = exitCode === 0;
      const color = passed ? "\x1b[32m" : "\x1b[31m";
      const label = passed ? "✓ Passed" : `✕ Failed (exit code ${exitCode})`;
      writeTerminal(`${color}\x1b[1m${label}\x1b[0m`);
      writeTerminal("");
    });

    return () => {
      socket.removeAllListeners();

      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }

      if (pendingSaveRef.current) {
        const pending = pendingSaveRef.current;
        api.put("/playwright/fs/file", { path: pending.path, code: pending.code });
      }
    };
  }, []);

  function scheduleSave(path: string, value: string) {
    pendingSaveRef.current = { path, code: value };

    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    saveTimerRef.current = setTimeout(() => {
      flushPendingSave();
    }, AUTO_SAVE_DELAY_MS);
  }

  async function flushPendingSave() {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }

    const pending = pendingSaveRef.current;

    if (!pending) return;

    pendingSaveRef.current = null;

    await api.put("/playwright/fs/file", {
      path: pending.path,
      code: pending.code,
    });
  }

  function handleCodeChange(value: string) {
    setCode(value);
    scheduleSave(selected ?? "current.spec.ts", value);
  }

  async function loadTree() {
    const res = await api.get("/playwright/fs/tree");
    setTree(res.data.tree);
  }

  async function syncTestStatus() {
    const res = await api.get("/playwright/status");
    setTestRunning(Boolean(res.data.running));
  }

  async function startRecording() {
    await api.post("/playwright/start", { autoLogin });
  }

  async function runTest() {
    await flushPendingSave();

    await api.post("/playwright/run", {
      name: selected ?? undefined,
      slowMo: slowMotion ? SLOW_MOTION_MS : undefined,
      headed,
      autoLogin,
    });
  }

  async function runSpecificTest(name: string) {
    await flushPendingSave();

    await api.post("/playwright/run", {
      name,
      slowMo: slowMotion ? SLOW_MOTION_MS : undefined,
      headed,
      autoLogin,
    });
  }

  async function stopTest() {
    await api.post("/playwright/stop");
  }

  function toggleSlowMotion() {
    setSlowMotion((prev) => !prev);
  }

  function toggleHeaded() {
    setHeaded((prev) => !prev);
  }

  function toggleAutoLogin() {
    setAutoLogin((prev) => !prev);
  }

  async function selectDraft() {
    await flushPendingSave();

    const res = await api.get("/playwright/code");
    setCode(res.data.code);
    setSelected(null);
  }

  async function openFile(path: string) {
    await flushPendingSave();

    const res = await api.get(
      `/playwright/fs/file?path=${encodeURIComponent(path)}`
    );
    setCode(res.data.code);
    setSelected(path);
  }

  async function createFolder(name: string) {
    await api.post("/playwright/fs/folder", { path: name });
    await loadTree();
  }

  async function createFile(name: string) {
    await api.post("/playwright/fs/file", { path: name });
    await loadTree();
    await openFile(name);
  }

  async function deleteNode(nodePath: string, type: "file" | "folder") {
    const affectsSelected =
      selected === nodePath ||
      (type === "folder" && selected !== null && selected.startsWith(`${nodePath}/`));

    if (affectsSelected && pendingSaveRef.current) {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
        saveTimerRef.current = null;
      }

      pendingSaveRef.current = null;
    }

    await api.delete("/playwright/fs/node", { params: { path: nodePath } });

    if (affectsSelected) {
      setSelected(null);
      setCode("");
    }

    await loadTree();
  }

  function addTime() {
    editorRef.current?.insertAtCursor("await page.waitForTimeout(2000);\n");
  }

  async function saveCurrentTest() {
    await flushPendingSave();

    const name = window.prompt("Save test as:", selected ?? "");

    if (!name) return;

    await api.post("/playwright/save", { name, code });
    await loadTree();
    setSelected(name.endsWith(".spec.ts") ? name : `${name}.spec.ts`);
  }

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Toolbar
        onRecord={startRecording}
        onRun={runTest}
        onSave={saveCurrentTest}
        onAddTime={addTime}
        slowMotion={slowMotion}
        onToggleSlowMotion={toggleSlowMotion}
        headed={headed}
        onToggleHeaded={toggleHeaded}
        autoLogin={autoLogin}
        onToggleAutoLogin={toggleAutoLogin}
      />

      <div
        style={{
          display: "flex",
          flex: 1,
        }}
      >
        <Sidebar
          tree={tree}
          selected={selected}
          onSelectDraft={selectDraft}
          onOpenFile={openFile}
          onRunTest={runSpecificTest}
          onCreateFolder={createFolder}
          onCreateFile={createFile}
          onDeleteNode={deleteNode}
        />

        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div style={{ flex: 1, minHeight: 0 }}>
            <CodeEditor
              ref={editorRef}
              value={code}
              onChange={handleCodeChange}
            />
          </div>

          <Terminal open={terminalOpen} running={testRunning} onStop={stopTest} />
        </div>
      </div>
    </div>
  );
}
