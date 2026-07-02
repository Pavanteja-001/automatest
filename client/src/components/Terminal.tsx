import { useEffect, useRef } from "react";
import { Terminal as XTerm } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";

import "@xterm/xterm/css/xterm.css";

import {
  subscribeTerminal,
} from "../services/terminal";

interface Props {
  open: boolean;
  running?: boolean;
  onStop?: () => void;
}

const TERMINAL_HEIGHT = 320;

const shortcutLabel =
  typeof navigator !== "undefined" && /mac/i.test(navigator.platform)
    ? "⌘ `"
    : "Ctrl+`";

export default function Terminal({ open, running, onStop }: Props) {
  const divRef = useRef<HTMLDivElement>(null);
  const terminalRef = useRef<XTerm | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);

  useEffect(() => {
    if (!divRef.current) return;

    const terminal = new XTerm({
      convertEol: true,
      cursorBlink: true,
      fontSize: 13,
      scrollback: 5000,
      theme: {
        background: "#1e1e1e",
      },
    });

    const fitAddon = new FitAddon();

    terminal.loadAddon(fitAddon);

    terminal.open(divRef.current);

    fitAddon.fit();

    terminalRef.current = terminal;
    fitAddonRef.current = fitAddon;

    const unsubscribe = subscribeTerminal((msg) => {
      terminal.writeln(msg);
      terminal.scrollToBottom();
    });

    const handleResize = () => fitAddonRef.current?.fit();

    window.addEventListener("resize", handleResize);

    return () => {
      unsubscribe();
      window.removeEventListener("resize", handleResize);
      terminal.dispose();
    };
  }, []);

  useEffect(() => {
    if (!open) return;

    requestAnimationFrame(() => {
      fitAddonRef.current?.fit();
      terminalRef.current?.scrollToBottom();
    });
  }, [open]);

  function handleClear() {
    terminalRef.current?.clear();
  }

  return (
    <div
      style={{
        display: open ? "flex" : "none",
        flexDirection: "column",
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        height: TERMINAL_HEIGHT,
        maxHeight: "70%",
        borderTop: "1px solid #3c3c3c",
        background: "#1e1e1e",
        boxShadow: "0 -6px 16px rgba(0, 0, 0, 0.45)",
        zIndex: 30,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "5px 10px",
          borderBottom: "1px solid #3c3c3c",
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: 0.5,
            textTransform: "uppercase",
            color: "#cccccc",
            opacity: 0.75,
          }}
        >
          Terminal
        </span>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 11, opacity: 0.5, color: "#cccccc" }}>
            {shortcutLabel} to toggle
          </span>

          <button
            title={running ? "Stop the running test" : "No test is currently running"}
            onClick={onStop}
            disabled={!running}
            style={{
              ...discardButtonStyle,
              opacity: running ? 1 : 0.4,
              cursor: running ? "pointer" : "not-allowed",
              borderColor: running ? "#f87171" : "#3c3c3c",
              color: running ? "#f87171" : "#cccccc",
            }}
          >
            &#9209; Stop
          </button>

          <button
            title="Clear terminal"
            onClick={handleClear}
            style={discardButtonStyle}
          >
            &#128465; Discard
          </button>
        </div>
      </div>

      <div ref={divRef} style={{ flex: 1, minHeight: 0, padding: "4px 8px" }} />
    </div>
  );
}

const discardButtonStyle = {
  background: "transparent",
  border: "1px solid #3c3c3c",
  color: "#cccccc",
  borderRadius: 4,
  fontSize: 11,
  padding: "3px 8px",
  cursor: "pointer",
};
