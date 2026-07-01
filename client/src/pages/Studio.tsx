import { useEffect, useState } from "react";

import api from "../services/api";
import socket from "../services/socket";

import Toolbar from "../components/Toolbar";
import Sidebar from "../components/Sidebar";
import Terminal from "../components/Terminal";
import CodeEditor from "../components/CodeEditor";
import { writeTerminal } from "../services/terminal";

export default function Studio() {
  const [code, setCode] = useState("");
  const [tests, setTests] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    loadTests();

    socket.on("terminal", (message) => {
      writeTerminal(message);
    });

    socket.on("recording-complete", (data) => {
      setCode(data.code);
      setSelected(null);
    });

    socket.on("test-started", (data) => {
      writeTerminal("");
      writeTerminal("================================");
      writeTerminal(`Running ${data?.name ?? "test"}...`);
      writeTerminal("================================");
    });

    socket.on("test-complete", ({ exitCode }) => {
      writeTerminal("");
      writeTerminal(`Finished with exit code ${exitCode}`);
    });

    return () => {
      socket.removeAllListeners();
    };
  }, []);

  async function loadTests() {
    const res = await api.get("/playwright/tests");
    setTests(res.data.tests);
  }

  async function startRecording() {
    await api.post("/playwright/start");
  }

  async function runTest() {
    await api.post("/playwright/run", { name: selected ?? undefined });
  }

  async function runSpecificTest(name: string) {
    await api.post("/playwright/run", { name });
  }

  async function selectDraft() {
    const res = await api.get("/playwright/code");
    setCode(res.data.code);
    setSelected(null);
  }

  async function selectTest(name: string) {
    const res = await api.get(`/playwright/tests/${name}`);
    setCode(res.data.code);
    setSelected(name);
  }

  async function saveCurrentTest() {
    const name = window.prompt("Save test as:", selected ?? "");

    if (!name) return;

    await api.post("/playwright/save", { name, code });
    await loadTests();
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
      />

      <div
        style={{
          display: "flex",
          flex: 1,
        }}
      >
        <Sidebar
          tests={tests}
          selected={selected}
          onSelectDraft={selectDraft}
          onSelectTest={selectTest}
          onRunTest={runSpecificTest}
        />

        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ flex: 1 }}>
            <CodeEditor
              value={code}
              onChange={setCode}
            />
          </div>

          <Terminal />
        </div>
      </div>
    </div>
  );
}
