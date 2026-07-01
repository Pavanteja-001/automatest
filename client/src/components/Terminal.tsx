import { useEffect, useRef } from "react";
import { Terminal as XTerm } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";

import "@xterm/xterm/css/xterm.css";

import {
  subscribeTerminal,
} from "../services/terminal";

export default function Terminal() {
  const divRef = useRef<HTMLDivElement>(null);

  const terminalRef = useRef<XTerm>();

  useEffect(() => {
    if (!divRef.current) return;

    const terminal = new XTerm({
      convertEol: true,
      cursorBlink: true,
      fontSize: 14,
      theme: {
        background: "#1e1e1e",
      },
    });

    const fitAddon = new FitAddon();

    terminal.loadAddon(fitAddon);

    terminal.open(divRef.current);

    fitAddon.fit();

    terminalRef.current = terminal;

    const unsubscribe = subscribeTerminal((msg) => {
      terminal.writeln(msg);
    });

    window.addEventListener("resize", () => fitAddon.fit());

    return () => {
      unsubscribe();
      terminal.dispose();
    };
  }, []);

  return (
    <div
      ref={divRef}
      style={{
        height: 250,
      }}
    />
  );
}