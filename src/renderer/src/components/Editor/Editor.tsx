import { useState } from 'react';
import {
  EditorContainer,
  EditorMain,
  EditorContentDiv,
  AnimationSidebar,
  DisabledMessage,
  StartSessionButton,
  TipTapEditor,
  DisabledOverlay,
} from './Editor.styles';
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TextAlign from '@tiptap/extension-text-align'
import { FormattingBar } from './FormattingBar';


export const Editor = () => {
  const [activeSession, setActiveSession] = useState(true);
  const [currentContent, setCurrentContent] = useState('');

  const handleOpenSessionSetup = () => {
    // TODO: Implement session setup modal
    console.log('Open session setup');
  };

  // Initialize Tiptap editor with basic extensions (always required for schema)
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ], // define your extension array
    content: currentContent,
    editable: activeSession,
  })

  return (
    <EditorContainer>
      {/* TODO: Add Editor Title */}

      {/* TODO: Add Session Stats */}
      <EditorMain>
        <EditorContentDiv>
          <FormattingBar editor={editor} disabled={!activeSession} />
          <TipTapEditor $disabled={!activeSession}>
            <EditorContent editor={editor} />
          </TipTapEditor>
          {!activeSession && (
            <DisabledOverlay>
              <DisabledMessage>
                <h2>Ready to Start Writing?</h2>
                <p>Begin your writing journey by starting a new session.</p>
              </DisabledMessage>
              <StartSessionButton onClick={handleOpenSessionSetup}>
                Start New Writing Session
              </StartSessionButton>
            </DisabledOverlay>
          )}
        </EditorContentDiv>

        <AnimationSidebar>
          {/* TODO: Add Tree animation */}
        </AnimationSidebar>
      </EditorMain>

      {/* TODO: Add Session setup modal */}
    </EditorContainer>
  );
};
