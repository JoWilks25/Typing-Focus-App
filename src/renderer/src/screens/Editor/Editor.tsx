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
  EditorTitle,
  EditorTitleText,
} from './Editor.styles';
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TextAlign from '@tiptap/extension-text-align'
import { FormattingBar } from './FormattingBar';
import { DraggableModal } from '@renderer/components/DraggableModal/DraggableModal';
import { SessionStatsModal } from './SessionStatsModal';


export const Editor = () => {
  const [activeSession, setActiveSession] = useState(true);
  const [currentContent, setCurrentContent] = useState('');
  const displayTitle = 'Test Title';

  const [showAnimationModal, setShowAnimationModal] = useState(true);

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
      <EditorTitle>
        <EditorTitleText>
          {displayTitle}
        </EditorTitleText>
      </EditorTitle>
      {/* TODO: Add Session Stats */}
      <DraggableModal
        title="Session Stats"
        isVisible={showAnimationModal}
        onClose={() => setShowAnimationModal(false)}
        initialPosition={{ x: 100, y: 100 }}
        initialSize={{ width: 180, height: 275 }} // Reduced from 200x300
        sizeConstraints={{
          minWidth: 120, // Reduced from 200
          maxWidth: 800,
          minHeight: 200,
          maxHeight: 600,
        }}
        resizable={true}
      >
        <SessionStatsModal />
      </DraggableModal>

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

      {/* TODO: Add Session setup modal */}
    </EditorContainer>
  );
};
