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

  useEffect(() => {
    socket.on("terminal", (message) => {
    writeTerminal(message);
});

    socket.on("recording-complete", (data) => {
      setCode(data.code);
    });

    socket.on("test-started", () => {
    writeTerminal("");
    writeTerminal("================================");
    writeTerminal("Running Playwright Test...");
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

  async function startRecording() {
   
    await api.post("/playwright/start");
  }

  async function runTest() {
  
    await api.post("/playwright/run");
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
      />

      <div
        style={{
          display: "flex",
          flex: 1,
        }}
      >
        <Sidebar />

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