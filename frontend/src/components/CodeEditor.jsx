import Editor from '@monaco-editor/react';

const languageMap = {
  cpp: 'cpp',
  python: 'python',
  java: 'java',
  javascript: 'javascript'
};

export default function CodeEditor({ language, value, onChange, readOnly = false }) {
  return (
    <div className="code-editor-shell">
      <Editor
        height="540px"
        language={languageMap[language] || 'cpp'}
        value={value || ''}
        onChange={(next) => onChange?.(next ?? '')}
        theme="vs-dark"
        options={{
          readOnly,
          minimap: { enabled: false },
          fontSize: 15,
          lineHeight: 23,
          fontFamily: "'IBM Plex Mono', 'JetBrains Mono', 'Cascadia Code', Consolas, monospace",
          padding: { top: 16, bottom: 16 },
          smoothScrolling: true,
          scrollBeyondLastLine: false,
          roundedSelection: true,
          cursorBlinking: 'smooth',
          wordWrap: 'off'
        }}
      />
    </div>
  );
}
