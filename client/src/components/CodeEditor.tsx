import { forwardRef, useImperativeHandle, useRef } from "react";
import Editor, { type OnMount } from "@monaco-editor/react";
import type { editor } from "monaco-editor";

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export interface CodeEditorHandle {
  insertAtCursor: (text: string) => void;
}

const CodeEditor = forwardRef<CodeEditorHandle, Props>(function CodeEditor(
  { value, onChange },
  ref
) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  const handleMount: OnMount = (editorInstance) => {
    editorRef.current = editorInstance;
  };

  useImperativeHandle(ref, () => ({
    insertAtCursor(text: string) {
      const editorInstance = editorRef.current;
      const position = editorInstance?.getPosition();

      if (!editorInstance || !position) return;

      editorInstance.executeEdits("addTime", [
        {
          range: {
            startLineNumber: position.lineNumber,
            startColumn: position.column,
            endLineNumber: position.lineNumber,
            endColumn: position.column,
          },
          text,
        },
      ]);

      editorInstance.focus();
    },
  }));

  return (
    <Editor
      height="600px"
      defaultLanguage="typescript"
      theme="vs-dark"
      value={value}
      onChange={(value) => onChange(value ?? "")}
      onMount={handleMount}
      options={{
        minimap: {
          enabled: false,
        },
        fontSize: 14,
        automaticLayout: true,
        wordWrap: "on",
      }}
    />
  );
});

export default CodeEditor;
