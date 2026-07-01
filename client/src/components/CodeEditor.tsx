import Editor from "@monaco-editor/react";

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export default function CodeEditor({ value, onChange }: Props) {
  return (
    <Editor
      height="600px"
      defaultLanguage="typescript"
      theme="vs-dark"
      value={value}
      onChange={(value) => onChange(value ?? "")}
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
}