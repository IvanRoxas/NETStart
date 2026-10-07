"use client";

import React, { useEffect, useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { EditorView } from '@codemirror/view';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { tags as t } from '@lezer/highlight';
import { Diagnostic, setDiagnostics, linter, lintGutter } from '@codemirror/lint';

interface CodeEditorProps {
  value: string;
  language: 'html' | 'css' | 'javascript' | 'python';
  onChange: (val: string) => void;
  onRun: () => void;
  diagnostic?: { line: number; message: string } | null;
}

export default function CodeEditor({ value, language, onChange, onRun, diagnostic }: CodeEditorProps) {
  const [mounted, setMounted] = useState(false);
  const editorRef = React.useRef<any>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (editorRef.current?.view) {
      const view = editorRef.current.view;
      if (diagnostic && diagnostic.line > 0) {
        const doc = view.state.doc;
        const lineNo = Math.min(Math.max(1, diagnostic.line), doc.lines);
        const lineInfo = doc.line(lineNo);
        const diag: Diagnostic = {
          from: lineInfo.from,
          to: lineInfo.to,
          severity: 'error',
          message: diagnostic.message,
        };
        view.dispatch(setDiagnostics(view.state, [diag]));
      } else {
        view.dispatch(setDiagnostics(view.state, []));
      }
    }
  }, [diagnostic]);

  if (!mounted) return null;

  const getExtension = () => {
    switch (language) {
      case 'html': return html();
      case 'css': return css();
      case 'javascript': return javascript();
      case 'python': return python();
      default: return javascript();
    }
  };

  // Custom Theme for NETStart CodeMirror
  const netstartTheme = EditorView.theme({
    "&": { backgroundColor: "#150524", color: "#e8e0f5", height: "100%" },
    ".cm-content": { caretColor: "#ff912d" },
    ".cm-cursor, .cm-dropCursor": { borderLeftColor: "#ff912d" },
    ".cm-gutters": { backgroundColor: "#0e0319", color: "#6b5a85", border: "none" },
    ".cm-activeLine": { backgroundColor: "rgba(255,145,45,0.08)" },
    ".cm-activeLineGutter": { backgroundColor: "transparent", color: "#ff912d" },
    "&.cm-focused": { outline: "none" },
    ".cm-selectionBackground, &.cm-focused .cm-selectionBackground, ::selection":
      { backgroundColor: "rgba(255,145,45,0.30)" },
  }, { dark: true });

  const netstartHighlight = HighlightStyle.define([
    { tag: t.keyword, color: "#ff912d" },
    { tag: [t.name, t.deleted, t.character, t.propertyName, t.macroName], color: "#89b4fa" },
    { tag: [t.function(t.variableName), t.labelName], color: "#89b4fa" },
    { tag: [t.color, t.constant(t.name), t.standard(t.name)], color: "#fab387" },
    { tag: [t.definition(t.name), t.separator], color: "#e8e0f5" },
    { tag: [t.typeName, t.className, t.number, t.changed, t.annotation, t.modifier, t.self, t.namespace], color: "#fab387" },
    { tag: [t.operator, t.operatorKeyword, t.url, t.escape, t.regexp, t.link, t.special(t.string)], color: "#e8e0f5" },
    { tag: [t.meta, t.comment], color: "#7f6f99" },
    { tag: t.strong, fontWeight: "bold" },
    { tag: t.emphasis, fontStyle: "italic" },
    { tag: t.strikethrough, textDecoration: "line-through" },
    { tag: t.link, color: "#7f6f99", textDecoration: "underline" },
    { tag: t.heading, fontWeight: "bold", color: "#ff912d" },
    { tag: [t.atom, t.bool, t.special(t.variableName)], color: "#fab387" },
    { tag: [t.processingInstruction, t.string, t.inserted], color: "#a6e3a1" },
    { tag: t.invalid, color: "#ff0000" },
  ]);

  const customKeymap = EditorView.domEventHandlers({
    keydown(event) {
      // Ctrl+Enter or Cmd+Enter to Run
      if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        event.preventDefault();
        onRun();
        return true;
      }
      return false;
    }
  });

  return (
    <div className="w-full h-full flex flex-col font-mono text-[15px] [&>.cm-theme-light]:h-full [&>.cm-editor]:h-full overflow-hidden">
      <CodeMirror
        ref={editorRef}
        value={value}
        theme="none"
        height="100%"
        extensions={[getExtension(), netstartTheme, syntaxHighlighting(netstartHighlight), customKeymap, lintGutter(), linter(() => [])]}
        onChange={onChange}
        basicSetup={{
          lineNumbers: true,
          highlightActiveLineGutter: true,
          highlightSpecialChars: true,
          history: true,
          foldGutter: true,
          drawSelection: true,
          dropCursor: true,
          allowMultipleSelections: true,
          indentOnInput: true,
          syntaxHighlighting: true,
          bracketMatching: true,
          closeBrackets: true,
          autocompletion: true,
          rectangularSelection: true,
          crosshairCursor: true,
          highlightActiveLine: true,
          highlightSelectionMatches: true,
          closeBracketsKeymap: true,
          defaultKeymap: true,
          searchKeymap: true,
          historyKeymap: true,
          foldKeymap: true,
          completionKeymap: true,
          lintKeymap: true,
        }}
      />
    </div>
  );
}
