"use client";

import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";

import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import { Block } from "@blocknote/core";
import { useEffect } from "react";

interface BlocknoteEditorProps {
  initialContent?: Block[];
  onChange: (blocks: Block[]) => void;
  editable?: boolean;
}

export default function BlocknoteEditor({
  initialContent,
  onChange,
  editable = true,
}: BlocknoteEditorProps) {
  const editor = useCreateBlockNote({
    initialContent: initialContent && initialContent.length > 0
      ? initialContent
      : undefined,
  });

  // Propagate changes upward
  useEffect(() => {
    const unsubscribe = editor.onChange(() => {
      onChange(editor.document);
    });
    return unsubscribe;
  }, [editor, onChange]);

  return (
    <BlockNoteView
      editor={editor}
      editable={editable}
      theme="light"
      style={{ minHeight: "100%" }}
    />
  );
}
