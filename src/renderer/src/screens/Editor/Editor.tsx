import { useState } from 'react';
import {
  EditorContainer,
  EditorMain,
  EditorContentDiv,
  DisabledMessage,
  StartSessionButton,
  TipTapEditor,
  DisabledOverlay,
  EditorTitle,
  EditorTitleText,
} from './Editor.styles';
import { useEditor, EditorContent, Editor as ttEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TextAlign from '@tiptap/extension-text-align'
import CharacterCount from '@tiptap/extension-character-count'
import { FormattingBar } from './FormattingBar';
import { SessionStats } from './SessionStats';
import { useEditorStore } from '@renderer/stores/EditorStore';
import { Modal } from '@renderer/components/Modal/Modal';
import { SessionSetup } from '../SessionSetup/SessionSetup';

export const Editor = () => {
  const [activeSession, setActiveSession] = useState(false);
  const [showSessionSetupModal, setShowSessionSetupModal] = useState(false);
  const displayTitle = 'Test Title';
  const updateContent = useEditorStore(state => state.updateContent)

  const handleOpenSessionSetup = () => {
    // TODO: Implement session setup modal
    console.log('Open session setup');
    setShowSessionSetupModal(true);
  };

  const handleOnUpdate = ({ editor }: { editor: ttEditor }) => {
    const content = editor.getHTML();
    const text = editor.getText();
    const wordCount = editor.storage.characterCount.words()
    updateContent(content, text, wordCount)
  }

  // Initialize Tiptap editor with basic extensions (always required for schema)
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      CharacterCount.configure({
        wordCounter: (text) => text.trim().split(/\s+/).filter(Boolean).length
      }),
    ], // define your extension array
    content: '',
    editable: activeSession,
    onUpdate: handleOnUpdate,
  })

  return (
    <EditorContainer>
      <EditorTitle>
        <EditorTitleText>
          {displayTitle}
        </EditorTitleText>
        <SessionStats />
      </EditorTitle>

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

        {/* TODO: Add Tree animation */}
      </EditorMain>

      <Modal
        title="Session Setup"
        isVisible={showSessionSetupModal}
        onClose={() => setShowSessionSetupModal(false)}
        width={600}
        height="auto"
      >
        <SessionSetup />
      </Modal>
    </EditorContainer>
  );
};